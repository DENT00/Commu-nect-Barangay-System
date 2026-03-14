// Import Firebase functions via CDN (Version 12.9.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

// Your exact web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD30sheL6HR5q95MxMRvqVWT_9ON3ML6uk",
    authDomain: "commu-nect.firebaseapp.com",
    projectId: "commu-nect",
    storageBucket: "commu-nect.firebasestorage.app",
    messagingSenderId: "67056180570",
    appId: "1:67056180570:web:af9fbad96687feecd82763"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);