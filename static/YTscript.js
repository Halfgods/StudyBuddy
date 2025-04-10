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
  attachSuggestionClicks()
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

function attachSuggestionClicks() {
  const suggestionCards = document.querySelectorAll("#suggestions .video-card");

  suggestionCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector("h4")?.textContent;
      const videoId = card.dataset.videoid;

      // Update main video iframe
      const videoPlayer = document.getElementById("video-player");
      if (videoPlayer && videoId) {
        videoPlayer.innerHTML = `
          <iframe width="100%" height="450" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
            frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
          </iframe>`;
          // After setting the iframe in attachSuggestionClicks
videoPlayer.scrollIntoView({ behavior: "smooth", block: "start" });

      }

      // Fetch new suggestions dynamically
      fetch("/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      })
        .then((res) => res.json())
        .then((data) => {
          const suggestions = document.getElementById("suggestions");
          if (suggestions) suggestions.innerHTML = "";

          if (Array.isArray(data)) {
            data.forEach((video) => {
              const card = document.createElement("div");
              card.className = "video-card";
              card.dataset.videoid = video.video_id;

              card.innerHTML = `
                <img src="${video.thumbnail}" alt="Thumbnail" />
                <h4>${video.title}</h4>
                <p class="channel-name">${video.channel}</p>`;

              suggestions?.appendChild(card);
            });

            // Reattach listeners after DOM update
            attachSuggestionClicks();
          } else {
            showToast("❌ Couldn't fetch suggestions.");
          }
        })
        .catch((err) => console.error("❌ Suggestion error:", err));
    });
  });
}document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("main-player");
  const cards = document.querySelectorAll(".video-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const videoId = card.dataset.videoid;
      if (videoId && player) {
        // Update iframe source
        player.src = `https://www.youtube.com/embed/${videoId}`;

        // Highlight selected card
        cards.forEach(c => c.classList.remove("playing"));
        card.classList.add("playing");

        // Optionally scroll up to the player
        window.scrollTo({ top: player.offsetTop - 20, behavior: "smooth" });
      }
    });
  });
});

const mainTitle = document.getElementById("main-title");
const mainChannel = document.getElementById("main-channel");
const mainSaveBtn = document.getElementById("main-save-btn");

cards.forEach(card => {
  card.addEventListener("click", () => {
    const videoId = card.dataset.videoid;
    const title = card.dataset.title;
    const url = card.dataset.url;
    const thumbnail = card.dataset.thumbnail;
    const channel = card.dataset.channel;

    if (videoId && player) {
      // Update iframe
      player.src = `https://www.youtube.com/embed/${videoId}`;

      // Update title & channel
      mainTitle.textContent = title;
      mainChannel.textContent = channel;

      // Update save button data
      mainSaveBtn.setAttribute("data-title", title);
      mainSaveBtn.setAttribute("data-url", url);
      mainSaveBtn.setAttribute("data-thumbnail", thumbnail);
      mainSaveBtn.setAttribute("data-channel", channel);

      // Reset highlights
      cards.forEach(c => c.classList.remove("playing"));
      card.classList.add("playing");
    }
  });
});


