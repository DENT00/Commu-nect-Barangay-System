import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

const form = document.getElementById("jobseekerForm");

if (form) {
    document.getElementById("submitJobseeker").addEventListener("click", async function(e) {
        e.preventDefault();

        // Check authentication state
        if (!auth.currentUser) {
            alert("You must be logged in to submit a request.");
            return;
        }

        const email = form.querySelector("#job_email").value;

        try {
            // 1. Query for existing pending requests
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

            // 2. Save to Firestore with standardized fields
            await addDoc(collection(db, "jobseekerRequests"), {
                fullName: form.querySelector("#job_name").value,
                address: form.querySelector("#job_address").value,
                email: email,
                age: Number(form.querySelector("#job_age").value),
                bday: form.querySelector("#job_bday").value,
                sex: form.querySelector("#job_sex").value,
                school: form.querySelector("#job_school").value,
                schoolLevel: form.querySelector("#job_schoolLevel")?.value || "",
                course: form.querySelector("#job_course")?.value || "",
                status: "Pending",
                dateSubmitted: serverTimestamp()
            });

            document.getElementById("successModal").style.display = "flex";
            form.reset();

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Submission failed. Please check your internet connection or login status.");
        }
    });
}

window.closeModal = function() {
    const modal = document.getElementById("successModal");
    if (modal) {
        modal.style.display = "none";
    }
};