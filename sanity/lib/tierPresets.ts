/**
 * Tier-row presets for the tierList block.
 *
 * Every label here is on the ramp in src/lib/tierlist/arrangement.ts, so a
 * preset never produces a grey row. Tier _keys are the stable ids the live
 * lists already use (tl-s, tl-a, …); scripts and share codes that address a
 * tier by key see one convention whether the list was scaffolded, imported,
 * or typed by hand.
 *
 * "Numbered" is deliberately absent until Phase 6 (docs/TIER_LIST_SPEC.md)
 * adds `listType`; without it, rows labelled 1/2/3 would render grey and
 * mean nothing.
 *
 * Pure module: the schema's initialValue and the Studio input both import it.
 */

export interface TierPresetRow {
  _key: string;
  _type: "tier";
  label: string;
  entries: never[];
}

export interface TierPreset {
  id: string;
  title: string;
  /** Short line under the button in the Studio toolbar. */
  hint: string;
  labels: string[];
}

const row = (label: string): TierPresetRow => ({
  _key: `tl-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  _type: "tier",
  label,
  entries: [],
});

export const TIER_PRESETS: TierPreset[] = [
  { id: "classic", title: "S – F", hint: "The classic six", labels: ["S", "A", "B", "C", "D", "F"] },
  { id: "five", title: "S – D", hint: "Five rows, no floor", labels: ["S", "A", "B", "C", "D"] },
  { id: "four", title: "S – C", hint: "Four rows", labels: ["S", "A", "B", "C"] },
  { id: "three", title: "S / A / B", hint: "Three rows", labels: ["S", "A", "B"] },
];

export function presetRows(preset: TierPreset): TierPresetRow[] {
  return preset.labels.map(row);
}

/** What a freshly inserted Tier List block starts as. */
export const DEFAULT_TIER_ROWS = presetRows(TIER_PRESETS[0]);
