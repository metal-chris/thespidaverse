"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Link2, MessageCircleOff, Palette, Ban } from "lucide-react";
import { LoreIndicator } from "./LoreIndicator";
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
  { icon: Palette, titleKey: "principle4Title", tooltipKey: "principle4Tooltip" },
  { icon: Ban, titleKey: "principle5Title", tooltipKey: "principle5Tooltip" },
];

export function ClassifiedTerminal() {
  const t = useTranslations("about");
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="terminal-scanlines terminal-boot relative rounded-lg border border-accent/20 bg-black/40">
      {/* Corner brackets */}
      <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-accent/30 z-10" />
      <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-accent/30 z-10" />
      <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-accent/30 z-10" />
      <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-accent/30 z-10" />

      {/* Classification header bar */}
      <div className="relative z-[2] bg-accent/5 border-b border-accent/15 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.2em]">
        <p className="text-accent/50">
          <span>{t("terminalClearance1")}</span>
          <span className="hidden md:inline"> // </span>
          <br className="md:hidden" />
          <span>{t("terminalClearance2")}</span>
        </p>
        <p className="text-accent/40 mt-0.5">
          <span>{t("terminalFile")}</span>
          <span className="hidden md:inline"> // </span>
          <br className="md:hidden" />
          <span>{t("terminalDate")} </span>
          <span className="text-accent/20">{t("terminalRedacted")}</span>
        </p>
      </div>

      {/* Content area */}
      <div className="relative z-[2] p-4 md:p-5 space-y-5">
        {/* Intro paragraph */}
        <p className="text-sm text-foreground/70 leading-relaxed italic">
          {t("originBody4Intro")}
        </p>

        {/* Principle cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-2.5">
          {PRINCIPLES.map(({ icon: Icon, titleKey, tooltipKey }) => {
            const isActive = activeCard === titleKey;
            return (
              <div
                key={titleKey}
                className={cn(
                  "relative rounded-md border p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[100px] transition-all duration-200",
                  isActive
                    ? "border-accent/50 bg-accent/15 shadow-md shadow-accent/10"
                    : "border-accent/15 bg-accent/5 hover:border-accent/30"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors duration-200",
                    isActive ? "text-accent" : "text-accent/60"
                  )}
                  strokeWidth={1.5}
                />
                <span className={cn(
                  "font-mono text-[10px] uppercase tracking-wider font-semibold transition-colors duration-200",
                  isActive ? "text-accent" : "text-accent/80"
                )}>
                  {t(titleKey)}
                </span>
                <LoreIndicator
                  lore={t(tooltipKey)}
                  onOpenChange={(open) => setActiveCard(open ? titleKey : null)}
                />
              </div>
            );
          })}
        </div>

        {/* Signature footer */}
        <div className="border-t border-accent/15 pt-3 mt-4 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/30">
            {t("terminalFooter")}
          </p>
          <p className="font-mono text-sm font-bold text-accent mt-2">
            {t("terminalWelcome")}
          </p>
        </div>
      </div>
    </div>
  );
}
