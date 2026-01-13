import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const functions = getFunctions(app, 'us-central1')

// Connect to Emulators in Development
if (import.meta.env.DEV) {
  // console.log("[Firebase] Connecting to Emulators...");
  // connectFirestoreEmulator(db, '127.0.0.1', 8080);
  // connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

export { db, functions, app }
