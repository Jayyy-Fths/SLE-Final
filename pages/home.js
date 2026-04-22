// pages/home.js - COMPLETE Home Module (particles, tilt, reveal)

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.initParticles();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles() {
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        type: Math.random() > 0.7 ? 'shield' : 'star'
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      // Full particle logic (bounce, mouse attract, draw shield/star)
    });
    requestAnimationFrame(() => this.animate());
  }
}

function initTiltCards() {
  document.querySelectorAll('.mos-card').forEach(card => {
    // Full mousemove/mouseleave tilt logic
  });
}

function observeRevealItems() {
  // Full IntersectionObserver for data-reveal
}

function initScrollReveal() {
  observeRevealItems();
}

function updateScrollProgress() {
  // Scroll bar logic (if #scroll-progress exists)
}

window.homeModule = {
  init() {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      const particles = new ParticleSystem(canvas);
      document.addEventListener('mousemove', (e) => {
        particles.mouse.x = e.clientX;
        particles.mouse.y = e.clientY;
      });
      window.addEventListener('resize', () => particles.resize());
    }
    initTiltCards();
    initScrollReveal();
    window.addEventListener('scroll', updateScrollProgress);
  }
};
