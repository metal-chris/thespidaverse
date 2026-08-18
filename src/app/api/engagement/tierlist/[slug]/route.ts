import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hashIP, getClientIP, isBot } from "@/lib/engagement/fingerprint";
import { getProvider } from "@/lib/providers";
import { decodeArrangement, flatten, type Arrangement } from "@/lib/tierlist/arrangement";
import { MIN_RESPONSES, aggregate } from "@/lib/tierlist/poll";
import type { TierListBlock } from "@/types";

/**
 * "Where readers put it" — the tier-list poll (docs/TIER_LIST_SPEC.md, Phase 5).
 *
 * POST stores one reader's arrangement; GET returns the crowd's board.
 *
 * Both degrade to silence rather than to an error. The table arrives by hand
 * through the Supabase SQL editor (docs/APPLY_MIGRATION.md), so until it
 * exists every GET answers "no responses yet" and the article renders exactly
 * as it does today. A poll is an enhancement; it must never be the reason a
 * page breaks.
 */

/** Staging can lower the threshold; production should not. */
const minResponses = (() => {
  const raw = Number(process.env.TIER_POLL_MIN_RESPONSES);
  return Number.isFinite(raw) && raw > 0 ? raw : MIN_RESPONSES;
})();

interface Ctx {
  params: Promise<{ slug: string }>;
}

function findBlock(body: unknown[], blockKey: string | null): TierListBlock | null {
  const blocks = (body ?? []).filter(
    (b) => (b as { _type?: string })?._type === "tierList"
  ) as TierListBlock[];
  if (!blocks.length) return null;
  if (!blockKey) return blocks[0];
  return blocks.find((b) => (b as { _key?: string })._key === blockKey) ?? null;
}

async function loadBlock(slug: string, blockKey: string | null) {
  const article = await getProvider().getArticleBySlug(slug);
  if (!article) return null;
  return findBlock(article.body as unknown[], blockKey);
}

/* ── POST: submit one arrangement ─────────────────────────────── */

export async function POST(request: Request, { params }: Ctx) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { blockKey, code, honeypot } = body ?? {};

    // Match the other engagement routes: bots get a success they can't detect.
    if (isBot(honeypot)) return NextResponse.json({ success: true, count: 0 });

    if (typeof code !== "string" || !code.trim() || code.length > 512) {
      return NextResponse.json({ error: "code is required." }, { status: 400 });
    }
    if (typeof blockKey !== "string" || !blockKey.trim()) {
      return NextResponse.json({ error: "blockKey is required." }, { status: 400 });
    }

    // Validate against the live block, so a malformed or stale code is
    // rejected at the door rather than silently skipped at read time.
    const block = await loadBlock(slug, blockKey);
    if (!block) return NextResponse.json({ error: "No such tier list." }, { status: 404 });
    if (block.poll === false) {
      return NextResponse.json({ error: "This list is not collecting responses." }, { status: 403 });
    }

    // Decode under the block's own rules. A numbered list's buckets are free
    // in number — splitting a tie adds one — so validating it as `tiers` would
    // reject exactly the arrangements the poll exists to collect.
    const listType = block.listType ?? "tiers";
    const tiers = block.tiers ?? [];
    const items = flatten(tiers);
    if (!decodeArrangement(code, tiers, items, listType)) {
      return NextResponse.json({ error: "That arrangement does not fit this list." }, { status: 400 });
    }

    const ipHash = await hashIP(getClientIP(request));
    const { data, error } = await supabaseAdmin.rpc("submit_tier_list_response", {
      p_slug: slug,
      p_block_key: blockKey,
      p_code: code,
      p_list_type: listType,
      p_ip: ipHash,
    });

    if (error) {
      console.error("[TierListPoll POST]", error);
      return NextResponse.json({ error: "Could not save that." }, { status: 503 });
    }

    return NextResponse.json({ success: true, count: (data as { count?: number })?.count ?? 0 });
  } catch (e) {
    console.error("[TierListPoll POST]", e);
    return NextResponse.json({ error: "Could not save that." }, { status: 500 });
  }
}

/* ── GET: the crowd's board ───────────────────────────────────── */

export async function GET(request: Request, { params }: Ctx) {
  const empty = { count: 0, belowThreshold: true, minResponses };
  try {
    const { slug } = await params;
    const blockKey = new URL(request.url).searchParams.get("block");

    const block = await loadBlock(slug, blockKey);
    if (!block || block.poll === false) return NextResponse.json(empty);

    const { data, error } = await supabaseAdmin.rpc("get_tier_list_codes", {
      p_slug: slug,
      p_block_key: blockKey ?? (block as { _key?: string })._key ?? "",
    });
    // Table not applied yet, or Supabase unreachable: say "nothing yet".
    if (error) return NextResponse.json(empty);

    const codes = Array.isArray(data) ? (data as string[]) : [];
    if (codes.length < minResponses) {
      return NextResponse.json({ count: codes.length, belowThreshold: true, minResponses });
    }

    const listType = block.listType ?? "tiers";
    const tiers = block.tiers ?? [];
    const items = flatten(tiers);
    const decoded: Arrangement[] = [];
    let undecodable = 0;
    for (const c of codes) {
      const a = decodeArrangement(c, tiers, items, listType);
      if (a) decoded.push(a);
      else undecodable++;
    }

    const agg = aggregate(
      decoded,
      tiers.map((t) => t._key),
      items.map((it) => it.entry._key),
      undecodable
    );

    return NextResponse.json(
      { ...agg, belowThreshold: false, minResponses },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (e) {
    console.error("[TierListPoll GET]", e);
    return NextResponse.json(empty);
  }
}
