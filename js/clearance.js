import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Monitor Auth State (Helps debug the Permission error)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Authenticated as:", user.email);
    } else {
        console.warn("User is not logged in. Firestore rules may block submission.");
    }
});

const form = document.getElementById("clearanceForm");

if (form) {
    document.getElementById("submitClearance").addEventListener("click", async function(e) {
        e.preventDefault();

        // Check if user is logged in before even trying
        if (!auth.currentUser) {
            alert("You must be logged in to submit a clearance request.");
            return;
        }

        const email = form.querySelector("#email").value;

        try {
            // 1. Check for existing pending requests in "clearance" collection
            const q = query(
                collection(db, "clearance"),
                where("emailAddress", "==", email),
                where("status", "==", "Pending")
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                alert("You already have a pending clearance request. Please wait for approval.");
                return;
            }

            // 2. Save new request using the field names from your screenshot
            await addDoc(collection(db, "clearance"), {
                fullName: form.querySelector("#name").value,
                address: form.querySelector("#address").value,
                emailAddress: email,
                age: Number(form.querySelector("#age").value),
                bday: form.querySelector("#bday").value,
                yearsLiving: form.querySelector("#yearsLiving").value,
                purpose: form.querySelector("#purpose").value,
                patient: form.querySelector("#patient")?.value || "",
                deceased: form.querySelector("#deceased")?.value || "",
                student: form.querySelector("#student")?.value || "",
                status: "Pending",
                dateSubmitted: serverTimestamp()
            });

            document.getElementById("successModal").style.display = "flex";
            form.reset();

        } catch (error) {
            console.error("Error submitting clearance: ", error);
            // If the error persists, check if an Index needs to be created in the console log
            alert("Submission failed: " + error.message);
        }
    });
}

window.closeModal = function() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.style.display = "none";
    }
};