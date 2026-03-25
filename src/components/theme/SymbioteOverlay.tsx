"use client";

import { useEffect, useState, useMemo } from "react";
import { WebSpinner } from "@/components/ui/WebSpinner";

type TransitionDirection = "to-venom" | "to-miles" | "to-peter";

interface SymbioteOverlayProps {
  direction: TransitionDirection;
  origin: { x: number; y: number };
  onComplete: () => void;
}

/** Per-direction visual configuration */
const DIRECTION_CONFIG: Record<
  TransitionDirection,
  { stroke: string; wipeColor: string; spinnerColor: string; totalDuration: number }
> = {
  "to-venom": { stroke: "#0A0A0A", wipeColor: "#0A0A0A", spinnerColor: "rgba(255,255,255,0.6)", totalDuration: 4000 },
  "to-miles":  { stroke: "#FFD700", wipeColor: "#FFD700", spinnerColor: "rgba(0,0,0,0.5)", totalDuration: 4000 },
  "to-peter":  { stroke: "#FFFFFF", wipeColor: "#FFFFFF", spinnerColor: "rgba(0,0,0,0.4)", totalDuration: 4000 },
};

const STROKE_DURATION = 2500;

// ---------------------------------------------------------------------------
// Shared: evenly distribute start points around viewport perimeter
// ---------------------------------------------------------------------------
function perimeterPoint(index: number, total: number, vw: number, vh: number): [number, number] {
  // Walk around the perimeter evenly: top → right → bottom → left
  const perimeter = 2 * (vw + vh);
  const pos = (index / total) * perimeter;

  if (pos < vw) return [pos, 0]; // top edge
  if (pos < vw + vh) return [vw, pos - vw]; // right edge
  if (pos < 2 * vw + vh) return [vw - (pos - vw - vh), vh]; // bottom edge
  return [0, vh - (pos - 2 * vw - vh)]; // left edge
}

// ---------------------------------------------------------------------------
// 1. MILES — Fractal Lightning (edges → center)
// ---------------------------------------------------------------------------

interface BoltPath {
  d: string;
  width: number;
  delay: number;
  glow?: boolean;
}

/**
 * Recursive midpoint-displacement lightning.
 * Displaces the midpoint perpendicular to each segment, then recurses.
 * Branches are baked into the same continuous path (no disconnected M jumps).
 */
/**
 * Recursive midpoint-displacement lightning.
 * Collects actual displaced midpoints so forks can branch from real positions.
 */
