/**
 * Backfill seed — 2026-03-30 (Mon) — the-daily-bugle
 * "Golden Kamuy Said 'Final Season.' Now There's a Runaway Train Arc Coming Winter 2027."
 *
 * Creates ONE unpublished draft in Sanity with a backdated publishedAt so the
 * archive fills correctly. The _id prefix is `drafts.backfill-` to distinguish
 * these from forward-scheduled posts in Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-golden-kamuy-runaway-train-2027.ts          # Create / overwrite
 *   npx tsx scripts/seed-backfill-golden-kamuy-runaway-train-2027.ts --dry    # Print plan, no writes
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
  // ----- 2026-03-30 (Mon) — the-daily-bugle
  {
    slug: "golden-kamuy-runaway-train-2027",
    title: "Golden Kamuy Said 'Final Season.' Now There's a Runaway Train Arc Coming Winter 2027.",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "The current final season just wrapped, and they immediately announced more. The Runaway Train Arc is the actual finale. Winter 2027. Of course.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news", "emotional"],
    readingTime: 3,
    mediaLength: "ongoing (final arc Winter 2027)",
    spoilerFree: false,
    body: [
      p("If you've been watching Golden Kamuy's 'final season' and feeling like something was being left on the table — you were right."),
      p("On March 30, Studio Brain's Base and the Golden Kamuy production team wrapped the current cour and immediately dropped a teaser visual for the Runaway Train Arc, confirmed for Winter 2027. This is the actual final arc. The one that closes out Sugimoto's nine-year journey across Hokkaido, the Ainu gold, Hijikata's ghost army, and all the deeply unhinged characters who've been bouncing off each other since 2018."),
      p("The 14 remaining manga chapters — the absolute final stretch — are being adapted into a single mini-arc. A runaway train. As a finale device. In a series that has made every single piece of period-accurate Hokkaido infrastructure feel dangerous and alive. I am not surprised. I am very much here for this."),
      h2("What Golden Kamuy is (if you're late)"),
      p("The elevator pitch: post-Russo-Japanese War, a soldier named Sugimoto teams up with an Ainu girl named Asirpa to chase a cache of stolen gold whose map is tattooed across the bodies of escaped convicts. The story is part survival thriller, part culinary anime, part Hokkaido tourism ad, part something you cannot fully explain to another person until they've seen it. Every few episodes the show invents a new reason for someone to get their shirt off and it somehow always works."),
      p("The current final season has been running since January 2026, covering the Tokyo arcs — which are dense and political and occasionally slow in a way the show hasn't been before. The Hijikata sections specifically have been doing heavy lifting, and the March 9 visual of him facing his past and present selves was already telling you exactly where the emotional register was going."),
      h2("Why the Runaway Train Arc matters"),
      p("This is the part where the gold plot actually resolves. Where the alliances that have been shifting since Season 1 get a terminal answer. The teaser visual — a train descending into chaos with multiple factions converging at once — is Golden Kamuy logic at full speed. Everyone showing up at the worst possible time to do the worst possible thing for reasons that make complete internal sense. That's the show."),
      p("Winter 2027 gives Brain's Base the production window to do this right. I'd rather they take the time than rush a nine-year story into the wrong ending. The current season has been steady. They've earned the trust."),
      h2("The read"),
      p("Golden Kamuy is finishing the job. Slowly, the way good serialized anime sometimes has to. If you've been sleeping on it, this is the window to catch up. All four prior seasons plus the current cour are on Crunchyroll. By the time Winter 2027 rolls around, you'll want every single episode sitting in your watch history."),
      p("How deep are you on Golden Kamuy going into this? Slide the meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "golden_kamuy_depth",
        questionText: "How hyped are you for the Runaway Train Arc?",
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
