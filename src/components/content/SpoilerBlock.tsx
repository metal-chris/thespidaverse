"use client";

import { useState, useRef, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

// Context for page-level "Reveal All" toggle
interface SpoilerContextValue {
  revealAll: boolean;
  toggleRevealAll: () => void;
}

const SpoilerContext = createContext<SpoilerContextValue>({
  revealAll: false,
  toggleRevealAll: () => {},
});

export function SpoilerProvider({ children }: { children: React.ReactNode }) {
  const [revealAll, setRevealAll] = useState(false);
  return (
    <SpoilerContext.Provider
      value={{
        revealAll,
        toggleRevealAll: () => setRevealAll((v) => !v),
      }}
    >
      {children}
    </SpoilerContext.Provider>
  );
}

export function RevealAllToggle() {
  const { revealAll, toggleRevealAll } = useContext(SpoilerContext);
  return (
    <button
      onClick={toggleRevealAll}
      className="text-xs font-medium px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors"
      aria-pressed={revealAll}
    >
      {revealAll ? "Hide All Spoilers" : "Reveal All Spoilers"}
    </button>
  );
}

export function useSpoilerContext() {
  return useContext(SpoilerContext);
}

interface SpoilerBlockProps {
  children: React.ReactNode;
  label?: string;
}

export function SpoilerBlock({ children, label = "Spoiler" }: SpoilerBlockProps) {
  const { revealAll } = useSpoilerContext();
  const [revealed, setRevealed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isRevealed = revealed || revealAll;

  // Sync local state when revealAll changes
  useEffect(() => {
    if (revealAll) setRevealed(true);
  }, [revealAll]);

  return (
    <div
      className={cn(
        "relative my-6 rounded-lg overflow-hidden border transition-all duration-300",
        isRevealed ? "border-border" : "border-accent/30 spoiler-sense"
      )}
      role="region"
      aria-label={`${label} — ${isRevealed ? "revealed" : "hidden"}`}
    >
      {/* Spidey-sense border indicator (CSS animation) */}
      {!isRevealed && (
        <div className="absolute inset-0 pointer-events-none spoiler-sense-waves" aria-hidden="true" />
      )}

      {/* Content */}
      <div
        ref={contentRef}
        className={cn(
          "p-4 transition-all duration-500",
          isRevealed ? "blur-0 opacity-100" : "blur-md opacity-50 select-none"
        )}
        aria-hidden={!isRevealed}
        inert={!isRevealed ? ("" as unknown as undefined) : undefined}
      >
        {children}
      </div>

      {/* Reveal button overlay */}
      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setRevealed(true)}
            className="spidey-sense-hover px-4 py-2 bg-accent text-background text-sm font-medium rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            aria-label={`Reveal ${label}`}
          >
            Reveal {label}
          </button>
        </div>
      )}
    </div>
  );
}
