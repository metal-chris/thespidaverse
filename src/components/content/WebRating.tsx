"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface WebRatingProps {
  score: number; // 0–100
  variant?: "full" | "compact";
  className?: string;
}

const RINGS = 5;
const SPOKES = 8;
const CENTER = 50;

/**
 * Generates SVG path data for a spider web ring at a given radius.
 * Connects points along each spoke at the same radial distance.
 */
function ringPath(radius: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i < SPOKES; i++) {
    const angle = (Math.PI * 2 * i) / SPOKES - Math.PI / 2;
    points.push([
      CENTER + Math.cos(angle) * radius,
      CENTER + Math.sin(angle) * radius,
    ]);
  }
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
}

/**
 * Generates the filled web path — same shape as rings but scaled to score%.
 */
function filledWebPath(score: number): string {
  const paths: string[] = [];
  const fillRings = Math.ceil((score / 100) * RINGS);
  for (let r = 1; r <= fillRings; r++) {
    const maxRadius = (r / RINGS) * 40;
    // For the outermost filled ring, scale by remaining fraction
    const fraction = r === fillRings ? ((score / 100) * RINGS - (r - 1)) : 1;
    const radius = r === 1 ? maxRadius * fraction : maxRadius;
    // Only add the outermost ring polygon (fill up to that level)
    if (r === fillRings) {
      const innerRadius = r > 1 ? ((r - 1) / RINGS) * 40 : 0;
      const actualRadius = innerRadius + (maxRadius - innerRadius) * fraction;
      paths.push(ringPath(actualRadius));
    }
  }
  // Just return the outermost filled ring — the fill is a solid polygon
  const finalRadius = (score / 100) * 40;
  return ringPath(Math.max(finalRadius, 0.5));
}

export function WebRating({ score, variant = "full", className }: WebRatingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(variant === "compact");
  const [animProgress, setAnimProgress] = useState(variant === "compact" ? 1 : 0);
  const [bursting, setBursting] = useState(false);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Intersection Observer for scroll-into-view animation (full variant only)
  useEffect(() => {
    if (variant === "compact") return;
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      setAnimProgress(1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  // Animate fill when visible
  useEffect(() => {
    if (!visible || variant === "compact") return;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (clampedScore === 100) {
        // Trigger burst
        setBursting(true);
        setTimeout(() => setBursting(false), 600);
      }
    }
    requestAnimationFrame(tick);
  }, [visible, variant, clampedScore]);

  const displayScore = Math.round(clampedScore * animProgress);
  const fillScore = clampedScore * animProgress;

  const isCompact = variant === "compact";
  const size = isCompact ? "w-10 h-10" : "w-32 h-32 md:w-40 md:h-40";

  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", size, className)}
      role="img"
      aria-label={`Rating: ${clampedScore} out of 100`}
    >
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-full h-full transition-transform",
          bursting && "animate-web-burst"
        )}
      >
        {/* Spokes */}
        {Array.from({ length: SPOKES }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / SPOKES - Math.PI / 2;
          const x2 = CENTER + Math.cos(angle) * 40;
          const y2 = CENTER + Math.sin(angle) * 40;
          return (
            <line
              key={`spoke-${i}`}
              x1={CENTER}
              y1={CENTER}
              x2={x2}
              y2={y2}
              stroke="var(--color-border)"
              strokeWidth={isCompact ? 0.8 : 0.5}
            />
          );
        })}

        {/* Concentric rings (background) */}
        {Array.from({ length: RINGS }).map((_, i) => {
          const radius = ((i + 1) / RINGS) * 40;
          return (
            <path
              key={`ring-${i}`}
              d={ringPath(radius)}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={isCompact ? 0.8 : 0.5}
            />
          );
        })}

        {/* Filled web (accent color) */}
        {fillScore > 0 && (
          <path
            d={filledWebPath(fillScore)}
            fill="var(--color-accent)"
            fillOpacity={0.25}
            stroke="var(--color-accent)"
            strokeWidth={isCompact ? 1.2 : 0.8}
          />
        )}

        {/* Burst rays at 100% */}
        {bursting &&
          Array.from({ length: SPOKES }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / SPOKES - Math.PI / 2;
            const x1 = CENTER + Math.cos(angle) * 40;
            const y1 = CENTER + Math.sin(angle) * 40;
            const x2 = CENTER + Math.cos(angle) * 55;
            const y2 = CENTER + Math.sin(angle) * 55;
            return (
              <line
                key={`burst-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--color-accent)"
                strokeWidth={1.5}
                strokeLinecap="round"
                className="animate-burst-ray"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            );
          })}
      </svg>

      {/* Score text */}
      {!isCompact && (
        <span className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl font-bold text-accent tabular-nums">
          {displayScore}
        </span>
      )}
    </div>
  );
}
