"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { SpiderWebCanvas } from "@/components/coming-soon/NeuralNetworkCanvas";
import type { Palette } from "@/components/coming-soon/particle-config";

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

interface CommunityStats {
  avgScore: number;
  totalRatings: number;
}

interface WebRatingProps {
  score: number; // 0–100
  variant?: WebRatingVariant;
  className?: string;
  /** Community rating stats — shown as teaser line in full variant only */
  communityStats?: CommunityStats | null;
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

export function WebRating({ score, variant = "full", className, communityStats }: WebRatingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isAnimated = variant === "full";
  const isFull = variant === "full";
  const [visible, setVisible] = useState(!isAnimated);
  const [animProgress, setAnimProgress] = useState(isAnimated ? 0 : 1);
  const [bursting, setBursting] = useState(false);
  const [doneAnimating, setDoneAnimating] = useState(!isAnimated);
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Canvas strike trigger (full variant only)
  const strikeTriggerRef = useRef<((x: number, y: number) => void) | null>(null);
  const cardRectRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const handleRendererReady = useCallback((trigger: (x: number, y: number) => void) => {
    strikeTriggerRef.current = trigger;
  }, []);

  // Cache card dimensions for strike calculations
  useEffect(() => {
    if (!isFull || !ref.current) return;
    const update = () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) cardRectRef.current = { w: rect.width, h: rect.height };
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isFull]);

  // Intersection observer for scroll-in visibility
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

  // Score fill animation + #1 Score Reveal Strike + #6 100% Burst Mode
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

