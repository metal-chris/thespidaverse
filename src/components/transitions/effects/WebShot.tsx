"use client";

import { useEffect, useMemo, useState } from "react";

function generateFullWeb(vw: number, vh: number) {
  const cx = vw / 2;
  const cy = vh / 2;
  const spokeCount = 12;
  const ringCount = 5;
  const diagonal = Math.sqrt(vw * vw + vh * vh);
  const maxR = diagonal * 0.55;

  // Spoke angles — even spacing, slight jitter for organic feel
  const angles: number[] = [];
  for (let i = 0; i < spokeCount; i++) {
    angles.push((i / spokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.04);
  }

  // Ring radii — slight exponential bias (tighter near center)
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
    const sagRatio = 0.22 + ri * 0.015;
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

interface WebShotProps {
  vw: number;
  vh: number;
  strokeColor?: string;
  /** Skip the RAF reveal animation (for quick mode) */
  skipReveal?: boolean;
}

/** Peter — Spider web shot revealed via expanding circular clip-path from center outward */
export function WebShot({ vw, vh, strokeColor = "#FFFFFF", skipReveal = false }: WebShotProps) {
  const [webReveal, setWebReveal] = useState(skipReveal ? 1 : 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const webData = useMemo(() => generateFullWeb(vw, vh), [vw, vh]);

  const diagonal = Math.sqrt(vw * vw + vh * vh);

  useEffect(() => {
    if (skipReveal) return;
    let raf: number;
    const start = performance.now();
    const duration = 3000;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setWebReveal(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skipReveal]);

  return (
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
          stroke={strokeColor}
          strokeWidth={2}
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
          stroke={strokeColor}
          strokeWidth={1.5}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
    </svg>
  );
}
