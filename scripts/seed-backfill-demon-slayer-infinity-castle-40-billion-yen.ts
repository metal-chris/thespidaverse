/**
 * Backfill: 2026-03-30 — the-daily-bugle
 * "Demon Slayer: Infinity Castle Just Crossed ¥40 Billion in Japan and the Anime Film Era Is Real"
 *
 * Creates ONE unpublished backfill draft in Sanity with publishedAt backdated to
 * the missed slot. Run this locally after merging, then publish the draft in Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-demon-slayer-infinity-castle-40-billion-yen.ts          # Write draft
 *   npx tsx scripts/seed-backfill-demon-slayer-infinity-castle-40-billion-yen.ts --dry    # Print plan, no writes
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
    slug: "demon-slayer-infinity-castle-40-billion-yen",
    title: "Demon Slayer: Infinity Castle Just Crossed ¥40 Billion in Japan and the Anime Film Era Is Real",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "The first Infinity Castle film hit ¥40 billion in Japan today — over 27 million tickets sold. It's also the highest-grossing foreign film in US history. Part 2 isn't even announced yet.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("The numbers for Demon Slayer: Infinity Castle keep getting bigger."),
      p("As of today, the first film in the Infinity Castle trilogy has crossed ¥40 billion at the Japan box office — over 27 million tickets sold — making it one of the highest-grossing films in Japanese theatrical history. Not one of the highest-grossing anime films. One of the highest-grossing films, full stop."),
      p("Meanwhile in North America, it already holds the record for highest-grossing foreign-language film in US box office history, surpassing Crouching Tiger, Hidden Dragon's 25-year-old mark. Crunchyroll and Sony brought it back to US theaters earlier this month in ScreenX. People showed up again."),
      h2("Why this matters beyond the numbers"),
      p("It's easy to look at 'Mugen Train did $1 billion globally' and file it under pandemic-era anomaly. Japan was starved for event cinema, the franchise was at peak heat, blame the circumstances. Fine."),
      p("Infinity Castle makes that argument impossible to hold onto. Part 1 opened wide internationally against normal market conditions. No pandemic asterisk. No 'right place, right time' excuse. It performed like a major studio blockbuster. Not 'decent for anime.' A major. Studio. Blockbuster."),
      p("That's the actual story underneath the ¥40 billion. Anime film is no longer a niche category with occasional crossover hits. It is a reliable commercial force with a global audience that will show up the same way they show up for Marvel. Studios are watching. Everyone is watching."),
      h2("What comes next"),
      p("Part 2 has not been officially announced yet — which at this point is just Ufotable doing Ufotable things. They're working. The Infinity Castle arc was always a three-film structure by design."),
      p("The manga material for Parts 2 and 3 covers some of the heaviest, most emotionally brutal sequences in the entire run. If Part 1 was the 'this is the scale of what we're doing' film, Parts 2 and 3 are the ones that are going to break people in theaters."),
      p("I am not ready. None of us are. Poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "infinity_castle_part2_hype",
        questionText: "How hyped are you for Infinity Castle Part 2?",
        questionType: "hot_take",
      },
    ],
  },
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seeding ${ARTICLES.length} backfill draft(s)...`);
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
