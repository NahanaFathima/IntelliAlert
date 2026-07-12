import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { TRANSCRIPTION_PROMPT } from "../utils/prompts.ts";

/**
 * Service to transcribe audio using Gemini's multimodal capabilities
 * (as a high-fidelity replacement for Whisper inside the sandboxed environment).
 */
export async function transcribeAudio(audioPath: string): Promise<string> {
  try {
    if (!fs.existsSync(audioPath)) {
      throw new Error(`Audio file not found at path: ${audioPath}`);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }

    const ai = new GoogleGenAI({ apiKey });
    const fileBuffer = fs.readFileSync(audioPath);
    const base64Data = fileBuffer.toString("base64");

    // Detect MIME type based on file extension
    const ext = path.extname(audioPath).toLowerCase();
    let mimeType = "audio/wav";
    if (ext === ".mp3") {
      mimeType = "audio/mp3";
    } else if (ext === ".ogg") {
      mimeType = "audio/ogg";
    } else if (ext === ".m4a") {
      mimeType = "audio/m4a";
    } else if (ext === ".webm") {
      mimeType = "audio/webm";
    }

    console.log(`Sending audio file (${mimeType}, size: ${fileBuffer.length} bytes) to Gemini for transcription...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
        TRANSCRIPTION_PROMPT,
      ],
    });

    const transcript = response.text?.trim() || "";
    console.log(`Transcription completed. Result: "${transcript}"`);
    return transcript;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    // Return a fallback or throw
    throw error;
  }
}
