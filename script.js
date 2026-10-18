// ==========================================
// 1. UNIFIED STORE NAVIGATION ROUTER
// ==========================================
function navigateToSection(targetId) {
    const counterMenu = document.getElementById("the-counter");
    const allSections = document.querySelectorAll(".store-section");
    const cleanId = (targetId || "").replace("#", "");

    if (!cleanId || cleanId === "the-counter") {
        allSections.forEach(section => {
            section.classList.remove("active");
            section.style.display = "none";
        });
        if (counterMenu) counterMenu.style.display = "block";
    } else {
        const targetSection = document.getElementById(cleanId);
        if (targetSection && targetSection.classList.contains("store-section")) {
            if (counterMenu) counterMenu.style.display = "none";
            allSections.forEach(section => {
                section.classList.remove("active");
                section.style.display = "none";
            });
            targetSection.classList.add("active");
            targetSection.style.display = "block";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
}

document.addEventListener("click", (event) => {
    const counterLink = event.target.closest(".counter-item");
    if (counterLink) {
        event.preventDefault();
        const targetId = counterLink.getAttribute("href");
        window.location.hash = targetId;
        navigateToSection(targetId);
        return;
    }

    const backBtn = event.target.closest(".back-to-counter");
    if (backBtn) {
        event.preventDefault();
        window.location.hash = "the-counter";
        navigateToSection("the-counter");
    }
});

window.addEventListener("hashchange", () => {
    navigateToSection(window.location.hash);
});

// ==========================================
// 2. GUESTBOOK / ORDER SHEET LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    navigateToSection(window.location.hash);

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
                    <span class="log-vibe">[${log.genre || 'Ambient'}]</span>
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

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const payload = {
                name: document.getElementById('visitor-name').value,
                genre: document.getElementById('visitor-genre').value,
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

function toggleTracklist(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.toggle('show-back');
    }
}

function toggleGenreTracklist(itemId) {
    const item = document.getElementById(itemId);
    if (!item) return;
    item.classList.toggle('open');
}

function filterGenre(selectedGenre) {
    const cards = document.querySelectorAll('.record-card');
    const tabs = document.querySelectorAll('.genre-tab');

    // Update active tab styling
    tabs.forEach(tab => {
        const matches = tab.getAttribute('onclick')?.includes(`'${selectedGenre}'`);
        tab.classList.toggle('active', !!matches);
    });

    // Show or hide cards based on data-genre attribute
    cards.forEach(card => {
        const cardGenre = card.getAttribute('data-genre');
        if (selectedGenre === 'all' || cardGenre === selectedGenre) {
            card.classList.remove('genre-hidden');
        } else {
            card.classList.add('genre-hidden');
            // Reset flipped state if hiding
            card.classList.remove('show-back');
        }
    });
}

function openLightbox(cardId) {
    const card = document.getElementById(cardId);
    const modal = document.getElementById('album-lightbox');
    if (!card || !modal) return;

    const img = card.querySelector('.jacket-cover-img');
    const title = card.querySelector('.album-details h3')?.innerText || 'Release Art';
    const tech = card.querySelector('.release-tech')?.innerText || '';

    const titleEl = document.getElementById('lightbox-title');
    const techEl = document.getElementById('lightbox-tech');
    const target = document.getElementById('lightbox-art-target');

    if (titleEl) titleEl.innerText = title;
    if (techEl) techEl.innerText = tech;

    // Render image inside the modal if present, otherwise fall back to jacket text
    if (target) {
        if (img) {
            target.innerHTML = `<img src="${img.src}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">`;
        } else {
            const jacketArt = card.querySelector('.jacket-art');
            target.innerHTML = jacketArt ? jacketArt.innerHTML : '';
        }
    }

    if (typeof modal.showModal === 'function') {
        modal.showModal();
    } else {
        modal.setAttribute('open', '');
    }
}

function closeLightbox(event) {
    const modal = document.getElementById('album-lightbox');
    if (event.target === modal) {
        modal.close();
    }
}