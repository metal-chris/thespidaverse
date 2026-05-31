/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Extends the rolling 4-week horizon documented in docs/CONTENT_SCHEDULE.md.
 * Drafts hold body, polls, and metadata — they will only appear on the site
 * once published manually in Studio.
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
  // ----- 1. Sat 2026-06-13 — cartoons-and-cereal
  {
    slug: "my-dress-up-darling-s2-review",
    title: "My Dress-Up Darling S2 Is Finally Here and Marin Kitagawa Still Broke Me",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Netflix dropped Season 2 at the end of May and I've watched more episodes than I've written words about it. That's a compliment.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["wholesome", "romantic", "hype"],
    webRating: 86,
    readingTime: 5,
    mediaLength: "12 episodes",
    spoilerFree: false,
    body: [
      p("Netflix dropped My Dress-Up Darling Season 2 at the end of May and I have been sitting on this review for three weeks because I kept going back and watching more episodes instead of writing."),
      p("That is, I want to be clear, a compliment."),
      h2("What Season 2 actually is"),
      p("Season 1 was a charming romantic comedy that leaned hard on the 'hot girl asks nerdy boy for help' formula, with cosplay as the hook and Marin Kitagawa doing the heavy lifting as a protagonist. It worked. But it also had a ceiling — the ecchi elements were front and center in a way that sometimes crowded out the character work underneath."),
      p("Season 2 moves the ceiling. The manga finished its run in July 2025, and the anime adaptation knew where the story was going. The romance gets room to develop in ways that feel earned — Gojo gets actual interiority instead of just reacting to Marin — and the cosplay projects this season are doing real thematic work the show was only hinting at before."),
      h2("Why it earns the Saturday slot"),
      p("My Dress-Up Darling is exactly the kind of show that works on a Saturday morning. Episodes are 24 minutes and don't waste a frame. The cosplay craft content is genuinely interesting — if you've ever walked a con floor wondering how people build this stuff, the show is a pretty good explainer."),
      p("What the show hasn't lost is the warmth. There's an arc midway through S2 where Marin and Gojo end up at a convention, and the crowd-scene animation is the most warmhearted thing I've seen in any medium this year. The show knows that cosplay is community, not just costume."),
      h2("The web rating"),
      p("86. Subtract a few points if S1's energy didn't land for you. Add them back if you've been waiting for the romance to actually go somewhere — because this season, it does."),
      p("Poll below: are you watching S2, or did S1 lose you somewhere in episode three?"),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "mudd_s2_watching",
        questionText: "Are you watching My Dress-Up Darling S2?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "toy-story-5-reviews-unlock-pixar-june-2026",
    title: "Toy Story 5 Critic Reviews Drop Tomorrow — Pixar Might Actually Be Back",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Reviews embargo lifts June 16. The early social reactions are warm, the London premiere was quiet in a good way, and Andrew Stanton is directing. Setting my reminder now.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "nostalgic"],
    webRating: 0,
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Reviews for Toy Story 5 drop tomorrow morning — June 16, 9am PT — and Disney has been doing everything right in the build-up."),
      p("The premiere in London at the end of May was quiet in a good way. No overcorrection, no defensive studio press tour, just Tom Hanks back in a recording booth being Tom Hanks. The social embargo lifted June 9 and the early reactions were uniformly warm — which, if you know how studios play the press game, means Disney isn't scared of what the critics are going to say."),
      h2("What we know about the film"),
      p("Toy Story 5 is directed by Andrew Stanton — the man behind Finding Nemo and WALL-E, two of Pixar's five genuinely untouchable films. The premise is 'Toy meets Tech': the gang has to reckon with what it means to exist in a world where kids grow up with AI companions and smart devices instead of a box of action figures. This could be a Pixar AI lecture. Based on the early reactions, it isn't."),
      p("Tom Hanks and Tim Allen are back. Greta Lee, Conan O'Brien, and Craig Robinson are new additions. Randy Newman returned to score it, marking his tenth Pixar collaboration. The domestic opening projection is $150 million — tracking higher than Toy Story 4's $120 million opening in 2019."),
      h2("Spider-sense"),
      p("Pixar has been in a rough stretch. Lightyear didn't work. Elemental was divisive. The COVID-to-streaming decisions cost the brand real goodwill. Toy Story 5 feels like the first time in a few years that the studio put its best people on a marquee title and said: make it good, and make it for theaters. The embargo timeline says they believe it worked."),
      p("Full review in the pipeline once I've seen it. For now: setting the Friday reminder. How hyped are you — poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "toy_story_5_hype",
        questionText: "How hyped are you for Toy Story 5?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-toy-story-4-vs-inside-out-2",
    title: "Versus: Toy Story 4 vs. Inside Out 2 — Which Pixar Sequel Actually Earned It?",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Toy Story 5 opens this Friday. Good week to settle an old argument: two Pixar sequels that weren't supposed to work — and did — but in completely different ways.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["thoughtful", "nostalgic", "comparative"],
    webRating: 0,
    readingTime: 10,
    spoilerFree: false,
    body: [
      p("Toy Story 5 opens this Friday, and it's a good week to settle an old argument."),
      p("Two Pixar sequels. Both were supposed to be impossible. Both walked into theaters with the weight of their predecessors' perfection on their backs. Both left with $1 billion-plus in global grosses. And fans are still fighting about which one actually deserved to exist."),
      h2("The case for Toy Story 4"),
      p("Toy Story 3 ended the franchise perfectly. The incinerator. The attic. The handoff. Toy Story 3 is the gold standard for how to close a franchise, and Pixar knew it. So when Toy Story 4 was announced, the immediate question was: why."),
      p("The answer turned out to be Forky. And Bo Peep. And an antique shop on a rainy street. And a finale that committed to something none of the previous three films had gone near: Woody choosing his own life, outside of being someone's toy, for the first time in four movies. The ending of Toy Story 4 is braver than the ending of Toy Story 3. Toy Story 3 closed Andy's chapter. Toy Story 4 closed the whole book."),
      p("The film also looked extraordinary. The rain on the antique shop window is peak Pixar technical craft. The moment Woody finds Bo again at the merry-go-round is the kind of sequence that makes you wonder what everyone else in animation is even trying for."),
      h2("The case for Inside Out 2"),
      p("Inside Out (2015) didn't need a sequel. Riley's story felt complete. The metaphor — emotions as characters, memories as glowing orbs — was a once-in-a-career creative invention that didn't seem to need a sequel any more than a perfect joke needs a callback."),
      p("And then Inside Out 2 happened and it became the highest-grossing animated film ever made. Because the metaphor wasn't exhausted — it had just run out of room in the first film. Riley at 13, navigating a new school, a new friend group, and the first waves of a personality that will follow her through adulthood, introduced Anxiety in a way that stopped being metaphorical about four minutes after she appeared on screen. Anxiety is not a villain. She's the part of every brain that's ever met a deadline or a first day of anything. Inside Out 2 knew that, and played it completely straight."),
      p("The ending — the 'sense of self' as Riley's core even when all the emotions can't agree on what it means — is the most emotionally rigorous thing Pixar has done since Coco."),
      h2("Where they differ structurally"),
      p("Toy Story 4 is a character study. The ensemble recedes and Woody's interiority is the entire film. If you loved the gang-is-all-here energy of the first three, 4 runs cold by comparison. If you wanted one more examination of what Woody actually is — not just a toy or a leader, but a person-shaped object trying to figure out where he fits — it's the best in the franchise."),
      p("Inside Out 2 is a crowd film. Every emotion gets a moment. The new characters have clear arcs. The editing is tighter than the original, and the comedy lands faster. But some of the raw emotional punch of the first film — the memory dump, Bing Bong — isn't replicated. Inside Out 2 is better-constructed and slightly less devastating."),
      h2("Which one won"),
      p("Toy Story 4 is the braver film. It went where it didn't have to go, committed to an ending that actually closed the door, and left the franchise in a state where Toy Story 5 has to build something genuinely new instead of riding a safe beat. That takes nerve."),
      p("Inside Out 2 is the better film. It earned its sequel by proving the metaphor had room to grow, and it grew in the direction that connected with the most people. Anxiety works because she's true. Toy Story 4's thesis is about one character. Inside Out 2's thesis is about everyone."),
      h2("The verdict"),
      p("Both of them earned it. Not every sequel does — most don't. These two did it in completely different ways, which is exactly why the argument has been running for two years."),
      p("Pick your side in the poll below. Toy Story 5 opens Friday, and we'll see whether it even belongs in this conversation a year from now."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "ts4_vs_io2",
        questionText: "Which Pixar sequel actually earned it?",
        questionType: "this_or_that",
        options: ["Toy Story 4", "Inside Out 2"],
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
