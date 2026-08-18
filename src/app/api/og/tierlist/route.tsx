import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { arrangedRows, tierColor } from "@/lib/tierlist/arrangement";
import type { TierListBlock } from "@/types";

export const runtime = "edge";

/**
 * The share card for a tier-list arrangement: /api/og/tierlist?slug=&tl=.
 *
 * Social platforms render links as one static image, so this route IS the
 * share experience — it decodes the same `tl` code the Maker writes and draws
 * the reader's actual rows, not a generic article card.
 *
 * Design constraints, in order:
 *  - Zero remote fetches. Posters would make the card prettier and also give
 *    it up to 36 ways to time out or half-render inside a crawler's fetch
 *    budget; a card that always renders beats one that is sometimes better.
 *  - Sanity is queried over plain HTTP (public read on the CDN endpoint), not
 *    through the provider layer — the mock provider and its faker payloads
 *    have no place on the edge runtime.
 *  - Every failure path still returns a branded 1200x630 image. A broken tl
 *    code falls back to the author's ranking; an unknown slug falls back to a
 *    plain brand card. Crawlers cache whatever they first see, so an error
 *    page here would become the share card.
 */

const PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "jvovrf9w";
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const SIZE = { width: 1200, height: 630 };
const BG = "#0A0A0A";
const CARD = "#141414";
const FG = "#EDEDED";
const MUTED = "#9A9A9A";
const ACCENT = "#E82334";

/** The orb-web mark, drawn inline — the same geometry family as the nav icon. */
/**
 * The F1 mark, for Satori.
 *
 * A local copy rather than an import of SpidaverseMark, for one reason: that
 * component paints in `currentColor`, which Satori does not resolve — every
 * stroke would come out black on a black card. The geometry below is EXTRACTED
 * from that component programmatically, not retyped, so the two cannot drift
 * by transcription; regenerate it if the mark changes.
 *
 * This replaces an inline copy of Kumo Club's orb-web (two rings, eight
 * radials, a dew-drop node) that stood in as the brand mark on every share
 * card back when this site had no mark of its own.
 */
function SpidaverseMarkOG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <polyline points="69.43,48.44 80.23,28.13 89.07,23.82" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="50.57,48.44 39.77,28.13 30.93,23.82" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="72.18,52.75 93.38,39.5 105.61,40.36" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="47.82,52.75 26.62,39.5 14.39,40.36" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="71.95,57.92 96.89,59.66 106.14,66.38" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="48.05,57.92 23.11,59.66 13.86,66.38" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="68.36,62.43 86.97,75.95 93.85,91.4" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="51.64,62.43 33.03,75.95 26.15,91.4" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 60 64 C 69.18 64 73.5 73 73.5 82.6 C 73.5 89.2 67.29 94 60 94 C 52.71 94 46.5 89.2 46.5 82.6 C 46.5 73 50.82 64 60 64 Z" fill={color} />
      <ellipse cx="60" cy="55" rx="12.5" ry="10" fill={color} />
      <ellipse cx="60" cy="39" rx="8.5" ry="7.5" fill={color} />
      <polygon points="108.04,79.9 79.9,108.04 40.1,108.04 11.96,79.9 11.96,40.1 40.1,11.96 79.9,11.96 108.04,40.1" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="94.59,74.33 74.33,94.59 45.67,94.59 25.41,74.33 25.41,45.67 45.67,25.41 74.33,25.41 94.59,45.67" fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <SpidaverseMarkOG size={30} color={ACCENT} />
      <div style={{ display: "flex", fontSize: 19, fontWeight: 700, color: FG, letterSpacing: 2 }}>
        THE SPIDAVERSE
      </div>
    </div>
  );
}

function fallbackCard(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: BG,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <SpidaverseMarkOG size={120} color={ACCENT} />
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: FG }}>{message}</div>
        <div style={{ display: "flex", fontSize: 24, color: MUTED, letterSpacing: 3 }}>
          THE SPIDAVERSE
        </div>
      </div>
    ),
    SIZE
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const tl = searchParams.get("tl");
  /* Optional signature from the Maker's Share panel. Clipped and stripped of
     control characters here as well as at the input: this route is reachable
     with any query string, and the value is drawn as text into an image, so
     it is treated as untrusted either way. Satori renders strings as text
     nodes, never as markup, so there is nothing to inject — the cap is about
     the card staying legible. */
  const by = (searchParams.get("by") ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 24);

  if (!slug) return fallbackCard("A reader's tier list");

  let article: { title?: string; block?: TierListBlock } | null = null;
  try {
    const query = `*[_type == "article" && slug.current == $slug][0]{title, "block": body[_type == "tierList"][0]}`;
    const url = `https://${PROJECT}.apicdn.sanity.io/v2025-02-19/data/query/${DATASET}?query=${encodeURIComponent(query)}&%24slug=${encodeURIComponent(JSON.stringify(slug))}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (res.ok) article = (await res.json()).result ?? null;
  } catch {
    // fall through to the brand card
  }

  const block = article?.block;
  if (!article?.title || !block?.tiers?.length) return fallbackCard("A reader's tier list");

  const rows = arrangedRows(block, tl).filter((r) => r.entries.length > 0);
  const isRearranged = !!tl;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          padding: "36px 56px 30px",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Header: what this is + whose it is */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 4,
              color: ACCENT,
            }}
          >
            {isRearranged ? (by ? `${by.toUpperCase()}'S RANKING` : "A READER'S RANKING") : "THE RANKING"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 800,
              color: FG,
              lineHeight: 1.15,
            }}
          >
            {article.title}
          </div>
        </div>

        {/* Tier rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 7,
            marginTop: 20,
            flexGrow: 1,
          }}
        >
          {rows.slice(0, 6).map((row) => {
            const names = row.entries.map((e) => e.title);
            // One line per tier; platforms downscale hard, so favour fewer,
            // larger names over completeness. The +N tail says what's cut.
            const shown = names.slice(0, 3);
            const extra = names.length - shown.length;
            return (
              <div
                key={row.tier._key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: CARD,
                  borderRadius: 10,
                  padding: "7px 16px 7px 7px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 46,
                    height: 46,
                    borderRadius: 8,
                    fontSize: 27,
                    fontWeight: 800,
                    color: "#141414",
                    background: tierColor(row.tier),
                    flexShrink: 0,
                  }}
                >
                  {row.tier.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 21,
                    color: FG,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {shown.join("  ·  ") + (extra > 0 ? `  ·  +${extra}` : "")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer: brand + the invitation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 18,
          }}
        >
          <Brand />
          <div style={{ display: "flex", fontSize: 19, color: MUTED }}>
            Make your own — no account needed
          </div>
        </div>
      </div>
    ),
    SIZE
  );
}
