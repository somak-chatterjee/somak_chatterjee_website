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
});