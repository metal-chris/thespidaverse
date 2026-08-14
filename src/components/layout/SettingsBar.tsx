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
  labelled = false,
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
  /**
   * Render each control as a labelled row instead of a bare icon strip.
   *
   * For the mobile menu, where the bar is no longer squeezed into the header
   * and has room to explain itself. Three unlabelled icons in a drawer read as
   * decoration and get ignored; the labels are what make them findable. The
   * strings already exist — they are the same ones the icons carry as
   * aria-labels, so this shows sighted users what screen-reader users were
   * already being told.
   *
   * ORDER IS UNCHANGED. This is a presentation switch, not a second bar.
   */
  labelled?: boolean;
}) {
  const t = useTranslations("common.settings");

  const paletteControl =
    palette === "swatches" ? (
      <PaletteToggle
        label={t("paletteLabel")}
        optionLabel={(p) => t(`palette_${p}`)}
      />
    ) : (
      <ThemeToggle />
    );

  if (labelled) {
    const rows: [string, React.ReactNode][] = [
      [t("languageLabel"), <LocaleSwitcher key="locale" />],
      [t("modeLabel"), <ModeToggle key="mode" className={modeClassName} />],
      [t("paletteLabel"), paletteControl],
    ];
    return (
      <div className={cn("flex flex-col", className)}>
        {rows.map(([label, control]) => (
          <div
            key={label}
            className="flex min-h-[44px] items-center justify-between gap-3 py-1"
          >
            <span className="text-sm font-medium text-muted-foreground">
              {label}
            </span>
            {control}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LocaleSwitcher />
      <ModeToggle className={modeClassName} />
      {paletteControl}
    </div>
  );
}
