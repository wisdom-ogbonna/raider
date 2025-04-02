// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // Import Firestore


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
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestor

export { auth, db, createUserWithEmailAndPassword };
