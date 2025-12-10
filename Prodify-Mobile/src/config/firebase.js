import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Firebase configuration
// Option 1: Set these values directly here
// Option 2: Use environment variables via Expo (app.config.js)
//
// To use environment variables with Expo:
// 1. Create app.config.js and add your config to extra:
//    export default {
//      expo: {
//        extra: {
//          firebaseApiKey: process.env.FIREBASE_API_KEY,
//          firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
//          ...
//        }
//      }
//    }
// 2. Access via Constants.expoConfig.extra.firebaseApiKey

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = ["apiKey", "authDomain", "projectId", "appId"];
  const missingFields = requiredFields.filter(
    (field) =>
      !firebaseConfig[field] || firebaseConfig[field].startsWith("YOUR_"),
  );

  if (missingFields.length > 0) {
    console.warn(
      `⚠️ Firebase configuration incomplete. Missing or placeholder values for: ${missingFields.join(", ")}\n` +
        "Please update src/config/firebase.js with your Firebase project credentials.\n" +
        "You can find these in the Firebase Console > Project Settings > Your Apps > Web App",
    );
  }
};

// Initialize Firebase
let app;
let auth;

try {
  validateConfig();

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);

    // Initialize Auth with AsyncStorage persistence for React Native
    if (Platform.OS !== "web") {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } else {
      auth = getAuth(app);
    }

    console.log("✅ Firebase initialized successfully");
  } else {
    app = getApp();
    auth = getAuth(app);
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
  throw error;
}

export { app, auth, firebaseConfig };
