// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Your Firebase configuration
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
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword };
