"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GlitchText } from "@/components/ui/GlitchText";
import { LoreIndicator } from "@/components/about/LoreIndicator";
import { CATEGORY_CONFIG, DEFAULT_CATEGORY } from "@/lib/categories";
import { cn } from "@/lib/utils";

const socials = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@daspida-mane",
    hoverColor: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Twitch",
    href: "https://www.twitch.tv/spidaman3",
    hoverColor: "#9146FF",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com/spida.world",
    hoverColor: "#E4405F",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    hoverColor: "#5865F2",
    handle: "spida.mane",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const categories = Object.entries(CATEGORY_CONFIG);

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

export function IDCardHeader() {
  const t = useTranslations("about");
  const handleDiscordCopy = () => {
    navigator.clipboard.writeText("spida.mane");
  };

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

            <p className="text-sm text-muted-foreground mt-3 font-bold italic flex items-center justify-center md:justify-start gap-1.5">
              &ldquo;{t("motto")}&rdquo;
              <LoreIndicator
                lore={t("loreMotto")}
              />
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  onClick={social.handle ? (e) => { e.preventDefault(); handleDiscordCopy(); } : undefined}
                  target={social.handle ? undefined : "_blank"}
                  rel={social.handle ? undefined : "noopener noreferrer"}
                  aria-label={social.handle ? `Discord: ${social.handle} (click to copy)` : social.name}
                  className="text-muted-foreground transition-colors duration-200"
                  style={{ ["--hover-color" as string]: social.hoverColor }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = social.hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                >
                  {social.icon}
                </a>
              ))}
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
                  {name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
