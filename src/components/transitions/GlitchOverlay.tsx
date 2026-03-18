"use client";

import { useEffect, useState } from "react";

interface GlitchOverlayProps {
  onComplete: () => void;
}

export function GlitchOverlay({ onComplete }: GlitchOverlayProps) {
  const [phase, setPhase] = useState<"active" | "done">("active");

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const duration = prefersReducedMotion ? 150 : 250;
    const timer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (phase === "done") return null;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Simple crossfade for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className="fixed inset-0 z-[9998] pointer-events-none bg-background"
        style={{ animation: "glitch-fade 150ms ease-out forwards" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9998] pointer-events-none"
      aria-hidden="true"
    >
      {/* Chromatic aberration layer — red channel offset */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          animation: "chromatic-shift 250ms ease-out forwards",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(232,35,52,0.08) 3px, rgba(232,35,52,0.08) 4px)",
        }}
      />

      {/* Chromatic aberration layer — cyan channel offset */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          animation: "chromatic-shift-reverse 250ms ease-out forwards",
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(0,200,255,0.06) 5px, rgba(0,200,255,0.06) 6px)",
        }}
      />

      {/* Screen tear strips */}
      {[15, 30, 45, 60, 75].map((top, i) => (
        <div
          key={i}
          className="absolute left-0 right-0 bg-foreground/5"
          style={{
            top: `${top + Math.random() * 5}%`,
            height: `${2 + Math.random() * 3}px`,
            animation: `glitch-tear 250ms ease-out ${i * 20}ms forwards`,
            clipPath: `inset(0 ${Math.random() * 10}% 0 ${Math.random() * 10}%)`,
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          animation: "glitch-noise 250ms steps(4) forwards",
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "150px 150px",
        }}
      />
    </div>
  );
}
