"use client";

import { useMemo } from "react";
import { perimeterPoint, quadBezier, quadBezierTangent } from "./utils";

const STROKE_DURATION = 2500;

interface TendrilPath {
  d: string;
  delay: number;
  startX: number;
  startY: number;
}

function generateTendrils(vw: number, vh: number): TendrilPath[] {
  const tendrilCount = 16;
  const paths: TendrilPath[] = [];
  const samples = 20;

  for (let i = 0; i < tendrilCount; i++) {
    const [sx, sy] = perimeterPoint(i, tendrilCount, vw, vh);

    const angle = (i / tendrilCount) * Math.PI * 2;
    const scatter = 50 + Math.random() * 70;
    const ex = vw / 2 + Math.cos(angle) * scatter;
    const ey = vh / 2 + Math.sin(angle) * scatter;

    // Quadratic bezier control point
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const sign = i % 2 === 0 ? 1 : -1;
    const curve = 30 + Math.random() * 50;
    const cpX = midX + perpX * curve * sign;
    const cpY = midY + perpY * curve * sign;

    const baseWidth = 10 + Math.random() * 6;

    // Sample points along centerline, build left and right edges
    const left: [number, number][] = [];
    const right: [number, number][] = [];

    for (let s = 0; s <= samples; s++) {
      const t = s / samples;
      const [px, py] = quadBezier(t, sx, sy, cpX, cpY, ex, ey);
      const [tx, ty] = quadBezierTangent(t, sx, sy, cpX, cpY, ex, ey);

      const nx = -ty;
      const ny = tx;

      // Width tapers: full at base (t=0), pointed at tip (t=1)
      const halfW = baseWidth * Math.pow(1 - t, 2);

      left.push([px + nx * halfW, py + ny * halfW]);
      right.push([px - nx * halfW, py - ny * halfW]);
    }

    // Build closed shape: left edge forward, right edge backward
    let d = `M ${left[0][0]} ${left[0][1]}`;
    for (let s = 1; s < left.length; s++) {
      d += ` L ${left[s][0]} ${left[s][1]}`;
    }
    d += ` L ${ex} ${ey}`;
    for (let s = right.length - 1; s >= 0; s--) {
      d += ` L ${right[s][0]} ${right[s][1]}`;
    }
    d += " Z";

    paths.push({ d, delay: i * 150, startX: sx, startY: sy });
  }

  return paths;
}

interface VenomProps {
  vw: number;
  vh: number;
  fillColor?: string;
}

/** Venom — Slow creeping symbiote tendrils growing from edges toward center */
export function Venom({ vw, vh, fillColor = "#0A0A0A" }: VenomProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tendrils = useMemo(() => generateTendrils(vw, vh), [vw, vh]);

  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-visible"
      viewBox={`0 0 ${vw} ${vh}`}
      preserveAspectRatio="none"
    >
      {tendrils.map((t, i) => (
        <path
          key={i}
          d={t.d}
          fill={fillColor}
          opacity={0}
          style={{
            transformOrigin: `${t.startX}px ${t.startY}px`,
            animation: `venom-grow ${STROKE_DURATION}ms cubic-bezier(0.2, 0, 0.3, 1) ${t.delay}ms forwards`,
          }}
        />
      ))}
    </svg>
  );
}
