/**
 * Seed 3 forward-scheduled article drafts (2026-06-15 → 2026-06-20)
 *
 * Extends the 4-week rolling horizon from 2026-06-10 (where
 * scripts/seed-articles-2026-05-to-06.ts left off) through the next
 * Mon/Wed/Sat cycle documented in docs/CONTENT_SCHEDULE.md.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-06-to-07.ts          # Create / overwrite drafts
 *   npx tsx scripts/seed-articles-2026-06-to-07.ts --dry    # Print plan, no writes
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
  // ----- 1. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "kingdom-hearts-iv-nintendo-direct-june",
    title: "Kingdom Hearts IV Finally Showed Up and the Hype Is Real",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Square Enix dropped a 50-minute Nintendo Direct last Tuesday that finally showed Kingdom Hearts IV in action. I have been waiting seven years for this moment.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "nostalgic", "emotional"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Square Enix held a 50-minute Nintendo Direct on June 9th and Kingdom Hearts IV was the lead act. I have been waiting seven years for this. I need to talk about it."),
      p("Quick context: Kingdom Hearts III dropped in January 2019. It concluded the Dark Seeker Saga — fifteen years of games across like eight different platforms, most of them named something like 'Kingdom Hearts: 358/2 Days' or 'Kingdom Hearts: Dream Drop Distance.' KH3 wrapped it up. Then Square Enix said 'more is coming' and disappeared into the mist."),
      p("That mist lifted on June 9th. Kingdom Hearts IV got its first real gameplay showcase: Sora is in Quadratum — a photorealistic modern city that looks nothing like any world in the franchise's history. He's wearing actual human-person clothes. The combat system is recognizable but evolved. And Donald and Goofy are confirmed returning, which is the only confirmation that actually mattered to me."),
      h2("What I'm most excited about"),
      p("The setting. Quadratum is unlike anything the franchise has used before. It's not a Disney property. It's not a Final Fantasy crossover. It's an original world, and visually it's Square Enix building something on their own terms — grounded, cinematic, less like a cartoon fever dream and more like a serious action RPG."),
      p("Which is exactly what Kingdom Hearts needs after closing out the old saga. KH3 was a satisfying ending. KH4 needs to be something new. From the Direct, it looks like it is."),
      h2("Spider-sense"),
      p("The KH games have a long history of looking incredible and shipping whenever they ship. KH4 doesn't have a release window yet. But after seven years of waiting, seeing real gameplay is enough for today."),
      p("How hyped are you? Poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "kh4_hype_meter",
        questionText: "How hyped are you for Kingdom Hearts IV?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 2. Wed 2026-06-18 — versus
  {
    slug: "versus-ffvii-revelation-vs-kingdom-hearts-iv",
    title: "Versus: Final Fantasy VII Revelation vs Kingdom Hearts IV — One Square Enix Summer, Two Dreams",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Square Enix dropped two generational announcements within one week. One ends a trilogy. The other starts a new era. Pick a side.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "comparative", "nostalgic"],
    webRating: 0,
    readingTime: 9,
    spoilerFree: true,
    body: [
      p("Two Square Enix announcements. One week. Both of them the 'this is actually happening' moment that fans have been waiting years for. Both of them doing completely opposite things with that moment."),
      p("Let's sort it out."),
      h2("The case for Final Fantasy VII Revelation"),
      p("Summer Game Fest opened with it. Square Enix came correct: a full trailer, a Spring 2027 release window, gameplay showing that the Highwind airship is back — meaning the world is finally open — and the first real look at Cid Highwind and Vincent Valentine as full party members. The FFVII Remake trilogy has been building to this since 2020. Revelation is the payoff."),
      p("What makes Revelation uniquely loaded is that everyone who played the original already knows where the story ends. The question was never 'what happens' — it's 'how does Square Enix handle it.' FFVII Rebirth started dancing with fate mechanics. Revelation has to close that dance, and the weight of expectation on it is enormous. The trailer suggests they know it."),
      p("If you're an FFVII fan who has played the Remake and Rebirth, Revelation isn't just a game announcement. It's a reckoning."),
      h2("The case for Kingdom Hearts IV"),
      p("The Nintendo Direct on June 9th gave us 50 minutes of KH4 content and it was the best Direct in years. Sora is in Quadratum — a grounded, near-realistic modern city that looks nothing like any world in the franchise's history. The combat system is refined. The camera is better. And crucially: this is an original story. No Dark Seeker Saga scaffolding. No fifteen-years-of-lore homework required."),
      p("KH4's advantage over Revelation isn't emotional weight. It's freedom. Square Enix is building something new here. The Disney worlds will presumably arrive — it would be Kingdom Hearts without them — but Quadratum suggests a game more comfortable with its own identity than anything since KH2."),
      p("For longtime fans, this is the end of the drought. For newer players, this might actually be the entry point the franchise has never quite managed."),
      h2("The structural difference"),
      p("FFVII Revelation has a destination. The original game's ending is in everyone's heads — and however Square Enix handles the mythology, that shape is already there. That's both the weight and the limit."),
      p("Kingdom Hearts IV has none of that. It's uncharted. Whether that's exciting or terrifying depends entirely on how much trust you still have in Tetsuya Nomura after years of spin-offs and side stories."),
      h2("The verdict"),
      p("For FFVII fans who have played the Remake trilogy: Revelation is the most important game announcement of 2026. Nothing close."),
      p("For Kingdom Hearts fans who have been on ice since KH3: IV is the show. The reset, the fresh chapter, the thing the fanbase actually needed."),
      p("If you somehow don't have a stake in either franchise yet — pick one up. They're both the best their genres have produced at their peaks. Start anywhere."),
      p("Pick your side in the poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "ffvii_revelation_vs_kh4",
        questionText: "Which Square Enix reveal hit harder?",
        questionType: "this_or_that",
        options: ["Final Fantasy VII Revelation", "Kingdom Hearts IV"],
      },
    ],
  },

  // ----- 3. Sat 2026-06-21 — cartoons-and-cereal
  {
    slug: "rezero-s4-finale-it-earned-every-minute",
    title: "Re:ZERO Season 4 Just Finished and It Earned Every Minute",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-20T14:00:00.000Z",
    excerpt:
      "Spring 2026's most emotionally demanding anime just wrapped up. Re:ZERO Season 4 delivered a finale that reminded me why this show has a permanent spot on my watchlist.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["heavy", "emotional", "intense"],
    webRating: 88,
    readingTime: 6,
    mediaLength: "ongoing series",
    spoilerFree: false,
    body: [
      p("Re:ZERO Season 4 wrapped this week and I've been sitting with it for a few days. I have things to say."),
      p("If you've never watched Re:ZERO: the pitch is 'what if isekai was actually about what happens to the kind of person who gets transported into another world.' Subaru Natsuki is not competent. He's not secretly powerful. He's a shut-in with no real skills, dropped into a medieval fantasy kingdom, and his only ability is that when he dies he resets to a recent checkpoint. Which sounds like a power. It is not."),
      p("Re:ZERO is a show about what it costs to use that ability. What dying over and over does to someone. What it means to earn every victory the hardest possible way, without being able to tell anyone what that victory cost."),
      h2("What Season 4 did"),
      p("Spring 2026 has been stacked — Witch Hat Atelier was the consensus season pick, Classroom of the Elite S4 delivered for its fanbase, Dr. Stone had its finale. Re:ZERO didn't lead the conversation until about halfway through the season. Then the back half happened."),
      p("What I can say without going full spoiler: Season 4 makes good on a promise the show has been building since the Sanctuary arc. Subaru's growth is no longer incremental — the finale demands he be a different kind of person than he was in Season 1, and the show earns the demand. The supporting cast finally gets to operate at full capacity in a way the earlier seasons only ever hinted at."),
      h2("The Witch Hat Atelier debate"),
      p("Witch Hat Atelier was the best anime of Spring 2026. I'll argue that confidently. But 'best' and 'most important' aren't always the same thing. Atelier is a perfect show. Re:ZERO is a necessary one."),
      p("What I mean: Witch Hat Atelier does what it sets out to do with complete craft and no wasted motion. Re:ZERO is doing something harder — running a decade-long character study in real time, accumulating consequences, making you feel every scar Subaru is carrying. Not every episode is perfect. But the whole is greater than the sum of its seasons."),
      h2("If you fell off the bus"),
      p("Re:ZERO is all on Crunchyroll. If you watched S1 and bounced: the show is better now than it was then. Not because S1 was bad — it wasn't — but because the payoff only exists in hindsight. Four seasons in, you can see the architecture."),
      p("If you've never started: the first episode is effectively a free trial for the whole show. If you make it through the first arc without caring about Subaru, this is probably not your show. If you do care — and you will — block off your weekend."),
      h2("Web rating"),
      p("Season 4: 88. The middle stretch was slow, the back half earned it. Cumulative series rating: legitimately one of the best long-running isekai anime of the last decade."),
      p("Did it deliver? Tell me in the poll."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "rezero_s4_delivered",
        questionText: "Did Re:ZERO Season 4 deliver?",
        questionType: "yes_no",
      },
    ],
  },
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seeding ${ARTICLES.length} forward-scheduled article drafts...`);
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
    const docId = `drafts.scheduled-${article.slug}`;
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
