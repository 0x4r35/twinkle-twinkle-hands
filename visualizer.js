export class Visualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Config
    this.hue = 0;
    this.mathSymbols = ['∑', '∫', 'π', '√', '∞', '≈', '≠', '±', '∂', '∇', 'x²', 'e^x', 'sin', 'cos', 'log'];
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(x, y) {
    for (let i = 0; i < 2; i++) { // Fewer particles, but meaningful
      this.particles.push({
        x: x,
        y: y,
        size: Math.random() * 10 + 10, // Larger for text
        speedX: Math.random() * 4 - 2,
        speedY: Math.random() * 4 - 2,
        color: `hsl(${this.hue}, 100%, 70%)`, // Lighter for better visibility
        life: 100,
        symbol: this.mathSymbols[Math.floor(Math.random() * this.mathSymbols.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    }
  }

  update(landmarks) {
    // Clear with transparency for trail effect, but since we have video background, 
    // we need to clear completely or handle trails differently.
    // For "clear" gestures on video, best to clear completely each frame.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Mirror landmarks (x = 1 - x) to match CSS flipped video
    const mirroredLandmarks = landmarks ? landmarks.map(hand =>
      hand.map(p => ({ ...p, x: 1 - p.x }))
    ) : [];

    // Update particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      p.life--;
      p.size *= 0.98;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      this.ctx.fillStyle = p.color;
      this.ctx.font = `bold ${p.size}px monospace`;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fillText(p.symbol, -p.size / 2, p.size / 2); // Center text somewhat

      this.ctx.restore();

      if (p.life <= 0 || p.size <= 1) {
        this.particles.splice(i, 1);
        i--;
      }
    }

    // Process mirrored landmarks
    if (mirroredLandmarks.length > 0) {
      // Iterate through detected hands
      for (const hand of mirroredLandmarks) {
        // Draw improved skeleton
        this.drawHand(hand);

        // Emit particles from tips
        const fingertips = [4, 8, 12, 16, 20]; // Thumb to Pinky tips
        for (const tipId of fingertips) {
          const tip = hand[tipId];
          // Emit from Index (8) and Thumb (4)
          if ((tipId === 8 || tipId === 4) && tip) {
            const x = tip.x * this.canvas.width;
            const y = tip.y * this.canvas.height;
            if (Math.random() > 0.5) { // Limit emission rate
              this.createParticles(x, y);
            }
          }
        }
      }

      // Thumb String Feature
      if (mirroredLandmarks.length === 2) {
        const hand1 = mirroredLandmarks[0];
        const hand2 = mirroredLandmarks[1];
        const thumb1 = hand1[4];
        const thumb2 = hand2[4];

        if (thumb1 && thumb2) {
          this.drawThumbString(thumb1, thumb2);
        }
      }
    }

    this.hue += 1;
  }

  drawThumbString(p1, p2) {
    const x1 = p1.x * this.canvas.width;
    const y1 = p1.y * this.canvas.height;
    const x2 = p2.x * this.canvas.width;
    const y2 = p2.y * this.canvas.height;

    const dist = Math.hypot(x2 - x1, y2 - y1);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 80%)`; // Light vibrating string
    this.ctx.lineWidth = Math.max(1, 5 - dist / 200); // Thinner as it stretches

    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);

    this.ctx.shadowColor = '#fff';
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawHand(landmarks) {
    this.ctx.save();

    // Neon/Glow settings
    this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
    this.ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;

    // Connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], [0, 17] // Palm base/connectors
    ];

    this.ctx.beginPath();
    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      this.ctx.moveTo(p1.x * this.canvas.width, p1.y * this.canvas.height);
      this.ctx.lineTo(p2.x * this.canvas.width, p2.y * this.canvas.height);
    }
    this.ctx.stroke();

    // Draw joints
    for (const lm of landmarks) {
      const x = lm.x * this.canvas.width;
      const y = lm.y * this.canvas.height;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 6, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
