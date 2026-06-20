/**
 * Backfill: 2026-03-30 — the-daily-bugle
 * "Steel Ball Run 2nd Stage Announced at AnimeJapan — and Netflix Is Already Making It Weird"
 *
 * Drains the 2026-03-30 slot from the backfill calendar in docs/CONTENT_WORKFLOW.md.
 * Run locally after merging to seed the draft into Sanity Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-steel-ball-run-2nd-stage-netflix-fall-2026.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-steel-ball-run-2nd-stage-netflix-fall-2026.ts --dry    # Print plan, no writes
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
    slug: "steel-ball-run-2nd-stage-netflix-fall-2026",
    title: "Steel Ball Run 2nd Stage Announced at AnimeJapan — and Netflix Is Already Making It Weird",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "The RED Stage event at AnimeJapan dropped the 2nd Stage teaser for Steel Ball Run and then refused to say when it would actually air. Netflix cleared it up after the backlash. Fall 2026, weekly.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "frustrated"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan weekend came through. Saturday's RED Stage event for Steel Ball Run: JoJo's Bizarre Adventure dropped the 2nd Stage teaser, and the voice cast — Johnny, Gyro, Diego, Sandman, Pocoloco, all in the room — made it feel like the event it was supposed to be."),
      p("And then Netflix's representative took the mic and refused to say when 2nd Stage would actually air."),
      p("Just: 'later in 2026.' No month. No season. No release window. In front of a room full of people who have been waiting for Part 7 to get the full-season treatment for years."),
      p("The backlash was fast. Within 48 hours Netflix had clarified: Fall 2026, weekly episodes, split-cour format. Which is what everyone wanted to hear the first time. Why this had to happen in that order, I will never understand."),
      h2("What the first episode did right"),
      p("Quick recap: the 47-minute special that dropped March 19 covered Stage 1 of the Steel Ball Run race — Johnny Joestar and Gyro Zeppeli getting through the first leg of the cross-country contest while the field sorts itself out. The animation was Hirohiko Araki's surreal linework adapted into motion with actual budget behind it, and the race sequences moved the way I needed them to."),
      p("The voice cast landed. Gyro's energy is exactly what the character needed — big and theatrical without crossing into parody. Johnny's quiet desperation carries across every scene he's in. If 2nd Stage keeps that production level, this is going to be the JoJo adaptation run that everyone points to."),
      h2("The actual concern"),
      p("Split-cour fall 2026 means we're looking at a Part 2 finish sometime in early-to-mid 2027 at the earliest — assuming they don't pull another pause. Steel Ball Run is a long manga. The first stage barely scratches the surface of where the story goes. That's fine. The pacing needs to breathe."),
      p("What's less fine is that Netflix's track record with split-cour anime is inconsistent. The gap between cours can kill momentum. The community loses the thread. The algorithm buries the show between drops. We've seen it happen to better series than this."),
      p("Hopefully the weekly format keeps the conversation alive. But that's on Netflix to not fumble the distribution."),
      h2("Spider-sense"),
      p("Fall 2026, weekly, Netflix. Set the reminder now. The first episode proved the adaptation is in capable hands. The announcement fumble was a PR problem, not a creative one — and creative is all that ultimately matters."),
      p("How hyped are you? Slide the meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "sbr_2nd_stage_hype",
        questionText: "How hyped are you for Steel Ball Run 2nd Stage?",
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
