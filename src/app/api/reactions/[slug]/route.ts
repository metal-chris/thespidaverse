import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

const REACTION_TYPES = ["fire", "love", "mindblown", "cool", "trash"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

function reactionKey(slug: string) {
  return `reactions:${slug}`;
}

function rateLimitKey(slug: string, ip: string) {
  return `ratelimit:${slug}:${ip}`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const redis = getRedis();
  if (!redis) {
    // Return zeroes when Redis not configured
    const empty: Record<string, number> = {};
    for (const r of REACTION_TYPES) empty[r] = 0;
    return NextResponse.json({ reactions: empty, total: 0 });
  }

  const { slug } = await params;
  const data = await redis.hgetall(reactionKey(slug));

  const reactions: Record<string, number> = {};
  let total = 0;
  for (const r of REACTION_TYPES) {
    const count = Number(data?.[r] || 0);
    reactions[r] = count;
    total += count;
  }

  return NextResponse.json(
    { reactions, total },
    { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" } }
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Reactions not configured" }, { status: 503 });
  }

  const { slug } = await params;
  const body = await request.json();
  const reaction = body.reaction as string;

  if (!REACTION_TYPES.includes(reaction as ReactionType)) {
    return NextResponse.json(
      { error: `Invalid reaction. Must be one of: ${REACTION_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Rate limit: 1 reaction per slug per IP per 60s
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rlKey = rateLimitKey(slug, ip);
  const existing = await redis.get(rlKey);

  if (existing) {
    return NextResponse.json({ error: "Rate limited. Try again later." }, { status: 429 });
  }

  // Increment reaction count
  await redis.hincrby(reactionKey(slug), reaction, 1);

  // Set rate limit (60 second window)
  await redis.set(rlKey, "1", { ex: 60 });

  // Return updated counts
  const data = await redis.hgetall(reactionKey(slug));
  const reactions: Record<string, number> = {};
  let total = 0;
  for (const r of REACTION_TYPES) {
    const count = Number(data?.[r] || 0);
    reactions[r] = count;
    total += count;
  }

  return NextResponse.json({ reactions, total });
}
