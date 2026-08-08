/**
 * Backfill seed — 2026-03-30 (Mon) the-daily-bugle
 * Slot: oldest open backfill entry from docs/CONTENT_WORKFLOW.md
 *
 * Creates ONE unpublished draft in Sanity for the March 30 news beat:
 * Golden Kamuy Runaway Train Arc announced + MHA: Vigilantes S2 finale.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-golden-kamuy-runaway-train-arc-announced.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-golden-kamuy-runaway-train-arc-announced.ts --dry    # Print plan, no writes
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
 */

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry");

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ------------------------------------------------------------
// Portable Text helpers
// ------------------------------------------------------------

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  children: Span[];
  markDefs: never[];
};
type BodyItem = { style: "normal" | "h2" | "h3" | "h4" | "blockquote"; text: string };

function makeBody(items: BodyItem[]): Block[] {
  return items.map((item, i) => {
    const key = `k${i.toString().padStart(3, "0")}`;
    return {
      _type: "block",
      _key: key,
      style: item.style,
      children: [{ _type: "span", _key: `${key}s`, text: item.text, marks: [] }],
      markDefs: [],
    };
  });
}

const p = (text: string): BodyItem => ({ style: "normal", text });
const h2 = (text: string): BodyItem => ({ style: "h2", text });

// ------------------------------------------------------------
// Article
// ------------------------------------------------------------

type PollQuestion = {
  questionKey: string;
  questionText: string;
  questionType:
    | "yes_no"
    | "agree_scale"
    | "multiple_choice"
    | "slider"
    | "this_or_that"
    | "ranking"
    | "hot_take";
  options?: string[];
  rankingItems?: string[];
};

type ArticleSeed = {
  slug: string;
  title: string;
  format: string;
  series?: string;
  publishedAt: string;
  excerpt: string;
  mediaType: "movie" | "tv" | "game" | "anime" | "books" | "music";
  categorySlug: string;
  moodTags: string[];
  webRating?: number;
  readingTime: number;
  mediaLength?: string;
  spoilerFree: boolean;
  body: BodyItem[];
  enableCommunityRating: boolean;
  pollQuestions: PollQuestion[];
};

const ARTICLES: ArticleSeed[] = [
  // ----- Backfill: Mon 2026-03-30 — the-daily-bugle
  {
    slug: "golden-kamuy-runaway-train-arc-announced",
    title: "Golden Kamuy Just Set Up Its Endgame and MHA: Vigilantes Is Done for Now",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "March 30 is doing double duty for anime news: Runaway Train Arc locked in for winter, and MHA: Vigilantes just wrapped Season 2 with nothing announced after it. Good Monday.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news", "emotional"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("March 30 is doing a lot for anime watchers today."),
      p("Two pieces of news landed and they point in opposite directions emotionally: Golden Kamuy got an arc announcement that has me looking forward to winter, and MHA: Vigilantes quietly wrapped Season 2 on a note that left me needing a minute. Both of those things happened on a Monday. We take what we can get."),
      h2("Golden Kamuy: Runaway Train Arc Is Locked In"),
      p("Anime News Network confirmed this morning that the Golden Kamuy Final Arc is pushing into winter with the Runaway Train Arc, and dropped a new visual alongside the announcement. The current arc — which just closed out Episode 13 — has been building toward the series climax for a full year. The manga ended. The story is known to anyone who read ahead. The anime is now in the process of animating the actual ending of one of the best adventure series of the decade."),
      p("The Runaway Train arc is exactly what the name implies: stakes, motion, something happening at speed on tracks while most of the cast makes a sequence of questionable decisions under pressure. If you've been off the Golden Kamuy bus for a while, now is the window. You have until winter to catch up and there is genuinely no excuse not to — the complete run is sitting there."),
      p("The new visual is clean. Production looks like it's in good shape. I'm not going to pretend I'm calm about this."),
      h2("MHA: Vigilantes S2 Is Done"),
      p("My Hero Academia: Vigilantes dropped its Season 2 finale today after 13 episodes, and I want to have a word with everyone who still has not watched this series."),
      p("Vigilantes is the best non-main MHA content that exists. Full stop. It covers the underground hero scene in a way the main series never had space for, it lets characters breathe at a different pace, and the two seasons together are 26 episodes of genuinely well-constructed hero fiction. Season 2 stuck its landing. It ends somewhere satisfying and also somewhere that sets up more story that currently has no announced continuation."),
      p("Season 3 has not been announced. This is Bones. They will announce it when they are ready. In the meantime, Vigilantes sits at 26 episodes and is fully worth the time."),
      h2("The Monday Situation"),
      p("Two arcs closing on the same Monday is either strong scheduling or pure chaos depending on what your watchlist looked like going in. I'm personally landing on grateful that Golden Kamuy has a winter return date confirmed, while simultaneously annoyed the wait starts now."),
      p("How hyped are you for the Runaway Train Arc? Meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "runaway_train_arc_hype",
        questionText: "How hyped are you for Golden Kamuy's Runaway Train Arc?",
        questionType: "hot_take",
      },
    ],
  },
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seeding ${ARTICLES.length} backfill article draft(s)...`);
  if (dryRun) console.log("(dry run — no writes)");

  const uniqueCategorySlugs = Array.from(new Set(ARTICLES.map((a) => a.categorySlug)));
  const categoryDocs: Array<{ _id: string; slug: { current: string } }> = await client.fetch(
    `*[_type=="category" && slug.current in $slugs]{_id, slug}`,
    { slugs: uniqueCategorySlugs }
  );
  const categoryIdBySlug = new Map(categoryDocs.map((c) => [c.slug.current, c._id]));

  const missing = uniqueCategorySlugs.filter((s) => !categoryIdBySlug.has(s));
  if (missing.length) {
    console.error(`Missing categories in Sanity: ${missing.join(", ")}`);
    process.exit(1);
  }

  let created = 0;
  let failed = 0;

  for (const article of ARTICLES) {
    const docId = `drafts.backfill-${article.slug}`;
    const categoryId = categoryIdBySlug.get(article.categorySlug)!;

    const doc = {
      _id: docId,
      _type: "article",
      title: article.title,
      slug: { _type: "slug", current: article.slug },
      format: article.format,
      ...(article.series ? { series: article.series } : {}),
      publishedAt: article.publishedAt,
      excerpt: article.excerpt,
      body: makeBody(article.body),
      spoilerFree: article.spoilerFree,
      category: { _type: "reference", _ref: categoryId },
      moodTags: article.moodTags,
      mediaType: article.mediaType,
      ...(article.webRating !== undefined ? { webRating: article.webRating } : {}),
      readingTime: article.readingTime,
      ...(article.mediaLength ? { mediaLength: article.mediaLength } : {}),
      pollConfig: {
        enableCommunityRating: article.enableCommunityRating,
        pollQuestions: article.pollQuestions.map((q, i) => ({
          _key: `q${i}`,
          questionKey: q.questionKey,
          questionText: q.questionText,
          questionType: q.questionType,
          ...(q.options ? { options: q.options } : {}),
          ...(q.rankingItems ? { rankingItems: q.rankingItems } : {}),
        })),
      },
    };

    console.log(`  ${article.publishedAt.slice(0, 10)}  ${article.format.padEnd(20)}  ${article.title}`);

    if (dryRun) continue;

    try {
      await client.createOrReplace(doc);
      created++;
    } catch (err) {
      failed++;
      console.error(`    failed: ${(err as Error).message}`);
    }
  }

  console.log(`\nDone. created=${created} failed=${failed}${dryRun ? " (dry run)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
