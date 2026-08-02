/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Extends the schedule past 2026-06-10. Creates UNPUBLISHED drafts in Sanity
 * for the next three slots: Sat 2026-06-13, Mon 2026-06-15, Wed 2026-06-17.
 * Drafts will only appear on the site once published manually in Studio.
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
    slug: "shangri-la-frontier-s2-two-weeks-in",
    title: "Shangri-La Frontier S2 Is Two Weeks Deep on Netflix and You're Running Out of Excuses",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "C2C is back, Sunraku is still treating every raid boss like a trash-game final level, and S2 hit Netflix two weeks ago. What are you waiting for.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["fun", "hype", "intense"],
    webRating: 85,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Two weeks since Shangri-La Frontier Season 2 landed on Netflix. If you haven't started, I'm going to need an explanation."),
      p("Here's what the show is for anyone who's somehow still on the outside: Rakurou Hizutome — username Sunraku — is a gamer who has dedicated his life to playing the worst games ever made and beating them anyway. The joke being that his trash-game muscle memory makes him genuinely unbeatable when he drops into Shangri-La Frontier, a top-tier VR MMO where no one has ever beaten the Unique Monsters. And Sunraku, unbothered, starts clearing them."),
      p("It's the ideal gamer power fantasy executed with actual craft. Studio C2C didn't just animate the action — they committed to making Sunraku's trash-game intuition feel like a genuine superpower, which requires the animation to make every unorthodox choice look smart in retrospect. S1 pulled it off. S2 is pulling it off harder."),
      h2("What S2 does differently"),
      p("The scope expands. The guild ecosystem gets more screen time, the scale of what's at stake in the fights goes up, and the show starts asking what it actually means to be the best player in a world where being the best player was previously considered impossible. It's not a deep question — Shangri-La Frontier isn't trying to be a deep show — but it earns the weight it puts on it."),
      p("The animation quality stays consistent in a way that a lot of sequels don't manage. C2C clearly knew what they had after S1 and didn't cut corners on the fights that matter. The set pieces are the selling point and they deliver."),
      h2("Who this is for"),
      p("If you bounced off isekai in general — fair. Shangri-La Frontier isn't technically isekai (Sunraku isn't transported to another world; he's playing a game) but it has the DNA. The difference is that the show never pretends the protagonist is discovering himself. He already knows who he is. He's a guy who beats bad games for fun and now he's beating impossible ones for the same reason."),
      p("That clarity is the thing I keep coming back to. Sunraku doesn't have an arc in the traditional sense. He just keeps winning in increasingly improbable ways, and the show is good enough at the spectacle of it that I don't mind."),
      h2("The verdict"),
      p("Web rating: 85. Everything I wanted from S2. The fun-to-runtime ratio is excellent and the fights justify the episode count. Add five points if you played MMOs in the 2000s; the nostalgia hit is real."),
      p("Adding it to the list? Tell me in the poll."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "shangri_la_s2_on_list",
        questionText: "Is Shangri-La Frontier S2 on your watch list?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "supergirl-2026-dcu-preview",
    title: "Supergirl Drops in 11 Days and the DCU Is Either About to Build or Buckle",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Milly Alcock. Craig Gillespie directing. Tom King's Woman of Tomorrow as the source. The second DCU movie arrives June 26 and the vibes are genuinely split.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["news", "cautious", "hype"],
    webRating: 0,
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Eleven days. Supergirl: Woman of Tomorrow lands on June 26 and the DCU's second major test is almost here."),
      p("The context: Superman (2025) was genuinely good. Not \"good for a superhero movie\" — good, full stop. It set a bar that raised expectations for everything James Gunn's DC Universe would follow it with. Supergirl is the follow-up, and the pressure is real."),
      h2("What the casting got right"),
      p("Milly Alcock is the correct casting choice and the discourse around it has been frustrating in a very specific way. If you watched House of the Dragon Season 1, you know she can carry a scene that needs both gravity and barely-contained chaos at the same time. That's the entire skill set for Tom King's version of Kara Zor-El — a character who has been through more than Clark Kent and has not come out the other side with his optimism."),
      p("Jason Momoa as Lobo is the other casting beat worth paying attention to. Lobo is a character who has defeated every screen adaptation attempted so far. Momoa has enough self-aware energy to pull it off if the script lets him. Whether the script lets him is the question."),
      h2("The adaptation challenge"),
      p("Tom King's Supergirl: Woman of Tomorrow is a deliberately difficult comic to adapt. It's a road-trip revenge story told from the perspective of a young girl who watches Supergirl operate — and it's less interested in heroism than it is in what happens when a Kryptonian who grew up before Krypton exploded has nothing left to prove to anyone. It's dark in ways that don't immediately map to blockbuster cinema."),
      p("Craig Gillespie directed I, Tonya and Cruella — both of which handled difficult protagonists in unconventional structures. That's either exactly the right hire or a coincidence that means nothing depending on what the script gave him to work with."),
      h2("Spider-sense"),
      p("I am cautiously in the \"trust the cast\" camp. But I've been burned by that instinct before. If Gunn's oversight is what I hope it is, the DCU gets another win. If the script didn't survive the adaptation process, it's going to be a loud two weeks after June 26."),
      p("How hyped are you? Hot take meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "supergirl_dcu_hype",
        questionText: "How hyped are you for Supergirl (2026)?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-frieren-vs-mushoku-tensei",
    title: "Versus: Frieren vs. Mushoku Tensei — Two Visions of What Fantasy Anime Can Be",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "One is a meditation on grief, time, and the weight of centuries. The other is a world-building machine that has never cared what you thought of its protagonist. With Mushoku Tensei S3 dropping this summer, the debate is at peak temperature. Pick your side.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["comparative", "thoughtful", "debate"],
    webRating: 0,
    readingTime: 9,
    spoilerFree: false,
    body: [
      p("Two shows. Both widely considered the standard-bearers for fantasy anime in the 2020s. Completely opposite philosophies about what a fantasy anime is actually for. With Mushoku Tensei: Jobless Reincarnation Season 3 dropping this summer, the debate between the two camps is at maximum temperature. Let's settle it."),
      h2("The case for Frieren: Beyond Journey's End"),
      p("Frieren: Beyond Journey's End won Anime of the Year at the 2024 Crunchyroll Anime Awards, and the case for it winning is airtight. The premise is devastatingly simple: an elven mage named Frieren goes on a decades-long quest, watches everyone she adventured with grow old and die, and slowly comes to understand that she never paid enough attention while they were alive. The show is about grief. It's about time. It's about what it means to be present for the people you're standing next to."),
      p("Madhouse brought their A-team. The animation is quiet in a way that takes real confidence — Frieren doesn't try to impress you with action sequences. It impresses you with stillness and the kind of scene composition that makes every pause feel earned."),
      p("What Frieren does that almost nothing else does: it makes you feel the passage of time at a structural level. By the end of the series, the audience has had time do the same work on them that it does on Frieren. That's a trick I've never seen pulled off this cleanly."),
      h2("The case for Mushoku Tensei: Jobless Reincarnation"),
      p("Mushoku Tensei is the show that Frieren fans often don't want to admit exists in the same conversation — and it's better for it. Studio Bind built something genuinely unusual: a fantasy world that feels like it predates the story being told in it. The geography, the politics, the magic system, the class structures — they all feel like they were here before Rudeus Greyrat arrived, and they'll be here after he's gone."),
      p("Rudeus is the most contentious protagonist in recent fantasy anime. He made choices in the early seasons that the show doesn't excuse. What the show does instead is track consequence — over seasons, over years of in-universe time, Rudeus is the product of what he's done and what's been done to him, and the slow arc toward someone worth rooting for is genuinely earned by S2's end. S3 this summer is the payoff."),
      p("The ambition of Mushoku Tensei is different from Frieren's. It's not asking what time does to people. It's asking what a person does with the time they have, even if they start from the worst possible position."),
      h2("The philosophical split"),
      p("Frieren trusts the audience to sit with absence. The most important thing in the show is often the person who isn't there. Mushoku Tensei trusts the audience to sit with presence — the protagonist's presence, his failures, his growth, his compounding history."),
      p("Frieren is the show you watch when you want to feel something you've been putting off. Mushoku Tensei is the show you watch when you want to watch someone climb out of a hole they dug themselves, slowly, over multiple seasons, without shortcuts."),
      p("They're not the same show. They're not trying to be. The question is which one you need."),
      h2("Which one stuck the landing"),
      p("Frieren finished its run in a complete state and the finale landed. It did the thing. Mushoku Tensei is mid-run, with S3 dropping this summer, and the finale question is still open."),
      p("That's the honest answer to the comparison: Frieren is complete. Mushoku Tensei is building. You can hold both. But for this moment, mid-summer 2026, with S3 on the horizon, Mushoku Tensei's potential is in the air in a way Frieren's already-realized achievement isn't."),
      h2("The verdict"),
      p("If I had to hand one to someone who has never seen either: Frieren. The on-ramp is lower, the emotional payoff comes faster, and the show works as a standalone statement."),
      p("If I had to hand one to someone who wants a long investment that pays off over seasons: Mushoku Tensei, and make sure they're prepared for the protagonist's early seasons being genuinely uncomfortable."),
      p("Which is the better fantasy anime? Pick your side below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "frieren_vs_mushoku_tensei",
        questionText: "Which is the better 2020s fantasy anime?",
        questionType: "this_or_that",
        options: ["Frieren: Beyond Journey's End", "Mushoku Tensei: Jobless Reincarnation"],
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
