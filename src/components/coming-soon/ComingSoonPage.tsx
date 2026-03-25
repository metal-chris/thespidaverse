"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SpiderWebCanvas } from "./NeuralNetworkCanvas";
import { ComingSoonContent } from "./ComingSoonContent";
import type { Palette } from "./particle-config";

interface ComingSoonPageProps {
  earlyAccessEnabled?: boolean;
}

export function ComingSoonPage({ earlyAccessEnabled = false }: ComingSoonPageProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [palette, setPaletteState] = useState<Palette>("miles");
  const [accessGranted, setAccessGranted] = useState(false);
  const strikeTriggerRef = useRef<((x: number, y: number) => void) | null>(null);

  const handleRendererReady = useCallback((trigger: (x: number, y: number) => void) => {
    strikeTriggerRef.current = trigger;
  }, []);

  const handleAccessGranted = useCallback(() => {
    setAccessGranted(true);
    // Fire 8 strikes in a radial burst from the center of the viewport
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const trigger = strikeTriggerRef.current;
    if (trigger && !reducedMotion) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 80;
        setTimeout(() => {
          trigger(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }, i * 60);
      }
    }
  }, [reducedMotion]);

  // Sync palette with main site's theme in localStorage
  const setPalette = useCallback((p: Palette | ((prev: Palette) => Palette)) => {
    setPaletteState(prev => {
      const next = typeof p === "function" ? p(prev) : p;
      localStorage.setItem("spidaverse-theme", next);
      return next;
    });
  }, []);

  useEffect(() => {
    // Read stored theme so coming soon matches any prior selection
    const stored = localStorage.getItem("spidaverse-theme");
    if (stored === "miles" || stored === "peter" || stored === "venom") {
      setPaletteState(stored);
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const accents: Record<Palette, string> = {
    miles: "#E82334",
    peter: "#1E50DC",
    venom: "#FFFFFF",
  };

  const bgColor: Record<Palette, string> = {
    miles: "#0A0A0A",
    peter: "#3A0808",
    venom: "#0A0A0A",
  };
  const vignetteCenter: Record<Palette, string> = {
    miles: "rgba(232,35,52,0.04)",
    peter: "transparent",
    venom: "rgba(255,255,255,0.02)",
  };
  const vignetteEdge: Record<Palette, string> = {
    miles: "rgba(0,0,0,0.4)",
    peter: "rgba(0,0,0,0.5)",
    venom: "rgba(0,0,0,0.4)",
  };
  const glowPrimary: Record<Palette, string> = {
    miles: "rgba(232,35,52,0.06)",
    peter: "rgba(20,50,140,0.08)",
    venom: "rgba(255,255,255,0.03)",
  };
  const glowSecondary: Record<Palette, string> = {
    miles: "rgba(180,40,255,0.03)",
    peter: "rgba(10,30,100,0.06)",
    venom: "rgba(60,140,255,0.03)",
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100dvh",
        minHeight: "100vh",
        background: bgColor[palette],
        transition: "background 0.6s ease",
      }}
    >
      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${vignetteCenter[palette]} 0%, transparent 50%, ${vignetteEdge[palette]} 100%)`,
          transition: "background 0.6s ease",
        }}
      />

      {/* Ambient glow — slow drift */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full"
          style={{
            width: "60vmax",
            height: "60vmax",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle, ${glowPrimary[palette]} 0%, transparent 60%)`,
            animation: "ambientDrift1 80s ease-in-out infinite",
            transition: "background 0.6s ease",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "40vmax",
            height: "40vmax",
            bottom: "-10%",
            right: "-5%",
            background: `radial-gradient(circle, ${glowSecondary[palette]} 0%, transparent 60%)`,
            animation: "ambientDrift2 100s ease-in-out infinite",
            transition: "background 0.6s ease",
          }}
        />
      </div>

      {/* Halftone dot overlay for comic-book texture */}
      <div
        className="absolute inset-0 pointer-events-none cs-halftone"
        aria-hidden="true"
      />

      {/* Spider web canvas */}
      <SpiderWebCanvas reducedMotion={reducedMotion} palette={palette} onRendererReady={handleRendererReady} />

      {/* Content overlay */}
      <ComingSoonContent palette={palette} onTogglePalette={() => setPalette(p => p === "miles" ? "peter" : p === "peter" ? "venom" : "miles")} earlyAccessEnabled={earlyAccessEnabled} onAccessGranted={handleAccessGranted} />

      {/* Portal wipe overlay — covers screen before redirect */}
      {accessGranted && (
        <div
          className="fixed inset-0 z-50 cs-portal-wipe"
          style={{
            background: accents[palette],
            animationDelay: "1.8s",
            clipPath: "circle(0% at 50% 50%)",
          }}
        />
      )}
    </div>
  );
}
