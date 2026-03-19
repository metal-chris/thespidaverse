import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const REACTION_TYPES = ["fire", "love", "mindblown", "cool", "trash"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

// Hash IP address for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get reaction counts from Supabase
    const { data, error } = await supabaseAdmin.rpc('get_reaction_counts', { slug });

    if (error) {
      console.error('[Reactions GET] Error:', error);
      // Return zeroes on error
      const empty: Record<string, number> = {};
      for (const r of REACTION_TYPES) empty[r] = 0;
      return NextResponse.json({ reactions: empty, total: 0 });
    }

    // Transform array of {reaction_type, count} to object
    const reactions: Record<string, number> = {};
    let total = 0;
    
    // Initialize all reaction types to 0
    for (const r of REACTION_TYPES) {
      reactions[r] = 0;
    }
    
    // Fill in actual counts
    if (data) {
      for (const row of data) {
        reactions[row.reaction_type] = Number(row.count);
        total += Number(row.count);
      }
    }

    return NextResponse.json(
      { reactions, total },
      { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=5" } }
    );
  } catch (error) {
    console.error('[Reactions GET] Unexpected error:', error);
    const empty: Record<string, number> = {};
    for (const r of REACTION_TYPES) empty[r] = 0;
    return NextResponse.json({ reactions: empty, total: 0 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const reaction = body.reaction as string;

    if (!REACTION_TYPES.includes(reaction as ReactionType)) {
      return NextResponse.json(
        { error: `Invalid reaction. Must be one of: ${REACTION_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Get and hash IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = await hashIP(ip);

    // Check rate limit using Supabase function
    const { data: canReactData, error: rateLimitError } = await supabaseAdmin.rpc('can_react', {
      slug,
      ip: ipHash
    });

    if (rateLimitError) {
      console.error('[Reactions POST] Rate limit check error:', rateLimitError);
      return NextResponse.json(
        { error: "Failed to check rate limit. Please try again." },
        { status: 500 }
      );
    }

    if (!canReactData) {
      return NextResponse.json(
        { error: "Rate limited. Try again later." },
        { status: 429 }
      );
    }

    // Insert reaction
    const { error: insertError } = await supabaseAdmin
      .from('article_reactions')
      .insert({
        article_slug: slug,
        reaction_type: reaction,
        ip_hash: ipHash
      });

    if (insertError) {
      // Check if it's a duplicate (unique constraint violation)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: "You've already reacted with this type." },
          { status: 409 }
        );
      }
      console.error('[Reactions POST] Insert error:', insertError);
      return NextResponse.json(
        { error: "Failed to save reaction. Please try again." },
        { status: 500 }
      );
    }

    // Get updated counts
    const { data: countsData, error: countsError } = await supabaseAdmin.rpc('get_reaction_counts', { slug });

    if (countsError) {
      console.error('[Reactions POST] Get counts error:', countsError);
      // Still return success since reaction was saved
      return NextResponse.json({ ok: true });
    }

    // Transform to expected format
    const reactions: Record<string, number> = {};
    let total = 0;
    
    for (const r of REACTION_TYPES) {
      reactions[r] = 0;
    }
    
    if (countsData) {
      for (const row of countsData) {
        reactions[row.reaction_type] = Number(row.count);
        total += Number(row.count);
      }
    }

    return NextResponse.json({ reactions, total });
  } catch (error) {
    console.error('[Reactions POST] Unexpected error:', error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
