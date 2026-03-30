import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const { data, error } = await supabaseAdmin.rpc(
      "get_engagement_results",
      { slug }
    );

    if (error) {
      console.error("[Engagement Results GET] Error:", error);
      return NextResponse.json({
        webRating: { avgScore: 0, totalRatings: 0, distribution: {} },
        polls: {},
      });
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
      },
    });
  } catch (error) {
    console.error("[Engagement Results GET] Unexpected error:", error);
    return NextResponse.json({
      webRating: { avgScore: 0, totalRatings: 0, distribution: {} },
      polls: {},
    });
  }
}
