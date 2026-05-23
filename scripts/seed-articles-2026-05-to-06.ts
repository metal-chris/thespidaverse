/**
 * Seed Script — Forward-Scheduled Articles (May–June 2026)
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local  (manage.sanity.io → API → Tokens)
 *
 * Each article is upserted as a Sanity draft with _id prefix "drafts.scheduled-".
 * Publish manually in Studio or via the publish action.
 *
 * For backfill scripts the prefix is "drafts.backfill-" — see CONTENT_WORKFLOW.md.
 */

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ─── Sanity client ─────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("❌  Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "❌  Missing SANITY_WRITE_TOKEN in .env.local\n" +
      "    Generate one at manage.sanity.io → your project → API → Tokens"
  );
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ─── Types ─────────────────────────────────────────────────────────────────

type ArticleFormat =
  | "first-bite"
  | "the-full-web"
  | "spin-the-block"
  | "the-sinister-six"
  | "the-gauntlet"
  | "versus"
  | "the-daily-bugle"
  | "spida-sense"
  | "the-web-sling"
  | "state-of-the-game"
  | "the-rotation"
  | "one-year-later";

type MediaType = "movie" | "tv" | "game" | "anime" | "books" | "music";

/** Flat input shape — the run() function resolves refs and writes the full doc */
interface ArticleSeed {
  title: string;
  slug: string;
  format: ArticleFormat;
  series?: "cartoons-and-cereal";
  publishedAt: string;        // ISO 8601 — e.g. "2026-05-16T14:00:00Z"
  excerpt: string;
  body: any[];                // Portable Text blocks (use helpers below)
  categorySlug: string;       // e.g. "anime", "movies", "tv", "video-games"
  tags?: string[];            // tag slugs — looked up or skipped if missing
  moodTags?: string[];
  mediaType?: MediaType;
  webRating?: number;         // 0–100
  readingTime?: number;       // minutes
  mediaLength?: string;       // e.g. "2h 8m", "24 episodes"
  spoilerFree?: boolean;
}

// ─── Portable Text helpers ─────────────────────────────────────────────────

function k(): string {
  return Math.random().toString(36).slice(2, 14);
}

function textBlock(
  text: string,
  style: "normal" | "h2" | "h3" | "blockquote" = "normal"
): any {
  return {
    _key: k(),
    _type: "block",
    style,
    children: [{ _key: k(), _type: "span", text, marks: [] }],
    markDefs: [],
  };
}

function boldSpan(text: string): any {
  return { _key: k(), _type: "span", text, marks: ["strong"] };
}

function mixedBlock(
  parts: Array<{ text: string; bold?: boolean }>,
  style: "normal" | "h2" | "h3" | "blockquote" = "normal"
): any {
  return {
    _key: k(),
    _type: "block",
    style,
    children: parts.map((p) => ({
      _key: k(),
      _type: "span",
      text: p.text,
      marks: p.bold ? ["strong"] : [],
    })),
    markDefs: [],
  };
}

function pullquote(text: string, attribution?: string): any {
  return {
    _key: k(),
    _type: "pullquote",
    text,
    ...(attribution ? { attribution } : {}),
  };
}

// ─── Articles ──────────────────────────────────────────────────────────────

