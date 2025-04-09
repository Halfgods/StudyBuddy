document.getElementById("play-game-btn").addEventListener("click", function () {
    console.log("Play game button clicked!");  // Debugging step to check if click is detected
    
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
    gameTab = window.open("https://www.crazygames.com/", "_blank");
    if (!gameTab) {
        console.error("Failed to open game tab."); // Debugging step
        return;
    }

    // Set the countdown time for the game session
    let timeLeft = remainingTime > 0 ? remainingTime : 2 * 60; // Start with remaining time or 2 minutes for testing

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

    // Start the study countdown after 2 minutes of game time
    setTimeout(function () {
        if (gameTab && !gameTab.closed) {
            gameTab.close(); // Close the game tab after 2 minutes
        }
        document.title = "📚 StudyBuddy"; // Reset the title after the game tab closes
        startStudyCountdown(); // Start the study break countdown
    }, 2 * 60 * 1000); // Set this to 2 minutes (in milliseconds)
});
