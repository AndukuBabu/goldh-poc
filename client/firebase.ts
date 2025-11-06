// client/firebase.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCjEmAnHmKLZ8msjNeovJBF3ssg-OHzz0M",
  authDomain: "goldh-c78ca.firebaseapp.com",
  projectId: "goldh-c78ca",
  storageBucket: "goldh-c78ca.firebasestorage.app",
  messagingSenderId: "1050639201481",
  appId: "1:1050639201481:web:71c433ebb31ccb2e6b4918",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db }
