// Firebase core
import { initializeApp } from "firebase/app";

// Firestore
import { getFirestore } from "firebase/firestore";

// Firebase Auth (React Native)
// AsyncStorage for persistence
import { initializeAuth } from "firebase/auth";
// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence (THIS FIXES THE WARNING)
export const auth = initializeAuth(app);

// Firestore
export const db = getFirestore(app);
