/**
 * Backfill seed — 2026-03-30: the-daily-bugle
 *
 * Creates ONE unpublished draft for the 2026-03-30 Monday news-beat slot,
 * backdating publishedAt so the archive populates correctly.
 *
 * Tracked in docs/CONTENT_WORKFLOW.md backfill calendar.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-project-hail-mary-second-weekend.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-project-hail-mary-second-weekend.ts --dry    # Print plan, no writes
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
    slug: "project-hail-mary-second-weekend",
    title: "Project Hail Mary Just Had Its Second Weekend and Hollywood Still Hasn't Processed It",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "A 32% second-weekend drop. $164M domestic and climbing. Original sci-fi doing Oppenheimer numbers. Someone needs to explain to the studios what just happened.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "thoughtful", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Ten days in. One hundred and sixty-four million domestic. A thirty-two percent second-weekend drop that is frankly indecent for a non-franchise sci-fi film in 2026."),
      p("Project Hail Mary just closed out its second weekend at $54.5M and it is still accelerating on word of mouth. This is not what the algorithm predicted. This is not what the studios planned for. This is what happens when a genuinely good movie gets seen by one person who tells five people who each tell five more people, and then you look up and it's doing Oppenheimer numbers."),
      h2("The setup"),
      p("Andy Weir wrote the novel in 2021. If you haven't read it, the pitch is: a scientist wakes up alone on a spacecraft millions of miles from Earth with no memory of who he is or why he's there, and has to figure both of those things out simultaneously. It's the kind of science-communication-disguised-as-thriller that The Martian made Weir famous for, but Project Hail Mary is the better book."),
      p("Ryan Gosling is carrying the film. Not 'carrying it despite the script,' not 'carrying it in spite of some production-committee choices' — actually, genuinely carrying it. The majority of the runtime is Gosling alone on a set, doing math and reacting to things, and it never once loses pace. That's a performance. That's a director who understood the assignment. That's a script that trusted the source material."),
      h2("What the numbers mean"),
      p("The opening weekend was $80.6M domestic, which ranks as the biggest debut for a non-franchise PG-13 film in recent memory. The only comparable in the last decade is Oppenheimer. For people who haven't been tracking this: Oppenheimer was a three-hour film about nuclear physics. Project Hail Mary is a two-hour film about a lone scientist and an alien he meets in deep space. These are not movies the algorithm clears for $80M openings."),
      p("The 32% hold in week two is the number that matters. Big openings happen. Holds like this happen when the film is actually good and word of mouth is clean. A film with a dirty hold bleeds 50–60% in week two. A film with a clean hold — one that's picking up new viewers because people are actively telling other people to go — holds in the low thirties. Project Hail Mary held 32%."),
      h2("What this should mean"),
      p("Studios have been telling themselves and the trade press for a decade that mid-budget original films don't work at the theatrical level. Too niche. Not IP. No pre-awareness. Every year the conversation resets to the same conclusion: franchise or nothing."),
      p("Project Hail Mary is the loudest counterargument that argument has had in years. It's an adaptation, yes — but it's not a sequel, not a reboot, not a superhero. It opened $80M and it held. The correct response is to look at what Amazon MGM did right and do more of it."),
      h2("Spider-sense"),
      p("The actual response will be to greenlight a Project Hail Mary sequel. The book doesn't have one. Weir hasn't announced one. It doesn't matter. The sequel will be announced by summer."),
      p("The other prediction: every studio that passed on this project is right now having a very uncomfortable Monday morning meeting. Good."),
      p("How hard did this one hit for you? Hot take meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "project_hail_mary_hit",
        questionText: "How hard did Project Hail Mary hit for you?",
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
