// --- Web Audio API Synth for Premium Game Sound Effects ---
const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playClick() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  },

  playSuccess() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Arpeggio)
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  },

  playWrong() {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    
    // Lowpass filter to make the buzz softer/friendlier
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  },

  playComplete() {
    this.init();
    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 880.00, d: 0.15 }, // A5
      { f: 1046.50, d: 0.4 }  // C6
    ];
    
    let time = now;
    melody.forEach((note) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, time + note.d);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + note.d + 0.1);
      
      time += note.d * 0.8;
    });
  }
};

// --- Confetti Animation Engine on Canvas ---
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  active: false,
  animationFrame: null,

  init() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = this.canvas.parentElement.clientHeight;
    }
  },

  createParticle() {
    const colors = ['#f59e0b', '#e6397c', '#1e7ec8', '#4f9a2a', '#8b5cf6', '#3b82f6', '#ec4899'];
    return {
      x: Math.random() * this.canvas.width,
      y: -20,
      size: Math.random() * 6 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 4 - 2,
      speedY: Math.random() * 4 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 4 - 2,
      shape: Math.random() > 0.5 ? 'square' : 'circle'
    };
  },

  burst(count = 50) {
    this.init();
    for (let i = 0; i < count; i++) {
      const p = this.createParticle();
      p.y = this.canvas.height + 10; // Start at bottom and shoot up!
      p.speedY = -Math.random() * 8 - 6;
      p.x = this.canvas.width / 2 + (Math.random() * 60 - 30);
      this.particles.push(p);
    }
    if (!this.active) {
      this.active = true;
      this.loop();
    }
  },

  stream(durationMs = 2000) {
    this.init();
    const interval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        this.particles.push(this.createParticle());
      }
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
    }, durationMs);

    if (!this.active) {
      this.active = true;
      this.loop();
    }
  },

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.speedY += 0.15; // Gravity
      p.rotation += p.rotationSpeed;
      
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'square') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
      
      // Remove offscreen particles
      if (p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(() => this.loop());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

// --- Game Logic Controller ---
const Game = {
  currentSlide: 1,
  slide5Step: 1,

  init() {
    // Bind global buttons
    document.getElementById('start-game').addEventListener('click', () => this.start());
    document.getElementById('restart-game').addEventListener('click', () => this.restart());

    // Bind next slide buttons
    document.getElementById('s2-next').addEventListener('click', () => this.nextSlide());
    document.getElementById('s3-next').addEventListener('click', () => this.nextSlide());
    document.getElementById('s4-next').addEventListener('click', () => this.nextSlide());
    document.getElementById('s5-next').addEventListener('click', () => this.nextSlide());
    document.getElementById('s6-next').addEventListener('click', () => this.nextSlide());
    document.getElementById('s7-next').addEventListener('click', () => this.nextSlide());

    // Bind slide 2 options
    const s2Buttons = document.querySelectorAll('#slide-2 button.overlay-element');
    s2Buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSlide2(e.currentTarget));
    });

    // Bind slide 3 options
    const s3Buttons = document.querySelectorAll('#slide-3 button.card-btn');
    s3Buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSlide3(e.currentTarget));
    });

    // Bind slide 4 options
    const s4Buttons = document.querySelectorAll('#slide-4 button.overlay-element');
    s4Buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSlide4(e.currentTarget));
    });

    // Bind slide 5 options
    document.getElementById('s5-btn-left').addEventListener('click', (e) => this.handleSlide5(e.currentTarget));
    document.getElementById('s5-btn-mid').addEventListener('click', (e) => this.handleSlide5(e.currentTarget));
    document.getElementById('s5-btn-right').addEventListener('click', (e) => this.handleSlide5(e.currentTarget));

    // Bind slide 6 options
    const s6Buttons = document.querySelectorAll('#slide-6 button.overlay-element');
    s6Buttons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSlide6(e.currentTarget));
    });

    // Bind slide 7 interaction
    document.getElementById('s7-done').addEventListener('click', () => this.handleSlide7());

    // Show dashboard on startup
    this.showDashboard();
  },

  showDashboard() {
    document.getElementById('dashboard-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
    const info = document.querySelector('.game-info');
    if (info) info.style.display = 'none';
  },

  launchGame(gameId) {
    if (gameId === 'krosh') {
      SoundFX.playClick();
      document.getElementById('dashboard-screen').style.display = 'none';
      document.getElementById('game-container').style.display = 'block';
      const info = document.querySelector('.game-info');
      if (info) info.style.display = 'block';
      this.goToSlide(1);
    }
  },

  start() {
    SoundFX.playClick();
    this.goToSlide(2);
  },

  goToSlide(slideIndex) {
    const currentElem = document.getElementById(`slide-${this.currentSlide}`);
    const nextElem = document.getElementById(`slide-${slideIndex}`);

    if (currentElem && nextElem) {
      currentElem.classList.remove('active');
      nextElem.classList.add('active');
      this.currentSlide = slideIndex;
      Confetti.resize();
    }
  },

  nextSlide() {
    SoundFX.playClick();
    this.goToSlide(this.currentSlide + 1);
  },

  triggerIncorrect(btn) {
    SoundFX.playWrong();
    btn.classList.add('shake-anim');
    setTimeout(() => {
      btn.classList.remove('shake-anim');
    }, 500);
  },

  handleSlide2(btn) {
    const isCorrect = btn.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      SoundFX.playSuccess();
      Confetti.burst(40);
      
      // Disable other choices
      const buttons = document.querySelectorAll('#slide-2 button.overlay-element');
      buttons.forEach(b => b.style.pointerEvents = 'none');
      
      // Show dynamic floating success banner
      const banner = document.createElement('div');
      banner.className = 'success-banner';
      banner.innerHTML = '<span>Молодець!</span> 🌟';
      banner.style.left = '50%';
      banner.style.top = '65%';
      document.getElementById('slide-2').appendChild(banner);
      
      setTimeout(() => {
        document.getElementById('s2-next').style.display = 'flex';
      }, 300);
    } else {
      this.triggerIncorrect(btn);
    }
  },

  handleSlide3(btn) {
    const isCorrect = btn.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      SoundFX.playSuccess();
      Confetti.burst(40);
      
      // Re-style correct button and disable pointer
      btn.style.background = '#4ade80';
      btn.style.color = 'white';
      btn.style.borderColor = '#4ade80';
      btn.style.boxShadow = '0 6px 0 #22c55e';
      
      const buttons = document.querySelectorAll('#slide-3 button.card-btn');
      buttons.forEach(b => b.style.pointerEvents = 'none');
      
      // Show dynamic floating success banner
      const banner = document.createElement('div');
      banner.className = 'success-banner';
      banner.innerHTML = '<span>Молодець!</span> 🌟';
      banner.style.left = '50%';
      banner.style.top = '65%';
      document.getElementById('slide-3').appendChild(banner);

      setTimeout(() => {
        // Hide all option cards and show next
        buttons.forEach(b => b.style.opacity = '0');
        document.getElementById('s3-next').style.display = 'flex';
      }, 800);
    } else {
      this.triggerIncorrect(btn);
    }
  },

  handleSlide4(btn) {
    const isCorrect = btn.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      SoundFX.playSuccess();
      Confetti.burst(40);

      // Show operators
      document.getElementById('s4-op-slot').style.display = 'flex';
      
      // Disable inputs
      const buttons = document.querySelectorAll('#slide-4 button.overlay-element');
      buttons.forEach(b => b.style.pointerEvents = 'none');

      setTimeout(() => {
        // Hide option buttons and show next
        buttons.forEach(b => b.style.opacity = '0');
        document.getElementById('s4-next').style.display = 'flex';
      }, 500);
    } else {
      this.triggerIncorrect(btn);
    }
  },

  handleSlide5(btn) {
    const val = parseInt(btn.getAttribute('data-val'));

    if (this.slide5Step === 1) {
      if (val === 4) {
        SoundFX.playSuccess();
        Confetti.burst(30);

        // Fill blank 1
        document.getElementById('s5-blank1').style.display = 'flex';
        
        // Hide and disable left option card
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        
        // Transition to step 2
        this.slide5Step = 2;
      } else {
        this.triggerIncorrect(btn);
      }
    } else if (this.slide5Step === 2) {
      if (val === 5) {
        SoundFX.playSuccess();
        Confetti.burst(40);

        // Fill blank 2
        document.getElementById('s5-blank2').style.display = 'flex';

        // Hide and disable middle option card
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
        document.getElementById('s5-btn-right').style.pointerEvents = 'none'; // disable right button

        setTimeout(() => {
          document.getElementById('s5-next').style.display = 'flex';
        }, 500);
      } else {
        this.triggerIncorrect(btn);
      }
    }
  },

  handleSlide6(btn) {
    const isCorrect = btn.getAttribute('data-correct') === 'true';
    if (isCorrect) {
      SoundFX.playSuccess();
      Confetti.burst(45);

      // Disable inputs
      const buttons = document.querySelectorAll('#slide-6 button.overlay-element');
      buttons.forEach(b => b.style.pointerEvents = 'none');

      setTimeout(() => {
        // Hide option buttons and show next
        buttons.forEach(b => b.style.opacity = '0');
        document.getElementById('s6-next').style.display = 'flex';
      }, 400);
    } else {
      this.triggerIncorrect(btn);
    }
  },

  handleSlide7() {
    SoundFX.playSuccess();
    Confetti.burst(45);

    // Hide interaction button
    document.getElementById('s7-done').style.display = 'none';

    // Show dynamic floating success banner
    const banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.innerHTML = '<span>Чудово!</span> 🎉';
    banner.style.left = '50%';
    banner.style.top = '65%';
    document.getElementById('slide-7').appendChild(banner);

    setTimeout(() => {
      document.getElementById('s7-next').style.display = 'flex';
    }, 400);
  },

  restart() {
    SoundFX.playComplete();
    Confetti.stream(1500);

    // Fade to slide 1 after delay
    setTimeout(() => {
      // CLEAR ALL SUCCESS BANNERS
      const existingBanners = document.querySelectorAll('.success-banner');
      existingBanners.forEach(b => b.remove());

      // RESET SLIDE 2
      document.getElementById('s2-next').style.display = 'none';
      const s2b = document.querySelectorAll('#slide-2 button.overlay-element');
      s2b.forEach(b => b.style.pointerEvents = 'auto');

      // RESET SLIDE 3
      const s3b = document.querySelectorAll('#slide-3 button.card-btn');
      s3b.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
        b.style.background = 'white';
        b.style.color = '';
        b.style.borderColor = '#e1f0f5';
        b.style.boxShadow = '0 6px 0 #d1e2e8, 0 8px 16px rgba(0,0,0,0.06)';
      });
      document.getElementById('s3-next').style.display = 'none';

      // RESET SLIDE 4
      document.getElementById('s4-op-slot').style.display = 'none';
      document.getElementById('s4-next').style.display = 'none';
      const s4b = document.querySelectorAll('#slide-4 button.overlay-element');
      s4b.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
      });

      // RESET SLIDE 5
      this.slide5Step = 1;
      document.getElementById('s5-blank1').style.display = 'none';
      document.getElementById('s5-blank2').style.display = 'none';
      document.getElementById('s5-next').style.display = 'none';
      const s5Buttons = [
        document.getElementById('s5-btn-left'),
        document.getElementById('s5-btn-mid'),
        document.getElementById('s5-btn-right')
      ];
      s5Buttons.forEach(b => {
        b.style.opacity = '1';
        b.style.pointerEvents = 'auto';
      });

      // RESET SLIDE 6
      document.getElementById('s6-next').style.display = 'none';
      const s6b = document.querySelectorAll('#slide-6 button.overlay-element');
      s6b.forEach(b => {
        b.style.pointerEvents = 'auto';
        b.style.opacity = '1';
      });

      // RESET SLIDE 7
      document.getElementById('s7-done').style.display = 'flex';
      document.getElementById('s7-next').style.display = 'none';

      // Go back to Dashboard
      this.showDashboard();
    }, 1500);
  }
};

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
  window.app = Game; // Expose to window for onclick handlers
  Game.init();
});
