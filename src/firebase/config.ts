// Firebase Configuration
// This file connects your app to Firebase services

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// 🔑 Your Firebase project credentials
// Replace these with your actual values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCpqrtXTATEcg7TBpGXoWFnv4aPl2lN9WI",
  authDomain: "sticky-notes-tracker.firebaseapp.com",
  projectId: "sticky-notes-tracker",
  storageBucket: "sticky-notes-tracker.firebasestorage.app",
  messagingSenderId: "731558338663",
  appId: "1:731558338663:web:e98076e35a35d179f6b4c2",
  measurementId: "G-QK9DJT471K"
};

// Step 1: Initialize the Firebase app with your config
const app = initializeApp(firebaseConfig);

// Step 2: Get Firebase services and export them
// These will be imported in other files to use Firebase features

// auth = handles user login, signup, logout
export const auth = getAuth(app);

// db = Firestore database for storing notes in the cloud
export const db = getFirestore(app);

// Export app as default (optional, rarely needed)
export default app;