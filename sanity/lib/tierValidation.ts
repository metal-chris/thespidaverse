/**
 * Studio validation for the tierList block. Warnings, never errors: the
 * author can always publish; these make the consequence visible first.
 *
 * Every check here is a thing that has already gone wrong once, or is one
 * edit away from it:
 *  - a label the ramp does not know rendered grey with no signal (B+, Aug 2026)
 *  - the wire format caps a list at 36 entries; past that, share links break
 *  - two rows with the same label make the Maker's letter shortcut ambiguous
 *  - in index mode a chip jumps to `#anchor`; an anchor matching no heading
 *    is a dead link the reader discovers by nothing happening
 *
 * Pure module. Reads only the validation context Sanity hands it.
 */
import type { ValidationContext } from "sanity";
import { rampColor } from "@/lib/tierlist/arrangement";
import { slugify } from "@/lib/utils";

/** Single base-36 char per entry index in the share code. Mirrors arrangement.ts. */
export const MAX_ENTRIES = 36;

type Keyed = { _key?: string };
type TierLike = Keyed & { label?: string; color?: string; entries?: Array<Keyed & { title?: string; anchor?: string }> };
type BlockLike = Keyed & { _type?: string; mode?: string; tiers?: TierLike[] };
type PTBlock = { _type?: string; style?: string; children?: Array<{ text?: string }> };

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `label` field: the row will render grey and nothing has said so. */
export function validateTierLabel(label: string | undefined, ctx: ValidationContext): true | string {
  const tier = ctx.parent as TierLike | undefined;
  if (!label || !label.trim()) return true; // `required()` handles empty
  if (rampColor(label) || tier?.color) return true;
  return `"${label.trim()}" is not on the tier ramp, so this row renders grey. Use a grade (S+ … F-) or pick a colour override.`;
}

/** `color` field: an override that is not a hex renders as no colour at all. */
export function validateTierColor(color: string | undefined): true | string {
  if (!color) return true;
  return HEX.test(color.trim()) ? true : `"${color}" is not a hex colour (#RGB or #RRGGBB). The row will render with no background.`;
}

/** `tiers` array: duplicate labels, and the wire-format entry cap. */
export function validateTiers(tiers: TierLike[] | undefined): true | string {
  if (!tiers?.length) return true;
  const problems: string[] = [];

  const seen = new Map<string, number>();
  for (const t of tiers) {
    const k = (t.label ?? "").trim().toUpperCase();
    if (!k) continue;
    seen.set(k, (seen.get(k) ?? 0) + 1);
  }
  const dupes = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
  if (dupes.length) problems.push(`Duplicate tier label${dupes.length > 1 ? "s" : ""}: ${dupes.join(", ")}. The Maker's letter shortcut will only ever reach the first.`);

  // The one that actually breaks things. Entries are bucketed by tier _key
  // in canonicalArrangement(), so two tiers sharing a key collapse into one:
  // the first tier's entries drop out of the arrangement entirely, the
  // author's ranking encodes a duplicate index, and that code fails to
  // decode. Marvel Rivals shipped this way ("B+" and "B" both keyed tl-b).
  const keyCount = new Map<string, number>();
  for (const t of tiers) if (t._key) keyCount.set(t._key, (keyCount.get(t._key) ?? 0) + 1);
  const dupKeys = [...keyCount].filter(([, n]) => n > 1).map(([k]) => k);
  if (dupKeys.length) problems.push(`Two tiers share the internal key ${dupKeys.join(", ")}. Entries in the first will disappear from the Maker and share links will not decode. Delete one of the rows and add it again to get a fresh key.`);

  const total = tiers.reduce((n, t) => n + (t.entries?.length ?? 0), 0);
  if (total > MAX_ENTRIES) problems.push(`${total} entries across all tiers; the share-link format holds ${MAX_ENTRIES}. Readers can still remix, but "Share" and "Compare" links will not encode entries past #${MAX_ENTRIES}.`);

  const anchors = new Map<string, number>();
  for (const t of tiers) for (const e of t.entries ?? []) if (e.anchor) anchors.set(e.anchor, (anchors.get(e.anchor) ?? 0) + 1);
  const dupA = [...anchors].filter(([, n]) => n > 1).map(([a]) => a);
  if (dupA.length) problems.push(`Two entries share an anchor (${dupA.join(", ")}); both chips will jump to the same heading.`);

  return problems.length ? problems.join(" ") : true;
}

/** Find the tierList block this field lives in, via the validation path. */
function enclosingBlock(ctx: ValidationContext): BlockLike | undefined {
  const path = ctx.path ?? [];
  const body = (ctx.document as { body?: BlockLike[] } | undefined)?.body;
  if (!body || path[0] !== "body") return undefined;
  const seg = path[1] as Keyed | undefined;
  const key = seg && typeof seg === "object" ? seg._key : undefined;
  return key ? body.find((b) => b._key === key) : undefined;
}

/** `anchor` field, index mode only: must match a heading id the page will actually render. */
export function validateEntryAnchor(anchor: string | undefined, ctx: ValidationContext): true | string {
  if (!anchor) return true;
  const block = enclosingBlock(ctx);
  // Capsule mode never renders the anchor link (TierListChart gates it on
  // mode === "index"), so a stale anchor there is inert, not broken.
  if (!block || block.mode !== "index") return true;
  const body = (ctx.document as { body?: PTBlock[] } | undefined)?.body ?? [];
  const ids = new Set(
    body
      .filter((b) => b._type === "block" && (b.style === "h2" || b.style === "h3"))
      .map((b) => slugify((b.children ?? []).map((c) => c.text ?? "").join("")))
  );
  if (ids.has(anchor)) return true;
  return `No heading in the body has the id "${anchor}". In index mode this chip jumps to that id, so the jump will do nothing. Heading ids are the slugified heading text, e.g. "3-spirited-away-2001".`;
}
