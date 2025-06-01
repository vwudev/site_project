// Heart Animation
class HeartAnimation {
  constructor() {
    this.canvas = document.getElementById("heart-canvas");
    if (!this.canvas) throw new Error("Canvas element not found");
    this.ctx = this.canvas.getContext("2d");
    this.hearts = [];
    this.animationId = null;
    this.resizeTimeout = null;
    this.maxHearts = 50;

    this.init();
  }

  init() {
    this.setupCanvas();
    this.createInitialHearts();
    this.setupEventListeners();
    this.startAnimation();
  }

  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createInitialHearts() {
    const heartCount = Math.min(this.maxHearts, Math.floor(window.innerWidth * window.innerHeight / 6000));
    this.hearts = Array.from({ length: heartCount }, () => this.createHeart());
  }

  createHeart() {
    return {
      x: Math.random() * this.canvas.width,
      y: -20 - Math.random() * 100,
      size: 8 + Math.random() * 15,
      speed: 1 + Math.random() * 2,
      alpha: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      color: `hsl(${Math.random() * 30 + 330}, 100%, 65%)`
    };
  }

  drawHeart(heart) {
    this.ctx.save();
    this.ctx.globalAlpha = heart.alpha;
    this.ctx.fillStyle = heart.color;
    this.ctx.translate(heart.x, heart.y);
    this.ctx.rotate(heart.rotation);

    const size = heart.size;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(-size / 2, -size / 2, -size, size / 3, 0, size);
    this.ctx.bezierCurveTo(size, size / 3, size / 2, -size / 2, 0, 0);
    this.ctx.fill();
    this.ctx.restore();
  }

  updateHearts() {
    this.hearts.forEach(heart => {
      heart.y += heart.speed;
      heart.rotation += heart.rotationSpeed;
      if (heart.y > this.canvas.height + heart.size) {
        Object.assign(heart, this.createHeart());
        heart.y = -20;
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateHearts();
    this.hearts.forEach(heart => this.drawHeart(heart));
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startAnimation() {
    if (!this.animationId) {
      this.animate();
    }
  }

  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  handleResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.setupCanvas();
      this.hearts.forEach(heart => {
        heart.x = Math.random() * this.canvas.width;
        if (heart.y > this.canvas.height) {
          heart.y = -20;
        }
      });
    }, 200);
  }

  setupEventListeners() {
    window.addEventListener("resize", () => this.handleResize());
  }

  destroy() {
    this.stopAnimation();
    window.removeEventListener("resize", () => this.handleResize());
  }
}

// Audio Control
class AudioController {
  constructor() {
    this.audio = document.getElementById("bg-music");
    this.toggleButton = document.getElementById("music-toggle");
    if (!this.audio || !this.toggleButton) throw new Error("Audio or toggle button not found");
    this.isPlaying = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.attemptAutoplay();
  }

  attemptAutoplay() {
    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => this.setPlayingState(true))
        .catch(() => this.setPlayingState(false));
    }
  }

  togglePlayback() {
    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(e => console.log("Audio play failed:", e));
    }
    this.setPlayingState(!this.isPlaying);
  }

  setPlayingState(state) {
    this.isPlaying = state;
    this.toggleButton.textContent = state ? "🔊 Tắt nhạc" : "🎵 Bật nhạc";
    this.toggleButton.classList.toggle("music-playing", state);
  }

  setupEventListeners() {
    this.toggleButton.addEventListener("click", () => this.togglePlayback());
    document.addEventListener(
      "click",
      () => {
        if (!this.isPlaying) {
          this.audio.play().catch(e => console.log("Audio play failed:", e));
        }
      },
      { once: true }
    );
  }

  destroy() {
    this.audio.pause();
    this.toggleButton.removeEventListener("click", () => this.togglePlayback());
  }
}

// Sequential effect animation
function setupEffectSequence() {
  const effectItems = document.querySelectorAll(".effect-item");
  let currentIndex = 0;

  function showNextEffect() {
    if (currentIndex < effectItems.length) {
      const item = effectItems[currentIndex];
      item.style.display = "block";
      item.classList.add("animated", currentIndex % 2 === 0 ? "fly-in" : "rotate-in");
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => {
          item.style.display = "none";
          currentIndex++;
          showNextEffect();
        }, 500);
      }, 3000);
    } else {
      showQuestion();
    }
  }

  function showQuestion() {
    const questionBox = document.querySelector(".question-box");
    const replayBtn = document.querySelector(".replay-btn");
    if (questionBox && replayBtn) {
      questionBox.style.display = "block";
      questionBox.style.opacity = "1";
      replayBtn.style.display = "block";
      replayBtn.style.opacity = "1";
      setupTrollQuestion(); // Gắn sự kiện nút sau khi question-box hiển thị
      if (typeof confetti === "function") {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  }

  showNextEffect();
}

// Troll button logic
function setupTrollQuestion() {
  const noBtn = document.getElementById("no-btn");
  const yesBtn = document.getElementById("yes-btn");
  const answerText = document.getElementById("answer-text");
  const questionBox = document.querySelector(".question-box");

  if (!noBtn || !yesBtn || !answerText || !questionBox) {
    console.error("One or more elements (no-btn, yes-btn, answer-text, question-box) not found");
    return;
  }

  console.log("Setting up troll question buttons"); // Debug log

  let moveTries = 0;
  const maxTries = 10;

  // Xóa sự kiện cũ (nếu có) để tránh trùng lặp
  noBtn.replaceWith(noBtn.cloneNode(true));
  yesBtn.replaceWith(yesBtn.cloneNode(true));
  const newNoBtn = document.getElementById("no-btn");
  const newYesBtn = document.getElementById("yes-btn");

  newNoBtn.addEventListener("mouseenter", () => {
    console.log("No button mouseenter triggered"); // Debug log
    if (moveTries >= maxTries) {
      newNoBtn.classList.add("disabled-troll");
      newNoBtn.textContent = "Thôi được rồi 😅";
      return;
    }

    const maxX = window.innerWidth - newNoBtn.offsetWidth - 10;
    const maxY = window.innerHeight - newNoBtn.offsetHeight - 10;
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    newNoBtn.style.position = "absolute";
    newNoBtn.style.left = `${randomX}px`;
    newNoBtn.style.top = `${randomY}px`;
    newNoBtn.classList.add("troll-mode");

    moveTries++;
    if (moveTries > 7) {
      newNoBtn.textContent = "Đừng cố nữa 😆";
    }
  });

  newYesBtn.addEventListener("click", () => {
    console.log("Yes button clicked"); // Debug log
    answerText.textContent = "💖 Cảm ơn em đã đồng ý 💖";
    answerText.style.display = "block";
    answerText.style.opacity = "1";
    newNoBtn.style.display = "none";
    questionBox.style.display = "none"; // Ẩn question-box khi nhấn "Có"
    if (typeof confetti === "function") {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      });
    }
  });
}

// Replay button
function setupReplayButton() {
  const replayBtn = document.querySelector(".replay-btn");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      console.log("Replay button clicked"); // Debug log
      window.location.reload();
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  try {
    const heartAnimation = new HeartAnimation();
    const audioController = new AudioController();
    setupEffectSequence();
    setupReplayButton();

    window.addEventListener("unload", () => {
      heartAnimation.destroy();
      audioController.destroy();
    });
  } catch (error) {
    console.error("Initialization failed:", error);
  }
});