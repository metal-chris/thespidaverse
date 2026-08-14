"use client";

import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PaletteToggle } from "@/components/theme/PaletteToggle";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/**
 * The three viewer settings, in one fixed order: locale, light/dark, palette.
 *
 * A COMPONENT rather than a documented convention, because the order was
 * already wrong in both directions before this existed — the header ran
 * mode → locale → search → palette, with the search button sitting in the
 * middle of the settings group, and the splash had its own hand-rolled
 * arrangement. Three loose controls placed by hand on four surfaces across two
 * repos will drift; one component cannot.
 *
 * The order is deliberate and runs least-to-most disruptive. Locale is the
 * setting a visitor changes once and never again. Light/dark is a comfort
 * control they may flip daily. Palette is the identity choice, and it sits
 * last because on this site it triggers a full character transition — the
 * heaviest thing in the group belongs at the end of it, not in the middle.
 *
 * Anything that is NOT a setting — search here, notifications in Kumo Club's
 * member portal — belongs OUTSIDE this bar, before it. That is what keeps the
 * two sites' headers legible as the same object even where their contents
 * differ.
 */
export function SettingsBar({
  className,
  palette = "cycle",
  modeClassName,
}: {
  className?: string;
  /**
   * How the palette control renders. The ORDER is fixed either way — only the
   * affordance changes, and the two are not interchangeable:
   *
   *  "cycle"    — ThemeToggle. Steps to the next palette through the full
   *               character transition. Right on the site itself, where the
   *               swap is an event you stay to watch.
   *  "swatches" — PaletteToggle. Sets a palette directly, no transition.
   *               Right on the splash, where a 3.2s transition would play on a
   *               page the visitor is about to leave, and where showing all
   *               three at once is the point.
   */
  palette?: "cycle" | "swatches";
  /** Splash surfaces restyle the mode button for glass-on-dark. */
  modeClassName?: string;
}) {
  const t = useTranslations("common.settings");
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LocaleSwitcher />
      <ModeToggle className={modeClassName} />
      {palette === "swatches" ? (
        <PaletteToggle
          label={t("paletteLabel")}
          optionLabel={(p) => t(`palette_${p}`)}
        />
      ) : (
        <ThemeToggle />
      )}
    </div>
  );
}
