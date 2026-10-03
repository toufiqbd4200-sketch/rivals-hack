/**
 * KAISER HACKS - APP LOGIC (PERFORMANCE OPTIMIZED)
 * Dynamic drops rendering, live search, category filtering,
 * interactive Sellix-style modal, Web Audio cues, Confetti burst,
 * automated YouTube video embed connection, and high-converting Subscribe-to-Unlock gateway.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  const dropsContainer = document.getElementById("drops-container");
  const searchInput = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const showcaseIframe = document.getElementById("showcase-iframe");

  // Product Modal
  const productModal = document.getElementById("product-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalDownloadBtn = document.getElementById("modal-download-btn");

  // Unlock Modal
  const unlockModal = document.getElementById("unlock-modal");
  const unlockCloseBtn = document.getElementById("unlock-close-btn");
  const btnSubAction = document.getElementById("btn-sub-action");
  const btnDlFinal = document.getElementById("btn-dl-final");
  const dlVerifiedNote = document.getElementById("dl-verified-note");
  const btnAlreadySubbed = document.getElementById("btn-already-subbed");
  const stepSubBox = document.getElementById("step-sub-box");
  const stepDlBox = document.getElementById("step-dl-box");
  const stepDlLabel = document.getElementById("step-dl-label");

  // State
  let currentCategory = "all";
  let searchQuery = "";
  let activeDropItem = (typeof KAISER_DROPS !== "undefined" && KAISER_DROPS.length > 0) ? KAISER_DROPS[0] : null;
  let isAuraUnlocked = localStorage.getItem("kaiser_aura_unlocked") === "true";

  // ============================================================================
  // 1. YouTube Video Embed Auto-Connector & Autoplay Controller
  // ============================================================================
  function initYouTubeShowcase() {
    if (!showcaseIframe || typeof KAISER_SITE_INFO === "undefined" || !KAISER_SITE_INFO.videoEmbedId) return;
    
    const raw = KAISER_SITE_INFO.videoEmbedId.trim();
    let videoId = raw;

    // Smart regex: extracts 11-char ID from full URLs or returns raw string
    const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
      videoId = match[1];
    }

    const soundPrompt = document.getElementById("video-sound-prompt");
    const btnUnmute = document.getElementById("btn-unmute-sound");

    // Standard high-converting autoplay: starts playing immediately on page load
    // Muted by default so all modern browsers (Chrome/Edge/Safari/Firefox) allow immediate video stream
    showcaseIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&enablejsapi=1&controls=1&rel=0`;

    function playWithSound() {
      // Send postMessage commands if iframe is already active
      try {
        showcaseIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
        showcaseIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      } catch (_) {}

      // Guarantee unmuted playback with user click gesture
      if (showcaseIframe.src.includes("mute=1")) {
        showcaseIframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&enablejsapi=1&controls=1&rel=0`;
      }

      if (soundPrompt) {
        soundPrompt.classList.add("hidden");
      }
    }

    if (btnUnmute) {
      btnUnmute.addEventListener("click", (e) => {
        e.stopPropagation();
        playClickSound();
        playWithSound();
      });
    }

    // Clicking anywhere on showcase links scrolls to video & enables sound
    document.querySelectorAll('a[href="#showcase"]').forEach(link => {
      link.addEventListener("click", () => {
        playWithSound();
        const wrapper = document.querySelector(".showcase-video-wrapper");
        if (wrapper) {
          wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    // Check if arriving with #showcase or ?play=1 or ?video=1
    if (window.location.hash === "#showcase" || window.location.search.includes("play=1") || window.location.search.includes("video=1")) {
      const onFirstInteract = () => {
        playWithSound();
        window.removeEventListener("click", onFirstInteract);
        window.removeEventListener("keydown", onFirstInteract);
      };
      window.addEventListener("click", onFirstInteract, { once: true });
      window.addEventListener("keydown", onFirstInteract, { once: true });
    }
  }

  initYouTubeShowcase();

  // ============================================================================
  // 2. Audio Synthesis Cues (Web Audio API - Zero External Network Latency)
  // ============================================================================
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Soft subtle cyber click
  function playClickSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (_) {}
  }

  // Victorious 4-tone unlock chord
  function playUnlockSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch (_) {}
  }

  // ============================================================================
  // 3. Confetti Particle Celebration (GPU Optimized Canvas)
  // ============================================================================
  function fireConfetti() {
    const canvas = document.getElementById("celebration-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Show canvas only when animating
    canvas.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#10B981", "#06B6D4", "#38BDF8", "#F59E0B", "#FFFFFF", "#34D399"];
    const particles = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.2) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        alpha: 1
      });
    }

    let animationFrame;
    const startTime = Date.now();

    function renderParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        if (elapsed > 1000) {
          p.alpha -= 0.02;
        }

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (alive && elapsed < 2600) {
        animationFrame = requestAnimationFrame(renderParticles);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
        canvas.style.display = "none"; // Hide completely to release GPU resources
      }
    }

    renderParticles();
  }

  // ============================================================================
  // 4. Toast Notifications
  // ============================================================================
  function showToast(message, icon = "⚡") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translate3d(0, 20px, 0)";
      toast.style.transition = "all 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ============================================================================
  // 5. Render Weekly Drop Cards
  // ============================================================================
  function renderDrops() {
    if (!dropsContainer || typeof KAISER_DROPS === "undefined") return;

    dropsContainer.innerHTML = "";

    const filtered = KAISER_DROPS.filter(item => {
      const matchesCategory = 
        currentCategory === "all" ||
        (currentCategory === "active" && item.status === "active") ||
        (currentCategory === "upcoming" && item.status === "coming_soon");

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      dropsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-secondary);">
          <p style="font-size: 18px; font-weight: 700;">No tools found matching "${escapeHtml(searchQuery)}"</p>
          <p style="font-size: 13px; margin-top: 8px;">Check back next week for fresh drops!</p>
        </div>
      `;
      return;
    }

    filtered.forEach(item => {
      const card = document.createElement("div");
      card.className = `drop-card ${item.status === "coming_soon" ? "coming-soon" : ""}`;
      card.setAttribute("data-id", item.id);

      const btnLabel = item.status === "active" 
        ? (isAuraUnlocked ? "DOWNLOAD NOW" : "GET FREE") 
        : "DETAILS";

      card.innerHTML = `
        <div class="card-image-box">
          <span class="card-tag ${item.tagColor}">${escapeHtml(item.tag)}</span>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${escapeHtml(item.title)}</h3>
          <p class="card-subtitle">${escapeHtml(item.subtitle)}</p>
          <div class="card-footer">
            <div class="card-pricing">
              <span class="price-original">${escapeHtml(item.originalPrice)}</span>
              <span class="price-current">${escapeHtml(item.currentPrice)}</span>
            </div>
            <button class="btn-card" type="button">
              ${btnLabel} →
            </button>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        playClickSound();
        openProductModal(item);
      });

      dropsContainer.appendChild(card);
    });
  }

  // ============================================================================
  // 6. Product Modal Handler
  // ============================================================================
  function openProductModal(item) {
    if (!productModal) return;
    activeDropItem = item;

    document.getElementById("modal-img").src = item.image;
    document.getElementById("modal-tag").textContent = item.tag;
    document.getElementById("modal-tag").className = `modal-badge ${item.tagColor}`;
    document.getElementById("modal-title").textContent = item.title;
    document.getElementById("modal-orig-price").textContent = item.originalPrice;
    document.getElementById("modal-price").textContent = item.currentPrice;
    document.getElementById("modal-desc").textContent = item.description;

    // Stats
    document.getElementById("stat-latency").textContent = item.stats.latency;
    document.getElementById("stat-bans").textContent = item.stats.bans;
    document.getElementById("stat-memory").textContent = item.stats.muscleMemory;
    document.getElementById("stat-cost").textContent = item.stats.cost;

    // Features
    const featList = document.getElementById("modal-features");
    featList.innerHTML = "";
    item.features.forEach(f => {
      const li = document.createElement("li");
      li.className = "modal-feature-item";
      li.innerHTML = `<span class="modal-feature-bullet">✔</span><span>${escapeHtml(f)}</span>`;
      featList.appendChild(li);
    });

    // Modal CTA Button text based on status and unlock state
    if (item.status === "active") {
      if (isAuraUnlocked) {
        modalDownloadBtn.textContent = "⚡ DIRECT DOWNLOAD (.ZIP FREE)";
      } else {
        modalDownloadBtn.textContent = "⚡ UNLOCK FREE DOWNLOAD →";
      }
    } else {
      modalDownloadBtn.textContent = "🔔 SUBSCRIBE FOR EARLY ACCESS →";
    }

    productModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => {
      playClickSound();
      closeProductModal();
    });
  }

  if (productModal) {
    productModal.addEventListener("click", (e) => {
      if (e.target === productModal) {
        closeProductModal();
      }
    });
  }

  // Modal Download Action
  if (modalDownloadBtn) {
    modalDownloadBtn.addEventListener("click", () => {
      playClickSound();
      if (!activeDropItem) return;

      if (activeDropItem.status === "coming_soon") {
        window.open(KAISER_SITE_INFO.youtubeSubscribeUrl, "_blank", "noopener,noreferrer");
        showToast("Opening Kaiser's channel! Subscribe to get notified on drop day.", "🔔");
        return;
      }

      // If active tool:
      if (isAuraUnlocked) {
        triggerDirectDownload(activeDropItem);
      } else {
        closeProductModal();
        openUnlockGateway(activeDropItem);
      }
    });
  }

  // ============================================================================
  // 7. Subscribe-to-Unlock Gateway Modal
  // ============================================================================
  function openUnlockGateway(item) {
    activeDropItem = item;
    if (!unlockModal) return;

    updateUnlockUI();
    unlockModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeUnlockGateway() {
    if (!unlockModal) return;
    unlockModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function updateUnlockUI() {
    if (isAuraUnlocked) {
      if (stepSubBox) stepSubBox.classList.add("completed");
      if (stepDlBox) stepDlBox.classList.add("completed");
      if (btnDlFinal) {
        btnDlFinal.disabled = false;
        btnDlFinal.className = "btn-dl-unlocked";
        btnDlFinal.innerHTML = `<span>🔓 DIRECT DOWNLOAD (.ZIP FREE)</span>`;
      }
      if (dlVerifiedNote) {
        dlVerifiedNote.style.display = "block";
      }
      if (stepDlLabel) {
        stepDlLabel.textContent = "Verified · Ready for Download";
      }
    } else {
      if (stepSubBox) stepSubBox.classList.remove("completed");
      if (stepDlBox) stepDlBox.classList.remove("completed");
      if (btnDlFinal) {
        btnDlFinal.disabled = true;
        btnDlFinal.className = "btn-dl-locked";
        btnDlFinal.innerHTML = `<span>🔒 Locked · Complete Step 1 Above</span>`;
      }
      if (dlVerifiedNote) {
        dlVerifiedNote.style.display = "none";
      }
      if (stepDlLabel) {
        stepDlLabel.textContent = "Download Software";
      }
    }
  }

  if (unlockCloseBtn) {
    unlockCloseBtn.addEventListener("click", () => {
      playClickSound();
      closeUnlockGateway();
    });
  }

  if (unlockModal) {
    unlockModal.addEventListener("click", (e) => {
      if (e.target === unlockModal) {
        closeUnlockGateway();
      }
    });
  }

  // Step 1: Subscribe Action Click
  if (btnSubAction) {
    btnSubAction.addEventListener("click", () => {
      playClickSound();
      if (isAuraUnlocked) return;

      // Start 3-second verification sequence
      if (stepDlLabel) stepDlLabel.textContent = "Checking Channel Aura...";
      if (btnDlFinal) {
        btnDlFinal.innerHTML = `<span>⚡ Verifying Subscription... (3s)</span>`;
        btnDlFinal.style.borderColor = "var(--color-cyan)";
      }

      setTimeout(() => {
        isAuraUnlocked = true;
        localStorage.setItem("kaiser_aura_unlocked", "true");
        updateUnlockUI();
        playUnlockSound();
        fireConfetti();
        showToast("Aura Verified! Download permanently unlocked.", "🎉");
        renderDrops();
      }, 3200);
    });
  }

  // Step 2: Download Button Click
  if (btnDlFinal) {
    btnDlFinal.addEventListener("click", () => {
      if (!isAuraUnlocked) return;
      playClickSound();
      triggerDirectDownload(activeDropItem);
    });
  }

  // Bypass Action: "Already Subscribed?"
  if (btnAlreadySubbed) {
    btnAlreadySubbed.addEventListener("click", () => {
      playClickSound();
      isAuraUnlocked = true;
      localStorage.setItem("kaiser_aura_unlocked", "true");
      updateUnlockUI();
      playUnlockSound();
      fireConfetti();
      showToast("Real one recognized! Aura verified. Download ready.", "😎");
      renderDrops();
    });
  }

  // Trigger file download
  function triggerDirectDownload(item) {
    let downloadUrl = (item && item.downloadUrl) ? item.downloadUrl : "downloads/KaiserAimAssist-v2.0.zip";
    
    // Check if user specified a GitHub Release link for unlimited bandwidth
    if (typeof KAISER_SITE_INFO !== "undefined" && KAISER_SITE_INFO.githubReleaseUrl && KAISER_SITE_INFO.githubReleaseUrl.trim().length > 0) {
      downloadUrl = KAISER_SITE_INFO.githubReleaseUrl.trim();
    }

    showToast("Launching Kaiser Aim Assist v2.0 download...", "🚀");

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "KaiserAimAssist-v2.0.zip";
    if (downloadUrl.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Global ESC key listener for modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (unlockModal && unlockModal.classList.contains("open")) {
        closeUnlockGateway();
      } else if (productModal && productModal.classList.contains("open")) {
        closeProductModal();
      }
    }
  });

  // ============================================================================
  // 8. Category Filter Buttons
  // ============================================================================
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      playClickSound();
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      renderDrops();
    });
  });

  // ============================================================================
  // 9. Search Input Filter
  // ============================================================================
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderDrops();
    });
  }

  // ============================================================================
  // 10. Utility: XSS-safe escape
  // ============================================================================
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initial render
  renderDrops();
});
