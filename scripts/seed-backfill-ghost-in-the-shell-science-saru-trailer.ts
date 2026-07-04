/**
 * Seed 1 backfill article draft (2026-03-30)
 *
 * Creates an UNPUBLISHED draft in Sanity for the 2026-03-30 Monday slot
 * documented in docs/CONTENT_WORKFLOW.md (Backfill calendar). The article
 * is backdated so the archive populates correctly — publish it manually
 * in Studio after merging this PR.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-ghost-in-the-shell-science-saru-trailer.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-ghost-in-the-shell-science-saru-trailer.ts --dry    # Print plan, no writes
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
  {
    slug: "ghost-in-the-shell-science-saru-trailer",
    title: "Science SARU Just Set the Bar: Ghost in the Shell Trailer Hit AnimeJapan and Nobody Is Ready",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "The trailer dropped at AnimeJapan 2026, the director said 'zero GenAI' out loud, and Production I.G.'s 30-year franchise run just ended. July 7 cannot come fast enough.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news", "thoughtful"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 ran March 28–29 and the biggest drop from the entire weekend wasn't a sequel announcement or a new season pickup. Science SARU walked up to the Bandai Namco Filmworks booth at Tokyo Big Sight, played a new Ghost in the Shell trailer, and quietly ended Production I.G.'s 30-year run with the franchise. In one weekend. No warning."),
      p("The trailer is what you'd expect from the studio that made Keep Your Hands Off Eizouken! and Inu-Oh: technically unhinged in the best possible way. Motoko Kusanagi doesn't look like she came out of a Photoshop filter. The environments feel hand-built. The action choreography has weight. It's giving 'we actually studied the source material' energy rather than 'we studied what other studios already did with the source material.'"),
      h2("The 'zero GenAI' quote that broke the internet"),
      p("But the moment that's going to live in my head longer than any frame of the trailer is the quote the director gave in the press line: 'Zero GenAI was used in this production.' In 2026. With the industry where it is. That sentence went viral within about forty minutes of being published, and honestly I understand why."),
      p("I'm not going to get deep into the AI-in-animation discourse today — that's a longer piece for a Wednesday slot. But the practical effect of that statement is that Science SARU is putting their production reputation behind it, which is a flex. Eizouken was a flex. Inu-Oh was a flex. Dungeon Meshi was a flex. These people do not show up to work to phone it in."),
      h2("The handoff"),
      p("Production I.G.'s Ghost in the Shell run spans 30 years, going back to Mamoru Oshii's 1995 original and through every Stand Alone Complex season that followed. That's a generational handoff — the equivalent of a new studio picking up Evangelion. And Science SARU is the right studio to receive it. They're not reverential in a way that calcifies them; they're reverential in a way that makes them do something new with the thing they love."),
      h2("Spider-sense"),
      p("July 7, Prime Video. That's the premiere date. The summer 2026 anime season just got its headliner."),
      p("How hyped are you? Meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "ghost_in_the_shell_hype",
        questionText: "How hyped are you for Science SARU's Ghost in the Shell?",
        questionType: "hot_take",
      },
    ],
  },
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seeding ${ARTICLES.length} backfill article draft...`);
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
