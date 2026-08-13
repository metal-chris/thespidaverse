"use client";

import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Accent palette selector — one of the three settings shared with Kumo Club
 * (palette, mode, language).
 *
 * PORTED FROM Kumo Club's teaser (mc-v4 src/components/teaser/teaser-page.tsx)
 * so the control is the same object on both sites, not a lookalike. The swatch
 * values below are Kumo's verbatim, and two of them are deliberately NOT the
 * site's own token values:
 *
 *  - `peter` shows #3c78ff, the brighter hover-blue, because #1E50DC on a dark
 *    pill reads as a dark smudge at 12px — a swatch has to be legible AS a
 *    swatch, which is a different job from being a text accent.
 *  - `venom` is a split diagonal, not solid white. That palette is the
 *    monochrome one; a single white dot says "white" where the split says
 *    "black and white", and a solid white dot is also indistinguishable from
 *    the selected-state ring on a light surface.
 *
 * Selection is a radiogroup rather than Kumo's `role="group"` + aria-pressed:
 * these options are mutually exclusive, which is what a radiogroup means, and
 * it gives arrow-key traversal for free. That improvement is worth porting
 * back the other way.
 */

const PALETTE_SWATCH: Record<string, string> = {
  miles: "#e82334",
  peter: "#3c78ff",
  // Split top/bottom rather than on the diagonal. A 135deg split puts the
  // light half against the BOTTOM-LEFT arc, so the lower half of the dot is
  // never solid — it reads as a smudge at 12px rather than as two halves.
  // Straight down states "black and white" unambiguously at this size.
  venom: "linear-gradient(to bottom, #f0f0f0 50%, #17151a 50%)",
};

const PALETTES = ["miles", "peter", "venom"] as const;
type PaletteId = (typeof PALETTES)[number];

export function PaletteToggle({
  className,
  label,
  optionLabel,
}: {
  className?: string;
  /** Group label, e.g. "Change colour". */
  label: string;
  /** Per-option accessible name. Describes the SWATCH, never a theme name. */
  optionLabel: (p: PaletteId) => string;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur",
        className
      )}
    >
      {PALETTES.map((p) => (
        <button
          key={p}
          type="button"
          role="radio"
          aria-checked={theme === p}
          aria-label={optionLabel(p)}
          onClick={() => setTheme(p)}
          className={cn(
            "h-3 w-3 rounded-full border border-white/25 transition-transform hover:scale-125",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            theme === p && "ring-2 ring-offset-2 ring-offset-black"
          )}
          style={
            {
              background: PALETTE_SWATCH[p],
              // The border box and the background box must agree. By default
              // the background is ORIGINATED at the padding edge but CLIPPED at
              // the border edge, so a gradient is laid out for the inner circle
              // and then painted a further 1px out on every side. At 12px that
              // offset is ~8% of the dot: the light half spilled past its own
              // boundary and showed as white leaking around the dark half's
              // edge. Clipping to the same box it is positioned in keeps the
              // split exactly where it is drawn, and leaves the border sitting
              // cleanly outside it.
              backgroundClip: "padding-box",
              outlineColor: "var(--color-accent)",
              ...(theme === p ? { "--tw-ring-color": "var(--color-accent)" } : {}),
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
