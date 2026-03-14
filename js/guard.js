document.addEventListener("DOMContentLoaded", () => {
    const userRole = sessionStorage.getItem('userRole');
    const currentPage = window.location.pathname.split('/').pop();

    if (!userRole && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
        return;
    }

    // --- FIX 1: Dynamic Home Link Routing ---
    // Automatically change the "Home" link to the admin dashboard for officials
    if (userRole === "Barangay Official") {
        document.querySelectorAll('a[href="dashboard.html"]').forEach(link => {
            link.href = "admin-dashboard.html";
        });
    }

    const rolePermissions = {
        "Barangay Official": [
            "admin-dashboard.html", 
            "admin-verification.html", 
            "announcement.html",
            "announcements.html", 
            "community-network.html",
            "news-feed.html",     
            "upload-announcement.html",   
            "request-forms.html",         
            "admin-clearance.html",       
            "admin-jobseeker.html" 
        ],
        "Resident": [
            "dashboard.html", 
            "announcement.html",
            "announcements.html", 
            "community-network.html",
            "news-feed.html",     
            "community-upload.html",      
            "request-forms.html",         
            "clearance-form.html",        
            "oath-undertaking-form.html"  
        ],
        "Non-Resident": [
            "dashboard.html", 
            "announcement.html",
            "announcements.html", 
            "community-network.html",
            "news-feed.html",     
            "request-forms.html"  
        ]
    };

    if (userRole && currentPage !== 'index.html' && currentPage !== '') {
        const allowedPages = rolePermissions[userRole] || [];
        
        if (!allowedPages.includes(currentPage)) {
            
            // --- FIX 2: Silent Redirects for Dashboard Mix-ups (Anti-Flash) ---
            if (userRole === "Barangay Official" && currentPage === "dashboard.html") {
                window.location.replace("admin-dashboard.html");
                return; // Stop execution, do not show the modal
            }
            if (userRole !== "Barangay Official" && currentPage === "admin-dashboard.html") {
                window.location.replace("dashboard.html");
                return; // Stop execution, do not show the modal
            }

            // Create the lock screen for genuine unauthorized access
            document.body.style.overflow = 'hidden';

            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            overlay.style.backdropFilter = 'blur(8px)';
            overlay.style.WebkitBackdropFilter = 'blur(8px)';
            overlay.style.zIndex = '9999';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';

            const modal = document.createElement('div');
            modal.style.backgroundColor = '#ffffff';
            modal.style.padding = '30px 40px';
            modal.style.borderRadius = '12px';
            modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
            modal.style.textAlign = 'center';
            modal.style.fontFamily = 'Arial, sans-serif';
            modal.style.maxWidth = '400px';

            const friendlyPageName = currentPage.replace('.html', '').replace('-', ' ');
            modal.innerHTML = `
                <i class="fas fa-lock" style="font-size: 40px; color: #d9534f; margin-bottom: 15px;"></i>
                <h2 style="color: #333; margin: 0 0 10px 0;">Access Denied</h2>
                <p style="color: #666; margin-bottom: 25px; line-height: 1.5;">
                    As a <strong>${userRole}</strong>, you do not have permission to view the <strong>${friendlyPageName}</strong> page.
                </p>
                <button id="kickout-btn" style="background-color: #61b136; color: white; border: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; cursor: pointer; font-weight: bold; width: 100%;">
                    Return to Dashboard
                </button>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

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