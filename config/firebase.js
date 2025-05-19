import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithCustomToken
} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC1pjl3SIx8bApgZDwgJRi5dIbFjfcsjOM",
  authDomain: "iceraider-7d19a.firebaseapp.com",
  projectId: "iceraider-7d19a",
  storageBucket: "iceraider-7d19a.firebasestorage.app",
  messagingSenderId: "171431054128",
  appId: "1:171431054128:web:d887857b6e5668c24996f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth instead of getAuth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithCustomToken };
