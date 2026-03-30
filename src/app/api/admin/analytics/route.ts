import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Per-post web rating stats
    const { data: ratingRows } = await supabaseAdmin
      .from("web_ratings")
      .select("article_slug, score");

    // Per-post poll response counts
    const { data: pollRows } = await supabaseAdmin
      .from("poll_responses")
      .select("article_slug, question_key");

    // Aggregate per-post rating stats
    const postMap = new Map<
      string,
      { scores: number[]; pollCount: number }
    >();

    for (const row of ratingRows ?? []) {
      const entry = postMap.get(row.article_slug) ?? {
        scores: [],
        pollCount: 0,
      };
      entry.scores.push(row.score);
      postMap.set(row.article_slug, entry);
    }

    for (const row of pollRows ?? []) {
      const entry = postMap.get(row.article_slug) ?? {
        scores: [],
        pollCount: 0,
      };
      entry.pollCount++;
      postMap.set(row.article_slug, entry);
    }

    const posts = Array.from(postMap.entries()).map(([slug, { scores, pollCount }]) => {
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      return {
        article_slug: slug,
        avg_score: avg,
        total_ratings: scores.length,
        poll_responses: pollCount,
      };
    });

    // Totals
    const allScores = posts.flatMap((p) =>
      Array(p.total_ratings).fill(p.avg_score)
    );
    const totalRatings = posts.reduce((s, p) => s + p.total_ratings, 0);
    const totalPolls = posts.reduce((s, p) => s + p.poll_responses, 0);
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

    return NextResponse.json({
      posts,
      categories: [], // Populated when Sanity integration adds category data
      totals: {
        totalRatings,
        totalPolls,
        avgScore,
        postsWithRatings: posts.filter((p) => p.total_ratings > 0).length,
      },
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
