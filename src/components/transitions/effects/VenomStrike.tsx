"use client";

import { useMemo } from "react";
import { perimeterPoint } from "./utils";

const STROKE_DURATION = 2500;
const PATH_LENGTH = 1200;

interface BoltPath {
  d: string;
  width: number;
  delay: number;
  glow?: boolean;
}

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
  if (depth >= maxDepth) return `L ${x2} ${y2}`;

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

    const midpoints: { x: number; y: number; dx: number; dy: number; t: number }[] = [];
    const mainD = `M ${sx} ${sy}` + fractalBolt(sx, sy, cx, cy, 0, 5, 0.35, midpoints);
    const delay = i * 120;
    const width = 1.5 + Math.random() * 1;

    // Glow layer behind
    paths.push({ d: mainD, width: width + 4, delay, glow: true });
    // Core bolt
    paths.push({ d: mainD, width, delay });

    // 1-2 fork branches from real midpoints
    const forkCount = 1 + Math.floor(Math.random() * 2);
    const usable = midpoints.filter((_, idx) => idx > 0);
    for (let f = 0; f < forkCount && usable.length > 0; f++) {
      const mp = usable.splice(Math.floor(Math.random() * usable.length), 1)[0];
      const mainAngle = Math.atan2(mp.dy, mp.dx);
      const forkAngle = mainAngle + (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.8);
      const forkLen = 80 + Math.random() * 120;
      const fex = mp.x + Math.cos(forkAngle) * forkLen;
      const fey = mp.y + Math.sin(forkAngle) * forkLen;
      const forkD = `M ${mp.x} ${mp.y}` + fractalBolt(mp.x, mp.y, fex, fey, 0, 3, 0.3);

      const forkDelay = delay + Math.round(mp.t * STROKE_DURATION);
      paths.push({ d: forkD, width: width * 0.6, delay: forkDelay, glow: true });
      paths.push({ d: forkD, width: width * 0.4, delay: forkDelay });
    }
  }

  return paths;
}

interface VenomStrikeProps {
  vw: number;
  vh: number;
  strokeColor?: string;
}

/** Miles — Venom Strike bioelectric bolts from edges toward center */
export function VenomStrike({ vw, vh, strokeColor = "#FFD700" }: VenomStrikeProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bolts = useMemo(() => generateLightning(vw, vh), [vw, vh]);

  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-visible"
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      {bolts.map((bolt, i) => (
        <path
          key={i}
          d={bolt.d}
          fill="none"
          stroke={bolt.glow ? "rgba(255,215,0,0.3)" : strokeColor}
          strokeWidth={bolt.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={PATH_LENGTH}
          strokeDashoffset={PATH_LENGTH}
          style={{
            animation: `tendril-draw ${STROKE_DURATION}ms ease-out ${bolt.delay}ms forwards`,
          }}
        />
      ))}
    </svg>
  );
}
