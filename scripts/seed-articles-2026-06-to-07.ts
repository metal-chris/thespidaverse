/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-20)
 *
 * Extends the forward calendar past 2026-06-10 with the next 3 cadence slots.
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
  // ----- 1. Mon 2026-06-13 — the-daily-bugle
  {
    slug: "ff7-revelation-summer-game-fest-announced",
    title: "Final Fantasy VII: Revelation Was the Last Slide at Summer Game Fest and I'm Still Processing",
    format: "the-daily-bugle",
    publishedAt: "2026-06-13T13:00:00.000Z",
    excerpt:
      "Square Enix closed Summer Game Fest with a world premiere for the final chapter of the FF7 Remake trilogy. We're really doing this.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "emotional"],
    webRating: 0,
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Square Enix ended Summer Game Fest 2026 with a world premiere for Final Fantasy VII: Revelation — the third and final chapter of the remake trilogy — and I had to walk around my apartment for ten minutes before I could write anything coherent about it."),
      p("Quick context if you've been living offline: Final Fantasy VII Remake (2020) split the original game's Midgar section into a full standalone RPG, then Rebirth (2024) opened the world map and ran through the bulk of the original story. Revelation is the closer. We're getting the ending. We're finding out what this creative team — which has been rewriting and expanding the original timeline in ways that range from subtle to genuinely ballsy — is going to do with the most emotionally loaded moment in JRPG history."),
      h2("What the trailer showed"),
      p("Not much. Which is the right call. A black screen, the FF7 Remake main theme building slowly, and then a single shot of the Northern Crater. No gameplay. No voice lines. Just the logo: Final Fantasy VII: Revelation. A 2027 window, platform TBD."),
      p("That's all you need for the people who need it. And for the people who don't know why that single cave shot matters — you have time to catch up on Remake and Rebirth before 2027. I genuinely recommend it."),
      h2("The context around the reveal"),
      p("Revelation is landing the week after Rebirth finally hit Switch 2 and Xbox (June 3). Square Enix clearly wanted one week of Rebirth-on-new-platforms coverage before dropping this bomb. Smart. The timing means the fanbase that just experienced Rebirth for the first time is now immediately invested in where the story goes."),
      p("Resident Evil: Veronica also opened the show — a full RE Engine remake of Code Veronica — which means Summer Game Fest 2026 had Capcom's nostalgia bait at the front door and Square Enix's emotional grenade at the exit. That's a well-constructed showcase."),
      h2("Spider-sense"),
      p("2027 window is deliberately vague. I think they're targeting late 2027 but leaving room to slip. After Rebirth's 18-month development stretch, I don't expect them to rush this. Whenever it lands, I will be there on day one."),
      p("How hyped are you? Tell me in the poll — and be honest about whether you've actually played Rebirth yet."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "ff7_revelation_hype",
        questionText: "How hyped are you for Final Fantasy VII: Revelation?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 2. Wed 2026-06-17 — versus
  {
    slug: "versus-ffvii-rebirth-vs-ffxvi",
    title: "Versus: Final Fantasy VII Rebirth vs Final Fantasy XVI — Two Visions of What Final Fantasy Is",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Rebirth just landed on Switch 2 and Xbox. XVI is still standing as the 'other' prestige FF of the decade. With Revelation on the horizon, it's time to settle this.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["thoughtful", "comparative"],
    webRating: 93,
    readingTime: 10,
    spoilerFree: false,
    body: [
      p("Final Fantasy VII Rebirth just landed on Switch 2 and Xbox earlier this month, which means a new wave of players is finally going through what PS5 owners have had since early 2024. And with Final Fantasy VII: Revelation now officially on the horizon, it feels like the right moment to settle something the fanbase has been quietly arguing about for two years: Rebirth or XVI?"),
      p("Two different games. Two different philosophies. One franchise that has spent the last decade figuring out what it wants to be when it grows up."),
      h2("The case for Final Fantasy VII Rebirth"),
      p("Rebirth is the more ambitious game. By a significant margin. The open world across six regions — each with distinct terrain, sidequests, and minigames — is the most content-dense entry in the franchise's history. The combat system, which builds on Remake's ATB-action hybrid, now has six playable characters with distinct move sets and synergy abilities that change what's possible in combat. And the story is doing something genuinely risky: it's rewriting one of the most beloved narratives in gaming history in real time, and it's doing it with enough confidence that you either buy in completely or spend the whole game slightly offside."),
      p("The Zack subplot alone — which was seeded in Remake and blooms here into something that recontextualizes the entire trilogy — is the kind of storytelling ambition you don't see from a mainline AAA title. It doesn't always land. But when it does, it hits in a way that games usually can't."),
      p("Rebirth also has the characters. Cloud, Tifa, Aerith, Barret, Red XIII, Yuffie, Cait Sith — seven party members with individual arcs, individual combat styles, and individual reasons to care. The Gold Saucer date sequence mid-game is the most emotionally loaded optional content I've encountered in the genre."),
      h2("The case for Final Fantasy XVI"),
      p("XVI made a different choice: clarity. One protagonist, one story, one world with a clean political geography and a coherent mythology. Clive Rosfield's revenge arc is the most focused narrative the franchise has attempted since Final Fantasy X, and the Eikon battles — the massive kaiju-on-kaiju set-pieces where Clive temporarily becomes a god — are the most technically spectacular moments in the franchise's history."),
      p("The combat in XVI is also a different kind of flex. Where Rebirth is asking you to manage a party, XVI is asking you to learn a single character's full kit and then execute under pressure. The skill ceiling is higher in a way that matters to a specific player. If you came from Devil May Cry or Bayonetta and always thought Final Fantasy combat was too hands-off, XVI was the game Square Enix made for you."),
      p("The world-building is XVI's quiet strength. Valisthea's geopolitics — the Mothercrystals, the Dominants, the Bearer underclass — is the most coherent fantasy scaffolding the franchise has built outside of the XIV extended universe. Clive's story is ultimately a story about systemic oppression and the limits of personal heroism, and the game mostly sticks the landing on that thesis."),
      h2("Where they fall short"),
      p("Rebirth's open world is sometimes too much. The map bloat in the later regions — particularly the final two areas before the endgame — flattens what should be an accelerating third act into a completionist's to-do list. And the ending, which is deliberately opaque, is either the boldest finale in AAA gaming or an unsatisfying setup for a sequel depending on your relationship to the source material."),
      p("XVI's biggest problem is that the supporting cast doesn't have room to breathe. Jill and Joshua are well-written characters who get meaningful arcs, but the broader cast — the Cursebreakers, the surviving Dominants — are under-served by a game that needed either more runtime or harder editing. The pacing also drags in the back half, which is a strange critique for a sixteen-hours-shorter game, but XVI's quiet story moments don't have the character work to carry them the way Rebirth's do."),
      h2("Which one should you play first"),
      p("If you have never played either: start with XVI. The barrier to entry is lower, the story is self-contained, and the combat will pull you in immediately. It's a fifteen-hour introduction to what modern Final Fantasy can be, and you'll finish it wanting more."),
      p("If you've played XVI and haven't touched Rebirth: you are ready. Rebirth assumes patience and a willingness to be lost in a big world. It rewards both."),
      h2("Which one wins"),
      p("Rebirth. Narrowly. But it wins because it's doing more, not because XVI failed. XVI is an excellent game that made clear choices and executed them well. Rebirth is a messy, overstuffed, occasionally transcendent game that is trying to do seventeen things and succeeding at twelve of them. In this genre, twelve out of seventeen transcendent is the best you can do."),
      p("And the Gold Saucer date sequence alone is worth the price of admission. Pick your side below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "rebirth_vs_xvi",
        questionText: "Better Final Fantasy of the decade so far?",
        questionType: "this_or_that",
        options: ["Final Fantasy VII Rebirth", "Final Fantasy XVI"],
      },
    ],
  },

  // ----- 3. Sat 2026-06-20 — cartoons-and-cereal
  {
    slug: "dorohedoro-season-2-unhinged-and-im-here",
    title: "Dorohedoro Season 2 Is Exactly as Unhinged as You Were Hoping",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-20T14:00:00.000Z",
    excerpt:
      "MAPPA brought Dorohedoro back for Spring 2026 and somehow the sorcerers' world got weirder, the gore got more cartoonish, and the found-family energy got even louder.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["weird", "intense", "hype"],
    webRating: 91,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Let me tell you about Dorohedoro Season 2, which dropped as part of the Spring 2026 season and has been my Saturday show since the first episode landed."),
      p("If you haven't seen S1: the setup is that Caiman is a man with an amnesia problem and a lizard head, living in The Hole — a deteriorating slum district that sorcerers use as target practice — trying to figure out who turned him into this. His partner is Nikaido, who owns a gyoza restaurant and is inexplicably the most competent person in a world full of extremely competent violent people. Together they climb through a cosmology that includes a sorcerer underworld, a mushroom-themed plague doctor, multiple competing crime families, and a devil who is genuinely one of the best antagonists in anime."),
      p("The vibe is: if Akira and Made in Abyss had a kid and that kid grew up eating nothing but gyoza and horror manga."),
      h2("What Season 2 does"),
      p("Season 2 picks up immediately after the S1 finale — which, if you watched it, you know ends on a note that requires Season 2 to exist before you can exhale. The Nikaido backstory arc that opens the season is the best concentrated stretch of the show so far. What S1 was slowly building toward regarding her past gets paid off in a way that recontextualizes every scene she was in during the first run."),
      p("The animation budget is holding up, which was my main concern. MAPPA has been overextended for years and the visual quality on Dorohedoro has always been an anomaly — the 3DCG character models that somehow feel more handcrafted than they have any right to, the color palette that's simultaneously dingy and saturated. Season 2 hasn't dropped the ball. If anything, the action choreography in the sorcerer world fights has tightened up."),
      h2("The found-family problem"),
      p("Here's what Dorohedoro does better than almost any other dark action show: the found-family element is real. Caiman and Nikaido's relationship, En's crew and their bizarre loyalty to each other, even the sorcerer antagonists who keep doing crimes and then going home for a home-cooked meal — the show understands that the violence hits harder when the audience actually cares about the people doing it."),
      p("A lot of shows in this genre mistake edge for depth. Dorohedoro has edge to spare, but the gyoza shop is warm, and that warmth is what makes the show work."),
      h2("Should you watch"),
      p("If you dropped off S1 because the art style was too weird: Season 2 is not going to fix that, and that's okay. This is a show that committed to its aesthetic five years ago and has not blinked."),
      p("If you finished S1 and have been waiting: what are you still doing here, go watch it."),
      p("Web rating: 91. One of the best returns of the Spring 2026 season. Poll below — and be honest about where you are in the manga."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "dorohedoro_s2_watching",
        questionText: "Watching Dorohedoro S2?",
        questionType: "yes_no",
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
