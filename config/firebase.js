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
  apiKey: "AIzaSyAanLEWUPYDY-O4yDXp9GYvnJCZk04V_7Y",
  authDomain: "iceraider-10280.firebaseapp.com",
  projectId: "iceraider-10280",
  storageBucket: "iceraider-10280.firebasestorage.app",
  messagingSenderId: "286447320245",
  appId: "1:286447320245:web:4f9b26bbadccbdc0bcd2fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Use initializeAuth instead of getAuth for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { auth, db, firebaseConfig,createUserWithEmailAndPassword, signInWithCustomToken };
