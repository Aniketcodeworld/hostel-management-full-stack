import { initializeApp, getApps } from "firebase/app"
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// Check if in development mode and use emulator for local testing
if (process.env.NODE_ENV === 'development') {
  console.log('Using Firebase Auth Emulator')
  // Uncomment this line to use the Firebase Auth Emulator
  // connectAuthEmulator(auth, 'http://localhost:9099')
}

export { auth, googleProvider } 