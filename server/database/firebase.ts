import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  // Read config from root of workspace
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let config: any = {};

  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, "utf-8");
    config = JSON.parse(raw);
    console.log("Firebase config loaded successfully from file:", config.projectId);
  } else {
    console.warn("firebase-applet-config.json not found! Using environment variables.");
    config = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    };
  }

  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }

  db = getFirestore(app);
  auth = getAuth(app);
  console.log("Firebase services initialized successfully on the backend.");
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  throw error;
}

export { app, db, auth };
export default db;
