// Import Firebase functions via CDN (Version 12.9.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Your exact web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
    authDomain: "commu-nect-e6bb9.firebaseapp.com",
    projectId: "commu-nect-e6bb9",
    storageBucket: "commu-nect-e6bb9.firebasestorage.app",
    messagingSenderId: "589689646614",
    appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
