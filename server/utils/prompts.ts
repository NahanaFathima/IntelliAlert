/**
 * Prompts for the Gemini AI Service.
 * Keeping all prompts in a centralized location as requested.
 */

export const TRANSCRIPTION_PROMPT = `
You are an expert audio transcription system.
Listen to this railway station announcement audio carefully.
Transcribe it word-for-word. Do not summarize. Do not add any filler text or explanations.
If the announcement is in Hindi or another Indian language, translate it into English so that it can be matched for Deaf/Hard-of-Hearing commuters.
Output ONLY the final English transcription.
`;

export const EXTRACTION_PROMPT = `
You are an AI assistant processing Indian Railway announcements.
Analyze the following announcement transcript and extract the details as a STRICT JSON object matching this schema:

{
  "announcementType": "string (e.g., PLATFORM_CHANGE, DELAY, BOARDING, EMERGENCY, CANCELLED, GENERAL)",
  "trainNumber": "string (e.g., '12625', or empty if not mentioned)",
  "destination": "string (destination city/station, or empty if not mentioned)",
  "platform": "string (new or current platform number, or empty if not mentioned)",
  "oldPlatform": "string (previous platform number if a change occurred, or empty)",
  "delay": "string (e.g., '30 minutes', '2 hours', or empty if not mentioned)",
  "boarding": true/false (boolean: true if the train is currently boarding, arriving, or standing on the platform),
  "emergency": true/false (boolean: true if it is an emergency, safety alert, or critical hazard)
}

Input Transcript:
"{TRANSCRIPT}"

Rules:
1. Return ONLY the strict JSON object. No markdown blocks, no triple backticks, no explanations.
2. If a value is unknown, use an empty string "" or false for booleans.
3. Be highly accurate. Indian train numbers are usually 5 digits (e.g., 12625, 12626, 22691). Ensure the platform is correctly identified.
`;
