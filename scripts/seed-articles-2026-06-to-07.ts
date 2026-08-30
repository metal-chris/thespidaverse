/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Creates UNPUBLISHED drafts in Sanity for the 3-slot extension of the
 * forward calendar documented in docs/CONTENT_SCHEDULE.md. Drafts hold
 * body, polls, and metadata — they will only appear on the site once
 * published manually in Studio.
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
    slug: "bleach-tybw-calamity-theatrical-hype",
    title: "Bleach Is Finally Ending and I've Been Waiting Since 2012",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Bleach: Thousand-Year Blood War – The Calamity opens in theaters June 25. Twelve years after the original anime went dark, we're about to see the ending the manga earned.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["nostalgic", "hype", "emotional"],
    webRating: 0,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Twelve days. The Bleach: Thousand-Year Blood War — The Calamity theatrical run opens June 25 and I have been waiting for this since the original anime signed off in 2012 without adapting the final arc."),
      p("If you weren't there: the original Bleach anime ended in 2012 at the Fullbring arc — a divisive story stretch that left a lot of fans cold. The Thousand-Year Blood War arc, which Tite Kubo had been building toward for years in the manga, didn't get adapted. The anime just stopped. Then the manga ended in 2016. And for six years, TYBW existed only on the page."),
      p("The 2022 revival changed everything. Studio Pierrot came back with a completely different animation budget, a different visual identity, and the kind of directorial ambition that made it clear: this wasn't a cash-grab revival. This was a team that understood what Bleach had always been trying to do, and finally had the means to do it."),
      h2("What the revival got right"),
      p("Three parts in, TYBW has done the thing that seemed impossible: it made Bleach feel like a prestige property. The Sternritters are genuinely menacing in a way that Aizen's arrancars never quite managed on screen. The Soul Society's institutional rot — the thing Kubo was always gesturing at — reads clearly now. And the animation during the Captain-level fights is some of the most technically accomplished work Pierrot has put out since the early Naruto Shippuden run."),
      p("Part 3, The Conflict, was where the series fully committed. The Yhwach battles, the scope of the Wandenreich invasion, the willingness to let supporting characters carry weight — it all clicked. By the end of Part 3, I was ready for whatever Part 4 was going to do."),
      h2("What The Calamity needs to deliver"),
      p("Part 4 has to close the loop on Ichigo's arc in a way that justifies the full runtime of the revival. The theatrical format — limited screenings through the end of June, then streaming in July — suggests Studio Pierrot is treating The Calamity as an event, not a content drop. That's the right call."),
      p("The manga's ending was divisive. I won't spoil specifics, but Kubo made some choices in the final chapters that a lot of readers felt were rushed. The adaptation has a real chance to give those moments the breathing room the serialized pace couldn't. Whether it takes that chance is what June 25 is about."),
      h2("If you're a newcomer"),
      p("You have twelve days to watch the first three parts on Hulu/Disney+. That's approximately 52 episodes. I'm not saying it's doable in twelve days. I'm saying it's doable if you commit."),
      p("Start with Part 1. The first few episodes are good but not great — the series is doing setup work. By the time you hit the Seireitei invasion stretch, you'll understand what the revival was trying to prove."),
      p("Theater or stream — are you catching The Calamity? Poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "bleach_calamity_watching",
        questionText: "Are you catching Bleach: The Calamity?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "summer-game-fest-2026-ff7-revelation",
    title: "Summer Game Fest Dropped FF7 Revelation and Now I Can't Think About Anything Else",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "SGF 2026 had plenty of big announcements — Resident Evil Code Veronica Remake, Until Dawn 2 — but Final Fantasy 7 Revelation was the headline. Nomura is back. The timeline is continuing. I need a minute.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Summer Game Fest 2026 happened on June 5 and I have spent the last ten days trying to process the Final Fantasy 7 Revelation announcement. I'm mostly there. I think."),
      p("Quick SGF roundup first: the show was stacked. Resident Evil Code Veronica Remake from Capcom is the project that survival horror fans have been asking about for years — and getting a Capcom Remake treatment after RE2, RE3, and RE4 all delivered means the ceiling is real. Until Dawn 2 from Firesprite was the surprise reveal. Guild Wars 3 was the MMO announcement. And Assassin's Creed Black Flag Resynced — an expanded remaster of one of the best Assassin's Creed games — is coming July 9. Good show. But."),
      h2("The headline"),
      p("Final Fantasy 7 Revelation is the continuation of the Remake trilogy. Nomura is directing. The trailer was roughly two minutes of Aerith, a new location that looks like it expands significantly beyond what Rebirth established, and a title card that makes clear: this is the final chapter."),
      p("What it wasn't: a release date. What it implies: they're far enough along to announce, which for Square Enix in 2026 means we're probably looking at a late 2027 or 2028 release window. I hate waiting. I'm going to wait anyway."),
      h2("Why it matters"),
      p("Remake and Rebirth both did the impossible thing, which was: they took the most beloved JRPG in history, rewrote its structure to explicitly acknowledge that it was rewriting itself, and somehow made the alternate timeline feel earned rather than cynical. Revelation has to land all the threads that Rebirth set up — the fate question, the multiverse logic, the Cloud-Aerith-Tifa triangle — and it has to do it without collapsing under the weight of twenty-seven years of expectation."),
      p("No pressure, Nomura."),
      h2("Spider-sense"),
      p("I think it delivers. Remake and Rebirth both earned the benefit of the doubt this team has built up. And the fact that they're calling it the final chapter rather than a fourth installment suggests they've actually figured out how to close it."),
      p("How hyped are you? Hot take meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "ff7_revelation_hype",
        questionText: "How hyped are you for FF7 Revelation?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-jjk-vs-demon-slayer-shonen-era",
    title: "Versus: Jujutsu Kaisen vs. Demon Slayer — Two Visions of What Shōnen Can Be",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Both series defined the last half-decade of shōnen anime. Both had flagship arcs that delivered. Now that JJK S3 has wrapped, it's time to have the conversation properly.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["comparative", "thoughtful", "intense"],
    webRating: 93,
    readingTime: 11,
    spoilerFree: false,
    body: [
      p("JJK Season 3 wrapped in late March. The Spring 2026 season settled. We've had two months to breathe. It's time to actually have this conversation."),
      p("Jujutsu Kaisen and Demon Slayer are the two defining shōnen anime of their era — and they are almost diametrically opposed in every meaningful way. Same genre. Completely different philosophies. Let's pick one."),
      h2("The case for Demon Slayer"),
      p("Ufotable built one of the most technically accomplished productions in the medium's history and pointed it at one of the most emotionally accessible shōnen franchises in years. That combination shouldn't work as well as it does."),
      p("Koyoharu Gotouge's manga is, at its core, a family story. Tanjiro isn't trying to become the strongest. He isn't collecting power-ups to fight a world government. He's trying to turn his sister back into a human being and protect his found family long enough to do it. That clarity of motivation — unfashionable in the power-fantasy era — is what makes every Demon Slayer fight mean something. You're never watching for the mechanics. You're watching because Tanjiro's about to have to do something horrible to someone he almost loves."),
      p("And then ufotable renders it in a way that no other studio currently can. The Flame Breathing sequences. The sound design. The way the series uses water, fire, and thunder as visual languages for different personalities. It's the most unified aesthetic in modern anime television, and it makes the show legible even to audiences who have never watched a frame of shōnen in their lives."),
      h2("The case for Jujutsu Kaisen"),
      p("MAPPA's adaptation of Gege Akutami's manga is the more difficult show to love, and that's precisely what makes it the more interesting one."),
      p("JJK is structurally hostile to comfort. Characters die at the wrong times, for the wrong reasons, without the dignity of proper send-offs. Villains win. The protagonist's best friend gets turned into an accomplice to atrocity. The power system is brilliant but cold — Cursed Techniques don't have the elemental warmth of Breathing Styles. They have terminology and geometry and a kind of bureaucratic logic that makes the world feel dangerous in a different way than the demonic flesh-and-blood of Demon Slayer's Muzan."),
      p("JJK Season 2's Shibuya Incident Arc was, for my money, the best sustained piece of animated action storytelling since the Chimera Ant Arc in Hunter x Hunter. MAPPA was doing things compositionally that the industry is still trying to catch up to. The Season 3 Culling Game added political texture and complicated every surviving character's motivation in ways that Demon Slayer — with its cleaner moral palette — simply doesn't attempt."),
      p("Which is not a knock. It's a choice. Akutami chose to write a shōnen about the cost of victory. The adaptation honors that choice."),
      h2("Animation: where they actually differ"),
      p("Both studios are doing work that makes the rest of the industry look underfunded. But they're doing different things."),
      p("Ufotable's animation is architectural. The camera has an implicit grammar: wide establishing shots for scale, rapid-cut close-ups for impact, slow-motion for the moments that matter. The water effects and particle systems are the benchmark. There's a reason the Rengoku fight became an industry reference point."),
      p("MAPPA's animation is more chaotic by design. The JJK sequences — particularly anything involving Gojo — use a looser, more expressionistic approach that sometimes hits transcendence and sometimes hits 'this looks rough.' The variability is real. The ceiling is higher than anything ufotable has reached. The floor is lower."),
      h2("Cultural footprint"),
      p("By raw metrics, Demon Slayer won. Mugen Train is still one of the highest-grossing films in Japanese box office history. The franchise merchandise is everywhere. It is the show that people who don't watch anime have watched."),
      p("JJK has the fandom. The Twitter arguments, the discourse, the reaction videos. It generates conversation in a way that Demon Slayer — which is more broadly liked and less deeply debated — doesn't. Whether that's a better kind of footprint is a question you'll have to answer for yourself."),
      h2("The verdict"),
      p("If you want a show that is going to gut you in three directions you didn't expect, with an animation team that swings for the fences and occasionally misses: JJK."),
      p("If you want a show that is going to be a flawless audiovisual experience built on emotional clarity, with an animation team that never misses: Demon Slayer."),
      p("I love both. I spend more time thinking about JJK. That's probably the answer."),
      p("Pick your side in the poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "jjk_vs_demon_slayer",
        questionText: "Better shōnen of this generation?",
        questionType: "this_or_that",
        options: ["Jujutsu Kaisen", "Demon Slayer"],
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
