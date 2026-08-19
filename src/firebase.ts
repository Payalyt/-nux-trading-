import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAkOe1CNFUgSN8Ek0SfRRfhHFbZ7vr9l8M",
  authDomain: "obasi-115d8.firebaseapp.com",
  projectId: "obasi-115d8",
  storageBucket: "obasi-115d8.firebasestorage.app",
  messagingSenderId: "959117138313",
  appId: "1:959117138313:web:ead7a254083b3ab39c6958",
  measurementId: "G-CGRD5DT04G"
};

// Initialize Firebase App safely (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
