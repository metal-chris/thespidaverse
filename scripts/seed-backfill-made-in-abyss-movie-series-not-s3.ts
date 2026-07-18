/**
 * Backfill: 2026-03-30 — Made in Abyss Is Getting Movies Instead of S3
 *
 * Creates ONE unpublished draft in Sanity for the 2026-03-30 backfill slot
 * documented in the 'Backfill calendar' section of docs/CONTENT_WORKFLOW.md.
 * Backdates publishedAt to 2026-03-30T13:00:00.000Z so the archive
 * populates correctly.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-made-in-abyss-movie-series-not-s3.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-made-in-abyss-movie-series-not-s3.ts --dry    # Print plan, no writes
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
// Article schedule
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
    slug: "made-in-abyss-movie-series-not-s3",
    title: "Made in Abyss Is Getting Movies Instead of S3 and I Have Feelings About It",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "AnimeJapan just dropped the news: Made in Abyss isn't getting a Season 3. It's getting a film series. First movie hits October 2026. This is either genius or a slow-motion betrayal.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "thoughtful", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan happened this weekend and the biggest anime news to come out of it wasn't a new trailer or a season renewal — it was Made in Abyss confirming what the production rumor mill had been whispering for months: there is no Season 3. Instead, Kinema Citrus is taking the story forward through a series of theatrical films."),
      p("The first entry is called Made in Abyss: Awakening Mystery. It hits Japanese theaters October 23, 2026. No international window confirmed yet. Director Masayuki Kojima is back, the core voice cast is returning, and the studio's official press release describes it as the first in a 'series' — which means we are officially in movie-arc territory."),
      h2("Okay, but why?"),
      p("I get the business logic. After Season 2 ended in 2022, the gap between chapters in Tsukushi's manga has been long enough that adapting into a serialized TV format is increasingly awkward. A theatrical run gives you more flexibility on pacing, bigger production budgets per minute of runtime, and the kind of big-event energy that a new season in a crowded simulcast calendar doesn't always get."),
      p("Evangelion did it. Mushishi did it for its second half. Formats change. That's fine."),
      p("But there's a real tension here. Made in Abyss works because it breathes. The descent into the Abyss is slow and deliberate, the horror creeps in, the emotional weight builds over episodes. A 90-minute theatrical window does different things to that pacing than 12 episodes with end-credits music that makes you wait a week."),
      h2("What we know"),
      p("Kinema Citrus. Masayuki Kojima directing. Hideyuki Kurata on script. Kazuchika Kise and Yuka Kuroda back on character design. This isn't a production-in-name-only situation — the actual team is back. And for what it's worth, the studio knows how to make something feel cinematic rather than a cut-down TV episode."),
      p("October 23 for the first film. If the pattern holds, subsequent films could follow every six to twelve months. A full arc adaptation could stretch across 2027 and into 2028. Patience is the move."),
      h2("My take"),
      p("Cautiously on board. The production pedigree checks out, and if they're going theatrical it probably means they want to do the source material justice rather than rush it. The Riko and Reg story deserves the full treatment."),
      p("But I will be watching the first trailer very closely. And I'll be watching the runtime even more closely."),
      p("Hot take meter below — are you here for the movie era or do you want your Season 3?"),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "mia_movies_vs_s3",
        questionText: "Movies instead of S3 — are you here for it?",
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

  // Resolve category ID for each unique slug
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
