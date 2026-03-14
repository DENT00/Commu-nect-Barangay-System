import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

// Use getApps() to prevent the page from crashing when loading multiple Firebase files
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Matched to the actual ID in your HTML
const form = document.getElementById("clearanceForm");

if (form) {
    document.getElementById("submitClearance").addEventListener("click", async function(e) {
        e.preventDefault();

        const clearanceID = "CLR-" + Date.now();
        const email = form.querySelector("#email").value;

        // Query Firestore to check for existing pending requests
        const q = query(
            collection(db, "clearanceRequests"),
            where("email", "==", email),
            where("status", "==", "Pending")
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("You already have a pending clearance request. Please wait for approval.");
            return;
        }

        // Save new request to Firestore
        try {
            await addDoc(collection(db, "clearanceRequests"), {
                id: clearanceID,
                name: form.querySelector("#name").value,
                address: form.querySelector("#address").value,
                age: form.querySelector("#age").value,
                bday: form.querySelector("#bday").value,
                yearsLiving: form.querySelector("#yearsLiving").value,
                email: email,
                purpose: form.querySelector("#purpose").value,
                patient: form.querySelector("#patient") ? form.querySelector("#patient").value : "",
                deceased: form.querySelector("#deceased") ? form.querySelector("#deceased").value : "",
                student: form.querySelector("#student") ? form.querySelector("#student").value : "",
                status: "Pending",
                dateSubmitted: new Date().toLocaleString()
            });

            document.getElementById("successModal").style.display = "flex";
            form.reset();
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Something went wrong. Please try again.");
        }
    });
}

window.closeModal = function() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.style.display = "none";
    }
}