// Wait for the HTML document to fully load before running the script
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Grab all our interactive elements from the HTML
    const counterMenu = document.getElementById("the-counter");
    const counterLinks = document.querySelectorAll(".counter-item");
    const backButtons = document.querySelectorAll(".back-to-counter");
    const allSections = document.querySelectorAll(".store-section");

    // 2. Listening for when a user clicks a Counter Card
    counterLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            // Prevent the default browser behavior of jump-scrolling to the anchor
            event.preventDefault();

            // Get the specific ID target (e.g., "#portfolio" or "#about")
            const targetId = link.getAttribute("href");
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Hide the main Counter Menu
                counterMenu.style.display = "none";
                
                // Show the targeted section by adding our active class
                targetSection.classList.add("active");
            }
        });
    });

    // 3. Listening for when a user clicks "Back to the Counter"
    backButtons.forEach(button => {
        button.addEventListener("click", (event) => {
            event.preventDefault();

            // Hide all open store sections by removing the active class
            allSections.forEach(section => {
                section.classList.remove("active");
            });

            // Bring the main Counter Menu back into view
            counterMenu.style.display = "block";
        });
    });


    // ==========================================
    // 2. NEW GUESTBOOK LISTENING STATION LOGIC
    // ==========================================
    const form = document.getElementById('order-sheet-form');
    const messagesContainer = document.getElementById('messages-container');

    // Establish or retrieve the visitor's unique cryptographic receipt token
    let visitorToken = localStorage.getItem('station_token');
    if (!visitorToken) {
        visitorToken = window.crypto && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        localStorage.setItem('station_token', visitorToken);
    }

    // Fetch and render only this visitor's logged tracks
    async function loadListeningLogs() {
        // If the HTML container doesn't exist on this page, exit early to prevent errors
        if (!messagesContainer) return; 

        try {
            const response = await fetch('/.netlify/functions/get_orders', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-visitor-token': visitorToken
                }
            });

            if (!response.ok) throw new Error('Could not pull station logs.');
            
            const logs = await response.json();
            
            if (logs.length === 0) {
                messagesContainer.innerHTML = '<p class="empty-log">Your clipboard is currently clean. Submit an order to log a track!</p>';
                return;
            }

            // Map and safely render the array
            messagesContainer.innerHTML = logs.map(log => `
                <div class="log-entry">
                    <span class="log-vibe">[${log.track_vibe || 'Ambient'}]</span>
                    <strong>${escapeHTML(log.name)}:</strong>
                    <p class="log-msg">"${escapeHTML(log.message)}"</p>
                    <small class="log-date">${new Date(log.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');

        } catch (err) {
            console.error('Error fetching logs:', err);
            messagesContainer.innerHTML = '<p class="error-log">System offline: Unable to load station log ledger.</p>';
        }
    }

    // Intercept form submissions and route them to post_orders.js
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const payload = {
                name: document.getElementById('visitor-name').value,
                track_genre: document.getElementById('visitor-genre').value,
                message: document.getElementById('visitor-message').value,
                visitor_token: visitorToken
            };

            try {
                const response = await fetch('/.netlify/functions/post_orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Network response failed.');

                form.reset(); 
                await loadListeningLogs(); // Refresh view
                alert('Order Sheet logged successfully to the station clipboard!');

            } catch (err) {
                console.error('Submission error:', err);
                alert('Failed to log order sheet. Check network configuration.');
            }
        });
    }

    // Protection Utility: Sanitize text inputs against Cross-Site Scripting (XSS)
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Fire the initial data load on startup
    loadListeningLogs();
});