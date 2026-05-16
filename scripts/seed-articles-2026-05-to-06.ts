/**
 * Seed Forward-Schedule Articles (May–June 2026)
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   SANITY_WRITE_TOKEN           (sanity.io/manage → API → Tokens → Editor)
 *
 * Pre-requisites:
 *   Category documents must exist in Sanity Studio before running.
 *   Expected slugs: anime, movies, tv, video-games, music, culture, books, tech
 *
 * Each article lands in Sanity as a Draft with _id prefix "drafts.scheduled-".
 * Open Sanity Studio and publish drafts when ready to go live.
 */

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// ── Env ───────────────────────────────────────────────────────────────────────

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("✗ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "✗ Missing SANITY_WRITE_TOKEN in .env.local\n" +
      "  Generate one at: https://sanity.io/manage → your project → API → Tokens"
  );
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface Block {
  _type: "block";
  _key: string;
  style: string;
  children: Span[];
  markDefs: unknown[];
}

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

/** Shape used to define each article before it's inserted into Sanity. */
interface ArticleSeed {
  /** Full Sanity _id. Use "drafts.scheduled-<slug>" for forward schedule. */
  _id: string;
  title: string;
  /** URL-safe slug string — becomes { _type: "slug", current: slug }. */
  slug: string;
  format:
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
  series?: "cartoons-and-cereal";
  /** ISO 8601 — use Mon 13:00, Wed 15:00, Sat 14:00 UTC per cadence. */
  publishedAt: string;
  excerpt: string;
  /** Must match a Category document slug already in Sanity Studio. */
  categorySlug: string;
  moodTags?: string[];
  mediaType?: "movie" | "tv" | "game" | "anime" | "books" | "music";
  webRating?: number;
  readingTime?: number;
  mediaLength?: string;
  body: Block[];
  pollConfig?: {
    enableCommunityRating: boolean;
    pollQuestions?: PollQuestion[];
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let _keyCounter = 0;

function key(): string {
  return `k${(++_keyCounter).toString(36).padStart(4, "0")}`;
}

function p(text: string, style = "normal"): Block {
  return {
    _type: "block",
    _key: key(),
    style,
    children: [{ _type: "span", _key: key(), text, marks: [] }],
    markDefs: [],
  };
}

function h2(text: string): Block {
  return p(text, "h2");
}

function h3(text: string): Block {
  return p(text, "h3");
}

async function resolveCategory(
  slug: string
): Promise<{ _type: "reference"; _ref: string }> {
  const doc = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!doc) {
    throw new Error(
      `Category not found: "${slug}". Create it in Sanity Studio first.`
    );
  }
  return { _type: "reference", _ref: doc._id };
}

// ── Articles ──────────────────────────────────────────────────────────────────

const ARTICLES: ArticleSeed[] = [
  // -------------------------------------------------------------------------
  // Example stub — replace with real articles before running.
  // This file is the CANONICAL SHAPE REFERENCE for all seed scripts.
  // Backfill scripts follow the same shape with _id prefix "drafts.backfill-".
  // -------------------------------------------------------------------------
  {
    _id: "drafts.scheduled-2026-05-18-example-first-bite",
    title: "Example First Bite — Replace This",
    slug: "example-first-bite-2026-05-18",
    format: "first-bite",
    publishedAt: "2026-05-18T13:00:00Z",
    excerpt: "Example excerpt — this stub is here to document the ArticleSeed shape.",
    categorySlug: "anime",
    moodTags: ["hype"],
    mediaType: "anime",
    webRating: 80,
    readingTime: 5,
    body: [
      p("This is an example paragraph. Replace with real article content."),
      h2("Example Section Header"),
      p("More example content here."),
      h3("Example Subsection"),
      p("Body blocks use Sanity Portable Text format via the p/h2/h3 helpers."),
    ],
    pollConfig: {
      enableCommunityRating: true,
      pollQuestions: [
        {
          questionKey: "have_you_watched",
          questionText: "Have you watched this yet?",
          questionType: "yes_no",
        },
      ],
    },
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${ARTICLES.length} article(s) to ${dataset}…\n`);

  for (const seed of ARTICLES) {
    const { categorySlug, slug, ...rest } = seed;

    const category = await resolveCategory(categorySlug);

    const doc = {
      ...rest,
      _type: "article" as const,
      slug: { _type: "slug" as const, current: slug },
      category,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${doc._id}`);
    console.log(`    "${doc.title}"`);
    console.log(`    ${doc.publishedAt}  [${seed.format}]\n`);
  }

  console.log("Done. Open Sanity Studio to review and publish drafts.");
}

main().catch((err) => {
  console.error("✗", err.message ?? err);
  process.exit(1);
});
