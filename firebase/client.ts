// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcacHNt4dnLcWA8epYqLvnqwYtPpvVXkE",
  authDomain: "interviewme-3d4b7.firebaseapp.com",
  projectId: "interviewme-3d4b7",
  storageBucket: "interviewme-3d4b7.firebasestorage.app",
  messagingSenderId: "494615740157",
  appId: "1:494615740157:web:743059d105744096540894",
  measurementId: "G-PDJX95XJQR",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
