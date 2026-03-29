"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SpiderWebCanvas } from "@/components/coming-soon/NeuralNetworkCanvas";
import { GlitchText } from "@/components/ui/GlitchText";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { Palette } from "@/components/coming-soon/particle-config";

export function HeroSection() {
  const { theme } = useTheme();
  const palette: Palette = theme; // miles | peter | venom — same type

  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Palette-aware background layers
  const vignetteCenter: Record<Palette, string> = {
    miles: "rgba(232,35,52,0.04)",
    peter: "rgba(30,80,220,0.03)",
    venom: "rgba(255,255,255,0.02)",
  };
  const vignetteEdge: Record<Palette, string> = {
    miles: "rgba(0,0,0,0.4)",
    peter: "rgba(30,4,4,0.15)",
    venom: "rgba(0,0,0,0.4)",
  };
  const glowPrimary: Record<Palette, string> = {
    miles: "rgba(232,35,52,0.06)",
    peter: "rgba(30,80,220,0.06)",
    venom: "rgba(255,255,255,0.03)",
  };
  const glowSecondary: Record<Palette, string> = {
    miles: "rgba(180,40,255,0.03)",
    peter: "rgba(30,50,140,0.04)",
    venom: "rgba(60,140,255,0.03)",
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Layer 1: Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${vignetteCenter[palette]} 0%, transparent 50%, ${vignetteEdge[palette]} 100%)`,
          transition: "background 0.6s ease",
        }}
      />

      {/* Layer 2: Ambient glow — slow drift */}
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

      {/* Layer 3: Comic-book halftone texture */}
      <div
        className="absolute inset-0 pointer-events-none halftone-overlay"
        aria-hidden="true"
      />

      {/* Layer 4: Interactive spider web canvas */}
      <SpiderWebCanvas reducedMotion={reducedMotion} palette={palette} />

      {/* Content — above all background layers */}
      <Container className="relative z-10 text-center">
        {/* Mono tagline above heading */}
        <p className="font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-accent mb-4">
          A Pop Culture Web
        </p>

        <GlitchText
          as="h1"
          dataText="The Spidaverse"
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-balance leading-[0.9]"
        >
          The{" "}
          <span className="text-accent relative [html[data-theme='venom']_&]:text-white [html[data-theme='peter']_&]:text-[#1E50DC]">
            Spidaverse
            {/* Underline accent */}
            <span
              className="absolute left-0 -bottom-1 w-full h-1 bg-accent/30 rounded-full"
              aria-hidden="true"
            />
          </span>
        </GlitchText>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed">
          Movies. TV. Games. Anime. Manga. Music.
          <br />
          <span className="text-foreground font-medium">One web connects them all.</span>
        </p>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["Movies & TV", "Video Games", "Anime & Manga", "Music"].map(
            (cat) => (
              <span
                key={cat}
                className="px-3 py-1 text-xs font-medium rounded-full border border-border text-muted-foreground bg-card/50 backdrop-blur-sm"
              >
                {cat}
              </span>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
