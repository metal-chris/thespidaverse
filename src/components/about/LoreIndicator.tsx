"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface LoreIndicatorProps {
  /** The lore text shown in the tooltip */
  lore: string;
  /** Optional: who/what the lore is attributed to */
  attribution?: string;
  /** Visual style of the indicator dot */
  variant?: "pulse" | "static" | "glitch";
  className?: string;
}

/**
 * A small glowing indicator icon that reveals in-universe "lore" on hover/tap.
 * Uses a portal so the tooltip escapes overflow-hidden containers.
 * All markup is span-based so it can live inside <p> tags without hydration errors.
 */
export function LoreIndicator({
  lore,
  attribution,
  variant = "pulse",
  className,
}: LoreIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; direction: "above" | "below" } | null>(null);
  const ref = useRef<HTMLButtonElement>(null);

  // Only render portal after mount to avoid SSR/hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const direction = spaceBelow < 180 ? "above" : "below";
    // Clamp left so tooltip stays within viewport (16px padding each side)
    const tooltipWidth = Math.min(288, window.innerWidth - 32); // w-72 = 288px
    const centerX = rect.left + rect.width / 2;
    const halfWidth = tooltipWidth / 2;
    const clampedLeft = Math.max(halfWidth + 16, Math.min(centerX, window.innerWidth - halfWidth - 16));
    setCoords({
      top: direction === "above" ? rect.top : rect.bottom,
      left: clampedLeft,
      direction,
    });
  }, []);

  const open = useCallback(() => {
    updatePosition();
    setIsOpen(true);
  }, [updatePosition]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        ref={ref}
        type="button"
        aria-label="View lore entry"
        className={cn(
          "relative w-3.5 h-3.5 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "transition-all duration-200"
        )}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={() => (isOpen ? close() : open())}
      >
        {/* Three rotating arcs — thematic spider-web motif */}
        <svg
          viewBox="0 0 14 14"
          className="absolute inset-0 w-full h-full animate-spin text-accent"
          style={{ animationDuration: "4s" }}
        >
          {[0, 120, 240].map((angle) => {
            const r = 6;
            const cx = 7;
            const cy = 7;
            const gap = 20;
            const span = 120 - gap;
            const a1 = ((angle + gap / 2 - 90) * Math.PI) / 180;
            const a2 = ((angle + gap / 2 + span - 90) * Math.PI) / 180;
            return (
              <path
                key={angle}
                d={`M ${(cx + Math.cos(a1) * r).toFixed(2)} ${(cy + Math.sin(a1) * r).toFixed(2)} A ${r} ${r} 0 0 1 ${(cx + Math.cos(a2) * r).toFixed(2)} ${(cy + Math.sin(a2) * r).toFixed(2)}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.5}
              />
            );
          })}
        </svg>
        {/* Inner dot */}
        <span className="absolute inset-[3px] rounded-full bg-accent/80" />
        {/* Center pip */}
        <span className="absolute inset-[4.5px] rounded-full bg-accent" />
      </button>

      {/* Portal tooltip — escapes overflow-hidden ancestors. All spans to be p-safe. */}
      {mounted &&
        createPortal(
          <span
            className={cn(
              "fixed z-[9999] w-64 sm:w-72 block transition-all duration-200 pointer-events-none",
              isOpen ? "opacity-100" : "opacity-0",
              isOpen
                ? "translate-y-0"
                : coords?.direction === "above"
                  ? "translate-y-1"
                  : "-translate-y-1"
            )}
            style={
              coords
                ? {
                    top: coords.direction === "above" ? undefined : coords.top + 8,
                    bottom: coords.direction === "above" ? `calc(100vh - ${coords.top}px + 8px)` : undefined,
                    left: coords.left,
                    transform: `translateX(-50%)${isOpen ? "" : coords.direction === "above" ? " translateY(4px)" : " translateY(-4px)"}`,
                  }
                : { top: -9999, left: -9999 }
            }
            role="tooltip"
          >
            <span className="relative block rounded-lg border border-accent/30 bg-card/80 backdrop-blur-md shadow-lg shadow-accent/10 p-3">
              {/* Corner brackets for that dossier feel */}
              <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-accent/40 block" />
              <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-accent/40 block" />
              <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-accent/40 block" />
              <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-accent/40 block" />

              <span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-accent/60 mb-1.5">
                Classified Lore Entry
              </span>
              <span className="block text-xs text-foreground/90 leading-relaxed">
                {lore}
              </span>
              {attribution && (
                <span className="block text-[10px] text-muted-foreground/60 mt-2 italic text-right">
                  &mdash; {attribution}
                </span>
              )}
            </span>
          </span>,
          document.body
        )}
    </span>
  );
}
