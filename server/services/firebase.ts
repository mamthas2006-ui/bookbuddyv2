import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

let dbInstance: admin.firestore.Firestore | null = null;
let isInitialized = false;

export function getFirebaseAdminDb(): admin.firestore.Firestore {
  if (!dbInstance) {
    if (!isInitialized) {
      try {
        let projectId = process.env.FIREBASE_PROJECT_ID;
        let databaseId = process.env.FIREBASE_DATABASE_ID || "(default)";

        // Fallback to firebase-applet-config.json if env is empty
        try {
          const configPath = path.join(process.cwd(), "firebase-applet-config.json");
          if (fs.existsSync(configPath)) {
            const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
            if (!projectId) projectId = configData.projectId;
            if (configData.firestoreDatabaseId) databaseId = configData.firestoreDatabaseId;
          }
        } catch (e) {
          console.warn("[Firebase Admin] Could not read firebase-applet-config.json fallback");
        }

        if (!admin.apps.length) {
          admin.initializeApp({
            projectId: projectId || "prime-osprey-1224x",
          });
        }
        isInitialized = true;
        dbInstance = getFirestore(admin.app(), databaseId);
        console.log(`[Firebase Admin] Initialized Firestore with Database ID: ${databaseId}`);
      } catch (error: any) {
        console.error("[Firebase Admin] Initialization failed:", error.message);
        throw error;
      }
    }
  }
  return dbInstance!;
}
