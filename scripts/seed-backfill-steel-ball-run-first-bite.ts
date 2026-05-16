/**
 * Backfill Seed — Steel Ball Run: First Bite (2026-03-30)
 *
 * Slot:   2026-03-30 · Monday · 13:00 UTC
 * Format: First Bite (first-impressions, ~11 days after Netflix premiere)
 * Category: anime
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-steel-ball-run-first-bite.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   SANITY_WRITE_TOKEN           (sanity.io/manage → API → Tokens → Editor)
 *
 * The "anime" category must already exist in Sanity Studio.
 * Article lands as a Draft — open Studio and publish when ready.
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

// ── Article ───────────────────────────────────────────────────────────────────

const ARTICLES = [
  {
    _id: "drafts.backfill-steel-ball-run-first-bite",
    _type: "article" as const,
    title:
      "Steel Ball Run's First Episode Just Hit Netflix and We Need to Talk",
    slug: { _type: "slug" as const, current: "steel-ball-run-first-bite" },
    format: "first-bite" as const,
    publishedAt: "2026-03-30T13:00:00Z",
    excerpt:
      "Netflix dropped the first episode of JoJo's Bizarre Adventure: Steel Ball Run on March 19 and the internet has been losing it ever since. Here's our first bite — plus why fans are already going to war with Netflix over the release schedule.",
    moodTags: ["hype", "emotional", "intense"],
    mediaType: "anime" as const,
    webRating: 84,
    readingTime: 6,
    mediaLength: "47 min (Episode 1)",
    body: [
      p(
        "Okay so I have to be real with you for a second. I have been waiting for this moment for a long, long time."
      ),
      p(
        "Steel Ball Run. The manga readers have been holding this over anime-only watchers' heads for YEARS. \"Just wait until they get to SBR.\" \"Nothing in anime will top what's coming in Part 7.\" It has been the ultimate flex card in every JoJo argument since 2011. And on March 19, 2026, Netflix finally dropped that first episode — all 47 minutes of it — and yeah... the manga readers were not lying."
      ),
      h2("What Even Is Steel Ball Run?"),
      p(
        "For anyone just tuning in: Steel Ball Run is the seventh arc of JoJo's Bizarre Adventure and it is a complete departure from everything that came before. No Europe, no Egypt, no Japan — this is America, 1890. Johnny Joestar, a paraplegic former horse jockey with nothing left to lose, enters the Steel Ball Run race: a transcontinental cross-country race from San Diego to New York. Somewhere along the way he meets Gyro Zeppeli, a mysterious Italian executioner who uses spinning steel balls as a weapon, and then things get very, very weird."
      ),
      p(
        "The good news for anime-only fans: this is basically a full series reset. You don't need to have watched any previous JoJo to understand it. Netflix is clearly betting on that angle, and honestly? It's the right bet. This is as good an entry point as Part 1 ever was, and the story it's telling is arguably more grounded and emotionally ambitious than anything the franchise has done before."
      ),
      h2("The Episode Itself"),
      p(
        "That 47-minute premiere functions more like a short film than a typical anime first episode, and it earns every minute. The opening sequence — thousands of riders lined up at the starting line in San Diego, the camera sweeping across the crowd before settling on Johnny sitting in the dirt while everyone else prepares around him — is genuinely cinematic. It sets the tone without a single line of expository dialogue. You feel his situation before anyone tells you anything about it."
      ),
      p(
        "David Production, who have been the studio behind every JoJo anime since Part 2, clearly came in with a real budget this time. The animation is mostly spectacular. The action sequences are fluid, the character designs are faithful to Araki's later art style, and there are moments that feel like the team is showing off in the best possible way. The color palette — all dusty golds and sunset reds — makes this feel like a different universe from every previous JoJo season."
      ),
      p(
        "I do need to address the horses though. Some of the horse animation is CGI and yeah, you can tell. It is not unwatchable — we are nowhere near the disaster that some early preview footage had people worried about — but it is there, it is noticeable, and in a show where the entire premise is a cross-country horse race, it sticks out more than it would in any other kind of series. It's the one element keeping this premiere from being a complete technical perfect."
      ),
      h2("Gyro and Johnny — Already"),
      p(
        "Here is the thing about Steel Ball Run: it lives or dies on the chemistry between its two leads. And the dynamic between Johnny and Gyro is already clicking in that first 47 minutes in a way that would take most anime series half a season to establish."
      ),
      p(
        "Gyro Zeppeli is one of the most unhinged, immediately lovable characters in the entire JoJo franchise. Within his first five minutes of screen time he is already doing bits, being deeply weird, and radiating this chaotic-good energy that makes you understand immediately why this man is going to become Johnny's whole world. His voice performance is doing serious heavy lifting and is absolutely delivering on every moment. The dynamic between his energy and Johnny's exhausted resignation is going to carry this show."
      ),
      p(
        "Johnny himself starts the series in a very different emotional place than most JoJo protagonists — broken, bitter, with zero reason to believe anything good is coming his way. Watching him slowly get pulled into Gyro's orbit in that first episode is the whole promise of this story, and the premiere nails it without rushing the relationship or over-explaining it. You just feel it building."
      ),
      h2("The Schedule Situation (We Need to Talk About It)"),
      p("Right. So. Here is where it gets complicated."),
      p(
        "Right after the episode dropped and the internet collectively lost its mind, fans started asking the obvious question: when does episode 2 come out? The answer? Fall 2026. One episode. In all of 2026."
      ),
      p(
        "I am going to be very clear: Netflix and Warner Bros. deserve every bit of the frustration fans are directing at them right now. Steel Ball Run is not a miniseries. It is not a limited event. It is one of the most expansive, most beloved manga arcs ever written — 95 chapters, multiple major interconnected story threads, an ending that has manga readers emotional years after they read it — and they are releasing it in stages with months between them."
      ),
      p(
        "The first episode has been trending globally since it dropped on March 19. It hit number two in the United States the day after release, beating out established Netflix originals and prestige live-action shows. The audience is clearly there. The demand is clearly there. And instead of feeding that momentum with a weekly or biweekly release schedule, they are making everyone wait until October."
      ),
      p(
        "This is not a new Netflix playbook — they ran this same model with Beastars in its early days — but it doesn't make it any less frustrating when the thing you have been waiting years for finally arrives and \"Stage 2: Fall 2026\" is immediately stamped on everything that follows."
      ),
      h3("Why This Actually Matters"),
      p(
        "The scheduling problem is not just annoying in the moment — it's strategically bad for the show's long-term success. Anime has a momentum problem. When a series drops all at once or in consistent weekly windows, communities form around it. Discourse builds. People get obsessed. By the time Stage 2 arrives in fall, the initial heat will have cooled considerably. Some people who would have kept watching weekly will have moved on. That is a real loss for a franchise that deserves better."
      ),
      h2("First Bite Verdict"),
      p(
        "Here is the thing though: none of the scheduling discourse should take away from what the episode itself actually is. This is not the Steel Ball Run adaptation that was going to disappoint manga readers or leave anime-only fans confused. It is, by every early indicator, the real deal. The tone is right, the characters are right, the visual ambition is clearly there from frame one."
      ),
      p(
        "If you are a JoJo anime fan who has been patiently waiting — watch it. Today. Right now. It is 47 minutes of some of the best anime that has dropped in 2026 and it ends on a note that will make the wait for Stage 2 extremely painful in the best possible way."
      ),
      p("Just... maybe don't look up the release schedule until you've finished it."),
    ],
    pollConfig: {
      enableCommunityRating: true,
      pollQuestions: [
        {
          questionKey: "watched_sbr_ep1",
          questionText: "Have you watched Steel Ball Run Episode 1 yet?",
          questionType: "yes_no" as const,
        },
        {
          questionKey: "netflix_schedule_verdict",
          questionText: "What's your take on the Stage 2 fall 2026 release plan?",
          questionType: "this_or_that" as const,
          options: ["Criminal. Release weekly.", "Fine. Quality over speed."],
        },
      ],
    },
  },
];

// ── Runner ────────────────────────────────────────────────────────────────────

async function main() {
  const [article] = ARTICLES;
  console.log(`Seeding backfill article to ${dataset}…\n`);

  const category = await resolveCategory("anime");
  const doc = { ...article, category };

  await client.createOrReplace(doc);
  console.log(`  ✓ ${doc._id}`);
  console.log(`    "${doc.title}"`);
  console.log(`    ${doc.publishedAt}  [${doc.format}]\n`);
  console.log("Done. Open Sanity Studio to review draft and publish.");
}

main().catch((err) => {
  console.error("✗", err.message ?? err);
  process.exit(1);
});
