import express from "express";
import multer from "multer";
import os from "os";
import fs from "fs";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../database/firebase.ts";
import { transcribeAudio } from "../services/whisper_service.ts";
import { extractAnnouncementDetails } from "../services/gemini_service.ts";
import { matchJourney, JourneyData } from "../services/matching_service.ts";
import { generateAlert } from "../services/alert_service.ts";

const router = express.Router();

// Configure multer to save uploaded files in the temporary system directory
const upload = multer({ dest: os.tmpdir() });

/**
 * POST /api/announcement/process
 * Receives audio file and user_id, transcribes and extracts details,
 * matches with the user's journey, creates alerts, and returns the alert.
 */
router.post("/process", upload.single("audio"), async (req, res) => {
  const tempFilePath = req.file?.path;
  const { user_id } = req.body;

  if (!tempFilePath) {
    res.status(400).json({ error: "No audio file provided in request." });
    return;
  }

  if (!user_id) {
    // Delete temp file to avoid leak
    try { fs.unlinkSync(tempFilePath); } catch {}
    res.status(400).json({ error: "user_id is a required field." });
    return;
  }

  try {
    console.log(`Processing announcement for user: ${user_id}`);

    // Step 1: Transcription using Whisper service
    console.log("Starting Whisper transcription...");
    const transcript = await transcribeAudio(tempFilePath);

    if (!transcript) {
      throw new Error("Transcriber returned an empty transcript.");
    }

    // Step 2: Extraction using Gemini service
    console.log("Starting Gemini details extraction...");
    const structuredAnn = await extractAnnouncementDetails(transcript);

    // Step 3: Fetch active journey for the user from Firestore
    console.log(`Querying journeys for user: ${user_id}...`);
    const journeysRef = collection(db, "journeys");
    const q = query(journeysRef, where("userId", "==", user_id));
    const querySnapshot = await getDocs(q);

    let journey: JourneyData | null = null;
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      journey = {
        userId: user_id,
        trainNumber: docData.trainNumber || "",
        destination: docData.destination || "",
        source: docData.source || "",
        platform: docData.platform || "",
      };
      console.log("User's journey found:", journey);
    } else {
      console.log(`No active journey found for user: ${user_id}`);
    }

    // Step 4: Run Matching Engine
    let matchResult = { relevant: false, reason: "No Journey Set" };
    if (journey) {
      matchResult = matchJourney(structuredAnn, journey);
    } else if (structuredAnn.emergency) {
      matchResult = { relevant: true, reason: "Emergency Alert" };
    }

    console.log("Matching result:", matchResult);

    // Step 5: Alert Generation
    const alertResult = generateAlert(structuredAnn, matchResult);
    console.log("Generated alert:", alertResult);

    // Step 6: Store announcement in Firestore
    console.log("Storing announcement in announcements collection...");
    const announcementRecord = {
      transcript,
      structuredAnnouncement: structuredAnn,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, "announcements"), announcementRecord);

    // Step 7: Store alert in Firestore if relevant
    if (alertResult.relevant) {
      console.log("Storing relevant alert in alerts collection...");
      const alertRecord = {
        userId: user_id,
        title: alertResult.title,
        priority: alertResult.priority,
        message: alertResult.message,
        recommendedAction: alertResult.recommendedAction,
        timeRemaining: alertResult.timeRemaining,
        routeRequired: alertResult.routeRequired,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, "alerts"), alertRecord);
    }

    // Clean up temporary audio file
    try {
      fs.unlinkSync(tempFilePath);
      console.log("Cleaned up temporary file:", tempFilePath);
    } catch (unlinkErr) {
      console.error("Failed to delete temp file:", unlinkErr);
    }

    // Return the response
    res.json(alertResult);

  } catch (error: any) {
    console.error("Error in /announcement/process pipeline:", error);

    // Clean up temporary audio file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }

    res.status(500).json({
      error: "Failed to process announcement.",
      details: error.message || error,
    });
  }
});

export default router;
