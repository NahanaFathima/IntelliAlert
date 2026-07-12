import express from "express";
import { collection, query, where, getDocs, setDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../database/firebase.ts";

const router = express.Router();

/**
 * GET /api/users/:userId
 * Fetch user profile from users collection.
 */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      res.json(userDoc.data());
    } else {
      res.status(404).json({ error: "User profile not found" });
    }
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
});

/**
 * POST /api/users
 * Create or update a user profile.
 */
router.post("/", async (req, res) => {
  const { userId, name, email } = req.body;

  if (!userId || !email) {
    res.status(400).json({ error: "userId and email are required fields." });
    return;
  }

  try {
    const userDocRef = doc(db, "users", userId);
    const userProfile = { userId, name: name || "", email };
    
    await setDoc(userDocRef, userProfile, { merge: true });
    console.log(`User profile updated for ${userId}`);
    res.json(userProfile);
  } catch (error: any) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user", details: error.message });
  }
});

/**
 * GET /api/users/:userId/journey
 * Fetch active journey for a specific user.
 */
router.get("/:userId/journey", async (req, res) => {
  const { userId } = req.params;

  try {
    const journeysRef = collection(db, "journeys");
    const q = query(journeysRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first journey (active)
      res.json({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
    } else {
      res.status(404).json({ error: "No active journey set for this user." });
    }
  } catch (error: any) {
    console.error("Error fetching journey:", error);
    res.status(500).json({ error: "Failed to fetch journey", details: error.message });
  }
});

/**
 * POST /api/users/:userId/journey
 * Create or update the active journey for a user.
 */
router.post("/:userId/journey", async (req, res) => {
  const { userId } = req.params;
  const { trainNumber, destination, source, platform } = req.body;

  if (!trainNumber || !destination) {
    res.status(400).json({ error: "trainNumber and destination are required fields." });
    return;
  }

  try {
    // Check if journey exists
    const journeysRef = collection(db, "journeys");
    const q = query(journeysRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const journeyData = {
      userId,
      trainNumber,
      destination,
      source: source || "",
      platform: platform || "",
      updatedAt: new Date().toISOString()
    };

    if (!querySnapshot.empty) {
      // Update existing journey doc
      const existingDocId = querySnapshot.docs[0].id;
      const docRef = doc(db, "journeys", existingDocId);
      await setDoc(docRef, journeyData, { merge: true });
      console.log(`Journey updated for user ${userId}`);
      res.json({ id: existingDocId, ...journeyData });
    } else {
      // Create a new journey doc with user ID as part of key or auto-generated ID
      // Using setDoc with userId as doc ID to guarantee only 1 active journey per user
      const docRef = doc(db, "journeys", userId);
      await setDoc(docRef, journeyData);
      console.log(`New journey created for user ${userId}`);
      res.json({ id: userId, ...journeyData });
    }
  } catch (error: any) {
    console.error("Error saving journey:", error);
    res.status(500).json({ error: "Failed to save journey", details: error.message });
  }
});

/**
 * GET /api/users/:userId/alerts
 * Fetch history of alerts generated for a specific user.
 */
router.get("/:userId/alerts", async (req, res) => {
  const { userId } = req.params;

  try {
    const alertsRef = collection(db, "alerts");
    const q = query(alertsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const alertsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by timestamp descending
    alertsList.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json(alertsList);
  } catch (error: any) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ error: "Failed to fetch alerts", details: error.message });
  }
});

export default router;
