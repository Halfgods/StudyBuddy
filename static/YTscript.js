document.addEventListener("DOMContentLoaded", function () {
  console.log("🎯 DOM fully loaded");

  const resetBtn = document.getElementById("reset-btn");
  const input = document.getElementById("search-input");
  const videoContainer = document.querySelector(".video-container");

  // Reset Button Functionality
  resetBtn?.addEventListener("click", function () {
    console.log("🔁 Reset button clicked!");

    if (input) input.value = "";
    if (videoContainer) videoContainer.innerHTML = "";

    fetch("/reset", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        console.log("✅ Server says:", data);
        if (data.status === "reset successful") {
          const videoPlayer = document.getElementById("video-player");
          const suggestions = document.getElementById("suggestions");

          if (videoPlayer) videoPlayer.innerHTML = "";
          if (suggestions) suggestions.innerHTML = "";
        }
      })
      .catch((err) => console.error("❌ Reset error:", err));
  });

  // Initialize Save & Render
  attachSaveButtons();
  renderSavedVideos();
});

// Attach save button click events
function attachSaveButtons() {
  const saveButtons = document.querySelectorAll(".save-btn");

  saveButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
          const videoData = {
              title: btn.dataset.title,
              url: btn.dataset.url,
              thumbnail: btn.dataset.thumbnail,
              channel: btn.dataset.channel,
          };

          // Retrieve current saved videos from localStorage
          let saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");

          // Check for duplicates
          if (!saved.find((vid) => vid.url === videoData.url)) {
              saved.push(videoData);
              localStorage.setItem("savedVideos", JSON.stringify(saved));
              console.log("🌟 Video saved:", videoData.title);
              renderSavedVideos();
              showToast("Video saved successfully!");
          } else {
              console.log("⚠️ Video already saved");
              showToast("This video is already saved.");
          }
         
      });
  });
}


// Render saved videos with delete-btn
function renderSavedVideos() {
  const savedContainer = document.getElementById("saved-container");
  const saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");

  savedContainer.innerHTML = "";

  if (saved.length === 0) {
    savedContainer.innerHTML = "<p>No saved videos yet.</p>";
    return;
  }

  saved.forEach((video, index) => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.style.position = "relative"; // ensure delete-btn positions correctly

    card.innerHTML = `
      <button class="delete-btn" data-index="${index}">×</button>
      <a href="${video.url}" target="_blank">
        <img src="${video.thumbnail}" alt="Thumbnail" onerror="this.onerror=null; this.src='/static/defaultlogo.jpg';" />
        <h4>${video.title}</h4>
      </a>
      <hr />
      <p class="channel-name">${video.channel}</p>
    `;

    savedContainer.appendChild(card);
  });

  // Delete functionality
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = this.dataset.index;
      let saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");

      saved.splice(index, 1);
      localStorage.setItem("savedVideos", JSON.stringify(saved));
      renderSavedVideos();
    });
  });
}
function showToast(message) {
  const toastContainer = document.getElementById("toast-container");

  // Create toast message element
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  // Append toast to the container
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 4000);

  // Remove toast after it fades out
  toast.addEventListener("animationend", () => {
      if (toast.style.opacity === "0") {
          toast.remove();
      }
  });
}

