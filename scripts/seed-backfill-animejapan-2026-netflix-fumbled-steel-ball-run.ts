/**
 * Backfill seed — 2026-03-30 (Mon) the-daily-bugle
 *
 * Creates ONE unpublished draft in Sanity for the oldest backfill slot.
 * Backdates publishedAt so the archive populates correctly.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-animejapan-2026-netflix-fumbled-steel-ball-run.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-animejapan-2026-netflix-fumbled-steel-ball-run.ts --dry    # Print plan, no writes
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
// Article seed
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
    slug: "animejapan-2026-netflix-fumbled-steel-ball-run",
    title: "AnimeJapan 2026 Gave Us Everything — Then Netflix Fumbled Steel Ball Run in Real Time",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "AnimeJapan 2026 wrapped with massive energy. JJK panels, Demon Slayer, One Piece, all of it. Then Netflix walked up to the mic and announced Steel Ball Run Stage 2 was coming 'later in 2026.' No date. Just vibes. The internet went feral.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["frustrated", "hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 just wrapped and the weekend was, by most accounts, a certified moment. Tokyo Big Sight was packed. The stage lineups were stacked. Demon Slayer, Jujutsu Kaisen, One Piece, Blue Box, JoJo — the whole industry showed up to remind everyone why we're still doing this."),
      p("And then Netflix stepped up to the microphone and announced that Steel Ball Run Stage 2 was coming 'later in 2026.'"),
      p("No date. No month. No release window. 'Later in 2026.'"),
      p("The fandom responded exactly how you'd expect."),
      h2("What AnimeJapan actually gave us"),
      p("Look, the weekend was genuinely good before the fumble. The JJK panel was the highlight — Culling Game Part 2 is clearly in motion and the cast was visibly hyped in the way actors get when they know the material they're working with is going to hit. No spoilers from me, but the energy in that room was real."),
      p("Demon Slayer's panel leaned into the post-Infinity Castle world, which is the right call. They're not going to overpromise anything until the movie's numbers settle globally, but the fact that they showed up at all tells you the franchise isn't cooling off."),
      p("Blue Box Season 2 getting an October 2026 window confirmed is genuinely exciting if you're on the romance-anime pipeline. Blue Box S1 was a slow burn that stuck the landing, and S2 picking up where it left off has good-faith energy."),
      p("And then there was the Steel Ball Run stage, which should have been the crown jewel of the whole convention."),
      h2("The Netflix fumble"),
      p("JoJo Part 7 is, depending on who you ask, one of the greatest manga arcs ever written. The Stage 1 anime adaptation dropped on Netflix earlier this year with a batch release, then quietly halted. The Stage 2 announcement at AnimeJapan was supposed to be the moment fans exhaled."),
      p("Instead, Netflix confirmed: Stage 2 is coming to Netflix 'later this year.' No premiere date. No schedule. Just a teaser and a vague gesture at a calendar."),
      p("The Johnny Joestar anti-piracy meme is already on every Netflix social post. The comment sections are in rare form. Netflix has a specific talent for taking franchise goodwill and leaving it in a parking lot."),
      h2("Spider-sense"),
      p("They'll eventually announce a fall 2026 weekly schedule and act like the gap never happened. The show will be good because the source material is great and the production committee cares about it more than Netflix does. But we're going to lose a few months of goodwill in the meantime."),
      p("How mad are you right now? Be honest in the poll."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "netflix_steel_ball_run_anger",
        questionText: "How mad are you at Netflix over Steel Ball Run?",
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
