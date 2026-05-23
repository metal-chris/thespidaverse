/**
 * Backfill Seed — 2026-03-30 — "Project Hail Mary Is Ryan Gosling in Full Swing"
 *
 * Slot: Backfill calendar row #1 (2026-03-30 Mon, first-bite, movies)
 * Subject: Project Hail Mary (2026 film) — dir. Phil Lord & Christopher Miller,
 *          starring Ryan Gosling. Released March 20 2026. 94% RT. $141M WW opening.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-project-hail-mary.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local  (manage.sanity.io → API → Tokens)
 *
 * Article is upserted as a Sanity draft with _id "drafts.backfill-project-hail-mary".
 * Review in Studio, attach a hero image, then publish.
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

function pullquote(text: string, attribution?: string): any {
  return {
    _key: k(),
    _type: "pullquote",
    text,
    ...(attribution ? { attribution } : {}),
  };
}

// ─── Article body ──────────────────────────────────────────────────────────

const BODY: any[] = [
  textBlock("I'm Still Thinking About This Movie"),
  textBlock(
    "Project Hail Mary came out March 20. Today is March 30. I have thought about this movie every single day since I walked out of the theater. That's not hyperbole — that's a genuine diagnostic symptom. The kind of film that camps out in your head and rearranges the furniture.",
    "normal"
  ),
  textBlock(
    "Phil Lord and Christopher Miller have been living in the Spider-Verse as producers, helping shape one of the best animated franchises in history. This is their first live-action directorial effort together since 22 Jump Street, and they brought that same energy — the 'what if we made this weird AND emotional AND funny at the same time' energy — into deep space. It works better than it has any right to.",
    "normal"
  ),

  textBlock("What You're Walking Into", "h2"),
  textBlock(
    "Ryland Grace (Ryan Gosling) wakes up alone on a spacecraft. No memory of who he is. No idea where he is. Two of his crewmates are dead in their bunks. The ship's AI starts asking him questions — name, occupation, last known location — and watching him piece it together in real time is one of the most quietly gripping opening acts in recent sci-fi cinema.",
    "normal"
  ),
  textBlock(
    "What Ryland eventually remembers: Earth's sun is dying. A microscopic organism called Astrophage has been absorbing the sun's energy, and it's spreading. The math on the extinction timeline is not friendly. Ryland is a former astrobiologist turned middle school science teacher — not an astronaut, not a soldier, not anyone's first choice for 'last hope of humanity.' But here he is, billions of miles from home, on a one-way mission to the star Tau Ceti, which somehow remains unaffected by Astrophage. His job is to figure out why.",
    "normal"
  ),
  textBlock(
    "Andy Weir's novel (2021) is a masterpiece of hard sci-fi — rigorous, funny, deeply humanist. The adaptation challenge is real. You can't just read orbital mechanics to an audience for two hours. Lord and Miller solve this by making the science feel like discovery rather than lecture. Ryland figures things out. The audience figures them out with him. It's interactive in the best way.",
    "normal"
  ),

  pullquote(
    "Ryland Grace is not chosen. He is volunteered. There's a difference, and the film lets that weight sit.",
    "Spida-Mane"
  ),

  textBlock("Gosling at Peak Gosling", "h2"),
  textBlock(
    "There is a version of this movie that casts a traditional action lead and it's fine. It gets 70% on Rotten Tomatoes and nobody talks about it in six months. This version has Ryan Gosling playing a man who cries, talks to himself, makes terrible science jokes to fill the silence, and processes grief in the messiest, most recognizable way possible. It has 94% on Rotten Tomatoes and I am writing about it ten days later.",
    "normal"
  ),
  textBlock(
    "The performance is doing a lot. Gosling is funny — specifically, he's funny in the way that anxious smart people are funny, where the jokes are a defense mechanism and everyone around him knows it. He's also genuinely vulnerable in ways that would feel cheap if the film hadn't earned them. The Barbie era had people worried he'd gone full quirky-Hollywood-guy. This puts that worry to bed. He's grounded here, and it matters.",
    "normal"
  ),

  textBlock("The Part I'm Not Going to Spoil", "h2"),
  textBlock(
    "About halfway through the film, something happens that changes what kind of movie this is. If you've read the book you know exactly what I mean. If you haven't — good. Go in clean. What I'll say is this: there is a relationship in this film that is unlike almost any other relationship in science fiction cinema. It's funny, then sweet, then devastating, in that order, more than once. The back half of Project Hail Mary is carried entirely by this relationship and it lands every single time.",
    "normal"
  ),
  textBlock(
    "There's a moment — you'll know it when you get there — where the film just stops, quietly, and asks you to feel something. No score swelling, no dramatic lighting. Just two characters communicating across an impossible gulf. I was not prepared. The theater was not prepared.",
    "normal"
  ),

  textBlock("The Lord & Miller Touch", "h2"),
  textBlock(
    "Something in the visual language here traces directly back to the Into the Spider-Verse universe that Lord and Miller helped build. Not stylistically — this is grounded, realistic sci-fi cinematography, not animation. But in the way the film trusts you to catch up. The memory-flashback structure is non-linear and it never over-explains itself. The science sequences are treated with care and shot to feel urgent rather than tedious. Big-budget studio filmmaking that doesn't assume you need your hand held.",
    "normal"
  ),
  textBlock(
    "There's also something quietly radical about a $100M-plus sci-fi film that is fundamentally about collaboration and curiosity rather than war or power. The actual drama is epistemological. The question driving every scene is: 'How do we figure this out together?' That's not a premise most studios greenlight. Somebody bet on it here and they were right.",
    "normal"
  ),

  textBlock("Verdict", "h2"),
  textBlock(
    "Project Hail Mary is the best film of 2026 so far and it's not close. It is funny, devastating, scientifically literate, emotionally generous, and it sticks the landing — including one of the most earned endings in recent memory. It opened to $80 million domestic in its first weekend, which is solid but this deserves to cross a billion. Tell your people. Go see it. See it again.",
    "normal"
  ),
  textBlock(
    "Web Rating: 94. If it had a better title sequence it'd be a 97.",
    "normal"
  ),
];

// ─── Article seed ──────────────────────────────────────────────────────────

const ARTICLE_ID = "drafts.backfill-project-hail-mary";

// ─── Runner ────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n🕷️  Seeding backfill article to Sanity…\n");

  const categoryRef = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == "movies"][0]{ _id }`,
    {}
  );

  if (!categoryRef) {
    console.error(
      '❌  Category "movies" not found in Sanity.\n' +
        "    Create it in Studio first, then re-run this script."
    );
    process.exit(1);
  }

  const doc = {
    _id: ARTICLE_ID,
    _type: "article",
    title: "Project Hail Mary Is Ryan Gosling in Full Swing — And It Sticks the Landing",
    slug: { _type: "slug", current: "project-hail-mary-review" },
    format: "first-bite",
    publishedAt: "2026-03-30T13:00:00Z",
    excerpt:
      "Ten days out and Project Hail Mary is still living rent-free in my head. Phil Lord and Christopher Miller sent Ryan Gosling into deep space and somehow made the most emotionally generous sci-fi film in years. Here's why it works.",
    body: BODY,
    category: { _type: "reference", _ref: categoryRef._id },
    moodTags: ["emotional", "thought-provoking", "uplifting"],
    mediaType: "movie",
    webRating: 94,
    readingTime: 7,
    mediaLength: "2h 21m",
    spoilerFree: false,
  };

  await client.createOrReplace(doc);

  console.log(`  ✅  ${ARTICLE_ID}`);
  console.log(`      "Project Hail Mary Is Ryan Gosling in Full Swing — And It Sticks the Landing"`);
  console.log(`      publishedAt: 2026-03-30T13:00:00Z`);
  console.log(`      category: movies | format: first-bite | webRating: 94\n`);
  console.log("  📋  TODO before publishing:");
  console.log("      1. Open Studio → Drafts → search 'backfill-project-hail-mary'");
  console.log("      2. Attach a hero image (movie poster or still)");
  console.log("      3. Add relevant tags (e.g. sci-fi, ryan-gosling, adaptation)");
  console.log("      4. Review body for voice — article was drafted from research, lightly verify facts");
  console.log("      5. Publish\n");
  console.log("Done.\n");
}

run().catch((err) => {
  console.error("❌  Seed script failed:", err);
  process.exit(1);
});
