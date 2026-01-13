import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// No arguments needed when running in Cloud Functions
if (!admin.apps.length) {
    admin.initializeApp();
}

export const db = admin.firestore();
