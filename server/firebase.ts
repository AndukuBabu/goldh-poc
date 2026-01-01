import admin from 'firebase-admin';
import { dbConfig } from './config';

/**
 * Firebase Admin SDK Initialization
 * 
 * Initializes the Firebase Admin SDK for server-side Firestore operations.
 * Supports three authentication modes for maximum platform independence:
 * 
 * 1. Environment Variables (Standard): Uses FIREBASE_PROJECT_ID, etc.
 * 2. Service Account JSON (Local): Uses GOOGLE_APPLICATION_CREDENTIALS path.
 * 3. Application Default Credentials (Replit/GCP): Used if no other config provided.
 * 
 * @see https://firebase.google.com/docs/admin/setup
 */

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  if (dbConfig.firebase.projectId && dbConfig.firebase.clientEmail && dbConfig.firebase.privateKey) {
    // Mode 1: Environment Variables (e.g., Render, Railway)
    console.log('[Firebase] Initializing using environment variables');
    console.log(`[Firebase] Project ID: ${dbConfig.firebase.projectId}`);
    console.log(`[Firebase] Client Email: ${dbConfig.firebase.clientEmail?.substring(0, 15)}...`);
    console.log(`[Firebase] Private Key Length: ${dbConfig.firebase.privateKey?.length || 0} characters`);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: dbConfig.firebase.projectId,
        clientEmail: dbConfig.firebase.clientEmail,
        privateKey: dbConfig.firebase.privateKey,
      }),
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Mode 2: Service Account JSON (e.g., Local development)
    console.log('[Firebase] Initializing using GOOGLE_APPLICATION_CREDENTIALS');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } else {
    // Mode 3: Application Default (e.g., Replit, Google Cloud)
    console.log('[Firebase] Initializing using Application Default Credentials');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
}

// Export Firestore database instance
export const db = admin.firestore();
