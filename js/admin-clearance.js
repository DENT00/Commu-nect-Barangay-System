import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize EmailJS
emailjs.init("DPWCQhOxzXHuAxJlq");

const tableBody = document.getElementById("tableBody");

// 1. CHANGED: collection name from "clearanceRequests" to "clearance"
onSnapshot(collection(db, "clearance"), (snapshot) => {
    tableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id;

        // 2. UPDATED: Using the new field names (fullName, emailAddress)
        let row = `
        <tr>
            <td>${docId.substring(0, 8)}...</td> 
            <td>${data.fullName || ""}</td>
            <td>${data.address || ""}</td>
            <td>${data.age || ""}</td>
            <td>${data.bday || ""}</td>
            <td>${data.yearsLiving || ""}</td>
            <td>${data.emailAddress || ""}</td>
            <td>${data.purpose || ""}</td>
            <td>${data.patient || ""}</td>
            <td>${data.deceased || ""}</td>
            <td>${data.student || ""}</td>
            <td>
                <button class="approve" onclick="approveRequest('${docId}','${data.emailAddress}','${data.fullName}','${data.status}')">✔</button>
                <button class="deny" onclick="denyRequest('${docId}','${data.emailAddress}','${data.fullName}','${data.status}')">✖</button>
                <button class="delete" onclick="deleteRequest('${docId}')">🗑</button>
            </td>
            <td class="status ${data.status ? data.status.toLowerCase() : 'pending'}">${data.status || "Pending"}</td>
        </tr>
        `;
        tableBody.innerHTML += row;
    });
});

// APPROVE REQUEST (Updated collection reference)
window.approveRequest = async function(docId, email, name, status) {
    if (status === "Approved") {
        alert("This request is already approved.");
        return;
    }

    try {
        const requestRef = doc(db, "clearance", docId); // Changed to "clearance"
        await updateDoc(requestRef, { status: "Approved" });

        emailjs.send("service_k0jg0op", "template_iqrjxi2", {
            name: name,
            email: email,
            status: "APPROVED"
        }).then(() => console.log("Approval email sent"))
          .catch(err => console.error("Email error:", err));

    } catch (error) {
        console.error("Error updating document:", error);
    }
}

// DENY REQUEST (Updated collection reference)
window.denyRequest = async function(docId, email, name, status) {
    if (status === "Denied") {
        alert("This request is already denied.");
        return;
    }

    try {
        const requestRef = doc(db, "clearance", docId); // Changed to "clearance"
        await updateDoc(requestRef, { status: "Denied" });

        emailjs.send("service_k0jg0op", "template_iqrjxi2", {
            name: name,
            email: email,
            status: "DENIED"
        }).then(() => console.log("Denial email sent"))
          .catch(err => console.error("Email error:", err));

    } catch (error) {
        console.error("Error updating document:", error);
    }
}

// DELETE REQUEST (Updated collection reference)
window.deleteRequest = async function(docId) {
    if(confirm("Are you sure you want to delete this request permanently?")) {
        try {
            await deleteDoc(doc(db, "clearance", docId)); // Changed to "clearance"
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    }
};