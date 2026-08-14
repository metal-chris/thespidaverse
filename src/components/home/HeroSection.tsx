"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SpiderWebCanvas } from "@/components/web-canvas/NeuralNetworkCanvas";
import { GlitchText } from "@/components/ui/GlitchText";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import type { Palette } from "@/components/web-canvas/particle-config";
import { SpidaverseMark } from "@/components/ui/SpidaverseMark";

interface HeroSectionProps {
  className?: string;
  children?: React.ReactNode;
}

export function HeroSection({ className = "", children }: HeroSectionProps) {
  const { theme, mode } = useTheme();
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
  // Edge falloff comes from the mode-aware token, not a fixed black. The
  // splash had this same bug and was fixed first; the hero kept painting a
  // 40% black ring on the light page, which is the "radial blur looks dark"
  // report. peter keeps its own tint since its dark ground is maroon, not
  // black, but it too defers to the token in light.
  const vignetteEdge: Record<Palette, string> = {
    miles: "var(--vignette-edge)",
    peter: "var(--vignette-edge)",
    venom: "var(--vignette-edge)",
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
      <SpiderWebCanvas reducedMotion={reducedMotion} palette={palette} mode={mode} />

      {/* Content — above all background layers, centered in remaining space */}
      <div className="flex-1 flex items-center justify-center">
      <Container className="relative z-10 text-center">
        {/* The mark, at the size it was actually designed to be judged at.
            It leads the hero rather than the tagline because this is the one
            place on the site with room to show it whole — everywhere else it
            appears at nav or favicon scale, where the inner octagon and the
            leg junctions are inferred rather than seen. Enters first, one beat
            ahead of the tagline, so the sequence reads mark → claim → title. */}
        <div
          className="flex justify-center mb-6 opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.05s" }}
        >
          <SpidaverseMark className="h-20 w-20 text-accent md:h-24 md:w-24" />
        </div>

        <GlitchText
          as="h1"
          dataText={t("hero.title")}
          className="font-black tracking-tight text-balance leading-[0.9] opacity-0 animate-hero-fade-in"
          style={{ fontSize: "clamp(3rem, 5vw + 1.5rem, 7rem)", animationDelay: "0.25s" }}
        >
          The{" "}
          {/* Accent word — driven by the token, with no per-palette overrides.
              These hardcoded values predate light mode and only ever described
              the DARK surface: venom forced text-white, so in wangan the title
              read half-black half-white; peter pinned #1E50DC, the dark-mode
              blue, which is 3.1:1 on the light ground. Both palettes already
              define --color-accent correctly for each mode (venom light is
              #33333A, peter light #12379E), so the override was not just wrong
              in light — it was overriding a value that was already right. */}
          <span className="relative text-accent">
            {t("hero.titleAccent")}
            {/* Underline accent */}
            <span
              className="absolute left-0 -bottom-1 w-full h-1 bg-accent/30 rounded-full"
              aria-hidden="true"
            />
          </span>
        </GlitchText>

        {/* A real heading, not a styled paragraph.
            This line introduces the two below it — the media list and the
            claim — so it is the heading OF that block and marking it <h2>
            says so. As a <p> it was styled to look like a heading while
            being invisible to anything reading structure, which left the
            hero as a title followed by three unrelated paragraphs.

            It also sits UNDER the title now. Above it, the mono line was the
            first thing read on the site and the title only the second — a
            caption introducing the name. Beneath, the sequence reads
            mark → name → what it is. */}
        <h2
          className="font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-accent mt-8 md:mt-9 opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.35s" }}
        >
          {t("hero.tagline")}
        </h2>

        {/* Tight to the heading above it, not floating between it and the
            title. A heading belongs to what it introduces, so the large gap
            goes ABOVE the tagline and the small one below — it was the other
            way round, which grouped the tagline with the title instead. */}
        <p
          className="mt-2.5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.45s" }}
        >
          {t("hero.description")}
          <br />
          <span className="text-foreground font-medium">{t("hero.subtitle")}</span>
        </p>

        {/* Children (e.g. CategoryGrid) */}
        <div className="hidden md:block opacity-0 animate-hero-fade-in" style={{ animationDelay: "0.6s", marginTop: "14vh" }}>
          {children}
        </div>

        {/* Scroll indicator — below categories on desktop, lower on mobile */}
        <div
          className="flex justify-center opacity-0 animate-hero-fade-in"
          style={{ animationDelay: "0.8s", marginTop: "min(8vh, 2rem)" }}
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
    </section>
  );
}
