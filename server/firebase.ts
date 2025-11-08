/**
 * Firebase Admin SDK Initialization
 * 
 * Initializes the Firebase Admin SDK for server-side Firestore operations.
 * Uses Application Default Credentials (ADC) for authentication in Replit.
 * 
 * @see https://firebase.google.com/docs/admin/setup
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Export Firestore database instance
export const db = admin.firestore();
