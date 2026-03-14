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

// Read data from Firestore in real-time
onSnapshot(collection(db, "clearanceRequests"), (snapshot) => {
    tableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id; // This is the Firestore Document ID needed for updating/deleting

        let row = `
        <tr>
            <td>${data.id || ""}</td>
            <td>${data.name || ""}</td>
            <td>${data.address || ""}</td>
            <td>${data.age || ""}</td>
            <td>${data.bday || ""}</td>
            <td>${data.yearsLiving || ""}</td>
            <td>${data.email || ""}</td>
            <td>${data.purpose || ""}</td>
            <td>${data.patient || ""}</td>
            <td>${data.deceased || ""}</td>
            <td>${data.student || ""}</td>
            <td>
                <button class="approve" onclick="approveRequest('${docId}','${data.email}','${data.name}','${data.status}')">✔</button>
                <button class="deny" onclick="denyRequest('${docId}','${data.email}','${data.name}','${data.status}')">✖</button>
                <button class="delete" onclick="deleteRequest('${docId}')">🗑</button>
            </td>
            <td class="status ${data.status ? data.status.toLowerCase() : 'pending'}">${data.status || "Pending"}</td>
        </tr>
        `;
        tableBody.innerHTML += row;
    });
});

// APPROVE REQUEST
window.approveRequest = async function(docId, email, name, status) {
    if (status === "Approved") {
        alert("This request is already approved.");
        return;
    }

    try {
        const requestRef = doc(db, "clearanceRequests", docId);
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

// DENY REQUEST
window.denyRequest = async function(docId, email, name, status) {
    if (status === "Denied") {
        alert("This request is already denied.");
        return;
    }

    try {
        const requestRef = doc(db, "clearanceRequests", docId);
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

// DELETE REQUEST
window.deleteRequest = async function(docId) {
    if(confirm("Are you sure you want to delete this request permanently?")) {
        try {
            await deleteDoc(doc(db, "clearanceRequests", docId));
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    }
};