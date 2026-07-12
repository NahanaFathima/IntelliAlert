export interface UserProfile {
  userId: string;
  name: string;
  email: string;
}

export interface Journey {
  userId: string;
  trainNumber: string;
  destination: string;
  source: string;
  platform: string;
}

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

export interface AnnouncementRecord {
  id?: string;
  transcript: string;
  structuredAnnouncement: StructuredAnnouncement;
  timestamp: string;
}

export interface Alert {
  id?: string;
  userId: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  timestamp: string;
  recommendedAction?: string;
  timeRemaining?: string;
  routeRequired?: boolean;
}

export interface ProcessResponse {
  relevant: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  timeRemaining: string;
  recommendedAction: string;
  routeRequired: boolean;
}
