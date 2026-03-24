"use client";

import { useEffect, useState, useMemo } from "react";

type TransitionDirection = "to-venom" | "to-miles" | "to-peter";

interface SymbioteOverlayProps {
  direction: TransitionDirection;
  origin: { x: number; y: number };
  onComplete: () => void;
}

/** Per-direction visual configuration */
const DIRECTION_CONFIG: Record<
  TransitionDirection,
  { flashBg: string; stroke: string; pathDuration: number; totalDuration: number }
> = {
  "to-venom": { flashBg: "#0A0A0A", stroke: "#0A0A0A", pathDuration: 500, totalDuration: 650 },
  "to-miles": { flashBg: "#0D0D0D", stroke: "#FFD700", pathDuration: 450, totalDuration: 600 },
  "to-peter": { flashBg: "#4A0A0A", stroke: "#FFFFFF", pathDuration: 400, totalDuration: 550 },
};

// ---------------------------------------------------------------------------
// Path generators — one per character
// ---------------------------------------------------------------------------

/** Venom: Organic symbiote tendrils — smooth bezier curves from edges toward center */
function generateTendrilPath(
  index: number,
  total: number,
  vw: number,
  vh: number
): string {
  const edge = index % 4;
  const spread = (index / total) * 0.8 + 0.1;

  let startX: number, startY: number;
  switch (edge) {
    case 0: startX = vw * spread; startY = 0; break;
    case 1: startX = vw; startY = vh * spread; break;
    case 2: startX = vw * (1 - spread); startY = vh; break;
    default: startX = 0; startY = vh * (1 - spread); break;
  }

  const endX = vw / 2 + (Math.random() - 0.5) * vw * 0.3;
  const endY = vh / 2 + (Math.random() - 0.5) * vh * 0.3;

  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 120;
  const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 120;
  const cp1x = startX + (midX - startX) * 0.4 + (Math.random() - 0.5) * 60;
  const cp1y = startY + (midY - startY) * 0.6 + (Math.random() - 0.5) * 60;
  const cp2x = midX + (endX - midX) * 0.6 + (Math.random() - 0.5) * 60;
  const cp2y = midY + (endY - midY) * 0.4 + (Math.random() - 0.5) * 60;

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

/** Miles: Electric lightning bolts — jagged zigzag from edges toward center */
function generateLightningPath(
  index: number,
  total: number,
  vw: number,
  vh: number
): string {
  const edge = index % 4;
  const spread = (index / total) * 0.8 + 0.1;

  let startX: number, startY: number;
  switch (edge) {
    case 0: startX = vw * spread; startY = 0; break;
    case 1: startX = vw; startY = vh * spread; break;
    case 2: startX = vw * (1 - spread); startY = vh; break;
    default: startX = 0; startY = vh * (1 - spread); break;
  }

  // Lightning strikes toward center with slight randomization
  const endX = vw / 2 + (Math.random() - 0.5) * vw * 0.5;
  const endY = vh / 2 + (Math.random() - 0.5) * vh * 0.5;

  // Build jagged zigzag segments between start and end
  const segments = 6 + Math.floor(Math.random() * 4); // 6-9 segments
  let d = `M ${startX} ${startY}`;

  for (let s = 1; s <= segments; s++) {
    const t = s / segments;
    const baseX = startX + (endX - startX) * t;
    const baseY = startY + (endY - startY) * t;
    // Sharp perpendicular jitter — lightning character
    const jitter = s < segments ? (Math.random() - 0.5) * 80 : 0;
    const perpX = -(endY - startY) / Math.max(vw, vh);
    const perpY = (endX - startX) / Math.max(vw, vh);
    d += ` L ${baseX + perpX * jitter} ${baseY + perpY * jitter}`;
  }

  return d;
}

/** Peter: Web strands — radial lines from origin outward with slight curve */
function generateWebPath(
  index: number,
  total: number,
  originX: number,
  originY: number,
  vw: number,
  vh: number
): string {
  const angle = (index / total) * Math.PI * 2;
  // Ensure strands always reach past viewport edges from any origin
  const diagonal = Math.sqrt(vw * vw + vh * vh);
  const length = diagonal * (0.6 + Math.random() * 0.5);

  const endX = originX + Math.cos(angle) * length;
  const endY = originY + Math.sin(angle) * length;

  // Slight curve for organic web feel
  const sag = (Math.random() - 0.5) * 30;
  const midAngle = angle + Math.PI / 2;
  const cpX = (originX + endX) / 2 + Math.cos(midAngle) * sag;
  const cpY = (originY + endY) / 2 + Math.sin(midAngle) * sag;

  return `M ${originX} ${originY} Q ${cpX} ${cpY}, ${endX} ${endY}`;
}

/** Peter: Concentric web ring arcs connecting radial strands */
function generateWebRing(
  ringIndex: number,
  totalRings: number,
  totalStrands: number,
  originX: number,
  originY: number,
  vw: number,
  vh: number
): string {
  const maxR = Math.sqrt(vw * vw + vh * vh) * 0.5;
  const r = maxR * ((ringIndex + 1) / (totalRings + 1));

  // Build arc segments between each strand angle
  let d = "";
  for (let i = 0; i < totalStrands; i++) {
    const a1 = (i / totalStrands) * Math.PI * 2;
    const a2 = ((i + 1) / totalStrands) * Math.PI * 2;

    const x1 = originX + Math.cos(a1) * r;
    const y1 = originY + Math.sin(a1) * r;
    const x2 = originX + Math.cos(a2) * r;
    const y2 = originY + Math.sin(a2) * r;

    if (i === 0) {
      d += `M ${x1} ${y1}`;
    }
    d += ` A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  }

  return d;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SymbioteOverlay({ direction, origin, onComplete }: SymbioteOverlayProps) {
  const [phase, setPhase] = useState<"animate" | "done">("animate");

  // Use full visual viewport — clientWidth/Height excludes scrollbar
  const vw = typeof document !== "undefined" ? document.documentElement.clientWidth : 1280;
  const vh = typeof document !== "undefined" ? document.documentElement.clientHeight : 800;

  const config = DIRECTION_CONFIG[direction];

  const paths = useMemo(() => {
    if (direction === "to-venom") {
      // Symbiote tendrils — thick organic curves from edges
      const count = 12;
      return Array.from({ length: count }, (_, i) => ({
        d: generateTendrilPath(i, count, vw, vh),
        delay: i * 30,
        width: 2 + Math.random() * 4,
      }));
    } else if (direction === "to-miles") {
      // Lightning bolts — sharp zigzag from edges
      const count = 14;
      return Array.from({ length: count }, (_, i) => ({
        d: generateLightningPath(i, count, vw, vh),
        delay: i * 18,
        width: 1 + Math.random() * 2.5,
      }));
    } else {
      // Web — radial strands from click origin + concentric rings
      const strandCount = 12;
      const ringCount = 3;
      const strands = Array.from({ length: strandCount }, (_, i) => ({
        d: generateWebPath(i, strandCount, origin.x, origin.y, vw, vh),
        delay: i * 15,
        width: 1 + Math.random() * 1.5,
      }));
      const rings = Array.from({ length: ringCount }, (_, i) => ({
        d: generateWebRing(i, ringCount, strandCount, origin.x, origin.y, vw, vh),
        delay: 100 + i * 60, // rings appear after strands start
        width: 0.8 + Math.random() * 0.8,
      }));
      return [...strands, ...rings];
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, config.totalDuration);
    return () => clearTimeout(timer);
  }, [direction, onComplete, config.totalDuration]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      {/* Flash overlay at peak */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: config.flashBg,
          animation: `symbiote-flash ${config.totalDuration}ms ease-out forwards`,
        }}
      />

      {/* SVG paths — overflow visible so strands bleed past edges */}
      <svg
        className="absolute inset-0 w-full h-full overflow-visible"
        viewBox={`0 0 ${vw} ${vh}`}
        preserveAspectRatio="none"
      >
        {paths.map((p, i) => {
          const pathLength = 1200;
          return (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={config.stroke}
              strokeWidth={p.width}
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{
                animation: `tendril-draw ${config.pathDuration}ms ease-out ${p.delay}ms forwards`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
