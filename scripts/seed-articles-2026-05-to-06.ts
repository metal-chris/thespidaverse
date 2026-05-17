/**
 * Seed scheduled article drafts into Sanity.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (default: production)
 *   SANITY_WRITE_TOKEN           (generate at sanity.io/manage → API → Tokens)
 *
 * Each article is upserted as a draft with _id = drafts.scheduled-<slug>.
 * Open Sanity Studio to review and publish.
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_WRITE_TOKEN in .env.local\n" +
      "Generate one at: https://sanity.io/manage → your project → API → Tokens"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// --- Types ---

interface PollQuestion {
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
}

interface ArticleSeed {
  title: string;
  slug: string;
  format: string;
  series?: string;
  publishedAt: string;
  excerpt: string;
  mediaType?: "movie" | "tv" | "game" | "anime" | "books" | "music";
  categorySlug: string;
  moodTags: string[];
  webRating: number;
  readingTime: number;
  mediaLength?: string;
  spoilerFree: boolean;
  body: ReturnType<typeof p>[];
  enableCommunityRating: boolean;
  pollQuestions: PollQuestion[];
}

// --- Helpers ---

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function p(text: string) {
  return {
    _type: "block" as const,
    _key: uid(),
    style: "normal",
    children: [{ _type: "span" as const, _key: uid(), text, marks: [] as string[] }],
    markDefs: [] as unknown[],
  };
}

function h2(text: string) {
  return {
    _type: "block" as const,
    _key: uid(),
    style: "h2",
    children: [{ _type: "span" as const, _key: uid(), text, marks: [] as string[] }],
    markDefs: [] as unknown[],
  };
}

function makeBody(...blocks: ReturnType<typeof p>[]) {
  return blocks;
}

async function categoryIdBySlug(slug: string): Promise<string> {
  const cat = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!cat) {
    throw new Error(
      `Category "${slug}" not found. Create it in Sanity Studio first.`
    );
  }
  return cat._id;
}

// --- Articles ---

const ARTICLES: ArticleSeed[] = [
  // ── Mon 2026-06-01 ── the-daily-bugle ────────────────────────────────────
  {
    title:
      "Toy Story 5 Drops Its Most Emotional Trailer Yet and Pixar Goes for the Throat",
    slug: "toy-story-5-emotional-trailer-pixar",
    format: "the-daily-bugle",
    publishedAt: "2026-06-01T13:00:00Z",
    excerpt:
      "Pixar just released the full trailer for Toy Story 5 and the internet is already not okay. Here's everything we clocked.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["nostalgic", "emotional", "hype"],
    webRating: 0,
    readingTime: 4,
    spoilerFree: true,
    body: makeBody(
      p(
        "Pixar dropped the full trailer for Toy Story 5 this week, and if you made it through without at least one lump in your throat, please report yourself to the authorities. The studio has been dangling footage since last fall, but this trailer gives us the full premise: Woody and Buzz in a world where their kid has kids of his own, and these toys have to reckon with what legacy actually means when the hands that loved them have grown too big."
      ),
      p(
        "The visual upgrade is staggering. Pixar has been iterating on its light-rendering technology for three decades, and Toy Story 5 looks like the definitive expression of everything they've learned. The fabrics have weight. The room has age. Andy's old toys look worn in the way things look worn when you've actually loved them — not battered, but lived-in."
      ),
      p(
        "Toy Story 4 ended in a place that felt definitive, and honestly, the discourse around whether this sequel was necessary has been running since the announcement. The trailer suggests Pixar found a real question to answer: not just another adventure, but something about memory and time and what we pass down. Whether they stick the landing is a June 19 problem."
      ),
      p(
        "The internet's verdict right now is cautiously optimistic with a side of 'please don't ruin this.' Standard Pixar sequel energy. But something in the craftsmanship on display suggests this one knows what it's doing. June 19. Be there."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "hyped",
        questionText: "Are you ready for Toy Story 5?",
        questionType: "yes_no",
      },
      {
        questionKey: "necessary",
        questionText: "This sequel was necessary.",
        questionType: "hot_take",
      },
    ],
  },

  // ── Wed 2026-06-03 ── the-sinister-six ────────────────────────────────────
  {
    title:
      "Six Reasons Disclosure Day Could Be Spielberg's Best in a Decade",
    slug: "disclosure-day-spielberg-six-reasons",
    format: "the-sinister-six",
    publishedAt: "2026-06-03T15:00:00Z",
    excerpt:
      "Steven Spielberg and David Koepp reunite for a UFO thriller opening June 12. Here are six reasons it's the most interesting summer film on the calendar.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "analytical", "intense"],
    webRating: 0,
    readingTime: 6,
    spoilerFree: true,
    body: makeBody(
      p(
        "Disclosure Day opens June 12, and the early buzz out of limited screenings has been quietly extraordinary. Spielberg and screenwriter David Koepp — the duo that gave us Jurassic Park and War of the Worlds — are back in science fiction territory with a first-contact film that's being described as intimate, unsettling, and unlike anything else on the summer slate. Here are six reasons to have it locked on your calendar."
      ),
      h2("1. The Spielberg-Koepp Reunion"),
      p(
        "Koepp has written more Spielberg films than almost anyone, and their shorthand shows up on screen in the way Spielberg's best films feel conversational even at their most enormous. Disclosure Day reportedly has that quality — big ideas happening in small rooms, with people making very human decisions in the face of the impossible."
      ),
      h2("2. Janusz Kamiński Behind the Lens"),
      p(
        "If you've noticed that every Spielberg film from Schindler's List onward has a particular quality of light, that's Kamiński. His cinematography for Disclosure Day is reportedly the most unusual of his career — approaches that make alien presence feel less like a visual effect and more like a disruption in reality itself."
      ),
      h2("3. An Original Story in a Sequel Summer"),
      p(
        "Almost everything else opening this summer is a sequel, reboot, or franchise extension. Disclosure Day is an original story. In 2026, that alone is a reason to show up and pay full price."
      ),
      h2("4. The Premise Has Real Stakes"),
      p(
        "Without spoiling the specific setup, this is not an alien invasion film. It sits closer in spirit to Contact or Arrival — a story about what happens to people when the impossible becomes true. That's harder to pull off than spectacle, and more rewarding when it works."
      ),
      h2("5. The Awards Track Is Already Clear"),
      p(
        "Early audiences have been describing scenes that sound like the kind of sequences that end up in Oscar clips packages. A summer release with serious craft behind it is positioned as a legitimate awards contender heading into fall."
      ),
      h2("6. We've Been Waiting for This Spielberg"),
      p(
        "The Spielberg who made Close Encounters, E.T., A.I., and Minority Report has a particular energy — wonder laced with dread, scale filtered through intimacy. Disclosure Day sounds like that Spielberg is back and has something to say. Summer blockbuster season just got a lot more interesting."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "agree_ranking",
        questionText:
          "Spielberg's best work is always his sci-fi and close-encounter films.",
        questionType: "agree_scale",
      },
      {
        questionKey: "anticipation",
        questionText: "Disclosure Day is on my must-see list.",
        questionType: "hot_take",
      },
    ],
  },

  // ── Sat 2026-06-06 ── the-full-web / cartoons-and-cereal ─────────────────
  {
    title:
      "Witch Hat Atelier: Eight Episodes In and BUG FILMS Hasn't Stumbled Once",
    slug: "witch-hat-atelier-eight-episodes-check-in",
    format: "the-full-web",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-06T14:00:00Z",
    excerpt:
      "Eight episodes into BUG FILMS' adaptation of Kamome Shirahama's beloved manga, Spring 2026 has a clear frontrunner. Here's where the show stands at the midpoint.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["chill", "emotional", "hype"],
    webRating: 0,
    readingTime: 7,
    mediaLength: "ongoing — Spring 2026",
    spoilerFree: false,
    body: makeBody(
      p(
        "Eight episodes into its Spring 2026 run, Witch Hat Atelier hasn't had a weak installment. For a show carrying the weight of a decade of manga fan anticipation — Kamome Shirahama has been serializing this since 2016 — that's not a given. It's a remarkable sustained achievement."
      ),
      p(
        "BUG FILMS has made the adaptation feel inevitable rather than dutiful. The studio found a visual language that doesn't try to replicate Shirahama's distinctive crosshatching, but instead responds to it. The backgrounds are lush. The character animation has a deliberateness that mirrors how the manga holds its panels — stillness punctuated by precise, meaningful movement."
      ),
      p(
        "Coco is still the beating heart of the show, and eight episodes in her arc has developed more texture than the premiere promised. The moment in episode five where she realizes the implications of the forbidden magic she witnessed — and what it means for how the world is structured — lands with real weight. The show isn't afraid to let its protagonist feel the philosophical dimensions of her situation."
      ),
      p(
        "The ensemble is clicking in ways the early manga chapters only sketched. Agott's initial hostility has given way to something more interesting: a reluctant acknowledgment that Coco's instincts for the craft are different but not lesser. Tetia is warm without being naive. Richeh remains the most enigmatic of the group, and the show seems to know it's holding that card for later."
      ),
      p(
        "At the halfway point of a cours, the question is always whether a show can sustain quality into the back half. Based on everything BUG FILMS has shown so far, the trust is earned. Check in again in two weeks when we have the full picture — but right now, this is the show of the season."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "watching",
        questionText: "Are you watching Witch Hat Atelier?",
        questionType: "yes_no",
      },
      {
        questionKey: "rating",
        questionText: "Rate it so far (1–10)",
        questionType: "slider",
      },
    ],
  },
];

// --- Main ---

async function main() {
  console.log(
    `\nSeeding ${ARTICLES.length} scheduled article drafts → Sanity (${dataset})...\n`
  );

  for (const seed of ARTICLES) {
    const categoryId = await categoryIdBySlug(seed.categorySlug);

    const doc = {
      _id: `drafts.scheduled-${seed.slug}`,
      _type: "article",
      title: seed.title,
      slug: { _type: "slug", current: seed.slug },
      format: seed.format,
      ...(seed.series ? { series: seed.series } : {}),
      publishedAt: seed.publishedAt,
      excerpt: seed.excerpt,
      ...(seed.mediaType ? { mediaType: seed.mediaType } : {}),
      category: { _type: "reference", _ref: categoryId },
      moodTags: seed.moodTags,
      webRating: seed.webRating,
      readingTime: seed.readingTime,
      ...(seed.mediaLength ? { mediaLength: seed.mediaLength } : {}),
      spoilerFree: seed.spoilerFree,
      body: seed.body,
      pollConfig: {
        enableCommunityRating: seed.enableCommunityRating,
        pollQuestions: seed.pollQuestions.map((q) => ({ _key: uid(), ...q })),
      },
    };

    try {
      await client.createOrReplace(doc);
      console.log(`  ✓ ${seed.publishedAt.slice(0, 10)}  ${seed.title}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${seed.slug}: ${msg}`);
    }
  }

  console.log(
    "\nDone. Open Sanity Studio to review drafts before publishing.\n"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
