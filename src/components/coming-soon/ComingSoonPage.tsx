"use client";

import { useState, useEffect } from "react";
import { SpiderWebCanvas } from "./NeuralNetworkCanvas";
import { ComingSoonContent } from "./ComingSoonContent";
import type { Palette } from "./particle-config";

export function ComingSoonPage() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [palette, setPalette] = useState<Palette>("miles");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const bgColor: Record<Palette, string> = {
    miles: "#0A0A0A",
    peter: "#4A0A0A",
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
      <SpiderWebCanvas reducedMotion={reducedMotion} palette={palette} />

      {/* Content overlay */}
      <ComingSoonContent palette={palette} onTogglePalette={() => setPalette(p => p === "miles" ? "peter" : p === "peter" ? "venom" : "miles")} />
    </div>
  );
}
