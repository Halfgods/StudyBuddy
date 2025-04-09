const cooldownTime = 90 * 60; // 1.5 hours cooldown in seconds (for testing: adjust to 90 minutes)
let lastExitTime = localStorage.getItem("lastExitTime") ? parseInt(localStorage.getItem("lastExitTime")) : 0;
let remainingTime = localStorage.getItem("remainingTime") ? parseInt(localStorage.getItem("remainingTime")) : 15 * 60; // Default 15 minutes play time

// Prevent multiple game start intervals stacking
let gameInterval, checkTabClosedInterval;

// Simulating game loading with a timeout (replace this with your actual game load logic)
window.onload = function () {
    // Hide the loading screen
    document.getElementById("loading-screen").style.display = "none";
    
    // Show the game content
    document.getElementById("game-content").style.display = "block";
};

document.getElementById("play-game-btn").addEventListener("click", function () {
    let currentTime = Math.floor(Date.now() / 1000);
    let timeSinceLastExit = currentTime - lastExitTime;

    // Check if cooldown period is active
    if (remainingTime <= 0 && timeSinceLastExit < cooldownTime) {
        let waitTime = cooldownTime - timeSinceLastExit;
        let waitMinutes = Math.ceil(waitTime / 60);
        alert(`⏳ Wait ${waitMinutes} min before playing again!`);
        return;
    }

    // Open the game in a new tab
    let gameTab = window.open("https://www.crazygames.com/", "_blank");
    if (!gameTab) return;

    // Set the countdown time for the game session
    let timeLeft = remainingTime > 0 ? remainingTime : 60; // Start with remaining time or 1 minute for testing

    localStorage.setItem("remainingTime", 0); // Reset the remaining time when the game starts

    // Start the countdown for game time
    gameInterval = setInterval(() => {
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        document.title = `🎮 ${minutes}:${seconds < 10 ? "0" : ""}${seconds} left | StudyBuddy`; // Update the title

        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            gameTab.close(); // Close the game tab when the time runs out
            document.title = "📚 StudyBuddy"; // Reset the title
            localStorage.setItem("lastExitTime", Math.floor(Date.now() / 1000)); // Save the exit time
        }

        timeLeft--;
    }, 1000);

    // Monitor if the game tab is closed
    checkTabClosedInterval = setInterval(() => {
        if (gameTab.closed) {
            clearInterval(gameInterval); // Clear the countdown when the game tab is closed
            clearInterval(checkTabClosedInterval); // Stop checking if the tab is closed
            localStorage.setItem("remainingTime", timeLeft); // Save the remaining time
            localStorage.setItem("lastExitTime", Math.floor(Date.now() / 1000)); // Save the exit time
            document.title = "📚 StudyBuddy"; // Reset the title when the user is back
        }
    }, 1000);
});

// Timer for study break countdown
let timeLeftForStudy = 1 * 60; // 1-minute break for testing (replace with 30 minutes for actual use)
let originalTitle = document.title; // Store the original tab title

function updateTitle() {
    let minutes = Math.floor(timeLeftForStudy / 60);
    let seconds = timeLeftForStudy % 60;
    document.title = `⏳ ${minutes}:${seconds < 10 ? '0' : ''}${seconds} | StudyBuddy`; // Update title with countdown

    if (timeLeftForStudy <= 0) {
        document.title = "🎯 Time's Up! | StudyBuddy"; // Change title when time's up
        clearInterval(studyCountdown); // Stop the countdown
        alert("Time's up! Close the game and get back to studying.");
    }

    timeLeftForStudy--;
}

// Start the study countdown when needed
let studyCountdown = setInterval(updateTitle, 1000);
