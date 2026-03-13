// js/guard.js
document.addEventListener("DOMContentLoaded", () => {
    const userRole = sessionStorage.getItem('userRole');
    const currentPage = window.location.pathname.split('/').pop();

    if (!userRole && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return;
    }

    const rolePermissions = {
        "Barangay Official": [
            "admin-dashboard.html", 
            "admin-verification.html", 
            "announcement.html",          
            "upload-announcement.html",   
            "community-network.html",     
            "request-forms.html",         
            "admin-clearance.html",       
            "admin-oath-undertaking.html" 
        ],
        "Resident": [
            "dashboard.html", 
            "announcement.html",          
            "community-network.html",     
            "community-upload.html",      
            "request-forms.html",         
            "clearance-form.html",        
            "oath-undertaking-form.html"  
        ],
        "Non-Resident": [
            "dashboard.html", 
            "announcement.html",          
            "community-network.html"      
        ]
    };

    if (userRole && currentPage !== 'index.html' && currentPage !== '') {
        const allowedPages = rolePermissions[userRole] || [];
        
        if (!allowedPages.includes(currentPage)) {
            // STOP the user from scrolling while the popup is active
            document.body.style.overflow = 'hidden';

            // Create a full-screen blurred overlay
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Darken background slightly
            overlay.style.backdropFilter = 'blur(8px)'; // THIS CREATES THE BLUR EFFECT
            overlay.style.WebkitBackdropFilter = 'blur(8px)'; // Safari support
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';

            // Create the custom styled popup box
            const modal = document.createElement('div');
            modal.style.backgroundColor = '#ffffff';
            modal.style.padding = '30px 40px';
            modal.style.borderRadius = '12px';
            modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            modal.style.textAlign = 'center';
            modal.style.fontFamily = 'Arial, sans-serif';
            modal.style.maxWidth = '400px';

            modal.innerHTML = `
                <i class="fas fa-lock" style="font-size: 40px; color: #d9534f; margin-bottom: 15px;"></i>
                <h2 style="color: #333; margin: 0 0 10px 0;">Access Denied</h2>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                    As a <strong>${userRole}</strong>, you do not have permission to view or submit request forms.
                </p>
                <button id="kickout-btn" style="background-color: #61b136; color: white; border: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%;">
                    Return to Dashboard
                </button>
            `;

            // Inject the popup into the page
            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            // Handle what happens when they click the return button
            document.getElementById('kickout-btn').addEventListener('click', () => {
                if (userRole === "Barangay Official") {
                    window.location.href = "admin-dashboard.html"; 
                } else {
                    window.location.href = "dashboard.html";
                }
            });
        }
    }
});