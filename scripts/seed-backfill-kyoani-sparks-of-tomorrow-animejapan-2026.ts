/**
 * Backfill seed: 2026-03-30 — the-daily-bugle
 *
 * Drafts the 2026-03-30 Monday news-beat slot from the backfill calendar
 * (docs/CONTENT_WORKFLOW.md). AnimeJapan 2026 wrapped March 28-29 and
 * KyoAni dropped the Sparks of Tomorrow trailer — the clean Monday hook.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-kyoani-sparks-of-tomorrow-animejapan-2026.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-kyoani-sparks-of-tomorrow-animejapan-2026.ts --dry    # Print plan, no writes
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
    slug: "kyoani-sparks-of-tomorrow-animejapan-2026",
    title: "KyoAni Dropped the Sparks of Tomorrow Trailer at AnimeJapan and It Has the Budget",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "AnimeJapan 2026 just wrapped and the trailer everyone is talking about is a steampunk KyoAni Netflix exclusive premiering July 5. Yes, it looks exactly like a KyoAni anime. Yes, that's the compliment.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "thoughtful"],
    readingTime: 2,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 closed out over the weekend, and in a convention floor full of sequel announcements and returning franchises, the one that had my tab count climbing was the Sparks of Tomorrow trailer drop from Kyoto Animation."),
      p("Quick setup if you missed it: Sparks of Tomorrow is an adaptation of Hiro Yuki's light novel 20 Seiki Denki Mokuroku — think Electric Catalog of the 20th Century — set in a dark, smoke-covered world where electricity is still a dream on the horizon. Steampunk-adjacent. Coming-of-age spine. Two young protagonists chasing a future that doesn't exist yet."),
      p("KyoAni is doing it. That sentence alone carries weight."),
      h2("What the trailer shows"),
      p("The main trailer that dropped at AnimeJapan is doing what KyoAni trailers do: not showing you action sequences. It's showing you fabric, and light, and the specific way a character exhales when they're about to say something they mean. The animation quality in two minutes is unreasonable."),
      p("There's a shot of candlelight catching the edge of a mechanical device that looks like it belongs in a museum. That's a shot designed by people who think about shots. Minoru Ota is directing, with Yuma Uchida and Sora Amamiya voicing the leads — Uchida has been on a run lately (Kashimo in JJK, Takemichi in Tokyo Revengers) and Amamiya brings the controlled warmth this kind of material needs."),
      h2("Netflix exclusive, July 5"),
      p("Worldwide exclusive on Netflix, premiering July 5. I have complicated feelings about Netflix as an anime platform — the weekly-vs.-drop debate is a whole other post — but the production values this deal clearly bought are hard to argue with. The trailer looks like KyoAni had a budget and instruction to use all of it."),
      h2("Spider-sense"),
      p("KyoAni hasn't done straight-up steampunk-adjacent sci-fi before. This is new territory for them. The studio's fingerprints are all over every frame of the trailer, but the setting is doing something they haven't tried. That makes me cautiously very excited, which is the only rational way to feel about a KyoAni show with a July premiere that just got announced at AnimeJapan."),
      p("Mark the calendar: July 5. The cereal bowl will be full. How hyped are you — slide the meter."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "sparks_of_tomorrow_hype",
        questionText: "How hyped are you for Sparks of Tomorrow?",
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
