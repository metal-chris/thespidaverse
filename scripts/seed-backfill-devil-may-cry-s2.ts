/**
 * Backfill seed: ONE article — Devil May Cry Season 2 full-web review
 * (for the 2026-05-13 Wed the-full-web backfill slot)
 *
 * Uses assignBackfillSlot to claim the newest available the-full-web slot
 * from Sanity at runtime — no hardcoded date. Two scripts targeting the same
 * format on the same day cannot collide because the second run sees the first's
 * draft and skips to the next open slot (or throws if the format is full).
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-devil-may-cry-s2.ts          # Create draft
 *   npx tsx scripts/seed-backfill-devil-may-cry-s2.ts --dry    # Print plan, no writes
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
 */

import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
import { assignBackfillSlot, publishedAtFor } from "./lib/backfillSlots";

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
// Article content
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

// publishedAt is intentionally absent — assigned at runtime via assignBackfillSlot.
const ARTICLE: ArticleSeed = {
  slug: "devil-may-cry-s2-vergil-era",
  title: "Devil May Cry Season 2: The Vergil Era Is Finally Here, and It Mostly Delivers",
  format: "the-full-web",
  excerpt:
    "Studio Mir's Netflix adaptation spent a whole season setting up Dante's brother. Season 2 finally puts Vergil at the center — and the result is a messier, moodier show that earns most of its ambition.",
  mediaType: "anime",
  categorySlug: "anime",
  moodTags: ["intense", "hype", "thoughtful"],
  webRating: 76,
  readingTime: 8,
  mediaLength: "8 episodes",
  spoilerFree: false,
  body: [
    p("Devil May Cry Season 2 dropped on Netflix yesterday. I sat with all eight episodes across an evening and most of this morning, which is either a ringing endorsement or an admission that I have a problem with stylized action anime. Probably both."),
    p("The short version: Season 2 is bigger, moodier, and messier than Season 1. It leans into the Vergil arc the first season spent a lot of time teasing. It pays that off in ways that mostly land and a few that don't. If you watched Season 1 and finished it wanting more of the twin-brother mythology — you're getting that, in full, with a side of demonic politics that the show handles with about a B-minus consistency."),
    h2("Where Season 1 left us"),
    p("Season 1 established Studio Mir's version of the Devil May Cry universe as a confident, visually inventive piece of work — closer to Castlevania's tone than to the games' campy bravado. The show respected the source material's iconography (Dante's red coat, Rebellion, Ebony and Ivory) while building out the human characters and the broader demon-world mythology in ways the games only ever gestured at. The back half of Season 1 started threading in Vergil's presence, and by the finale it was clear the show was setting a table."),
    p("Season 2 is what was sitting on that table."),
    h2("The Vergil problem — and why the show solves it"),
    p("Here's the challenge with adapting Vergil: in the games, he's the best character and also mostly vibes. He shows up, he talks about power in a way that is deeply quotable, he fights Dante, he loses, he monologues. The games give him just enough interiority to be compelling without ever making him fully human."),
    p("The Netflix show has to do something different. Eight episodes is enough time that you need a character to be legible on the inside — not just as a foil, but as someone with motivations that track. Robbie Daymond's Vergil is doing that work. The cold-blooded surface is still there; the voice direction plays into the way DMC fans need Vergil to sound. But the show puts him in situations that force him to respond to other people as though he cares about the outcome, and those moments — a confrontation with Lady in episode four, a quiet scene in the demon world mid-season that I'm not going to spoil — are where the season earns its ambition."),
    p("Johnny Yong Bosch as Dante continues to be one of the best pieces of casting in the entire project. Bosch has the range — anyone who watched his work in Bleach and Code Geass knows this — and he uses it. The show's version of Dante is funnier and more wounded than the games usually let him be, and when Bosch gets to play both registers in the same scene, it elevates the material around him."),
    h2("Studio Mir's animation is doing the heavy lifting"),
    p("Studio Mir has been pulling off something tricky: making action animation that reads as anime-adjacent without being a Japanese production. Season 1 had moments of genuine visual invention. Season 2 has more of them. The combat choreography this season is consistently excellent — there's a set-piece in episode six that operates at a level of spatial clarity and kinetic energy that most dedicated action anime can't match."),
    p("The design language for the demon world gets expanded this season, and that's where the studio's 2D-and-CGI blending is most visible. Some of it works. Some of it is the seam where the two techniques don't quite reconcile. It's never egregious enough to take you out of the show, but if you're going in looking for a weak point technically, that's where you'll find it."),
    p("The score under the action is still doing the nu-metal-adjacent thing the first season established. I'll be honest: I thought it would wear on me more than it has. It fits. The show's whole register is 'Linkin Park if Linkin Park had a demon canon,' and the music leans into that correctly."),
    h2("Where the season gets in its own way"),
    p("The pacing. It's the same issue the first season had in spots, and Season 2 is more ambitious about its plot, which means the pacing wobble hits harder. The middle stretch — roughly episodes three through five — is juggling three different story threads, and the cutting between them doesn't always feel earned. There's a subplot involving Lady and a secondary antagonist that the show keeps returning to and then dropping; by the time it resolves, it's had so many false endings that the payoff lands a little flat."),
    p("The world-building is also expanding faster than the show can fully dramatize. Season 2 is introducing factions, histories, and rules about how demon politics work, and while the logic is internally consistent, it's delivering a lot of it through dialogue rather than showing us the stakes in action. The Castlevania comparisons the first season invited still feel useful here — Castlevania had the same tendency to over-explain its mythology in long conversations, but that show had Warren Ellis's ear for how to make that dialogue crackle. Devil May Cry's expository scenes are competent but rarely as sharp."),
    h2("The fan perspective"),
    p("If you came to this show through the games, Season 2 is threading in elements that fans of the wider franchise will recognize — there are beats here that feel like they're pulling from corners of the DMC universe that the mainline numbered games never fully explored. Whether that's exciting or distracting probably depends on how invested you are in the lore. For me it reads as the show treating the games as a living mythology rather than a plot to adapt, which is the correct approach."),
    p("The ending of Season 2 goes somewhere that leaves things open in a way that reads as confident rather than unfinished. The show knows where it's going. Whether it gets to finish the story depends on Netflix doing what Netflix does, which is to say the odds are unpredictable. But what's here is enough of a season to justify the watch regardless of whether Season 3 happens."),
    h2("Web rating"),
    p("76. The ambition earns it a step above the first season; the pacing wobble and the occasionally overloaded mythology cost it a few points from where it could have landed. If you liked Season 1, the ceiling for your enjoyment is higher — Season 2 is a better character drama. If Season 1 lost you on the style-over-substance angle, Season 2 doubles down on the style before it earns the substance, which may not convert you."),
    p("Poll below: how long did it take you to finish all eight episodes?"),
  ],
  enableCommunityRating: true,
  pollQuestions: [
    {
      questionKey: "dmc_s2_binge_speed",
      questionText: "How did you watch Devil May Cry Season 2?",
      questionType: "multiple_choice",
      options: [
        "One sitting (true believer)",
        "A weekend",
        "One episode at a time",
        "Still haven't started",
      ],
    },
  ],
};

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log("Seeding backfill draft: Devil May Cry Season 2 (the-full-web)...");
  if (dryRun) console.log("(dry run — no writes)");

  // Resolve slot dynamically — throws if format is full or unrecognised.
  const slot = await assignBackfillSlot(client, "the-full-web");
  const publishedAt = publishedAtFor(slot);
  console.log(`  Assigned slot: ${publishedAt}`);

  // Resolve category ID.
  const categoryDocs: Array<{ _id: string; slug: { current: string } }> = await client.fetch(
    `*[_type=="category" && slug.current == $slug]{_id, slug}`,
    { slug: ARTICLE.categorySlug }
  );
  if (!categoryDocs.length) {
    console.error(`Missing category in Sanity: ${ARTICLE.categorySlug}`);
    process.exit(1);
  }
  const categoryId = categoryDocs[0]._id;

  const docId = `drafts.backfill-${ARTICLE.slug}`;
  const doc = {
    _id: docId,
    _type: "article",
    title: ARTICLE.title,
    slug: { _type: "slug", current: ARTICLE.slug },
    format: ARTICLE.format,
    publishedAt,
    excerpt: ARTICLE.excerpt,
    body: makeBody(ARTICLE.body),
    spoilerFree: ARTICLE.spoilerFree,
    category: { _type: "reference", _ref: categoryId },
    moodTags: ARTICLE.moodTags,
    mediaType: ARTICLE.mediaType,
    ...(ARTICLE.webRating !== undefined ? { webRating: ARTICLE.webRating } : {}),
    readingTime: ARTICLE.readingTime,
    ...(ARTICLE.mediaLength ? { mediaLength: ARTICLE.mediaLength } : {}),
    pollConfig: {
      enableCommunityRating: ARTICLE.enableCommunityRating,
      pollQuestions: ARTICLE.pollQuestions.map((q, i) => ({
        _key: `q${i}`,
        questionKey: q.questionKey,
        questionText: q.questionText,
        questionType: q.questionType,
        ...(q.options ? { options: q.options } : {}),
        ...(q.rankingItems ? { rankingItems: q.rankingItems } : {}),
      })),
    },
  };

  console.log(`  ${publishedAt.slice(0, 10)}  ${ARTICLE.format.padEnd(20)}  ${ARTICLE.title}`);

  if (dryRun) {
    console.log("\nDone. (dry run — no writes)");
    return;
  }

  try {
    await client.createOrReplace(doc);
    console.log(`\nDone. Created draft: ${docId}`);
  } catch (err) {
    console.error(`Failed: ${(err as Error).message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