function fractalBolt(
  x1: number, y1: number,
  x2: number, y2: number,
  depth: number,
  maxDepth: number,
  displacement: number,
  midpoints?: { x: number; y: number; dx: number; dy: number; t: number }[],
  tStart = 0,
  tEnd = 1,
): string {
  if (depth >= maxDepth) {
    return `L ${x2} ${y2}`;
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return `L ${x2} ${y2}`;

  const perpX = -dy / len;
  const perpY = dx / len;
  const offset = (Math.random() - 0.5) * len * displacement;
  const mx = (x1 + x2) / 2 + perpX * offset;
  const my = (y1 + y2) / 2 + perpY * offset;
  const tMid = (tStart + tEnd) / 2;

  // Collect early-depth midpoints for forking (with their position along the bolt)
  if (midpoints && depth <= 2) {
    midpoints.push({ x: mx, y: my, dx, dy, t: tMid });
  }

  return fractalBolt(x1, y1, mx, my, depth + 1, maxDepth, displacement, midpoints, tStart, tMid)
       + fractalBolt(mx, my, x2, y2, depth + 1, maxDepth, displacement, midpoints, tMid, tEnd);
}

function generateLightning(vw: number, vh: number): BoltPath[] {
  const boltCount = 8;
  const paths: BoltPath[] = [];

  for (let i = 0; i < boltCount; i++) {
    const [sx, sy] = perimeterPoint(i, boltCount, vw, vh);
    const angle = (i / boltCount) * Math.PI * 2;
    const scatter = 60;
    const cx = vw / 2 + Math.cos(angle) * scatter;
    const cy = vh / 2 + Math.sin(angle) * scatter;

    // Collect real midpoints during generation
    const midpoints: { x: number; y: number; dx: number; dy: number; t: number }[] = [];
    const mainD = `M ${sx} ${sy}` + fractalBolt(sx, sy, cx, cy, 0, 5, 0.35, midpoints);
    const delay = i * 120;
    const width = 1.5 + Math.random() * 1;

    // Glow layer behind
    paths.push({ d: mainD, width: width + 4, delay, glow: true });
    // Core bolt
    paths.push({ d: mainD, width, delay });

    // 1-2 fork branches from REAL midpoints on the bolt
    const forkCount = 1 + Math.floor(Math.random() * 2);
    const usable = midpoints.filter((_, idx) => idx > 0); // skip first midpoint (too close to start)
    for (let f = 0; f < forkCount && usable.length > 0; f++) {
      const mp = usable.splice(Math.floor(Math.random() * usable.length), 1)[0];
      const mainAngle = Math.atan2(mp.dy, mp.dx);
      const forkAngle = mainAngle + (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8);
      const forkLen = 80 + Math.random() * 120;
      const fex = mp.x + Math.cos(forkAngle) * forkLen;
      const fey = mp.y + Math.sin(forkAngle) * forkLen;
      const forkD = `M ${mp.x} ${mp.y}` + fractalBolt(mp.x, mp.y, fex, fey, 0, 3, 0.3);

      // Fork starts drawing when the main bolt's stroke reaches this point
      const forkDelay = delay + Math.round(mp.t * STROKE_DURATION);
      paths.push({ d: forkD, width: width * 0.6, delay: forkDelay, glow: true });
      paths.push({ d: forkD, width: width * 0.4, delay: forkDelay });
    }
  }

  return paths;
}

// ---------------------------------------------------------------------------
// 2. PETER — Pre-built Spider Web (revealed from center outward)
// ---------------------------------------------------------------------------

/**
 * Generates a complete spider web SVG as a single group of paths.
 * The web is NOT stroke-animated — it's rendered statically and
 * revealed via an expanding clip-path circle from center outward.
 */
function generateFullWeb(vw: number, vh: number) {
  const cx = vw / 2;
  const cy = vh / 2;
  const spokeCount = 20;
  const ringCount = 8;
  const diagonal = Math.sqrt(vw * vw + vh * vh);
  const maxR = diagonal * 0.55;

  // Spoke angles — even spacing, slight jitter for organic feel
  const angles: number[] = [];
  for (let i = 0; i < spokeCount; i++) {
    angles.push((i / spokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.04);
  }

  // Ring radii — slight exponential bias (tighter near center, matching coming-soon web)
  const ringRadii: number[] = [];
  for (let i = 1; i <= ringCount; i++) {
    const t = i / ringCount;
    ringRadii.push(maxR * (t * t * 0.4 + t * 0.6));
  }

  // Build spoke paths
  const spokes: string[] = angles.map((a) => {
    const endX = cx + Math.cos(a) * maxR;
    const endY = cy + Math.sin(a) * maxR;
    return `M ${cx} ${cy} L ${endX} ${endY}`;
  });

  // Build ring paths — quadratic bezier with inward sag between each spoke pair
  const rings: string[] = ringRadii.map((r, ri) => {
    const sagRatio = 0.22 + ri * 0.015; // inner rings sag more proportionally
    let d = "";
    for (let s = 0; s < spokeCount; s++) {
      const a1 = angles[s];
      const a2 = angles[(s + 1) % spokeCount];

      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const x2 = cx + Math.cos(a2) * r;
      const y2 = cy + Math.sin(a2) * r;

      // Midpoint angle — handle wrapping
      let mid = (a1 + a2) / 2;
      if (a2 < a1) mid = a1 + ((a2 + Math.PI * 2) - a1) / 2;

      // Control point pulled inward — concave scallop
      const cpR = r * (1 - sagRatio);
      const cpX = cx + Math.cos(mid) * cpR;
      const cpY = cy + Math.sin(mid) * cpR;

      if (s === 0) d += `M ${x1} ${y1}`;
      d += ` Q ${cpX} ${cpY}, ${x2} ${y2}`;
    }
    return d;
  });

  return { spokes, rings, cx, cy };
}

// ---------------------------------------------------------------------------
// 3. VENOM — Simple S-Curve Tendrils (edges → scattered center points)
// ---------------------------------------------------------------------------

interface TendrilPath {
  d: string;
  width: number;
  delay: number;
  isOutline?: boolean;
}

function generateTendrils(vw: number, vh: number): TendrilPath[] {
  const tendrilCount = 16;
  const paths: TendrilPath[] = [];

  for (let i = 0; i < tendrilCount; i++) {
    const [sx, sy] = perimeterPoint(i, tendrilCount, vw, vh);

    // Each tendril ends at a DIFFERENT point in the center region — no single convergence
    const angle = (i / tendrilCount) * Math.PI * 2;
    const scatter = 80 + Math.random() * 120;
    const ex = vw / 2 + Math.cos(angle) * scatter;
    const ey = vh / 2 + Math.sin(angle) * scatter;

    // Simple S-curve: single cubic bezier with two offset control points
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const sign = i % 2 === 0 ? 1 : -1;
    const jitter = 100 + Math.random() * 100;

    const cp1x = sx + dx * 0.33 + perpX * jitter * sign;
    const cp1y = sy + dy * 0.33 + perpY * jitter * sign;
    const cp2x = sx + dx * 0.66 - perpX * jitter * sign;
    const cp2y = sy + dy * 0.66 - perpY * jitter * sign;

    const d = `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`;
    const baseDelay = i * 120;
    // Thicker at edges (~25% boost), slightly thicker overall (~15%)
    const width = 5 + Math.random() * 5;

    // Main tendril only — no outline
    paths.push({ d, width, delay: baseDelay });
  }

  return paths;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SymbioteOverlay({ direction, origin, onComplete }: SymbioteOverlayProps) {
  const [phase, setPhase] = useState<"animate" | "hold" | "fade" | "done">("animate");
  const [webReveal, setWebReveal] = useState(0); // 0 to 1 — clip-path radius for web reveal

  const vw = typeof document !== "undefined" ? document.documentElement.clientWidth : 1280;
  const vh = typeof document !== "undefined" ? document.documentElement.clientHeight : 800;

  const config = DIRECTION_CONFIG[direction];

  const { lightning, webData, tendrils } = useMemo(() => ({
    lightning: direction === "to-miles" ? generateLightning(vw, vh) : [],
    webData: direction === "to-peter" ? generateFullWeb(vw, vh) : null,
    tendrils: direction === "to-venom" ? generateTendrils(vw, vh) : [],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [direction]);

  // Web reveal animation — expand clip from 0% to 100% over 3s
  useEffect(() => {
    if (direction !== "to-peter") return;
    let raf: number;
    const start = performance.now();
    const duration = 3000;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setWebReveal(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [direction]);

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 3000);
    const fadeTimer = setTimeout(() => setPhase("fade"), 3600);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, config.totalDuration);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [direction, onComplete, config.totalDuration]);

  if (phase === "done") return null;

  const pathLength = 1200;
  const diagonal = Math.sqrt(vw * vw + vh * vh);

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      {/* SVG stroke animations — Miles & Venom (stroke-draw) */}
      {phase === "animate" && (direction === "to-miles" || direction === "to-venom") && (
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox={`0 0 ${vw} ${vh}`}
          preserveAspectRatio="none"
        >
          {/* Miles — Fractal Lightning */}
          {lightning.map((bolt, i) => (
            <path
              key={`bolt-${i}`}
              d={bolt.d}
              fill="none"
              stroke={bolt.glow ? "rgba(255,215,0,0.3)" : config.stroke}
              strokeWidth={bolt.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{
                animation: `tendril-draw ${STROKE_DURATION}ms ease-out ${bolt.delay}ms forwards`,
              }}
            />
          ))}

          {/* Venom — S-Curve Tendrils */}
          {tendrils.map((t, i) => (
            <path
              key={`tendril-${i}`}
              d={t.d}
              fill="none"
              stroke={config.stroke}
              strokeWidth={t.width}
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{
                animation: `tendril-draw ${STROKE_DURATION}ms ease-out ${t.delay}ms forwards`,
              }}
            />
          ))}
        </svg>
      )}

      {/* Peter — Pre-built web revealed via expanding clip-path */}
      {phase === "animate" && webData && (
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox={`0 0 ${vw} ${vh}`}
          preserveAspectRatio="none"
          style={{
            clipPath: `circle(${webReveal * diagonal * 0.6}px at ${vw / 2}px ${vh / 2}px)`,
          }}
        >
          {/* Spokes */}
          {webData.spokes.map((d, i) => (
            <path
              key={`spoke-${i}`}
              d={d}
              fill="none"
              stroke={config.stroke}
              strokeWidth={1.5}
              strokeLinecap="round"
              opacity={0.9}
            />
          ))}
          {/* Rings with concave sag */}
          {webData.rings.map((d, i) => (
            <path
              key={`ring-${i}`}
              d={d}
              fill="none"
              stroke={config.stroke}
              strokeWidth={1}
              strokeLinecap="round"
              opacity={0.7}
            />
          ))}
        </svg>
      )}

      {/* Circle-wipe portal — expands from click origin */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: config.wipeColor,
          clipPath: phase === "hold" || phase === "fade"
            ? `circle(150% at ${origin.x}px ${origin.y}px)`
            : `circle(0% at ${origin.x}px ${origin.y}px)`,
          opacity: phase === "fade" ? 0 : 1,
          transition: phase === "animate"
            ? "clip-path 3s cubic-bezier(0.4, 0, 0.2, 1)"
            : phase === "fade"
              ? "opacity 0.4s ease-out"
              : "none",
        }}
      />

      {/* Theme-aware WebSpinner — visible during hold */}
      {(phase === "hold" || phase === "fade") && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === "fade" ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            color: config.spinnerColor,
          }}
        >
          <WebSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
