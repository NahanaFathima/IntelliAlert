import { GoogleGenAI, Type } from "@google/genai";
import { EXTRACTION_PROMPT } from "../utils/prompts.ts";

export interface StructuredAnnouncement {
  announcementType: string;
  trainNumber: string;
  destination: string;
  platform: string;
  oldPlatform: string;
  delay: string;
  boarding: boolean;
  emergency: boolean;
}

/**
 * Service to extract structured details from announcement transcripts using Gemini.
 */
export async function extractAnnouncementDetails(transcript: string): Promise<StructuredAnnouncement> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = EXTRACTION_PROMPT.replace("{TRANSCRIPT}", transcript);

    console.log(`Sending transcript to Gemini for structured extraction...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            announcementType: { 
              type: Type.STRING, 
              description: "Type of announcement (e.g., PLATFORM_CHANGE, DELAY, BOARDING, EMERGENCY, CANCELLED, GENERAL)" 
            },
            trainNumber: { 
              type: Type.STRING, 
              description: "5-digit Indian train number or code, e.g. '12625'" 
            },
            destination: { 
              type: Type.STRING, 
              description: "Final destination station name" 
            },
            platform: { 
              type: Type.STRING, 
              description: "New/current platform number" 
            },
            oldPlatform: { 
              type: Type.STRING, 
              description: "Previous platform number" 
            },
            delay: { 
              type: Type.STRING, 
              description: "Delay details if any" 
            },
            boarding: { 
              type: Type.BOOLEAN, 
              description: "Whether train is arriving, standing, or boarding" 
            },
            emergency: { 
              type: Type.BOOLEAN, 
              description: "Whether this is an emergency message" 
            }
          },
          required: [
            "announcementType",
            "trainNumber",
            "destination",
            "platform",
            "oldPlatform",
            "delay",
            "boarding",
            "emergency"
          ]
        }
      }
    });

    const text = response.text?.trim() || "{}";
    const result: StructuredAnnouncement = JSON.parse(text);
    console.log("Structured extraction completed successfully:", result);
    return result;
  } catch (error) {
    console.error("Error in extractAnnouncementDetails:", error);
    // Return a default empty schema
    return {
      announcementType: "GENERAL",
      trainNumber: "",
      destination: "",
      platform: "",
      oldPlatform: "",
      delay: "",
      boarding: false,
      emergency: false
    };
  }
}
