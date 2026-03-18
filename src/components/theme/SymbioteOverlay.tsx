"use client";

import { useEffect, useState, useMemo } from "react";

interface SymbioteOverlayProps {
  direction: "to-venom" | "to-miles";
  origin: { x: number; y: number };
  onComplete: () => void;
}

/** Generate a random tendril SVG path from an edge toward center */
function generateTendrilPath(
  index: number,
  total: number,
  vw: number,
  vh: number
): string {
  const edge = index % 4; // top, right, bottom, left
  const spread = (index / total) * 0.8 + 0.1; // 10-90% along each edge

  let startX: number, startY: number;
  switch (edge) {
    case 0: startX = vw * spread; startY = 0; break; // top
    case 1: startX = vw; startY = vh * spread; break; // right
    case 2: startX = vw * (1 - spread); startY = vh; break; // bottom
    default: startX = 0; startY = vh * (1 - spread); break; // left
  }

  const endX = vw / 2 + (Math.random() - 0.5) * vw * 0.3;
  const endY = vh / 2 + (Math.random() - 0.5) * vh * 0.3;

  // Organic bezier control points with randomization
  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 120;
  const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 120;
  const cp1x = startX + (midX - startX) * 0.4 + (Math.random() - 0.5) * 60;
  const cp1y = startY + (midY - startY) * 0.6 + (Math.random() - 0.5) * 60;
  const cp2x = midX + (endX - midX) * 0.6 + (Math.random() - 0.5) * 60;
  const cp2y = midY + (endY - midY) * 0.4 + (Math.random() - 0.5) * 60;

  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

/** Generate crack paths radiating from an origin point */
function generateCrackPath(
  index: number,
  total: number,
  originX: number,
  originY: number,
  vw: number,
  vh: number
): string {
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
  const length = Math.max(vw, vh) * (0.5 + Math.random() * 0.5);

  const endX = originX + Math.cos(angle) * length;
  const endY = originY + Math.sin(angle) * length;

  // Jagged path with multiple segments
  const mid1x = originX + (endX - originX) * 0.3 + (Math.random() - 0.5) * 40;
  const mid1y = originY + (endY - originY) * 0.3 + (Math.random() - 0.5) * 40;
  const mid2x = originX + (endX - originX) * 0.6 + (Math.random() - 0.5) * 60;
  const mid2y = originY + (endY - originY) * 0.6 + (Math.random() - 0.5) * 60;

  return `M ${originX} ${originY} L ${mid1x} ${mid1y} L ${mid2x} ${mid2y} L ${endX} ${endY}`;
}

export function SymbioteOverlay({ direction, origin, onComplete }: SymbioteOverlayProps) {
  const [phase, setPhase] = useState<"animate" | "done">("animate");

  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const paths = useMemo(() => {
    const count = 12;
    if (direction === "to-venom") {
      return Array.from({ length: count }, (_, i) => ({
        d: generateTendrilPath(i, count, vw, vh),
        delay: i * 30,
        width: 2 + Math.random() * 4,
      }));
    } else {
      return Array.from({ length: count }, (_, i) => ({
        d: generateCrackPath(i, count, origin.x, origin.y, vw, vh),
        delay: i * 20,
        width: 1 + Math.random() * 2.5,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction]);

  useEffect(() => {
    const duration = direction === "to-venom" ? 650 : 550;
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [direction, onComplete]);

  if (phase === "done") return null;

  const isToVenom = direction === "to-venom";

  return (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    >
      {/* Flash overlay at peak */}
      <div
        className={`absolute inset-0 ${isToVenom ? "bg-[#0A0A0A]" : "bg-[#FAFAFA]"}`}
        style={{
          animation: `symbiote-flash ${isToVenom ? "650ms" : "550ms"} ease-out forwards`,
        }}
      />

      {/* SVG tendril/crack paths */}
      <svg
        className="absolute inset-0 w-full h-full"
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
              stroke={isToVenom ? "#0A0A0A" : "#E82334"}
              strokeWidth={p.width}
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              style={{
                animation: `tendril-draw ${isToVenom ? "500ms" : "400ms"} ease-out ${p.delay}ms forwards`,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
