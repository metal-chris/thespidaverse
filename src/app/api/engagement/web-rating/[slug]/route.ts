import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { hashIP, getClientIP, isBot } from "@/lib/engagement/fingerprint";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { data, error } = await supabaseAdmin.rpc("get_web_rating_stats", {
      slug,
    });

    if (error) {
      console.error("[WebRating GET] Error:", error);
      return NextResponse.json({
        avgScore: 0,
        totalRatings: 0,
        distribution: {},
      });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
      },
    });
  } catch (error) {
    console.error("[WebRating GET] Unexpected error:", error);
    return NextResponse.json({
      avgScore: 0,
      totalRatings: 0,
      distribution: {},
    });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { score, honeypot } = body;

    // Honeypot check
    if (isBot(honeypot)) {
      // Return fake success to bots
      return NextResponse.json({ success: true, aggregated: { avgScore: 0, totalRatings: 0 } });
    }

    // Validate score
    if (typeof score !== "number" || score < 1 || score > 100 || !Number.isInteger(score)) {
      return NextResponse.json(
        { error: "Score must be an integer between 1 and 100." },
        { status: 400 }
      );
    }

    const ipHash = await hashIP(getClientIP(request));

    const { data, error } = await supabaseAdmin.rpc("submit_web_rating", {
      p_slug: slug,
      p_score: score,
      p_ip: ipHash,
    });

    if (error) {
      // Unique constraint violation = already rated
      if (error.code === "23505") {
        // Fetch their existing score
        const { data: existing } = await supabaseAdmin
          .from("web_ratings")
          .select("score")
          .eq("article_slug", slug)
          .eq("ip_hash", ipHash)
          .single();

        const { data: stats } = await supabaseAdmin.rpc(
          "get_web_rating_stats",
          { slug }
        );

        return NextResponse.json(
          {
            success: false,
            reason: "already_rated",
            existingScore: existing?.score,
            aggregated: stats,
          },
          { status: 409 }
        );
      }

      console.error("[WebRating POST] Error:", error);
      return NextResponse.json(
        { error: "Failed to save rating. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, aggregated: data });
  } catch (error) {
    console.error("[WebRating POST] Unexpected error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
