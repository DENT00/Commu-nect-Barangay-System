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

// Use getApps() to prevent the page from crashing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Matched to the actual ID in your HTML
const form = document.getElementById("jobseekerForm");

if (form) {
    document.getElementById("submitJobseeker").addEventListener("click", async function(e) {
        e.preventDefault();

        const jobseekerID = "JBS-" + Date.now();
        
        // Matched to the exact 'job_' inputs in your HTML
        const email = form.querySelector("#job_email").value;

        // Check for existing pending requests
        const q = query(
            collection(db, "jobseekerRequests"),
            where("email", "==", email),
            where("status", "==", "Pending")
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert("You already have a pending Jobseeker request. Please wait for approval.");
            return;
        }

        // Save to Firestore
        try {
            await addDoc(collection(db, "jobseekerRequests"), {
                id: jobseekerID,
                name: form.querySelector("#job_name").value,
                address: form.querySelector("#job_address").value,
                email: email,
                age: form.querySelector("#job_age").value,
                bday: form.querySelector("#job_bday").value,
                sex: form.querySelector("#job_sex").value,
                school: form.querySelector("#job_school").value,
                schoolLevel: form.querySelector("#job_schoolLevel") ? form.querySelector("#job_schoolLevel").value : "",
                course: form.querySelector("#job_course") ? form.querySelector("#job_course").value : "",
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