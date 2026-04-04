"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/* ─── Web-Shooters: Content Formats ─── */
const formats = [
  { nameKey: "formatFirstBite", taglineKey: "formatFirstBiteTagline" },
  { nameKey: "formatFullWeb", taglineKey: "formatFullWebTagline" },
  { nameKey: "formatSpinTheBlock", taglineKey: "formatSpinTheBlockTagline" },
  { nameKey: "formatSinisterSix", taglineKey: "formatSinisterSixTagline" },
  { nameKey: "formatGauntlet", taglineKey: "formatGauntletTagline" },
  { nameKey: "formatVersus", taglineKey: "formatVersusTagline" },
  { nameKey: "formatDailyBugle", taglineKey: "formatDailyBugleTagline" },
  { nameKey: "formatSpidaSense", taglineKey: "formatSpidaSenseTagline" },
  { nameKey: "formatRotation", taglineKey: "formatRotationTagline" },
  { nameKey: "formatStateOfGame", taglineKey: "formatStateOfGameTagline" },
];

/* ─── Suit Tech: Platforms ─── */
const platforms = [
  {
    name: "Discord",
    taglineKey: "platformDiscordTagline",
    handle: "spida.mane",
    href: "#",
    color: "text-indigo-400 border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-400/5",
    onClick: () => navigator.clipboard.writeText("spida.mane"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

/* ─── Gadgets: Site Mechanics ─── */
const gadgets = [
  { nameKey: "gadgetWebRating", taglineKey: "gadgetWebRatingTagline" },
  { nameKey: "gadgetCategoryBadges", taglineKey: "gadgetCategoryBadgesTagline" },
  { nameKey: "gadgetSpidaSensePoll", taglineKey: "gadgetSpidaSensePollTagline" },
];

function GearCategory({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

export function ArsenalPanel() {
  const t = useTranslations("about");
  const [discordCopied, setDiscordCopied] = useState(false);

  return (
    <div className="space-y-6">
      {/* Web-Shooters — Content Formats */}
      <GearCategory label={t("webShooters")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {formats.map((f) => (
            <div
              key={f.nameKey}
              className="flex items-baseline gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card/30"
            >
              <span className="text-xs font-bold text-card-foreground whitespace-nowrap">
                {t(f.nameKey)}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {t(f.taglineKey)}
              </span>
            </div>
          ))}
        </div>
      </GearCategory>

      {/* Suit Tech — Platforms (inline) */}
      <GearCategory label={t("suitTech")}>
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <div key={p.name} className="relative">
              <button
                onClick={() => {
                  if (p.onClick) {
                    p.onClick();
                    setDiscordCopied(true);
                    setTimeout(() => setDiscordCopied(false), 2000);
                  }
                }}
                aria-label={p.handle ? `${p.name}: ${p.handle} (click to copy)` : p.name}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-card/50 transition-all duration-200",
                  p.color
                )}
              >
                {p.icon}
                <span className="text-sm font-semibold text-card-foreground">
                  {p.name}
                </span>
              </button>
              {p.handle && discordCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium text-white bg-[#5865F2] rounded-md whitespace-nowrap animate-fade-in">
                  {p.handle} copied!
                </span>
              )}
            </div>
          ))}
        </div>
      </GearCategory>

      {/* Gadgets — Site Mechanics */}
      <GearCategory label={t("gadgetsLabel")}>
        <div className="flex flex-wrap gap-2">
          {gadgets.map((g) => (
            <div
              key={g.nameKey}
              className="flex items-baseline gap-2 px-3 py-2 rounded-lg border border-border/50 bg-card/30"
            >
              <span className="text-xs font-bold text-card-foreground whitespace-nowrap">
                {t(g.nameKey)}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {t(g.taglineKey)}
              </span>
            </div>
          ))}
        </div>
      </GearCategory>
    </div>
  );
}
