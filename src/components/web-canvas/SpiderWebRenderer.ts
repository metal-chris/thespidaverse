import {
  PALETTES, ANIMATION, type WebConfig, type Palette, type PaletteColors, getWebConfig,
} from "./particle-config";

// ============================================================
// Strike — stores the angular direction of the click relative
// to the web center. Lightning radiates FROM center OUTWARD
// through that angular section of the web.
// ============================================================
interface Strike {
  angle: number;    // angle from center to click point
  progress: number; // 0→1
}

// ============================================================
// SpiderWebRenderer — fullscreen spider-web with concentric
// rings, radial spokes, mouse glow, breathing animation,
// venom-strike click effect, and palette switching.
// ============================================================
export class SpiderWebRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: WebConfig;
  private animationId = 0;
  private lastTime = 0;
  private time = 0;
  private isRunning = false;
  private reducedMotion: boolean;

  // Palette
  private colors: PaletteColors;

  // Web geometry
  private cx = 0;
  private cy = 0;
  private maxRadius = 0;
  private spokeAngles: number[] = [];
  private ringRadii: number[] = [];

  // Mouse
  private mouseX = -1;
  private mouseY = -1;
  private mouseActive = false;
  private smoothMouseX = -1;
  private smoothMouseY = -1;

  // Spawn
  private spawnProgress = 0;

  // Venom strikes
  private strikes: Strike[] = [];

  constructor(canvas: HTMLCanvasElement, reducedMotion = false, palette: Palette = "miles") {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.reducedMotion = reducedMotion;
    this.colors = PALETTES[palette];
    this.config = getWebConfig(window.innerWidth);
    this.computeGeometry();
  }

  // ----------------------------------------------------------
  // Geometry — concentric rings + evenly-spaced radial spokes.
  // maxRadius uses the *diagonal* so the web always covers the
  // full viewport, even in landscape/portrait extremes.
  // ----------------------------------------------------------
  private computeGeometry() {
    const dpr = window.devicePixelRatio || 1;
    const w = this.canvas.width / dpr;
    const h = this.canvas.height / dpr;
    this.cx = w / 2;
    this.cy = h / 2;

    // Diagonal / 2 so the web reaches every corner
    this.maxRadius = Math.sqrt(w * w + h * h) / 2;

    // Even spoke angles — no jitter, clean geometry
    this.spokeAngles = [];
    const step = (Math.PI * 2) / this.config.spokes;
    for (let i = 0; i < this.config.spokes; i++) {
      this.spokeAngles.push(step * i);
    }

    // Ring radii — slight exponential bias (tighter near center)
    this.ringRadii = [];
    for (let i = 1; i <= this.config.rings; i++) {
      const t = i / this.config.rings;
      this.ringRadii.push(this.maxRadius * (t * t * 0.4 + t * 0.6));
    }
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = 0;
    }
  }

  destroy() {
    this.stop();
    this.strikes = [];
  }

  setPalette(palette: Palette) {
    this.colors = PALETTES[palette];
  }

  triggerStrike(x: number, y: number) {
    const angle = Math.atan2(y - this.cy, x - this.cx);
    this.strikes.push({ angle, progress: 0 });
  }

  setMousePosition(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
    if (!this.mouseActive) {
      this.smoothMouseX = x;
      this.smoothMouseY = y;
    }
    this.mouseActive = true;
  }

  clearMouse() {
    this.mouseActive = false;
  }

  resize() {
    this.config = getWebConfig(window.innerWidth);
    this.computeGeometry();
  }

  // ----------------------------------------------------------
  // Loop
  // ----------------------------------------------------------
  private loop = (ts: number) => {
    if (!this.isRunning) return;
    const dt = Math.min(ts - this.lastTime, 50);
    this.lastTime = ts;
    this.time += dt;

    if (this.mouseActive) {
      this.smoothMouseX += (this.mouseX - this.smoothMouseX) * 0.12;
      this.smoothMouseY += (this.mouseY - this.smoothMouseY) * 0.12;
    }

    if (this.reducedMotion) {
      this.spawnProgress = 1;
    } else if (this.spawnProgress < 1) {
      this.spawnProgress = Math.min(this.spawnProgress + dt / ANIMATION.spawnDuration, 1);
    }

    // Update strikes
    for (let i = this.strikes.length - 1; i >= 0; i--) {
      this.strikes[i].progress += dt / ANIMATION.strikeDuration;
      if (this.strikes[i].progress >= 1) this.strikes.splice(i, 1);
    }

    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  };

  // ----------------------------------------------------------
  // Draw
  // ----------------------------------------------------------
  private draw() {
    const dpr = window.devicePixelRatio || 1;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.scale(dpr, dpr);

    const spawn = easeOutQuart(this.spawnProgress);
    const breathe = Math.sin((this.time / ANIMATION.breatheCycle) * Math.PI * 2);

    this.drawSpokes(spawn);
    this.drawRings(spawn, breathe);
    this.drawCenter(spawn);
    this.drawIntersections(spawn, breathe);
    this.drawStrikes(spawn, breathe);

    this.ctx.restore();
  }

  // ----------------------------------------------------------
  // Spokes — straight lines from center to edge
  // ----------------------------------------------------------
  private drawSpokes(spawn: number) {
    const outerR = this.maxRadius * spawn;

    for (let i = 0; i < this.spokeAngles.length; i++) {
      const angle = this.spokeAngles[i];
      const endX = this.cx + Math.cos(angle) * outerR;
      const endY = this.cy + Math.sin(angle) * outerR;

      const mi = this.getPointMouseInfluence(
        this.cx + Math.cos(angle) * this.smoothMouseDist(),
        this.cy + Math.sin(angle) * this.smoothMouseDist()
      );
      const alpha = 0.12 + mi * 0.5;

      this.ctx.beginPath();
      this.ctx.moveTo(this.cx, this.cy);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = mi > 0.2
        ? `rgba(${this.colors.web.glow}, ${alpha})`
        : `rgba(${this.colors.web.dim}, ${alpha})`;
      this.ctx.lineWidth = mi > 0.2 ? 1.2 : 0.8;
      this.ctx.stroke();
    }
  }

  // ----------------------------------------------------------
  // Rings — full concentric circles drawn as arcs, with a
  // slight sag per segment for organic feel. Uses arc() for
  // each segment so they always connect cleanly.
  // ----------------------------------------------------------
  private drawRings(spawn: number, breathe: number) {
    for (let r = 0; r < this.ringRadii.length; r++) {
      const ringSpawn = Math.min(spawn * (this.config.rings / (r + 1)), 1);
      if (ringSpawn <= 0) continue;

      const baseR = this.ringRadii[r];
      const breatheFactor = 1 + breathe * ANIMATION.breatheAmount * ((r + 1) / this.config.rings);
      const radius = baseR * breatheFactor;
      const ringAlphaBase = 0.10 + (r / this.config.rings) * 0.06;

      // Draw individual segments between spokes as quadratic curves
      for (let s = 0; s < this.spokeAngles.length; s++) {
        const a1 = this.spokeAngles[s];
        const a2 = this.spokeAngles[(s + 1) % this.spokeAngles.length];

        const x1 = this.cx + Math.cos(a1) * radius;
        const y1 = this.cy + Math.sin(a1) * radius;
        const x2 = this.cx + Math.cos(a2) * radius;
        const y2 = this.cy + Math.sin(a2) * radius;

        // Control point — pushed slightly outward for sag
        // Use the midpoint angle correctly, handling the 0/2π wrap
        let mid = (a1 + a2) / 2;
        if (a2 < a1) mid = a1 + ((a2 + Math.PI * 2) - a1) / 2;
        const sag = radius * 0.025;
        const cpx = this.cx + Math.cos(mid) * (radius + sag);
        const cpy = this.cy + Math.sin(mid) * (radius + sag);

        // Mouse influence — check midpoint of segment
        const segMidX = this.cx + Math.cos(mid) * radius;
        const segMidY = this.cy + Math.sin(mid) * radius;
        const mi = this.getPointMouseInfluence(segMidX, segMidY);
        const alpha = (ringAlphaBase + mi * 0.45) * ringSpawn;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        this.ctx.strokeStyle = mi > 0.2
          ? `rgba(${this.colors.web.glow}, ${alpha})`
          : `rgba(${this.colors.web.dim}, ${alpha})`;
        this.ctx.lineWidth = mi > 0.2 ? 1.0 : 0.6;
        this.ctx.stroke();
      }
    }
  }

  // ----------------------------------------------------------
  // Center node
  // ----------------------------------------------------------
  private drawCenter(spawn: number) {
    if (spawn < 0.05) return;
    const pulse = 1 + Math.sin(this.time * 0.002) * 0.1;
    const r = 3.5 * pulse * spawn;

    const grad = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, r * 5);
    grad.addColorStop(0, `rgba(${this.colors.web.glow}, 0.5)`);
    grad.addColorStop(0.5, `rgba(${this.colors.web.base}, 0.15)`);
    grad.addColorStop(1, `rgba(${this.colors.web.base}, 0)`);
    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, r * 5, 0, Math.PI * 2);
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
    this.ctx.fillStyle = `rgba(${this.colors.web.glow}, 0.8)`;
    this.ctx.fill();
  }

  // ----------------------------------------------------------
  // Intersection dots — at every ring × spoke crossing
  // ----------------------------------------------------------
  private drawIntersections(spawn: number, breathe: number) {
    for (let r = 0; r < this.ringRadii.length; r++) {
      const ringSpawn = Math.min(spawn * (this.config.rings / (r + 1)), 1);
      if (ringSpawn <= 0) continue;

      const baseR = this.ringRadii[r];
      const breatheFactor = 1 + breathe * ANIMATION.breatheAmount * ((r + 1) / this.config.rings);
      const radius = baseR * breatheFactor;

      for (let s = 0; s < this.spokeAngles.length; s++) {
        const angle = this.spokeAngles[s];
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;

        const mi = this.getPointMouseInfluence(x, y);
        const dotAlpha = (0.15 + mi * 0.6) * ringSpawn;
        const dotSize = (1.2 + mi * 2) * ringSpawn;

        this.ctx.beginPath();
        this.ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        this.ctx.fillStyle = mi > 0.2
          ? `rgba(${this.colors.web.glow}, ${dotAlpha})`
          : `rgba(${this.colors.web.base}, ${dotAlpha})`;
        this.ctx.fill();
      }
    }
  }

  // ----------------------------------------------------------
  // Venom Strike — a lightning bolt surges outward from the
  // web center along the clicked direction. A bright wave front
  // travels outward, leaving a fading trail behind it.
  // ----------------------------------------------------------
  private drawStrikes(spawn: number, breathe: number) {
    if (this.strikes.length === 0) return;

    const halfCone = 0.6;
    // The bolt front width as a fraction of maxRadius
    const frontWidth = 0.18;

    for (const strike of this.strikes) {
      const strikeColor = this.colors.strike;
      const glowColor = this.colors.strikeGlow;

      // The bolt front position: 0 at center → 1+ past the edge
      // Use first 70% of progress for the surge, last 30% for trail fade
      const surgeT = Math.min(strike.progress / 0.7, 1.0);
      const frontPos = easeOutQuart(surgeT); // 0→1 of maxRadius
      const frontR = frontPos * this.maxRadius;

      // Global fade: full during surge, fade in last 30%
      const globalFade = strike.progress < 0.7
        ? 1.0
        : 1.0 - (strike.progress - 0.7) / 0.3;
      if (globalFade <= 0.01) continue;

      // Angular influence
      const angInf = (a: number): number => {
        let diff = strike.angle - a;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const absDiff = Math.abs(diff);
        if (absDiff > halfCone) return 0;
        return 1.0 - absDiff / halfCone;
      };

      // Radial intensity: bright at the front, dim trail behind
      const radInf = (r: number): number => {
        const dist = r / this.maxRadius; // 0→1
        if (dist > frontPos) return 0; // ahead of front = dark
        const behind = frontPos - dist;
        // Bright zone near the front
        if (behind < frontWidth) return 1.0;
        // Trail fades out behind
        const trailDist = behind - frontWidth;
        const trailLen = frontPos - frontWidth;
        if (trailLen <= 0) return 1.0;
        return Math.max(0, 1.0 - trailDist / (trailLen * 0.6));
      };

      const outerR = this.maxRadius * spawn;

      // 1. Spokes — draw only up to the front position
      for (let i = 0; i < this.spokeAngles.length; i++) {
        const angle = this.spokeAngles[i];
        const ai = angInf(angle);
        if (ai < 0.01) continue;

        const spokeEnd = Math.min(frontR, outerR);
        const endX = this.cx + Math.cos(angle) * spokeEnd;
        const endY = this.cy + Math.sin(angle) * spokeEnd;

        // Trail glow
        this.ctx.beginPath();
        this.ctx.moveTo(this.cx, this.cy);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `rgba(${strikeColor}, ${ai * globalFade * 0.25})`;
        this.ctx.lineWidth = 6;
        this.ctx.stroke();

        // Core
        this.ctx.beginPath();
        this.ctx.moveTo(this.cx, this.cy);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `rgba(${glowColor}, ${ai * globalFade * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Bright front tip — short segment near the leading edge
        if (frontR > 20) {
          const tipStart = Math.max(0, frontR - 40);
          const tipSX = this.cx + Math.cos(angle) * tipStart;
          const tipSY = this.cy + Math.sin(angle) * tipStart;
          this.ctx.beginPath();
          this.ctx.moveTo(tipSX, tipSY);
          this.ctx.lineTo(endX, endY);
          this.ctx.strokeStyle = `rgba(${glowColor}, ${ai * globalFade * 0.95})`;
          this.ctx.lineWidth = 3;
          this.ctx.stroke();
        }
      }

      // 2. Rings + dots — only rings the front has passed through
      for (let r = 0; r < this.ringRadii.length; r++) {
        const ringSpawn = Math.min(spawn * (this.config.rings / (r + 1)), 1);
        if (ringSpawn <= 0) continue;

        const baseR = this.ringRadii[r];
        const bf = 1 + breathe * ANIMATION.breatheAmount * ((r + 1) / this.config.rings);
        const radius = baseR * bf;

        const ri = radInf(radius);
        if (ri < 0.01) continue;

        for (let s = 0; s < this.spokeAngles.length; s++) {
          const a1 = this.spokeAngles[s];
          const ai = angInf(a1);
          if (ai < 0.01) continue;

          const intensity = ai * ri * globalFade;
          const px = this.cx + Math.cos(a1) * radius;
          const py = this.cy + Math.sin(a1) * radius;

          // Dot
          const ds = (3 + intensity * 5) * ringSpawn;
          this.ctx.beginPath();
          this.ctx.arc(px, py, ds, 0, Math.PI * 2);
          this.ctx.fillStyle = `rgba(${glowColor}, ${intensity * 0.95})`;
          this.ctx.fill();

          // Ring segment
          const a2 = this.spokeAngles[(s + 1) % this.spokeAngles.length];
          const x2 = this.cx + Math.cos(a2) * radius;
          const y2 = this.cy + Math.sin(a2) * radius;

          let mid = (a1 + a2) / 2;
          if (a2 < a1) mid = a1 + ((a2 + Math.PI * 2) - a1) / 2;
          const sag = radius * 0.025;
          const cpx = this.cx + Math.cos(mid) * (radius + sag);
          const cpy = this.cy + Math.sin(mid) * (radius + sag);

          // Glow
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
          this.ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          this.ctx.strokeStyle = `rgba(${strikeColor}, ${intensity * 0.3})`;
          this.ctx.lineWidth = 4;
          this.ctx.stroke();

          // Core
          this.ctx.beginPath();
          this.ctx.moveTo(px, py);
          this.ctx.quadraticCurveTo(cpx, cpy, x2, y2);
          this.ctx.strokeStyle = `rgba(${glowColor}, ${intensity * 0.85})`;
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();
        }
      }

      // 3. Center flash — quick burst at the start
      if (strike.progress < 0.3) {
        const flashFade = 1.0 - strike.progress / 0.3;
        const flashR = 15 + (1 - flashFade) * 10;
        const grad = this.ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, flashR);
        grad.addColorStop(0, `rgba(${glowColor}, ${flashFade * 0.9})`);
        grad.addColorStop(0.5, `rgba(${strikeColor}, ${flashFade * 0.3})`);
        grad.addColorStop(1, `rgba(${strikeColor}, 0)`);
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, flashR, 0, Math.PI * 2);
        this.ctx.fillStyle = grad;
        this.ctx.fill();
      }
    }
  }

  // ----------------------------------------------------------
  // Mouse helpers
  // ----------------------------------------------------------
  private smoothMouseDist(): number {
    if (!this.mouseActive) return 0;
    const dx = this.smoothMouseX - this.cx;
    const dy = this.smoothMouseY - this.cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getPointMouseInfluence(px: number, py: number): number {
    if (!this.mouseActive) return 0;
    const dx = this.smoothMouseX - px;
    const dy = this.smoothMouseY - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, 1 - dist / this.config.mouseRadius);
  }
}

// ============================================================
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