        // #1: Score Reveal Strike — radial bursts scaled by score
        const trigger = strikeTriggerRef.current;
        const { w, h } = cardRectRef.current;
        if (trigger && w > 0) {
          const cx = w / 2;
          const cy = h / 2;
          const r = Math.min(w, h) * 0.2;

          if (clampedScore === 100) {
            // Perfect score sequence:
            // 4 mini 4-strike bursts → 1 full 8-strike radial burst → sustain
            setBursting(true);
            setTimeout(() => setBursting(false), 600);

            // 4 mini bursts (random rotation each)
            for (let w = 0; w < 4; w++) {
              setTimeout(() => {
                const offset = (w / 4) * Math.PI * 0.5; // stagger rotation
                for (let i = 0; i < 4; i++) {
                  const angle = offset + (i / 4) * Math.PI * 2;
                  trigger(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
                }
              }, w * 600);
            }

            // Final full radial burst after the 4 minis + SVG burst rays encore
            setTimeout(() => {
              setBursting(true);
              setTimeout(() => setBursting(false), 600);
              for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                trigger(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
              }
            }, 4 * 600);

          } else {
            // Non-100 scores: omni-directional shockwave rings
            let waves: number;
            if (clampedScore >= 80) {
              waves = 3;
            } else if (clampedScore >= 50) {
              waves = 2;
            } else {
              waves = 1;
            }

            for (let w = 0; w < waves; w++) {
              setTimeout(() => {
                for (let i = 0; i < 8; i++) {
                  const angle = (i / 8) * Math.PI * 2;
                  trigger(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
                }
              }, w * 600);
            }
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }, [visible, isAnimated, clampedScore]);

  // #6 continued: 100% scores get periodic mini-bursts (web stays alive)
  const sustainIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!doneAnimating || clampedScore !== 100) return;
    const trigger = strikeTriggerRef.current;
    const { w, h } = cardRectRef.current;
    if (!trigger || w === 0) return;

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.25;

    // Wait for the initial sequence to finish (4×600 + 600 = 3s) before sustaining
    const delay = setTimeout(() => {
      sustainIntervalRef.current = setInterval(() => {
        // 4-strike mini-burst at random rotation
        const offset = Math.random() * Math.PI * 2;
        for (let i = 0; i < 4; i++) {
          const angle = offset + (i / 4) * Math.PI * 2;
          trigger(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
      }, 3000);
    }, 3500);

    return () => {
      clearTimeout(delay);
      if (sustainIntervalRef.current) clearInterval(sustainIntervalRef.current);
    };
  }, [doneAnimating, clampedScore]);

  // #5: Scroll Parallax Breathing
  const [scrollScale, setScrollScale] = useState(1);
  useEffect(() => {
    if (!isFull) return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight;
      // How centered is the card in the viewport? 0 = centered, 1 = at edge
      const center = rect.top + rect.height / 2;
      const offset = Math.abs(center - viewH / 2) / (viewH / 2);
      // Scale: 1.06 when centered, 1.0 when at edges
      const s = 1 + 0.06 * Math.max(0, 1 - offset);
      setScrollScale(s);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFull]);

  const displayScore = Math.round(clampedScore * animProgress);
  const fillScore = clampedScore * animProgress;
  const isCompact = variant !== "full";

  const structureColor = isFull ? "rgba(255,255,255,0.2)" : "var(--color-muted-foreground)";
  const structureOpacity = 1;
  const strokeW = isCompact ? 0.8 : 0.6;
  const fillStrokeW = isCompact ? 1.2 : 1;
  const fillOpacity = isFull ? 0.35 : 0.25;

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
          "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
          "bg-black/75 backdrop-blur-md shadow-lg shadow-black/30",
          "border border-white/10",
          className
        )}
        role="img"
        aria-label={`Rating: ${clampedScore} out of 100`}
      >
        <div className={SIZE_MAP.badge}>{webSvg}</div>
        <span className="text-xs font-bold text-white tabular-nums">{displayScore}</span>
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

  /* ── Full: centered composition with SpiderWebCanvas background ── */

  // #4: Theme detection + transition strike
  const [palette, setPalette] = useState<Palette>("miles");
  const prevPaletteRef = useRef<Palette>("miles");
  const reducedMotion = useRef(false);

  // Sync palette with data-theme attribute
  useEffect(() => {
    const readTheme = (): Palette => {
      const t = document.documentElement.getAttribute("data-theme");
      return t === "peter" || t === "venom" ? t : "miles";
    };

    setPalette(readTheme());

    const observer = new MutationObserver(() => {
      setPalette(readTheme());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return () => observer.disconnect();
  }, []);



  return (
    <div
      ref={ref}
      className={cn("web-rating-full", className)}
      role="img"
      aria-label={`Rating: ${clampedScore} out of 100`}
    >
      {/* SpiderWebCanvas — animated background */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <SpiderWebCanvas
          reducedMotion={reducedMotion.current}
          palette={palette}
          onRendererReady={handleRendererReady}
        />
      </div>

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Top label */}
      <div className="absolute top-4 left-0 right-0 z-10 text-center px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Web Rating
        </p>
        <p className="text-sm md:text-base font-bold text-foreground/80 mt-0.5">
          {ratingLabel(displayScore)}
        </p>
      </div>

      {/* Web SVG — true center, #5 scroll breathing */}
      <div
        className={cn("relative z-10 transition-transform duration-300 ease-out", SIZE_MAP.full)}
        style={{ transform: `scale(${scrollScale})` }}
      >
        {webSvg}
        <span className="absolute inset-0 flex items-center justify-center text-2xl md:text-3xl font-black tabular-nums drop-shadow-sm web-rating-score-number">
          {displayScore}
        </span>
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-5 left-0 right-0 z-10 text-center px-4">
        {communityStats !== undefined && (
          communityStats && communityStats.totalRatings > 0 ? (
            <a
              href="#engagement"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30 hover:bg-accent/25 transition-colors"
            >
              The Web:{" "}
              <span className="tabular-nums">{communityStats.avgScore}</span>
              <span className="text-muted-foreground/60">
                ({communityStats.totalRatings})
              </span>
            </a>
          ) : (
            <a
              href="#engagement"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-foreground/70 border border-white/15 hover:bg-white/15 hover:text-foreground transition-colors"
            >
              Be the first to rate
              <span aria-hidden="true">↓</span>
            </a>
          )
        )}
      </div>
    </div>
  );
}
