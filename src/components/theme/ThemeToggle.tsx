"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "./ThemeProvider";
import { WebSpinner } from "@/components/ui/WebSpinner";

/** Cycle order. The control steps forward through the palettes, so the label
 *  has to name the one you are about to GET, not the one you are on. */
const NEXT: Record<string, string> = { miles: "peter", peter: "venom", venom: "miles" };

/**
 * Palette control for the site itself — cycles through the full character
 * transition (see ThemeProvider.toggleTheme). The splash uses PaletteToggle
 * instead, which sets directly; both sit in the same slot of SettingsBar.
 *
 * The label names a COLOUR, never a character. It previously read "Switch to
 * Peter mode" — hardcoded, untranslated English that also put licensed
 * character names into the accessible name of a control on every page. A
 * swatch says "red" faster than a name does, and a screen reader user gains
 * nothing from the trivia.
 */
export function ThemeToggle() {
  const { theme, toggleTheme, toggleRef } = useTheme();
  const t = useTranslations("common.settings");

  const label = t("paletteNext", { palette: t(`palette_${NEXT[theme] ?? "miles"}`) });

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      ref={toggleRef as React.RefObject<HTMLButtonElement>}
      className="spider-toggle spidey-sense-hover relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      aria-label={label}
    >
      <WebSpinner size="sm" className="text-foreground" />
    </button>
  );
}
