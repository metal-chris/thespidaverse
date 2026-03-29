"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * WebRating — Spider-web shaped rating visualization.
 *
 * Variants:
 * - `compact`  — Small web only, no score text (32px default)
 * - `badge`    — Glassmorphism pill with compact web + score number (for cards)
 * - `inline`   — Tiny web + score, for list rows
 * - `full`     — Large animated web with centered score (article detail)
 *
 * The unfilled portion of the web is always visible as a subtle tinted
 * background so users can gauge the rating at a glance.
 */

type WebRatingVariant = "full" | "compact" | "badge" | "inline";

interface WebRatingProps {
  score: number; // 0–100
  variant?: WebRatingVariant;
  className?: string;
}

const RINGS = 5;
const SPOKES = 8;
const CENTER = 50;

/** SVG path for a web ring at a given radius. */
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

/** SVG path for the filled portion of the web at a given score (0-100). */
function filledWebPath(score: number): string {
  const finalRadius = (score / 100) * 40;
  return ringPath(Math.max(finalRadius, 0.5));
}

/* ── Size presets ── */
const SIZE_MAP: Record<WebRatingVariant, string> = {
  compact: "w-8 h-8",
  badge: "w-7 h-7",
  inline: "w-6 h-6",
  full: "w-32 h-32 md:w-40 md:h-40",
};

export function WebRating({ score, variant = "full", className }: WebRatingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isAnimated = variant === "full";
  const [visible, setVisible] = useState(!isAnimated);
  const [animProgress, setAnimProgress] = useState(isAnimated ? 0 : 1);
  const [bursting, setBursting] = useState(false);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Intersection Observer for scroll-into-view animation (full variant only)
  useEffect(() => {
    if (!isAnimated) return;
    const el = ref.current;
    if (!el) return;

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
  }, [isAnimated]);

  // Animate fill when visible
  useEffect(() => {
    if (!visible || !isAnimated) return;
    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);

      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (clampedScore === 100) {
        setBursting(true);
        setTimeout(() => setBursting(false), 600);
      }
    }
    requestAnimationFrame(tick);
  }, [visible, isAnimated, clampedScore]);

  const displayScore = Math.round(clampedScore * animProgress);
  const fillScore = clampedScore * animProgress;
  const isCompact = variant === "compact" || variant === "badge" || variant === "inline";
  const strokeW = isCompact ? 0.8 : 0.5;
  const fillStrokeW = isCompact ? 1.2 : 0.8;

  /* ── The SVG web ── */
  const webSvg = (
    <svg
      viewBox="0 0 100 100"
      className={cn(
        "w-full h-full transition-transform",
        bursting && "animate-web-burst"
      )}
    >
      {/* Unfilled web background — always visible for contrast */}
      <path
        d={ringPath(40)}
        fill="var(--color-border)"
        fillOpacity={0.08}
      />

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
            strokeWidth={strokeW}
          />
        );
      })}

      {/* Concentric rings (background structure) */}
      {Array.from({ length: RINGS }).map((_, i) => {
        const radius = ((i + 1) / RINGS) * 40;
        return (
          <path
            key={`ring-${i}`}
            d={ringPath(radius)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeW}
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
          strokeWidth={fillStrokeW}
        />
      )}

      {/* Spoke intersection dots — lit when filled past that ring */}
      {!isCompact && Array.from({ length: RINGS }).map((_, ringIdx) => {
        const ringRadius = ((ringIdx + 1) / RINGS) * 40;
        const fillRadius = (fillScore / 100) * 40;
        const isFilled = fillRadius >= ringRadius - 0.5;

        return Array.from({ length: SPOKES }).map((_, spokeIdx) => {
          const angle = (Math.PI * 2 * spokeIdx) / SPOKES - Math.PI / 2;
          const cx = CENTER + Math.cos(angle) * ringRadius;
          const cy = CENTER + Math.sin(angle) * ringRadius;

          return (
            <circle
              key={`dot-${ringIdx}-${spokeIdx}`}
              cx={cx}
              cy={cy}
              r={isFilled ? 1.2 : 0.6}
              fill={isFilled ? "var(--color-accent)" : "var(--color-border)"}
              fillOpacity={isFilled ? 0.8 : 0.3}
            />
          );
        });
      })}

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
  );

  /* ── Variant renderers ── */

  // Badge: glassmorphism pill with web + score
  if (variant === "badge") {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg",
          "bg-card/80 backdrop-blur-sm shadow-sm border border-border/50",
          className
        )}
        role="img"
        aria-label={`Rating: ${clampedScore} out of 100`}
      >
        <div className={SIZE_MAP.badge}>{webSvg}</div>
        <span className="text-xs font-bold text-accent tabular-nums">{displayScore}</span>
      </div>
    );
  }

  // Inline: tiny web + score for list rows
  if (variant === "inline") {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1", className)}
        role="img"
        aria-label={`Rating: ${clampedScore} out of 100`}
      >
        <span className={SIZE_MAP.inline}>{webSvg}</span>
        <span className="text-xs font-bold text-accent tabular-nums">{displayScore}</span>
      </span>
    );
  }

  // Compact: small web only, no score text
  if (variant === "compact") {
    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", SIZE_MAP.compact, className)}
        role="img"
        aria-label={`Rating: ${clampedScore} out of 100`}
      >
        {webSvg}
      </div>
    );
  }

  // Full: large animated web with centered score
  return (
    <div
      ref={ref}
      className={cn("relative inline-flex items-center justify-center", SIZE_MAP.full, className)}
      role="img"
      aria-label={`Rating: ${clampedScore} out of 100`}
    >
      {webSvg}
      <span className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl font-bold text-accent tabular-nums">
        {displayScore}
      </span>
    </div>
  );
}
