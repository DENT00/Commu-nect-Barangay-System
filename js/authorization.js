// Import Firebase functions via CDN (Version 12.9.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, deleteUser, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Process 1.0: Account Registration ---
window.registerUser = async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const role = document.getElementById('reg-role').value;

    if (!role) return alert("Please select Resident or Non-Resident.");

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), { 
            email: email, 
            userType: role, 
            createdAt: new Date() 
        });
        
        await sendEmailVerification(user);
        alert("Verification email sent! You have 3 minutes to verify.");
        startVerificationTimer(user);
        
    } catch (error) { 
        console.error("Registration Error:", error.message); 
        alert(error.message); 
    }
};

// --- Process 1.3: Verify Confirmation & 3-Minute Purge ---
function startVerificationTimer(user) {
    let timeLeft = 180; 
    const timerDisplay = document.getElementById('timer-display');
    
    const countdown = setInterval(async () => {
        timeLeft--;
        if(timerDisplay) timerDisplay.innerText = `Verify email within: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            await user.reload(); 
            
            if (!user.emailVerified) {
                await deleteUser(user);
                alert("Verification time expired. Unverified account has been purged from the system.");
                if(timerDisplay) timerDisplay.innerText = "";
            }
        }
    }, 1000);
}

// --- Login & Role Routing ---
window.loginUser = async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (!userCredential.user.emailVerified) {
            alert("Please verify your email address before logging in.");
            auth.signOut();
        } else {
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists() && userDoc.data().userType === 'non-resident') {
                sessionStorage.setItem('userRole', 'non-resident');
            } else {
                sessionStorage.setItem('userRole', 'resident');
            }
            window.location.href = "dashboard.html";
        }
    } catch (error) { 
        alert("Invalid credentials. Please check your email and password."); 
    }
};

// --- Route Guard & Session Security ---
onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = currentPage === 'index.html' || currentPage === '';

    if (user && user.emailVerified) {
        if (isAuthPage) window.location.href = "dashboard.html";
    } else {
        if (!isAuthPage) window.location.href = "index.html";
    }
});

// --- Logout Function ---
window.logoutUser = async () => {
    try {
        await signOut(auth);
        sessionStorage.removeItem('userRole');
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// --- Switch between Login and Sign Up UI ---
function toggleAuth(event) {
    // Stop the link from jumping to the top of the page
    event.preventDefault(); 

    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // If Sign Up is currently hidden, show it and hide Login
    if (signupForm.style.display === 'none') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        // Otherwise, hide Sign Up and show Login
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}
// Make function globally available if you are using type="module"
window.toggleAuth = toggleAuth;