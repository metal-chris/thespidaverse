"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { TierEntry, TierListBlock } from "@/types";

/**
 * Read-only tier-list chart for Portable Text (`_type: "tierList"`).
 *
 * Chips are small 2:3 posters grouped into classic S/A/B/… rows; each chip
 * deep-links to its entry's heading in the article, so the chart doubles as
 * a visual table of contents for Gauntlet pieces.
 *
 * Phase 1 (the interactive "make your own" Maker) upgrades this component in
 * place — the schema and this read-only view are its foundation, which is why
 * entries carry stable _keys.
 */

// The classic tier ramp. Fixed rather than theme-derived on purpose: this is
// recognizable tier-list iconography, and it sits on the dark card in all
// three site themes. Schema `color` overrides per tier.
const TIER_COLORS: Record<string, string> = {
  S: "#E85A4F",
  A: "#E8944F",
  B: "#E8C94F",
  C: "#6FC46F",
  D: "#5FA8DC",
  E: "#4FC4B0",
  F: "#A66FC4",
};

function Chip({ entry, rank }: { entry: TierEntry; rank: number }) {
  let imageUrl = "";
  if (entry.image) {
    try {
      imageUrl = urlFor(entry.image).width(200).url() || "";
    } catch {
      // Mock data has fake asset refs — fall back to mockUrl below
    }
    if (!imageUrl) imageUrl = entry.image.mockUrl || "";
  }

  const label = entry.year ? `${entry.title} (${entry.year})` : entry.title;

  const face = (
    <span className="relative block w-16 sm:w-20 aspect-[2/3] overflow-hidden rounded bg-muted ring-1 ring-border transition-transform duration-150 group-hover:scale-[1.04] group-hover:ring-accent group-focus-visible:ring-accent">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${label} poster`}
          fill
          sizes="80px"
          className="object-cover"
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center p-1 text-center text-[9px] leading-tight text-muted-foreground">
          {entry.title}
        </span>
      )}
      <span className="absolute top-0.5 left-0.5 rounded-sm bg-black/75 px-1 font-mono text-[10px] font-bold tabular-nums text-white">
        {rank}
      </span>
    </span>
  );

  // A chip without an anchor still renders — it just isn't a link.
  return entry.anchor ? (
    <a href={`#${entry.anchor}`} title={label} aria-label={`Jump to ${label}`} className="group">
      {face}
    </a>
  ) : (
    <span title={label} className="group">
      {face}
    </span>
  );
}

export function TierListChart({ value }: { value: TierListBlock }) {
  if (!value?.tiers?.length) return null;

  // Overall rank runs left-to-right, top tier first — the chip badges are the
  // article's 1–N ordering, not per-tier position.
  let rank = 0;

  return (
    <figure className="my-10 not-prose overflow-hidden rounded-lg ring-1 ring-border">
      {value.title && (
        <figcaption className="border-b border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {value.title}
        </figcaption>
      )}
      <div className="flex flex-col gap-px bg-border">
        {value.tiers.map((tier) => (
          <div key={tier._key} className="flex items-stretch gap-px">
            <div
              className="grid w-12 flex-none place-items-center text-xl font-black sm:w-16"
              style={{
                backgroundColor: tier.color || TIER_COLORS[tier.label] || "#8A8A8A",
                color: "#141414",
              }}
            >
              {tier.label}
            </div>
            <div className="flex flex-1 flex-wrap gap-2 bg-card p-2">
              {tier.entries?.map((entry) => {
                rank += 1;
                return <Chip key={entry._key} entry={entry} rank={rank} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