const ARTICLES: ArticleSeed[] = [
  {
    title: "Spring 2026 OP/ED Tier List — Witch Hat, Re:Zero & the Rest",
    slug: "spring-2026-op-ed-tier-list",
    format: "the-rotation",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-16T14:00:00Z",
    excerpt:
      "Every season delivers a new batch of bangers and misses in the opening/ending department. Spring 2026 has been sending. Here's how everything stacks up.",
    categorySlug: "anime",
    tags: ["anime", "music", "ost"],
    moodTags: ["chill", "nostalgic", "fun"],
    mediaType: "anime",
    readingTime: 6,
    spoilerFree: true,
    body: [
      textBlock("The OP/ED rankings for Spring 2026 are here. Settle in.", "h2"),
      textBlock(
        "Every season I end up with a Spotify playlist of openings and endings I'm not ready to stop listening to. Spring 2026 hit different — the range this season, from full orchestral swing to lo-fi acoustic, is genuinely impressive. Let's get into it.",
        "normal"
      ),
      pullquote(
        "If an OP doesn't make me feel something by the 20-second mark, we have a problem.",
        "Spida-Mane"
      ),
      textBlock("S Tier: The Ones You Skip at Your Own Risk", "h2"),
      textBlock(
        "Witch Hat Atelier's opening is doing something special — the hand-drawn aesthetic matches the show's visual style perfectly and the song builds slowly before it hits you. It is not trying to be a hype track. It's trying to make you feel safe, then pull the rug. S tier, no debate.",
        "normal"
      ),
      textBlock("A Tier: Consistent, No Skip Energy", "h2"),
      textBlock(
        "Re:Zero Season 3 continues the trend of delivering above-average EDs that you actually sit through. The ending animation is low-key one of the most emotionally charged in recent memory. A tier, but barely — the OP is carrying more weight than it should.",
        "normal"
      ),
      textBlock("The Rest: Ranked and Explained", "h2"),
      textBlock(
        "Full rankings in the piece. As always, this is a vibe-based tier list. Science has nothing to do with it.",
        "normal"
      ),
    ],
  },
  {
    title: "The Algorithm Is Ruining How We Discover Anime",
    slug: "algorithm-ruining-anime-discovery",
    format: "the-daily-bugle",
    publishedAt: "2026-05-20T15:00:00Z",
    excerpt:
      "Every platform optimizes for watch-time and engagement. That's fine for some things. For anime discovery, it's a quiet disaster.",
    categorySlug: "culture",
    tags: ["anime", "tech"],
    moodTags: ["thought-provoking", "intense"],
    readingTime: 5,
    spoilerFree: true,
    body: [
      textBlock("I Have a Problem With the 'Recommended For You' Row", "h2"),
      textBlock(
        "Last week I spent 20 minutes scrolling Crunchyroll's homepage trying to find something new to watch. Not new-to-me. Just new. The algorithm had decided, with the confidence of a man who's never been wrong once in his life, that I wanted to watch the same four genres I always watch. It was not wrong. But it also wasn't helping.",
        "normal"
      ),
      textBlock("The Discovery Problem Is Real", "h2"),
      textBlock(
        "There's a version of streaming where the recommendations are your friend. Music does this well — Spotify Discover Weekly will drop you into something completely different from your usual rotation and it works because the signal (listens, skips, saves) is tight. Video is messier. You might start an anime, get 3 episodes in, not love it, but not quit either. Now the algorithm thinks you love it. Congratulations, you have trained it wrong.",
        "normal"
      ),
      textBlock(
        "The shows that are getting buried are mid-budget, mid-tier-popularity series — the exact ones that used to define the medium. The hidden gems. The 'someone mentioned this in passing and it changed my life' category. Those are disappearing from discoverability and it's a problem.",
        "normal"
      ),
      textBlock("What Actually Works", "h2"),
      textBlock(
        "Word of mouth. Discord servers. Letterboxd for anime (yes, people are using it that way). Human curation has not been replaced by machines — it's just harder to find. The solution isn't a better algorithm. It's each other.",
        "normal"
      ),
    ],
  },
];

// ─── Runner ────────────────────────────────────────────────────────────────

async function resolveCategoryRef(slug: string): Promise<string | null> {
  const result = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  return result?._id ?? null;
}

async function resolveTagRef(slug: string): Promise<string | null> {
  const result = await client.fetch<{ _id: string } | null>(
    `*[_type == "tag" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  return result?._id ?? null;
}

async function run() {
  console.log(`\n🕷️  Seeding ${ARTICLES.length} article(s) to Sanity…\n`);

  for (const seed of ARTICLES) {
    const categoryRef = await resolveCategoryRef(seed.categorySlug);
    if (!categoryRef) {
      console.warn(
        `  ⚠️  Category "${seed.categorySlug}" not found in Sanity — skipping "${seed.title}"`
      );
      continue;
    }

    const tagRefs: { _key: string; _type: "reference"; _ref: string }[] = [];
    for (const tagSlug of seed.tags ?? []) {
      const ref = await resolveTagRef(tagSlug);
      if (ref) tagRefs.push({ _key: k(), _type: "reference", _ref: ref });
    }

    const docId = `drafts.scheduled-${seed.slug}`;
    const doc: Record<string, unknown> = {
      _id: docId,
      _type: "article",
      title: seed.title,
      slug: { _type: "slug", current: seed.slug },
      format: seed.format,
      publishedAt: seed.publishedAt,
      excerpt: seed.excerpt,
      body: seed.body,
      category: { _type: "reference", _ref: categoryRef },
      spoilerFree: seed.spoilerFree ?? false,
    };

    if (seed.series) doc.series = seed.series;
    if (tagRefs.length) doc.tags = tagRefs;
    if (seed.moodTags?.length) doc.moodTags = seed.moodTags;
    if (seed.mediaType) doc.mediaType = seed.mediaType;
    if (seed.webRating !== undefined) doc.webRating = seed.webRating;
    if (seed.readingTime !== undefined) doc.readingTime = seed.readingTime;
    if (seed.mediaLength) doc.mediaLength = seed.mediaLength;

    await client.createOrReplace(doc);
    console.log(`  ✅  ${docId}`);
    console.log(`      "${seed.title}"`);
    console.log(`      publishedAt: ${seed.publishedAt}\n`);
  }

  console.log("Done. Review drafts in Studio before publishing.\n");
}

run().catch((err) => {
  console.error("❌  Seed script failed:", err);
  process.exit(1);
});
