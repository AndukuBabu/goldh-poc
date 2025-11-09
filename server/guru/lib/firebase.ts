/**
 * Firebase Client SDK for Guru Digest
 * 
 * Initializes Firebase client SDK for Guru Digest Firestore operations.
 * Uses environment variables for secure credential management.
 * 
 * Note: Uses client SDK (not Admin SDK) for Replit environment compatibility.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase Configuration from Environment Variables
 * 
 * All credentials stored securely in Replit secrets.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

/**
 * Validate Required Environment Variables
 */
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * Singleton Firebase App and Firestore Instances
 */
let app: FirebaseApp;
let db: Firestore;

/**
 * Initialize Firebase App (Singleton)
 * 
 * Only initializes if no app exists.
 * Reuses existing app if already initialized.
 * 
 * @returns Firebase App instance
 */
export function initializeFirebase(): FirebaseApp {
  if (!app) {
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      // Initialize new app
      app = initializeApp(firebaseConfig, 'guru-server');
    } else {
      // Reuse existing app (if initialized by other modules)
      app = existingApps[0];
    }
  }
  
  return app;
}

/**
 * Get Firestore Instance (Singleton)
 * 
 * Initializes Firebase app if needed, then returns Firestore instance.
 * 
 * @returns Firestore database instance
 */
export function getDb(): Firestore {
  if (!db) {
    const firebaseApp = initializeFirebase();
    db = getFirestore(firebaseApp);
  }
  
  return db;
}
