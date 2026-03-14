// Import Firebase functions via CDN (Version 12.9.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, deleteUser, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX7NmAsDkBik-mbmEWqwodLUv9nQjJ65g",
  authDomain: "commu-nect-e6bb9.firebaseapp.com",
  projectId: "commu-nect-e6bb9",
  storageBucket: "commu-nect-e6bb9.firebasestorage.app",
  messagingSenderId: "589689646614",
  appId: "1:589689646614:web:ac474ff850d276a263cf37"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
        if (file.type === "application/pdf") {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
}

window.registerUser = async () => {
    const fName = document.getElementById('reg-firstname').value.trim();
    const mi = document.getElementById('reg-mi').value.trim();
    const lName = document.getElementById('reg-lastname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const contact = document.getElementById('reg-contact').value.trim();
    const mm = document.getElementById('reg-mm').value.trim();
    const dd = document.getElementById('reg-dd').value.trim();
    const yyyy = document.getElementById('reg-yyyy').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;

    const roleElement = document.querySelector('input[name="reg-role"]:checked');
    if (!roleElement) return alert("Please select a Role.");
    const role = roleElement.value;

    const fileInput = document.getElementById('reg-proof');
    const file = fileInput.files[0];

    if (file) {
        const fileSizeMB = file.size / (1024 * 1024);
        const limitMB = 5; 
        if (fileSizeMB > limitMB) {
            alert(`The file is too large (${fileSizeMB.toFixed(2)}MB). Please upload an image smaller than ${limitMB}MB.`);
            fileInput.value = ""; 
            return;
        }
    }

    if (!fName || !lName || !email || !password) return alert("Please fill in all required fields.");
    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (role === "Resident" && !file) return alert("Proof of residency is required for Residents.");

    let createdUser = null;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        createdUser = userCredential.user;
        
        let proofString = "";
        if (file) {
            proofString = await compressImage(file);
            if (proofString.length > 900000) {
                throw new Error("Even after compression, the image is too large to store. Please use a smaller image.");
            }
        }

        const status = (role === "Resident") ? "pending" : "approved";

        await setDoc(doc(db, "users", createdUser.uid), {
            firstName: fName,
            middleInitial: mi,
            lastName: lName,
            email: email,
            contactNo: contact,
            birthday: `${mm}/${dd}/${yyyy}`,
            userType: role,
            proofOfResidency: proofString,
            verificationStatus: status,
            createdAt: new Date()
        });

        const actionCodeSettings = {
            url: window.location.origin + '/index.html', 
            handleCodeInApp: false
        };

        await sendEmailVerification(createdUser, actionCodeSettings);

        alert("Account created! A verification email has been sent. You have 3 minutes to verify.");
        startVerificationTimer(createdUser);
        
    } catch (error) {
        alert("Registration failed: " + error.message);
        if (createdUser) {
            try { await deleteUser(createdUser); } catch (e) {}
        }
    }
};

function startVerificationTimer(user) {
    let timeLeft = 180;
    const timerDisplay = document.getElementById('timer-display');

    const countdown = setInterval(async () => {
        timeLeft--;
        if (timerDisplay) timerDisplay.innerText = `Verify email within: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            try {
                await user.reload();
                if (!user.emailVerified) {
                    await deleteUser(user);
                    alert("Verification time expired. Your unverified account has been removed.");
                } else {
                    alert("Email verified! Please log in.");
                }
            } catch (e) {}
            if (timerDisplay) timerDisplay.innerText = "";
        }
    }, 1000);
}

window.loginUser = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    const loginRoleElement = document.querySelector('input[name="login-role"]:checked');
    if (!loginRoleElement) return alert("Please select your role to login.");
    const loginRole = loginRoleElement.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("Please verify your email address before logging in.");
            await signOut(auth);
            return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.userType !== loginRole) {
                alert("Access Denied: Your registered role does not match this selection.");
                await signOut(auth);
                return;
            }

            if (userData.userType === "Resident" && userData.verificationStatus === "pending") {
                alert("Your account is pending Admin verification. Please try again later.");
                await signOut(auth);
                return;
            }

            // NEW FIX: Block rejected users from entering the system
            if (userData.verificationStatus === "rejected") {
                alert("Your account application was denied by the Barangay.");
                await signOut(auth);
                return;
            }

            sessionStorage.setItem('userRole', userData.userType);

            if (userData.userType === "Barangay Official") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }
dfefaef
        } else {
            alert("User data not found. Please contact support.");
            await signOut(auth);
        }
    } catch (error) {
        alert("Invalid credentials. Please check your email and password.");
    }
};

window.sendPasswordReset = async () => {
    const email = document.getElementById('reset-email').value.trim();
    if (!email) return alert("Please enter your email address.");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent! Please check your inbox.");
        showLoginForm(); 
    } catch (error) {
        alert("Error: " + error.message);
    }
};

onAuthStateChanged(auth, (user) => {
    const currentPage = window.location.pathname.split('/').pop();
    const isAuthPage = currentPage === 'index.html' || currentPage === '';
    const activeRole = sessionStorage.getItem('userRole');

    if (user && user.emailVerified && activeRole) {
        if (isAuthPage) {
            if (activeRole === "Barangay Official") {
                // Change this line from admin-verification.html to admin-dashboard.html
                window.location.href = "admin-dashboard.html"; 
            } else {
                window.location.href = "dashboard.html";
            }
        }
    } else if (!user) {
        if (!isAuthPage) window.location.href = "index.html";
    }
});

window.logoutUser = async (event) => {
    if (event) event.preventDefault();
    try {
        await signOut(auth);
        sessionStorage.removeItem('userRole');
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

window.showLoginForm = (event) => {
    if (event) event.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};

window.showSignupForm = (event) => {
    if (event) event.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
};

window.showForgotPassword = (event) => {
    if (event) event.preventDefault();
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'block';
};
