/**
 * Backfill: Devil May Cry Season 2 — 2026-05-13 (the-full-web)
 *
 * Creates a single UNPUBLISHED draft in Sanity for the 2026-05-13 backfill slot
 * documented in docs/CONTENT_WORKFLOW.md (Backfill calendar, 'Drafted' rows).
 * The draft holds body, polls, and metadata — it will only appear on the site
 * once published manually in Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-devil-may-cry-s2-vergil-show.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-devil-may-cry-s2-vergil-show.ts --dry    # Print plan, no writes
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
  // ----- Backfill: Wed 2026-05-13 — the-full-web
  {
    slug: "devil-may-cry-s2-vergil-show",
    title: "Devil May Cry S2 Is the Vergil Show — and I'm Not Complaining",
    format: "the-full-web",
    publishedAt: "2026-05-13T15:00:00.000Z",
    excerpt:
      "Netflix dropped all eight episodes of Devil May Cry Season 2 yesterday. Studio Mir animated it. Adi Shankar wrote it. Robbie Daymond's Vergil immediately made you forget Dante exists.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["hype", "intense", "thoughtful"],
    webRating: 84,
    readingTime: 8,
    mediaLength: "8 episodes",
    spoilerFree: false,
    body: [
      p("Netflix dropped all eight episodes of Devil May Cry Season 2 yesterday. I watched all eight episodes of Devil May Cry Season 2 yesterday. These are related events."),
      p("I've been sitting with it overnight and the verdict is: Adi Shankar and Studio Mir built a sharper, meaner season — and the secret weapon isn't Dante. It's never been Dante. It's Vergil."),
      h2("What this show is (catch-up for the uninitiated)"),
      p("Devil May Cry the animated series is Adi Shankar's adaptation of Capcom's 20-year-old hack-and-slash franchise. Season 1 — which dropped in 2024 — followed Dante, a half-demon demon hunter who runs the world's least profitable office, fights creatures from hell for money, and has the fashion sense of a man who has never once seen himself in a mirror. He has big hair, a big sword, and a bigger gun, and the show leaned into all of it."),
      p("What Season 1 got right was the tone. Dante is supposed to be ridiculous. The games are ridiculous. The whole franchise runs on 'so cool it's stupid, so stupid it's cool,' and the animated series understood that. What Season 1 didn't quite get right was the stakes — by the time the final boss arrived, the emotional weight was thinner than it needed to be."),
      p("Season 2 fixes that by introducing the only person who has ever made Dante feel genuinely small: his twin brother Vergil."),
      h2("The Vergil problem"),
      p("If you know the games, you know the Dante/Vergil dynamic is the beating heart of the franchise. DMC3: Dante's Awakening — which is what Season 2 is largely pulling from — is the game that gave the franchise its emotional backbone. Two brothers, same demonic heritage, completely opposite responses to it. Dante embraces the chaos. Vergil rejects it, buries it, turns himself into something colder than a person."),
      p("The show gives Robbie Daymond room to work with that tension, and he delivers. Vergil in this season is terrifying not because he's powerful — and he is extremely, unreasonably powerful — but because he's reasonable. Every choice he makes has a logic. The logic is horrifying, but it's there. Daymond plays him with a register that sits just below menace, patient and precise, and it makes every scene he shares with Johnny Yong Bosch's Dante feel like a coiled wire about to snap."),
      p("Bosch is doing the same Dante he did in Season 1, which is correct. Dante should be the same guy. What the writers do differently this time is put that consistent guy in rooms where his consistency is the problem — where the joke and the casual confidence and the red-coat swagger run directly into something that doesn't care about any of it. That's the show this season."),
      h2("Studio Mir doing what Studio Mir does"),
      p("If you're here for the animation discourse: yes, it's excellent. Studio Mir has been flexing a specific muscle since The Legend of Korra, and that muscle is action choreography that reads in still frames. You can pause Devil May Cry Season 2 at almost any moment during a fight and it looks like a promotional still. The fight in Episode 4 — the rooftop sequence with the Artemis weapon — is the season's visual centerpiece and it runs almost seven minutes without a cut that doesn't earn itself."),
      p("The lighting work is where Mir distinguishes itself from a lot of Western-produced animation. They understand that a fight between two half-demons should look supernatural without looking cheap, and supernatural lighting is the difference between a stylized action sequence and a screenshot from a game cutscene. DMC S2 is firmly in the former category."),
      p("Where it occasionally stumbles is in the quieter scenes. The character animation during dialogue is fine — it's not bad, it's just not as locked-in as the action work, and the contrast is noticeable when you go from a hallway conversation to a boss fight in the span of two minutes. Some of the facial acting during the heavier emotional beats needed another pass."),
      h2("Lady and the supporting bench"),
      p("Scout Taylor-Compton's Lady gets more to do this season, which is welcome. In Season 1 she was the show's designated ground-level perspective — the human who doesn't fully trust the demons she's working with — and that's a useful narrative function that the show underutilized. Season 2 expands her role into something closer to co-protagonist status in the back half, and Taylor-Compton handles the shift well."),
      p("Arius as the season's surface-level antagonist is serviceable. He's a corporate villain, which is a gear the DMC games have leaned on before, and the show doesn't do anything especially original with him. He works as a mechanism for getting Dante and Vergil into conflict; he doesn't work as someone you're particularly invested in as a threat on his own terms. That's a minor complaint given how clearly the show understands that the real antagonist is Vergil."),
      h2("What doesn't quite land"),
      p("The pacing in the middle of the season has a wobble. Episodes 4 and 5 both feel like they're setting up the back half rather than doing their own work, and there's a subplot in Episode 5 involving a secondary demon faction that gets introduced and then largely abandoned before it can breathe. Shankar clearly had a lot of mythology to establish for the Dante/Vergil confrontation and it shows in how compressed some of the world-building feels."),
      p("There's also a question about what the show wants to be tonally. Season 1 leaned into the camp — the swagger, the demon pizza, Dante being objectively insufferable in a way the show was in on. Season 2 leans harder into the emotional stakes of the Vergil arc, and some of the tonal whiplash between 'Dante makes a quip' and 'Vergil describes a genuinely dark philosophy of personhood' is more abrupt than it should be. Both registers work. The show doesn't always know which one it's in."),
      h2("The verdict"),
      p("Devil May Cry Season 2 is better than Season 1 in almost every way that matters. It has a clearer emotional core, a stronger central conflict, and in Vergil it has a character who can actually match Dante at the level the show needs. The animation is still the best-looking American-produced action animation on any streaming service right now. Studio Mir is not slowing down."),
      p("If you watched Season 1 and it didn't fully grab you — give this season two episodes. The show knows what it's doing now. If you haven't watched Season 1: watch it, it's eight episodes, it's on Netflix, and it ends on a setup that Season 2 pays off properly."),
      p("Web rating: 84. The wobble in the middle keeps it out of the high 80s. Everything else pushes it up there."),
      p("Tell me if you watched Season 1 in the poll below — curious how many people are coming in cold."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "dmc_s2_watched_s1",
        questionText: "Did you watch Devil May Cry Season 1 first?",
        questionType: "yes_no",
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
