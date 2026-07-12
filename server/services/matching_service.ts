import { StructuredAnnouncement } from "./gemini_service.ts";

export interface JourneyData {
  userId: string;
  trainNumber: string;
  destination: string;
  source: string;
  platform: string;
}

export interface MatchingResult {
  relevant: boolean;
  reason: string;
}

/**
 * Matching engine to check if an announcement is relevant to a user's journey.
 * Match order/priority:
 * 1. Emergency: automatically relevant.
 * 2. Train Number: exact match.
 * 3. Destination: substring or exact match.
 * 4. Platform: matching the user's starting platform.
 */
export function matchJourney(announcement: StructuredAnnouncement, journey: JourneyData): MatchingResult {
  // 1. Emergency alerts are always relevant for safety
  if (announcement.emergency) {
    return {
      relevant: true,
      reason: "Emergency Alert",
    };
  }

  // Helper to normalize strings for comparison
  const normalize = (val: string) => val.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const userTrain = normalize(journey.trainNumber);
  const annTrain = normalize(announcement.trainNumber);

  // 2. Train Number Match
  if (userTrain && annTrain && (userTrain === annTrain || annTrain.includes(userTrain) || userTrain.includes(annTrain))) {
    return {
      relevant: true,
      reason: "Train Number Match",
    };
  }

  // 3. Destination Match
  const userDest = normalize(journey.destination);
  const annDest = normalize(announcement.destination);
  if (userDest && annDest && (userDest.includes(annDest) || annDest.includes(userDest))) {
    return {
      relevant: true,
      reason: "Destination Match",
    };
  }

  // 4. Platform Match
  const userPlatform = normalize(journey.platform);
  const annPlatform = normalize(announcement.platform);
  const annOldPlatform = normalize(announcement.oldPlatform);

  if (userPlatform) {
    if (annPlatform && userPlatform === annPlatform) {
      return {
        relevant: true,
        reason: "Platform Match",
      };
    }
    if (annOldPlatform && userPlatform === annOldPlatform) {
      return {
        relevant: true,
        reason: "Platform Change Match",
      };
    }
  }

  // Not relevant
  return {
    relevant: false,
    reason: "No Match",
  };
}
