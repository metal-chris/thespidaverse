"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GlitchText } from "@/components/ui/GlitchText";
import { LoreIndicator } from "@/components/about/LoreIndicator";
import { CATEGORY_CONFIG, DEFAULT_CATEGORY } from "@/lib/categories";
import { cn } from "@/lib/utils";

const DISCORD_ICON_PATH = "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z";

const categories = Object.entries(CATEGORY_CONFIG);

const CATEGORY_I18N_KEY: Record<string, string> = {
  Movies: "categories.movies",
  TV: "categories.tv",
  "Video Games": "categories.videoGames",
  Anime: "categories.anime",
  Books: "categories.books",
  Music: "categories.music",
  Culture: "categories.culture",
  Tech: "categories.tech",
};

/** Spider emblem SVG — stylized avatar for the ID card */
function SpiderEmblem() {
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20 md:w-24 md:h-24 text-accent" fill="currentColor" aria-hidden="true">
      {/* Body */}
      <ellipse cx="40" cy="35" rx="8" ry="10" />
      <ellipse cx="40" cy="50" rx="6" ry="7" />
      {/* Eyes */}
      <circle cx="36" cy="31" r="2.5" className="text-background" fill="currentColor" />
      <circle cx="44" cy="31" r="2.5" className="text-background" fill="currentColor" />
      {/* Legs */}
      <path d="M32 30 Q20 18 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M32 35 Q16 30 4 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M32 40 Q16 46 4 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M34 50 Q22 58 10 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M48 30 Q60 18 72 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M48 35 Q64 30 76 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M48 40 Q64 46 76 54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
      <path d="M46 50 Q58 58 70 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" className="text-accent" />
    </svg>
  );
}

function AvatarWithFallback() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-accent/20 bg-accent/5 overflow-hidden flex items-center justify-center">
      {!imgError ? (
        <Image
          src="/images/spida-mane-avatar.jpg"
          alt="Spida-Mane"
          width={128}
          height={128}
          className="w-full h-full object-cover"
          priority
          onError={() => setImgError(true)}
        />
      ) : (
        <SpiderEmblem />
      )}
    </div>
  );
}

const QUOTES = [
  { textKey: "quote1", speakerKey: "quote1Speaker", tooltipKey: "quote1Tooltip" },
  { textKey: "quote2", speakerKey: "quote2Speaker", tooltipKey: "quote2Tooltip" },
  { textKey: "quote3", speakerKey: "quote3Speaker", tooltipKey: "quote3Tooltip" },
  { textKey: "quote4", speakerKey: "quote4Speaker", tooltipKey: "quote4Tooltip" },
  { textKey: "quote5", speakerKey: "quote5Speaker", tooltipKey: "quote5Tooltip" },
];

export function IDCardHeader() {
  const t = useTranslations("about");
  const tCat = useTranslations("categories");
  const [discordCopied, setDiscordCopied] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Rotate quotes every 12 seconds (5 quotes × 12s = 60s full cycle)
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscordCopy = () => {
    navigator.clipboard.writeText("spida.mane");
    setDiscordCopied(true);
    setTimeout(() => setDiscordCopied(false), 2000);
  };

  const currentQuote = QUOTES[quoteIndex];

  return (
    <div className="rounded-xl border-2 border-accent/30 bg-card/60 backdrop-blur-sm overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-accent" />

      <div className="p-5 md:p-8">
        {/* Main ID layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
          {/* Avatar / Emblem fallback */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <AvatarWithFallback />
          </div>

          {/* Designation */}
          <div className="flex-1 text-center md:text-left">
            <GlitchText className="text-3xl md:text-4xl font-black">
              SPIDA-MANE
            </GlitchText>

            <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.15em] text-muted-foreground mt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-1">
              <span>{t("designation")}</span>
              <LoreIndicator
                lore={t("loreDesignation")}
                variant="static"
              />
              <span>// &nbsp;{t("origin")}</span>
              <LoreIndicator
                lore={t("loreOrigin")}
                attribution={t("loreOriginAttribution")}
              />
            </p>

            <div className="mt-3 text-center md:text-left">
              <p
                key={quoteIndex}
                className="text-sm text-muted-foreground font-bold italic inline-flex items-center gap-1.5 transition-opacity duration-500 animate-fade-in"
              >
                &ldquo;{t(currentQuote.textKey)}&rdquo;
                <LoreIndicator lore={t(currentQuote.tooltipKey)} />
              </p>
              <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider mt-1">
                &mdash; {t(currentQuote.speakerKey)}
              </p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              <div className="relative">
                <button
                  onClick={handleDiscordCopy}
                  className="text-muted-foreground transition-colors duration-200 hover:text-[#5865F2]"
                  aria-label="Discord: spida.mane (click to copy)"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d={DISCORD_ICON_PATH} />
                  </svg>
                </button>
                {discordCopied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium text-white bg-[#5865F2] rounded-md whitespace-nowrap animate-fade-in">
                    spida.mane copied!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category clearance badges */}
        <div className="mt-6 pt-5 border-t border-border/50">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 text-center md:text-left">
            {t("clearanceBadges")}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {categories.map(([name, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={name}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border transition-all duration-200",
                    "hover:-translate-y-0.5",
                    config.pill,
                    config.borderHover
                  )}
                >
                  <Icon className={cn("w-3 h-3", config.iconColor)} strokeWidth={2} />
                  {CATEGORY_I18N_KEY[name] ? tCat(CATEGORY_I18N_KEY[name].replace("categories.", "")) : name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
