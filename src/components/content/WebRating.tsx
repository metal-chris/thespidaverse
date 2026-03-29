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

function filledWebPath(score: number): string {
  const finalRadius = (score / 100) * 40;
  return ringPath(Math.max(finalRadius, 0.5));
}

function ratingLabel(score: number): string {
  if (score >= 90) return "Masterpiece";
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 60) return "Good";
  if (score >= 50) return "Decent";
  if (score >= 40) return "Below Average";
  if (score >= 25) return "Poor";
  return "Abysmal";
}

const SIZE_MAP: Record<WebRatingVariant, string> = {
  compact: "w-8 h-8",
  badge: "w-7 h-7",
  inline: "w-6 h-6",
  full: "w-36 h-36 md:w-44 md:h-44",
};

export function WebRating({ score, variant = "full", className }: WebRatingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isAnimated = variant === "full";
  const isFull = variant === "full";
  const [visible, setVisible] = useState(!isAnimated);
  const [animProgress, setAnimProgress] = useState(isAnimated ? 0 : 1);
  const [bursting, setBursting] = useState(false);
  const [doneAnimating, setDoneAnimating] = useState(!isAnimated);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  useEffect(() => {
    if (!isAnimated) return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      setAnimProgress(1);
      setDoneAnimating(true);
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
      } else {
        setDoneAnimating(true);
        if (clampedScore === 100) {
          setBursting(true);
          setTimeout(() => setBursting(false), 600);
        }
      }
    }
    requestAnimationFrame(tick);
  }, [visible, isAnimated, clampedScore]);

  const displayScore = Math.round(clampedScore * animProgress);
  const fillScore = clampedScore * animProgress;
  const isCompact = variant !== "full";

  /*
   * Contrast fix: use a neutral white/grey for web structure so it's
   * visible on ALL themes (Miles' border color #2A1015 was invisible).
   * Full variant uses higher opacity for drama.
   */
  const structureColor = isFull ? "rgba(255,255,255,0.2)" : "var(--color-muted-foreground)";
  const structureOpacity = 1;
  const strokeW = isCompact ? 0.8 : 0.6;
  const fillStrokeW = isCompact ? 1.2 : 1;
  const fillOpacity = isFull ? 0.35 : 0.25;
  const bgOpacity = isFull ? 0.04 : 0.08;

  const webSvg = (
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
            stroke={structureColor}
            strokeWidth={strokeW}
            strokeOpacity={structureOpacity}
          />
        );
      })}

      {/* Concentric rings */}
      {Array.from({ length: RINGS }).map((_, i) => {
        const radius = ((i + 1) / RINGS) * 40;
        return (
          <path
            key={`ring-${i}`}
            d={ringPath(radius)}
            fill="none"
            stroke={structureColor}
            strokeWidth={strokeW}
            strokeOpacity={structureOpacity}
          />
        );
      })}

      {/* Filled web (accent color) */}
      {fillScore > 0 && (
        <path
          d={filledWebPath(fillScore)}
          fill="var(--color-accent)"
          fillOpacity={fillOpacity}
          stroke="var(--color-accent)"
          strokeWidth={fillStrokeW}
          className={doneAnimating && isFull ? "web-rating-pulse" : ""}
        />
      )}

      {/* Spoke intersection dots — full variant only */}
      {isFull && Array.from({ length: RINGS }).map((_, ringIdx) => {
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
              r={isFilled ? 1.4 : 0.7}
              fill={isFilled ? "var(--color-accent)" : "rgba(255,255,255,0.15)"}
              fillOpacity={1}
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

  /* ── Badge ── */
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

  /* ── Inline ── */
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

  /* ── Compact ── */
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

  /* ── Full: centered composition with score-driven glow ── */
  const glowIntensity = Math.round((clampedScore / 100) * 20); // 0-20% glow

  return (
    <div
      ref={ref}
      className={cn("web-rating-full", className)}
      role="img"
      aria-label={`Rating: ${clampedScore} out of 100`}
    >
      {/* Score-driven radial glow behind the web */}
      <div
        className="web-rating-glow"
        style={{
          opacity: animProgress * 0.8,
          background: `radial-gradient(circle, color-mix(in srgb, var(--color-accent) ${glowIntensity}%, transparent) 0%, transparent 70%)`,
        }}
      />

      {/* Web SVG — centered */}
      <div className={cn("relative z-10", SIZE_MAP.full)}>
        {webSvg}
        {/* Score centered inside the web */}
        <span className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-black text-accent tabular-nums drop-shadow-sm">
          {displayScore}
        </span>
      </div>

      {/* Label below */}
      <div className="relative z-10 text-center mt-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Web Rating
        </p>
        <p className="text-sm md:text-base font-bold text-foreground/80 mt-0.5">
          {ratingLabel(displayScore)}
        </p>
      </div>
    </div>
  );
}
