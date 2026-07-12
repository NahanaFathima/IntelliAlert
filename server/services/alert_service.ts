import { StructuredAnnouncement } from "./gemini_service.ts";
import { MatchingResult } from "./matching_service.ts";

export interface GeneratedAlert {
  relevant: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  timeRemaining: string;
  recommendedAction: string;
  routeRequired: boolean;
}

/**
 * Service to generate personalized action cards (alerts) from matches.
 */
export function generateAlert(
  announcement: StructuredAnnouncement,
  match: MatchingResult
): GeneratedAlert {
  if (!match.relevant) {
    return {
      relevant: false,
      priority: "LOW",
      title: "Not Relevant",
      message: "This announcement does not affect your selected journey.",
      timeRemaining: "",
      recommendedAction: "",
      routeRequired: false,
    };
  }

  const type = announcement.announcementType?.toUpperCase() || "GENERAL";
  let priority: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  let title = "Journey Update";
  let message = "An announcement was made regarding your train.";
  let recommendedAction = "Stay alert for further instructions.";
  let routeRequired = false;
  let timeRemaining = announcement.delay ? `Delayed by ${announcement.delay}` : "";

  // 1. Emergency Case
  if (announcement.emergency || type === "EMERGENCY") {
    priority = "HIGH";
    title = "⚠️ EMERGENCY ALERT";
    message = "A station-wide emergency announcement has been issued. Please pay attention to safety signs.";
    recommendedAction = "Follow security directions and evacuate safely if instructed.";
    routeRequired = false;
  }
  // 2. Platform Change
  else if (type === "PLATFORM_CHANGE" || (announcement.platform && announcement.oldPlatform)) {
    priority = "HIGH";
    title = "Platform Changed 🔄";
    message = `Your train has moved from Platform ${announcement.oldPlatform || "unknown"} to Platform ${announcement.platform}.`;
    recommendedAction = `Please safely walk over to Platform ${announcement.platform}.`;
    routeRequired = true;
    timeRemaining = "Immediate action required";
  }
  // 3. Delay
  else if (type === "DELAY" || announcement.delay) {
    priority = "MEDIUM";
    title = "Train Delayed ⏱️";
    message = `Your train is running late by ${announcement.delay || "some time"}.`;
    recommendedAction = "Check digital station boards or wait in the waiting room.";
    routeRequired = false;
    timeRemaining = announcement.delay || "Expected late";
  }
  // 4. Boarding / Arrival
  else if (type === "BOARDING" || announcement.boarding) {
    priority = "HIGH";
    title = "Now Boarding / Arriving 🚉";
    message = `Your train is arriving or standing on Platform ${announcement.platform || "designated platform"}.`;
    recommendedAction = `Please locate your compartment and begin boarding.`;
    routeRequired = true;
    timeRemaining = "Boarding in progress";
  }
  // 5. Cancelled
  else if (type === "CANCELLED") {
    priority = "HIGH";
    title = "Train CANCELLED ❌";
    message = "Your train announcement indicates that the service has been cancelled.";
    recommendedAction = "Proceed to the inquiry counter or station master office.";
    routeRequired = false;
  }
  // 6. Generic Matches (e.g. Train Number Match but general info)
  else if (match.reason === "Train Number Match") {
    priority = "MEDIUM";
    title = "Train Announcement";
    message = `An announcement was broadcasted specifically for Train No. ${announcement.trainNumber}.`;
    if (announcement.platform) {
      message += ` The train is scheduled at Platform ${announcement.platform}.`;
      recommendedAction = `Go to Platform ${announcement.platform}.`;
      routeRequired = true;
    } else {
      recommendedAction = "Verify details with railway staff.";
    }
  }

  return {
    relevant: true,
    priority,
    title,
    message,
    timeRemaining,
    recommendedAction,
    routeRequired,
  };
}
