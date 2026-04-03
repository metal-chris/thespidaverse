"use client";

import { useTranslations } from "next-intl";
import { WebRating } from "@/components/content/WebRating";

const beliefKeys = [
  { titleKey: "beliefTitle1", textKey: "beliefText1" },
  { titleKey: "beliefTitle2", textKey: "beliefText2" },
  { titleKey: "beliefTitle3", textKey: "beliefText3" },
];

export function PhilosophyConsole() {
  const t = useTranslations("about");

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      {/* WebRating demo */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <WebRating score={100} variant="full" />
        <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider text-center">
          {t("webRatingSystem")}
        </p>
      </div>

      {/* Philosophy cards */}
      <div className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {t("webRatingDescription")}
        </p>
        {beliefKeys.map((belief, i) => (
          <div
            key={belief.titleKey}
            className="rounded-lg border border-border/50 bg-card/30 px-4 py-3"
          >
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
              {String(i + 1).padStart(2, "0")} &mdash; {t(belief.titleKey)}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t(belief.textKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
