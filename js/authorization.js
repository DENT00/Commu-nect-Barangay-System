// Import Firebase functions via CDN (Version 12.9.0)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword, 
  deleteUser, 
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
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

// --- Helper Function: Compress Image before saving ---
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
        // PDFs cannot be drawn on canvas — store as base64 directly (smaller files only)
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

// --- Process 1.0: Account Registration ---
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

    if (!fName || !lName || !email || !password) return alert("Please fill in all required fields.");
    if (password !== confirmPassword) return alert("Passwords do not match!");
    if (role === "Resident" && !file) return alert("Proof of residency is required for Residents.");

    // ✅ FIX: Track the created user so we can clean up on ANY failure
    let createdUser = null;

    try {
        // STEP 1: Create Auth user
        console.log("Step 1: Creating Auth user...");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        createdUser = userCredential.user;
        console.log("Auth user created. UID:", createdUser.uid);

        // STEP 2: Compress image (if provided)
        console.log("Step 2: Processing image...");
        let proofString = "";
        if (file) {
            // ✅ FIX: Check file size BEFORE compressing — Firestore has a 1MB per-document limit
            if (file.size > 5 * 1024 * 1024) {
                throw new Error("File is too large. Please upload an image under 5MB.");
            }
            proofString = await compressImage(file);
            console.log("Image compressed. Base64 length:", proofString.length);

            // ✅ FIX: Warn if compressed result is still too large for Firestore (1MB doc limit)
            if (proofString.length > 900000) {
                throw new Error("Even after compression, the image is too large to store. Please use a smaller image.");
            }
        }

        const status = (role === "Resident") ? "pending" : "approved";

        // STEP 3: Save to Firestore
        console.log("Step 3: Saving data to Firestore...");
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
        console.log("Firestore document saved successfully!");

        // STEP 4: Send verification email
        console.log("Step 4: Sending verification email...");
        await sendEmailVerification(createdUser);
        console.log("Verification email sent!");

        alert("Account created! A verification email has been sent. You have 3 minutes to verify.");
        startVerificationTimer(createdUser);

    } catch (error) {
        // ✅ FIX: Log the FULL error so you can see exactly what failed
        console.error("Registration Error Code:", error.code);
        console.error("Registration Error Message:", error.message);
        console.error("Full error:", error);

        alert("Registration failed: " + error.message);

        // Only delete the auth user if it was created in this attempt
        if (createdUser) {
            try {
                await deleteUser(createdUser);
                console.log("Cleaned up incomplete auth user.");
            } catch (deleteError) {
                console.error("Could not delete incomplete auth user:", deleteError.message);
            }
        }
    }
};

// --- Process 1.3: Verify Confirmation & 3-Minute Purge ---
function startVerificationTimer(user) {
    let timeLeft = 180;
    const timerDisplay = document.getElementById('timer-display');

    const countdown = setInterval(async () => {
        timeLeft--;
        if (timerDisplay) {
            timerDisplay.innerText = `Verify email within: ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`;
        }

        if (timeLeft <= 0) {
            clearInterval(countdown);

            try {
                await user.reload();

                if (!user.emailVerified) {
                    // ✅ FIX: Delete both the Auth user AND the Firestore document on expiry
                    await deleteUser(user);
                    alert("Verification time expired. Your unverified account has been removed.");
                } else {
                    alert("Email verified! Please log in.");
                }
            } catch (e) {
                console.error("Timer cleanup error:", e.message);
            }

            if (timerDisplay) timerDisplay.innerText = "";
        }
    }, 1000);
}

// --- Login & Role Routing ---
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

            sessionStorage.setItem('userRole', userData.userType);

            if (userData.userType === "Barangay Official") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } else {
            alert("User data not found. Please contact support.");
            await signOut(auth);
        }

    } catch (error) {
        console.error("Login error:", error.code, error.message);
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
    if (event) event.preventDefault();
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    if (signupForm.style.display === 'none') {
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    } else {
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
    }
}
window.toggleAuth = toggleAuth;