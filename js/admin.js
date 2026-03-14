import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Added Auth initialization
const db = getFirestore(app);

let currentUserIdToApprove = null;

async function loadPendingUsers() {
    const tableBody = document.getElementById('verification-table-body');
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading pending users...</td></tr>';

    try {
        const q = query(collection(db, "users"), where("verificationStatus", "==", "pending"));
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = '';

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center;">No pending users to verify.</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const userId = docSnap.id;
            const shortId = userId.substring(0, 5);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shortId}</td>
                <td>${user.firstName}</td>
                <td>${user.middleInitial}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.contactNo}</td>
                <td>${user.birthday}</td>
                <td>${user.userType}</td>
                <td><button class="file-btn" onclick="openImageModal('${user.proofOfResidency}')">View ID</button></td>
                <td class="approval-actions">
                    <i class="far fa-check-circle action-icon approve" style="cursor: pointer;" onclick="openApprovalModal('${userId}', '${user.firstName} ${user.lastName}')"></i>
                    <i class="far fa-times-circle action-icon reject" style="cursor: pointer;" onclick="rejectUser('${userId}')"></i>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading pending users:", error);
        tableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Error loading data. Check console.</td></tr>';
    }
}

window.approveUser = async (assignedRole) => {
    if (!currentUserIdToApprove) return;
    try {
        const userRef = doc(db, "users", currentUserIdToApprove);
        await updateDoc(userRef, {
            verificationStatus: "approved",
            userType: assignedRole
        });
        alert(`User successfully approved as a ${assignedRole}!`);
        closeModals();
        loadPendingUsers();
    } catch (error) {
        console.error("Error approving user:", error);
        alert("Failed to approve user.");
    }
};

window.rejectUser = async (userId) => {
    if(confirm("Are you sure you want to reject this application?")) {
        try {
            await updateDoc(doc(db, "users", userId), {
                verificationStatus: "rejected"
            });
            alert("User rejected.");
            loadPendingUsers();
        } catch (error) {
            console.error("Error rejecting user:", error);
        }
    }
};

window.openImageModal = (base64ImageString) => {
    document.getElementById('modal-doc-image').src = base64ImageString;
    document.getElementById('image-modal').style.display = 'flex';
};

window.openApprovalModal = (userId, fullName) => {
    currentUserIdToApprove = userId; 
    document.getElementById('approval-modal-name').innerText = fullName;
    document.getElementById('approval-modal').style.display = 'flex';
};

window.closeModals = () => {
    document.getElementById('image-modal').style.display = 'none';
    document.getElementById('approval-modal').style.display = 'none';
    currentUserIdToApprove = null;
};

document.addEventListener('DOMContentLoaded', () => {
    // FIX: Wait for Firebase to confirm the user is logged in before asking for data
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadPendingUsers();
        } else {
            document.getElementById('verification-table-body').innerHTML = '<tr><td colspan="10" style="text-align: center; color: red;">Please log in first.</td></tr>';
        }
    });
    
    // Close modal when clicking outside the box
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) closeModals();
        });
    });
});