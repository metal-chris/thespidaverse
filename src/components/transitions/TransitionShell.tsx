"use client";

import { useEffect, useState, useCallback } from "react";
import { WebSpinner } from "@/components/ui/WebSpinner";

export type TransitionPhase = "animate" | "hold" | "fade" | "done";

interface TransitionShellProps {
  origin: { x: number; y: number };
  quick?: boolean;
  wipeColor: string;
  spinnerColor: string;
  totalDuration?: number;
  onComplete: () => void;
  /** Render the character-specific effect during the animate phase */
  children: (props: { phase: TransitionPhase; vw: number; vh: number }) => React.ReactNode;
}

/**
 * Shared transition shell — owns the phase lifecycle, circle-wipe portal, and spinner.
 * Individual effects (lightning, web, tendrils) plug in via the children render prop.
 */
export function TransitionShell({
  origin,
  quick = false,
  wipeColor,
  spinnerColor,
  totalDuration = 4000,
  onComplete,
  children,
}: TransitionShellProps) {
  const [phase, setPhase] = useState<TransitionPhase>(quick ? "hold" : "animate");

  const vw = typeof document !== "undefined" ? document.documentElement.clientWidth : 1280;
  const vh = typeof document !== "undefined" ? document.documentElement.clientHeight : 800;

  useEffect(() => {
    if (quick) {
      const fadeTimer = setTimeout(() => setPhase("fade"), 600);
      const doneTimer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 1000);
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(doneTimer);
      };
    }

    const holdTimer = setTimeout(() => setPhase("hold"), 3000);
    const fadeTimer = setTimeout(() => setPhase("fade"), 3600);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, totalDuration);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, totalDuration, quick]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" aria-hidden="true">
      {/* Character-specific effect layer */}
      {children({ phase, vw, vh })}

      {/* Circle-wipe portal — expands from click origin */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: wipeColor,
          clipPath:
            phase === "hold" || phase === "fade" || quick
              ? `circle(150% at ${origin.x}px ${origin.y}px)`
              : `circle(0% at ${origin.x}px ${origin.y}px)`,
          opacity: phase === "fade" ? 0 : 1,
          transition:
            phase === "animate" && !quick
              ? "clip-path 3s cubic-bezier(0.4, 0, 0.2, 1)"
              : phase === "fade"
                ? "opacity 0.4s ease-out"
                : "none",
        }}
      />

      {/* WebSpinner — visible during hold/fade */}
      {(phase === "hold" || phase === "fade") && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: phase === "fade" ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            color: spinnerColor,
          }}
        >
          <WebSpinner size="lg" />
        </div>
      )}
    </div>
  );
}
