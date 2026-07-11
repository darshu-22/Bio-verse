




'use strict';

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.animFrame = null;
    this.dpr = window.devicePixelRatio || 1;

    this.config = {
      count: 120,
      maxSize: 2.5,
      minSize: 0.5,
      speed: 0.3,
      colors: [
        'rgba(0, 212, 255, ',
        'rgba(123, 47, 255, ',
        'rgba(0, 255, 163, ',
        'rgba(255, 107, 157, ',
      ],
      connectionDistance: 120,
      mouseInfluence: 100,
    };

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate();
  }

  resize() {
    const { canvas, dpr } = this;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    this.W = window.innerWidth;
    this.H = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
  }

  createParticle() {
    return null;
  }

  bindEvents() {
    window.addEventListener('resize', BioUtils.debounce(() => {
      this.resize();
    }, 200));
  }

  drawParticle(p) {}

  drawConnections() {}

  updateParticle(p) {}

  animate() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
  }

  destroy() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
    }
  }
}


window.ParticleSystem = ParticleSystem;
