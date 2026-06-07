/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-18)
 *
 * Extends the forward calendar by 3 slots documented in docs/CONTENT_SCHEDULE.md.
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
  // ----- 1. Sat 2026-06-13 — cartoons-and-cereal
  {
    slug: "assassination-classroom-s2-netflix-two-weeks-in",
    title: "Assassination Classroom S2 Just Hit Netflix — Two Weeks In, the Class Has Not Missed",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Class 3-E has a new deadline, a ruthless principal, and approximately zero chill. Assassination Classroom S2 dropped on Netflix June 1 and I've watched it twice.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["emotional", "hype", "nostalgic"],
    webRating: 92,
    readingTime: 5,
    mediaLength: "47 episodes total (S1 + S2)",
    spoilerFree: false,
    body: [
      p("Assassination Classroom S2 hit Netflix on June 1. I've watched it twice in two weeks. This is the column."),
      p("Quick context for anyone Netflix-pilling their way into this for the first time: AssClass is the show where a tentacled alien teacher promises to destroy Earth at the end of the school year unless Class 3-E can assassinate him first. The first season is a found-family story wearing assassination comedy as a skin suit. The second season is where the show cashes every emotional check it spent 22 episodes writing."),
      h2("What S2 does differently"),
      p("Season 1 is about whether these kids can kill their teacher. Season 2 is about whether they want to. The Nagisa vs. Karma ideological split — passive talent versus aggressive drive — gets its full payoff in S2, and the school festival arc in particular is the tightest single extended sequence in either season."),
      p("Gakuhou Asano as the main antagonist of S2 is also the show's most interesting villain. He's not a monster. He's a philosophy. His approach to education is just the same system Koro-sensei is tearing down from a different angle — and the parallels the show draws between them are the kind of writing that makes you pause and think about what you just watched."),
      h2("The Koro-sensei problem"),
      p("The show spends significant time in S2 revealing Koro-sensei's backstory. I will not spoil it. But what I will say is that the reveal recontextualizes every single moment of warmth in S1, and if you watched S1 without crying, S2 is going to correct that."),
      p("The final episode is one of the most emotionally honest goodbyes a shōnen has ever attempted. It earns every minute of setup. The class earns their graduation. Koro-sensei earns his ending. You will not be okay."),
      h2("Why now is the right time to binge"),
      p("The full 47-episode run is on Netflix. You can go start to finish without a week between episodes. That is the correct way to experience AssClass. The pacing was built for a binge era even before binge culture was the dominant delivery method."),
      p("If you've been putting this off because the premise sounded silly: the premise is silly. The show is not. Web rating: 92. Clear your Saturday."),
      p("Tell me in the poll whether the ending hit you the way it hit me."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "assclass_ending_hit",
        questionText: "Did the Assassination Classroom ending make you cry?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "supergirl-2026-final-trailer-milly-alcock",
    title: "The Supergirl Final Trailer Is Here and Milly Alcock Is Already Building Something Special",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Eleven days out from June 26. The final Supergirl trailer dropped this week and Craig Gillespie is clearly not here to play it safe with the DCU's second film.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("The final Supergirl trailer dropped this week. June 26 is eleven days away. Eleven."),
      p("If you've been tracking the DCU's slow rebuild since James Gunn took over, Supergirl is the second film in the new continuity after David Corenswet's Superman last year. The first film worked. This one needs to confirm the direction."),
      h2("What the trailer shows"),
      p("They officially dropped the 'Woman of Tomorrow' subtitle — it's just Supergirl now, which I have complicated feelings about, but the trailer earns the confidence behind that decision. The logline is Kara Zor-El on a murderous quest for revenge across the galaxy. The trailer leans into it. This is not the cheerful Kryptonian cousin archetype. This is a girl who arrived on Earth after floating alone in space for decades, has very specific feelings about it, and is now dealing with space pirates and what the credits are calling a spider droid situation."),
      p("Milly Alcock — who you know from House of the Dragon as young Rhaenyra — is doing the thing she does: inhabit a complicated person making questionable choices in a way that makes you root for them anyway. The physicality is there. The range is there."),
      h2("Craig Gillespie's call"),
      p("The director is Craig Gillespie, who did I, Tonya and Cruella. Both of those films are about women operating outside the rules that were built without them in mind. The throughline to Kara's story in Tom King's source material isn't subtle, and the trailer makes clear Gillespie is playing it straight. No winking. No MCU-ification of the premise. Just commitment."),
      h2("Spider-sense"),
      p("I'm cautiously in. Gunn's Superman surprised me by being genuinely good — the bar was 'not terrible' and it cleared by a mile. If the DCU can land two in a row, the era is real and we're watching the moment it got established. How hyped are you for June 26?"),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "supergirl_hype",
        questionText: "How hyped are you for Supergirl on June 26?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-18 — versus
  {
    slug: "versus-demon-slayer-vs-jujutsu-kaisen",
    title: "Versus: Demon Slayer vs. Jujutsu Kaisen — Which Shonen Owns the 2020s?",
    format: "versus",
    publishedAt: "2026-06-18T15:00:00.000Z",
    excerpt:
      "Two shows. Both massive. Both generational. One question the fandom has been arguing about for five years: which one actually defines this era?",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["comparative", "thoughtful", "hype"],
    webRating: 0,
    readingTime: 10,
    spoilerFree: false,
    body: [
      p("Let's settle something. Demon Slayer and Jujutsu Kaisen are the two biggest anime of the 2020s. You can argue the margins — MHA was there first, Chainsaw Man had the cultural moment, One Piece never left — but if you had to point to the two shows that defined this decade for a general audience, it's these two."),
      p("One question: which one actually wins it?"),
      h2("The case for Demon Slayer"),
      p("Ufotable decided with Demon Slayer that animation could be the entire argument, and they were right. The Rengoku fight in Mugen Train is still one of the most technically sophisticated sequences in the medium's history, and every season since has escalated in a way that should not be physically possible given the production schedule. The Sound Hashira arc looked like a video game cutscene. The Swordsmith Village arc looked like someone handed ufotable an unlimited budget and left the room."),
      p("The story is not complicated. That's not a criticism — it's a design choice. Tanjiro is the most purely earnest protagonist in modern shōnen. His relationship with Nezuko is the emotional core, and the show protects it. You can hand Demon Slayer to someone who has never watched anime in their life and they will be crying in three episodes."),
      p("The Hashira are the deepest bench of supporting characters in any 2020s shōnen. Rengoku, Tengen, Mitsuri, Obanai — every one of them has a complete arc, and the show treats their deaths like deaths that actually matter. Because in this show, they do."),
      h2("The case for Jujutsu Kaisen"),
      p("JJK is doing something Demon Slayer is not: taking the shōnen rulebook and using it as evidence against itself. Gege Akutami writes like they are personally offended by the idea that the protagonist will definitely survive. The Shibuya Incident arc — adapted in S2 — is the single most devastating narrative sequence in 2020s anime, and it earns that devastation by spending an entire season building stakes the show then actually cashes."),
      p("Gojo Satoru is the best-designed character in either show. The Infinity technique, the Six Eyes, the specific flavor of invincibility that the story eventually breaks — the show baits you with a safety net and then removes it at the worst possible moment. The resulting grief among the fanbase was genuine and communal and one of the last times a chapter drop made the internet actually, collectively not okay."),
      p("The animation is less consistent than Demon Slayer — MAPPA's output swings more than ufotable's — but when JJK is firing, it fires. The Gojo vs. Sukuna sequences are animation assignments that will matter in conversation about the medium for decades."),
      h2("What the fight actually is"),
      p("Demon Slayer is better to experience. The emotional accessibility is genuinely higher. You will cry more, smile more, and feel the full cycle of a complete story without needing to track thirty-seven power systems."),
      p("JJK is better to think about. The moral complexity is genuinely higher. The ending is divisive — and the division is the point. Akutami was not writing a story with a comfortable resolution. They were writing a story about what happens when the rules of fiction apply to characters with real stakes and no plot armor."),
      p("Which one defines the 2020s depends on what you mean by defines. If you mean the one that captured the most people, it's Demon Slayer. If you mean the one that pushed the genre the furthest, it's JJK."),
      h2("The verdict"),
      p("I'm picking JJK. Demon Slayer is the better entry point. JJK is the better argument. The decade in shōnen should be remembered for what JJK was willing to break, even if more people remember Demon Slayer for what it refused to."),
      p("Vote your side in the poll. I want to see where this lands."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "demon_slayer_vs_jjk",
        questionText: "Which shonen defines the 2020s?",
        questionType: "this_or_that",
        options: ["Demon Slayer", "Jujutsu Kaisen"],
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
