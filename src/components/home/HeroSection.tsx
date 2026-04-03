"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SpiderWebCanvas } from "@/components/coming-soon/NeuralNetworkCanvas";
import { GlitchText } from "@/components/ui/GlitchText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import type { Palette } from "@/components/coming-soon/particle-config";

interface HeroSectionProps {
  className?: string;
  children?: React.ReactNode;
}

export function HeroSection({ className = "", children }: HeroSectionProps) {
  const { theme } = useTheme();
  const t = useTranslations();
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
    <section className={`relative flex flex-col overflow-hidden ${className}`}>
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

      {/* Content — above all background layers, centered in remaining space */}
      <div className="flex-1 flex items-center justify-center">
      <Container className="relative z-10 text-center">
        {/* Mono tagline above heading */}
        <p
          className="font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-accent mb-4 opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {t("hero.tagline")}
        </p>

        <GlitchText
          as="h1"
          dataText={t("hero.title")}
          className="font-black tracking-tight text-balance leading-[0.9] opacity-0 animate-hero-fade-in"
          style={{ fontSize: "clamp(3rem, 5vw + 1.5rem, 7rem)", animationDelay: "0.25s" }}
        >
          The{" "}
          <span className="text-accent relative [html[data-theme='venom']_&]:text-white [html[data-theme='peter']_&]:text-[#1E50DC]">
            {t("hero.titleAccent")}
            {/* Underline accent */}
            <span
              className="absolute left-0 -bottom-1 w-full h-1 bg-accent/30 rounded-full"
              aria-hidden="true"
            />
          </span>
        </GlitchText>

        <p
          className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.45s" }}
        >
          {t("hero.description")}
          <br />
          <span className="text-foreground font-medium">{t("hero.subtitle")}</span>
        </p>

        {/* Scroll indicator */}
        <div
          className="mt-12 flex justify-center opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-accent/30 text-accent/70 bg-accent/5 backdrop-blur-sm hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all duration-200 animate-bounce-slow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={() => {
              const main = document.getElementById("main-content");
              const hero = main?.querySelector("section:nth-child(2)");
              hero?.scrollIntoView({ behavior: "smooth" });
            }}
            aria-label={t("hero.scrollToContent")}
          >
            <ArrowDown className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </Container>
      </div>

      {/* Children (e.g. CategoryGrid) anchored at bottom */}
      {children}
    </section>
  );
}
