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
          document.getElementById("video-player").innerHTML = "";
          document.getElementById("suggestions").innerHTML = "";
        }
      })
      .catch((err) => console.error("❌ Reset error:", err));
  });

  // Initialize Save Button Listeners and Render Saved Videos
  attachSaveButtons();
  renderSavedVideos();
  // Attach listeners to suggestion cards
  attachSuggestionClicks();
});

// Attach save button click events for all .save-btn in the current DOM
function attachSaveButtons() {
  const saveButtons = document.querySelectorAll(".save-btn");
  saveButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Build full URL in case it's incomplete
      const videoData = {
        title: btn.dataset.title,
        url: btn.dataset.url?.startsWith("http")
          ? btn.dataset.url
          : `https://www.youtube.com/watch?v=${btn.dataset.videoid}`,
        thumbnail: btn.dataset.thumbnail,
        channel: btn.dataset.channel,
      };

      let saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");

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

// Render saved videos in the saved container
function renderSavedVideos() {
  const savedContainer = document.getElementById("saved-container");
  const saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");

  savedContainer.innerHTML = "";
  if (saved.length === 0) {
    savedContainer.innerHTML = "<p>No saved videos yet.</p>";
    return;
  }

  saved.forEach((video, index) => {
    // Ensure required fields exist
    if (!video.url || !video.thumbnail || !video.title) return;

    const card = document.createElement("div");
    card.className = "video-card";
    card.style.position = "relative"; // Ensure delete-btn positions correctly

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

  // Attach delete functionality to delete buttons
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

// Toast notifications to alert users
function showToast(message) {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 4000);
  toast.addEventListener("animationend", () => {
    if (toast.style.opacity === "0") toast.remove();
  });
}

// Attach click events to suggestion cards for dynamic video updates
function attachSuggestionClicks() {
  // Select only suggestion cards inside #suggestions
  const suggestionCards = document.querySelectorAll("#suggestions .video-card");
  suggestionCards.forEach((card) => {
    // Extract and attach data attributes if not already set
    const title = card.querySelector("h4")?.textContent;
    const channel = card.querySelector(".channel-name")?.textContent;
    const thumbnail = card.querySelector("img")?.src;
    const videoId = card.dataset.videoid;
    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Save necessary data on the card element for later use
    card.dataset.title = title;
    card.dataset.url = url;
    card.dataset.thumbnail = thumbnail;
    card.dataset.channel = channel;

    // Handle click event for suggestion
    card.addEventListener("click", () => {
      const player = document.getElementById("main-player");
      const mainTitle = document.getElementById("main-title");
      const mainChannel = document.getElementById("main-channel");
      const mainSaveBtn = document.getElementById("main-save-btn");

      if (player && videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${window.location.origin}&enablejsapi=1`;
const directUrl = `https://www.youtube.com/watch?v=${videoId}`;

// Create a new iframe dynamically to attach error handler
const newIframe = document.createElement("iframe");
newIframe.id = "main-player";
newIframe.width = "100%";
newIframe.height = "450";
newIframe.src = embedUrl;
newIframe.frameBorder = "0";
newIframe.allow = "autoplay; encrypted-media";
newIframe.allowFullscreen = true;

// Fallback if video isn't embeddable
newIframe.onerror = () => {
  showToast("⚠️ Video can't be embedded. Redirecting to YouTube...");
  setTimeout(() => {
    window.open(directUrl, "_blank");
  }, 1000);
};

// Replace existing iframe
const playerContainer = document.getElementById("video-player");
if (playerContainer) {
  playerContainer.innerHTML = ""; // Clear current player
  playerContainer.appendChild(newIframe); // Add new one
}

        // Update main video metadata
        mainTitle.textContent = title;
        mainChannel.textContent = channel;
        // Update save button dataset
        mainSaveBtn.setAttribute("data-title", title);
        mainSaveBtn.setAttribute("data-url", url);
        mainSaveBtn.setAttribute("data-thumbnail", thumbnail);
        mainSaveBtn.setAttribute("data-channel", channel);

        // Set main save button click listener
        mainSaveBtn.onclick = () => {
          const videoData = { title, url, thumbnail, channel };
          let saved = JSON.parse(localStorage.getItem("savedVideos") || "[]");
          if (!saved.find((vid) => vid.url === url)) {
            saved.push(videoData);
            localStorage.setItem("savedVideos", JSON.stringify(saved));
            renderSavedVideos();
            showToast("Video saved successfully!");
          } else {
            showToast("This video is already saved.");
          }
        };

        // Highlight selected suggestion (and remove highlight from others)
        suggestionCards.forEach((c) => c.classList.remove("playing"));
        card.classList.add("playing");

        // Scroll the video player into view smoothly
        document.getElementById("video-player").scrollIntoView({ behavior: "smooth", block: "start" });
      }

      // Fetch new suggestions based on current video title
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
              const newCard = document.createElement("div");
              newCard.className = "video-card";
              newCard.dataset.videoid = video.video_id;
              newCard.dataset.title = video.title;
              newCard.dataset.url = video.url;
              newCard.dataset.thumbnail = video.thumbnail;
              newCard.dataset.channel = video.channel;

              newCard.innerHTML = `
                <img src="${video.thumbnail}" alt="Thumbnail" />
                <h4>${video.title}</h4>
                <p class="channel-name">${video.channel}</p>
              `;
              suggestions.appendChild(newCard);
            });
            // Reattach event listeners to the newly created suggestion cards
            attachSuggestionClicks();
          } else {
            showToast("❌ Couldn't fetch suggestions.");
          }
        })
        .catch((err) => console.error("❌ Suggestion error:", err));
    });
  });
}

// Additionally, handle main player click events to update iframe (if needed)
document.addEventListener("DOMContentLoaded", () => {
  const player = document.getElementById("main-player");
  const cards = document.querySelectorAll(".video-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const videoId = card.dataset.videoid;
      if (videoId && player) {
        player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&origin=${window.location.origin}&enablejsapi=1`;
        // Highlight selected card
        cards.forEach(c => c.classList.remove("playing"));
        card.classList.add("playing");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
});
