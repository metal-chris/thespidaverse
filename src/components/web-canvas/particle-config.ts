// ============================================================
// Miles Morales Spider-Web Config
// ============================================================

export type Palette = "miles" | "peter" | "venom";
/** Surface lightness — the canvas has to resolve colours against it. */
export type Mode = "dark" | "light";

export interface WebConfig {
  rings: number;
  spokes: number;
  mouseRadius: number;
}

export const WEB_CONFIGS: Record<"desktop" | "tablet" | "mobile", WebConfig> = {
  desktop: { rings: 10, spokes: 28, mouseRadius: 200 },
  tablet:  { rings: 8,  spokes: 22, mouseRadius: 170 },
  mobile:  { rings: 6,  spokes: 16, mouseRadius: 130 },
};

// RGB strings for rgba() usage
export interface PaletteColors {
  web: { base: string; glow: string; dim: string };
  strike: string;   // venom strike color
  strikeGlow: string;
}

/**
 * Web colours, resolved per PALETTE and per MODE.
 *
 * This used to be keyed on palette alone, which was correct while every
 * surface was dark and became wrong the moment light mode existed: venom's
 * web is near-white with a pure-white glow, so on the light ground the
 * hover lines painted white-on-white and the strike vanished. The canvas had
 * no way to express "the same palette, on paper".
 *
 * Same shape Kumo Club's teaser already uses (WEB_PALETTES[palette][theme] in
 * mc-v4 src/components/teaser/config.ts) — the sibling site solved this first
 * and this is deliberately the same structure rather than a second invention.
 *
 * Light values are NOT the dark ones darkened. A web is drawn as thin
 * strokes: on black, light strokes glow; on paper, the equivalent read is a
 * DARKER, more saturated stroke, and "glow" becomes depth rather than
 * emission — a bright halo on white is invisible. Each light triple is
 * therefore tuned rather than derived.
 */
export const PALETTES: Record<Palette, Record<Mode, PaletteColors>> = {
  miles: {
    dark: {
      web: { base: "232, 35, 52", glow: "255, 60, 80", dim: "140, 20, 30" },
      strike: "255, 220, 40",
      strikeGlow: "255, 240, 100",
    },
    light: {
      web: { base: "179, 18, 31", glow: "214, 40, 55", dim: "236, 200, 204" },
      strike: "196, 132, 0",
      strikeGlow: "224, 168, 20",
    },
  },
  peter: {
    dark: {
      web: { base: "30, 80, 220", glow: "60, 120, 255", dim: "20, 50, 140" },
      strike: "220, 220, 240",
      strikeGlow: "255, 255, 255",
    },
    light: {
      web: { base: "18, 55, 158", glow: "40, 88, 200", dim: "200, 210, 236" },
      strike: "90, 100, 130",
      strikeGlow: "120, 132, 165",
    },
  },
  venom: {
    dark: {
      web: { base: "220, 220, 220", glow: "255, 255, 255", dim: "100, 100, 100" },
      strike: "60, 140, 255",
      strikeGlow: "100, 180, 255",
    },
    light: {
      web: { base: "51, 51, 58", glow: "88, 88, 98", dim: "214, 214, 220" },
      strike: "18, 90, 190",
      strikeGlow: "48, 122, 220",
    },
  },
};

export const ANIMATION = {
  breatheCycle: 8000,
  breatheAmount: 0.02,
  spawnDuration: 2000,
  strikeDuration: 1500,          // ms — how long the venom strike lasts
  strikeRadius: 250,             // px — how far the strike reaches from click
};

export function getWebConfig(width: number): WebConfig {
  if (width < 640) return WEB_CONFIGS.mobile;
  if (width < 1024) return WEB_CONFIGS.tablet;
  return WEB_CONFIGS.desktop;
}
