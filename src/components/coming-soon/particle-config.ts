// ============================================================
// Miles Morales Spider-Web Config
// ============================================================

export type Palette = "miles" | "peter" | "venom";

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

export const PALETTES: Record<Palette, PaletteColors> = {
  miles: {
    web: {
      base: "232, 35, 52",        // #E82334 — red
      glow: "255, 60, 80",        // hot red glow
      dim: "140, 20, 30",         // dark red
    },
    strike: "255, 220, 40",       // yellow lightning
    strikeGlow: "255, 240, 100",  // bright yellow
  },
  peter: {
    web: {
      base: "30, 80, 220",         // classic Spidey blue
      glow: "60, 120, 255",        // bright blue glow
      dim: "20, 50, 140",          // dark blue
    },
    strike: "220, 220, 240",      // silver-white web fluid
    strikeGlow: "255, 255, 255",  // bright white
  },
  venom: {
    web: {
      base: "220, 220, 220",      // white-ish
      glow: "255, 255, 255",      // pure white glow
      dim: "100, 100, 100",       // grey
    },
    strike: "60, 140, 255",       // blue lightning
    strikeGlow: "100, 180, 255",  // bright blue
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
