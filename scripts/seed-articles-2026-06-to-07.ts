/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Creates UNPUBLISHED drafts in Sanity for the next 3 slots after the
 * 2026-06-10 schedule horizon documented in docs/CONTENT_SCHEDULE.md.
 * Drafts hold body, polls, and metadata — they will only appear on the
 * site once published manually in Studio.
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
    slug: "shangri-la-frontier-s2-netflix",
    title: "Shangri-La Frontier S2 Hit Netflix and I've Already Lost a Weekend",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "A show about a guy who games inside a game — and somehow that premise produces one of the more interesting battle anime in recent memory. S2 is on Netflix and it is cooking.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "chill", "obsessed"],
    webRating: 85,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Okay so Shangri-La Frontier S2 dropped on Netflix and I need everyone to calm down while I explain why this show works when it has absolutely no right to."),
      p("The premise is: guy who specifically seeks out badly-designed, broken, 'kusoge' video games — the janky ones, the glitchy ones, the games everyone stopped playing — tries his hand at Shangri-La Frontier, a massively popular VR MMO that is actually well-made. He then proceeds to break it using the instincts he developed from a lifetime of playing trash games. That's it. That's the show."),
      p("Season 1 was a slow build. It took a few episodes to click — the worldbuilding is dense in the way that MMO anime tends to be, and you need to accept that some of the early dungeon sequences are table-setting for payoffs that hit later. Once it clicked, though, it clicked hard. Sunraku versus Wethermon the Tombguard is one of the best single-arc fights S1 anime produced last year."),
      h2("What S2 does differently"),
      p("S2 moves faster and it trusts you to keep up. The guild mechanics that S1 introduced as background texture are now load-bearing plot infrastructure. The cast of players around Sunraku — who were mostly window dressing before — start actually mattering in S2's second episode, and the show is better for it."),
      p("The thing that keeps Shangri-La Frontier from being Just Another Isekai-Adjacent Gaming Anime is Sunraku's specific expertise. He's not a prodigy. He's not blessed with special powers. He's a nerd who has played so many garbage games that he reads enemy attack patterns before anyone else thinks to look. That's a character hook that holds up over time in a way that 'chosen one energy' usually doesn't."),
      h2("The animation situation"),
      p("C2C — the studio — is not flush. The budget is visible in places where you'd prefer it wasn't. A few fight sequences in the first two episodes show clear corner-cutting in the wide shots, and some of the character designs in crowd scenes are rough."),
      p("But the sequences that matter — the boss encounters — are given enough budget to deliver. The Wethermon callback in episode three is gorgeous in a way that makes the budget wobbles elsewhere feel intentional, like they're saving it for when it counts."),
      h2("Should you watch"),
      p("If you liked S1, S2 is better — easier call I've made in a while. If you haven't started: the S1 slow burn is real and you should accept it. Three episodes minimum before you decide. If you're out by then, this show isn't for you, and that's fine."),
      p("Web rating: 85. Has the ceiling to go higher if S2 sticks its ending. Poll below — are you adding this to your queue or already three episodes in?"),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "shangri_la_queue",
        questionText: "Where are you on Shangri-La Frontier?",
        questionType: "multiple_choice",
        options: [
          "Already caught up on S2",
          "On S1, S2 next",
          "Adding to queue now",
          "Not for me",
        ],
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "persona-live-action-tv-show-announced",
    title: "They Announced a Persona Live-Action TV Show and I Have Feelings About This",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "A Persona live-action TV adaptation is officially in development. The announcement came out of the June game-to-screen wave and I don't know how to feel yet.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["news", "skeptical", "hype"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("So they announced a Persona live-action TV show. A real one. In development. And I am processing this like a normal person, which is to say I immediately went and replayed the Persona 5 opening cinematic to remind myself what I'm protecting."),
      p("The announcement dropped in the wake of June's game-to-screen news cycle — which also included Sea of Thieves getting a live-action movie, which is a different conversation — and the details are sparse. No cast. No streamer confirmed. No showrunner publicly attached. Just: it is happening, and someone at Atlus signed off on it."),
      h2("The case for optimism"),
      p("The Last of Us happened. That's the case for optimism. There was a version of this conversation five years ago where the Persona announcement would have been automatic bad news, because video game adaptations had a track record of landing between 'mediocre' and 'actively damaging to the source material.' The Last of Us changed that. Arcane changed that. The runway now exists for a Persona adaptation to be excellent."),
      p("The specific material — Persona 5 is the obvious IP to lead with, given its cultural footprint — is built for prestige TV. Confidants as supporting arcs, the Velvet Room as a recurring atmosphere piece, the Phantom Thieves as a found-family ensemble. You can construct a compelling limited series from that."),
      h2("The case for caution"),
      p("Persona's power is in its pace. The games are 80-100 hours of relationship-building before the payoffs mean anything. A 10-episode TV season compresses that into a timeline where the Confidant arcs either get flattened or get cut. The ghost of what they'll inevitably lose is already loud."),
      p("The anime adaptation — Persona 5: The Animation — exists as a cautionary tale. It hit all the plot beats. It reproduced the scenes. It felt like a highlight reel of a game you'd already played, without the bones underneath that make the game feel like a life."),
      h2("Spider-sense"),
      p("I think they're going for Persona 5. I think the right call is a limited series that doesn't try to adapt the full game — adapt one arc. The Casino arc could be a self-contained six episodes that lands. Give me that and I'll believe in it."),
      p("How hyped are you? Honest hot take below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "persona_tv_hype",
        questionText: "How hyped are you for the Persona live-action series?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-frieren-vs-mushishi",
    title: "Versus: Frieren vs. Mushishi — Which Slow Fantasy Actually Hits Harder?",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Two anime about long-lived wanderers moving through a world that keeps changing around them. Two completely different answers to the same question: what is fantasy actually for?",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["thoughtful", "comparative", "chill"],
    webRating: 94,
    readingTime: 10,
    spoilerFree: true,
    body: [
      p("Two anime. Two wanderers who have outlived their eras. Two shows that ask what it means to move through a world that keeps changing around you — and arrive at completely different answers."),
      p("Frieren: Beyond Journey's End vs. Mushishi. Let's go."),
      h2("What they share"),
      p("The surface comparison is obvious: both shows center on a single, long-lived protagonist who travels alone (or nearly alone) through a world full of supernatural elements, collecting small encounters that carry emotional weight out of proportion to their scope. Neither show is in a hurry. Both reward patience in a way that modern anime is often afraid to ask for."),
      p("They also share an aesthetic of restraint. The action in Frieren is deliberate and infrequent. The action in Mushishi barely exists. Both shows understand that the emotional beat of a quiet scene depends on the space you let it occupy, and neither flinches from the silence."),
      h2("The case for Frieren"),
      p("Frieren lands in a specific cultural moment. It premiered at the tail end of a decade when isekai had been so dominant that 'fantasy anime' had come to mean 'guy gets truck-kun'd into a videogame world.' Frieren is the anti-isekai: it's about what happens after the adventure ends, told from the perspective of someone for whom the adventure was a footnote in an impossibly long life."),
      p("The emotional engine is grief. Frieren doesn't know how to grieve Himmel because she didn't understand, while he was alive, that his life would feel short to her. The show's project is watching her learn how to feel a loss she didn't recognize while it was happening. That's one of the more emotionally intelligent setups in recent anime, and the writing earns it at nearly every turn."),
      p("The production from Madhouse is stunning. The color palette during the northern winter arc is the kind of thing you save as a reference image. The magic system is under-explained by design — Frieren's powers are vast and only partially revealed — and the show uses that ambiguity to generate tension in a way that more conventional systems can't."),
      h2("The case for Mushishi"),
      p("Mushishi is older — it premiered in 2005, with a 2014 continuation — and it earns the title of 'slow fantasy' in a way that Frieren is still growing into. Ginko moves through a Japan-adjacent world where 'mushi' — primordial life forms that most humans can't perceive — cause strange ailments, transformations, and phenomena. Ginko mediates. Sometimes he solves. Sometimes he doesn't."),
      p("The structural difference is significant: Mushishi is fully episodic. There is no overarching plot, no endgame, no quest. Each episode is a standalone encounter that illuminates a facet of the mushi world and, usually, a facet of what it means to live in proximity to forces beyond your understanding. Ginko is the constant, not the protagonist in any traditional sense."),
      p("What Mushishi does that Frieren doesn't — and can't, because of structure — is accumulate meaning through absence. Because there's no plot thread to pull, every episode has to earn its existence independently. The result, across 46 episodes and two features, is a body of work where the weakest entry is still beautiful and the strongest is in the conversation for best anime episode of its era."),
      h2("Where they diverge on the same question"),
      p("Both shows are trying to answer the same question: what is fantasy for?"),
      p("Frieren's answer is memory and relationship. Fantasy is the context in which people become real to each other, and the magic is incidental to the connection. The adventure mattered because of who she traveled with, not what she did."),
      p("Mushishi's answer is coexistence. Fantasy is the space in which humans learn (or fail to learn) how to live alongside forces they can't fully comprehend. Ginko isn't trying to fix the world. He's trying to reduce suffering within a system that was never designed for human comfort. That's a quieter, darker, more honest take."),
      h2("The verdict"),
      p("Web rating: 94 — applied to both, and I mean it for both."),
      p("If you're asking which one to start with: Frieren is the easier entry point. It has a hook, it has an emotional throughline, it has animation that will grab you inside the first episode. The investment pays off faster."),
      p("If you're asking which one is better: I don't think that's the right question. Mushishi is 20 years old and it hasn't been replaced. Frieren is three years old and already in the conversation with the all-time greats. That says something about both of them."),
      p("Pick your side in the poll below. No right answer — unless you say neither, in which case we need to talk."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "frieren_vs_mushishi",
        questionText: "Which one hits harder?",
        questionType: "this_or_that",
        options: ["Frieren: Beyond Journey's End", "Mushishi"],
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
