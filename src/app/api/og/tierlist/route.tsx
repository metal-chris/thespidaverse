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
function WebMark({ size, color }: { size: number; color: string }) {
  const radials = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    return {
      x2: 12 + Math.cos(a) * 9.4,
      y2: 12 + Math.sin(a) * 9.4,
    };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
      <circle cx="12" cy="12" r="9.4" />
      <circle cx="12" cy="12" r="5" />
      {radials.map((r, i) => (
        <line key={i} x1="12" y1="12" x2={r.x2} y2={r.y2} />
      ))}
      <circle cx="15.5" cy="8.5" r="1.8" fill={color} stroke="none" />
    </svg>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <WebMark size={26} color={ACCENT} />
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
        <WebMark size={110} color={ACCENT} />
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
            {isRearranged ? "A READER'S RANKING" : "THE RANKING"}
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
