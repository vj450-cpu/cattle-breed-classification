/**
 * PashuDrishti AI - Ambient Background Stardust & Floating Cattle Visuals
 * Creates a luxurious golden stardust particle field and drifting cattle silhouettes
 */

class AmbientBackground {
  constructor(canvasId = "bgParticleCanvas") {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.numParticles = 55;
    this.mouseX = 0;
    this.mouseY = 0;

    this.resize();
    this.initParticles();
    this.setupEvents();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.55 - 0.15, // float upwards like golden embers
        alpha: Math.random() * 0.7 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.3 ? "#f59e0b" : "#fbbf24"
      });
    }
  }

  setupEvents() {
    window.addEventListener("resize", () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener("mousemove", (e) => {
      this.mouseX = (e.clientX - this.width / 2) * 0.025;
      this.mouseY = (e.clientY - this.height / 2) * 0.025;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let p of this.particles) {
      p.y += p.vy;
      p.x += p.vx + this.mouseX * 0.1;
      p.pulsePhase += p.pulseSpeed;

      // Wrap around
      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));

      // Draw particle glow
      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
      grad.addColorStop(0, p.color);
      grad.addColorStop(1, "rgba(245, 158, 11, 0)");

      this.ctx.save();
      this.ctx.globalAlpha = currentAlpha;
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Sharp center core
      this.ctx.fillStyle = "#fffbeb";
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
}

window.initAmbientBackground = function () {
  window.ambientBg = new AmbientBackground("bgParticleCanvas");
};
