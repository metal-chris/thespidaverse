"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Link2, MessageCircleOff, Palette, Ban, BarChart3 } from "lucide-react";
import { LoreIndicator } from "@/components/about/LoreIndicator";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PrincipleCard {
  icon: LucideIcon;
  titleKey: string;
  tooltipKey: string;
}

const PRINCIPLES: PrincipleCard[] = [
  { icon: Shield, titleKey: "principle1Title", tooltipKey: "principle1Tooltip" },
  { icon: Link2, titleKey: "principle2Title", tooltipKey: "principle2Tooltip" },
  { icon: MessageCircleOff, titleKey: "principle3Title", tooltipKey: "principle3Tooltip" },
  { icon: BarChart3, titleKey: "principle6Title", tooltipKey: "principle6Tooltip" },
  { icon: Ban, titleKey: "principle5Title", tooltipKey: "principle5Tooltip" },
  { icon: Palette, titleKey: "principle4Title", tooltipKey: "principle4Tooltip" },
];

export function WhatIsSection() {
  const t = useTranslations();
  const about = useTranslations("about");
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="relative rounded-xl border border-border/60 p-5 md:p-8 overflow-hidden">
      {/* Corner brackets — subtle brand nod */}
      <span className="absolute top-2 left-2 w-4 h-4 border-t border-l border-accent/25" aria-hidden="true" />
      <span className="absolute top-2 right-2 w-4 h-4 border-t border-r border-accent/25" aria-hidden="true" />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-accent/25" aria-hidden="true" />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-accent/25" aria-hidden="true" />

      {/* Card background */}
      <div className="absolute inset-0 bg-card/40" aria-hidden="true" />

      {/* Header */}
      <h2 className="relative text-2xl font-bold mb-2 flex items-center gap-2">
        <span className="text-accent">///</span> {t("home.whatIs.heading")}
      </h2>

      {/* Intro text */}
      <p className="relative text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">
        {t("home.whatIs.intro")}
      </p>

      {/* Principle cards grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {PRINCIPLES.map(({ icon: Icon, titleKey, tooltipKey }) => {
          const isActive = activeCard === titleKey;
          return (
            <div
              key={titleKey}
              className={cn(
                "relative rounded-lg border p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[100px] transition-all duration-200",
                isActive
                  ? "border-accent/50 bg-accent/15 shadow-md shadow-accent/10"
                  : "border-accent/15 bg-accent/5 hover:border-accent/30"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  isActive ? "text-accent" : "text-accent/60"
                )}
                strokeWidth={1.5}
              />
              <span className={cn(
                "font-mono text-[10px] md:text-[11px] uppercase tracking-wider font-semibold transition-colors duration-200",
                isActive ? "text-accent" : "text-accent/80"
              )}>
                {about(titleKey)}
              </span>
              <LoreIndicator
                lore={about(tooltipKey)}
                onOpenChange={(open) => setActiveCard(open ? titleKey : null)}
              />
            </div>
          );
        })}
      </div>

      {/* Welcome closing */}
      <p className="relative text-center font-mono text-sm font-bold text-accent mt-6">
        {t("home.whatIs.welcome")}
      </p>
    </div>
  );
}
