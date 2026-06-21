/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Extends the 4-week forward calendar documented in docs/CONTENT_SCHEDULE.md
 * past the previous horizon (2026-06-10). Creates UNPUBLISHED drafts in Sanity.
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
    slug: "baki-dou-part-2-drops-thursday",
    title: "Baki-Dou Part 2 Drops Thursday and Part 1 Already Set the Table",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Musashi Miyamoto's clone versus the Hanma bloodline is the most unhinged premise in modern action anime. Part 2 lands on Netflix June 18 — here's why you need to care.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "intense", "violent"],
    webRating: 84,
    readingTime: 5,
    mediaLength: "13 episodes (Part 1)",
    spoilerFree: false,
    body: [
      p("Five days out from the Part 2 drop and I need to talk about Baki-Dou."),
      p("If you somehow missed Part 1: BAKI-DOU: The Invincible Samurai is the latest entry in the long-running Baki adaptation pipeline, and this time the premise is genuinely deranged. Baki Hanma has beaten his father, Yujiro Hanma — the Strongest Creature on Earth. The fighters who've spent their entire lives training for something have run out of something to train for. And into that power vacuum, someone decides the obvious answer is to clone Miyamoto Musashi from ancient DNA."),
      p("You know. The seventeenth-century swordsman. Considered the greatest martial artist in Japanese history. Brought back to life in the twenty-first century against cage fighters and underground death-match veterans and a man whose father can stop an earthquake with his fist."),
      p("This rules."),
      h2("What Part 1 actually delivered"),
      p("TMS Entertainment — the studio behind Sakamoto Days and Dr. Stone — is the right home for this material. The animation isn't consistent across every episode, but the fights have a kinetic weight that a lot of modern action anime loses to speed-lines and impact freeze-frames. When Musashi moves, the camera respects the movement. You can clock the geometry of the draw. That matters a lot when the character is defined entirely by the sword."),
      p("The first arc of Part 1 is setup, and the show knows it. Musashi acclimating to the present day is played for some genuinely funny fish-out-of-water beats before the show remembers it's about violence and gets back to violence. The pacing is uneven in the middle stretch — a few fights run longer than they need to — but the finale of Part 1 is an earned gut-punch that leaves you with exactly one question: what happens when someone who can stop a bullet with his ki tries to stop a man who has no concept of what a bullet is?"),
      h2("What Part 2 is bringing"),
      p("All 12 episodes of Part 2 drop on Netflix on June 18 — Thursday, all at once. WANIMA's opening theme 'FURUBOKO' is the kind of track that makes you want to punch air before the episode even starts, and Novel Core's 'Mountain Top' as the ending earns its landing. The trailers suggest Part 2 escalates the scope: more of the established fighters get their shots against Musashi, and the climactic matchup involves someone I genuinely did not expect to see in this position."),
      p("Based on the source manga, Part 2 is where this arc stops being a curiosity and starts being a full argument. Musashi isn't just a gimmick — he's a thesis about what 'strength' even means when the frame of reference changes entirely."),
      h2("Should you watch"),
      p("If you've watched any of the Baki franchise and didn't bounce off the premise, yes — immediately. Baki-Dou is more focused than the sprawling Baki Hanma S2 stretches, and the Musashi angle is a genuinely fresh hook for a franchise that has been running in some form since 1991."),
      p("If you've never watched Baki: this is not your entry point. Go back to the 2018 Baki on Netflix, work forward, come back when you understand why everyone in this universe is screaming about Yujiro."),
      p("Web rating for Part 1: 84. Part 2 write-up comes next Saturday. Poll below — let me know if you're watching."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "baki_dou_watching",
        questionText: "Are you watching Baki-Dou Part 2 this weekend?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "god-of-war-laufey-reaction",
    title: "God of War Laufey Was the State of Play's Best Reveal and I Haven't Shut Up Since",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Santa Monica Studio just announced a God of War game where Kratos isn't the lead. Faye is. Deborah Ann Woll is playing her. The combat looks nothing like Ragnarök. I've been processing this for two weeks.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("The State of Play on June 2 was a good showcase. Control Resonant confirmed a release date, Onimusha: Way of the Sword looked cleaner than I expected, Silent Hill: Downfall is going to be someone's nightmare in the best possible sense. But then Santa Monica Studio showed up and said something I did not see coming."),
      p("God of War: Laufey. And Kratos is not the main character."),
      p("Faye is. Laufey. Kratos' wife. The woman whose death sets the entire Norse arc in motion. Played by Deborah Ann Woll."),
      p("I've been thinking about this for two weeks and I'm not done yet."),
      h2("What the gameplay trailer showed"),
      p("Twenty minutes of gameplay. Set in what Santa Monica is calling the Everywhen — an afterlife dimension where gods and mythologies from across history converge and fight for dominance. Faye wakes up after her funeral, discovers that the plans she put in place to protect Kratos and Atreus are now at risk, and has to fight her way through an impossible landscape to save the people she left behind."),
      p("The combat is completely different from Ragnarök. Faye is agile — the movement reads as fast and acrobatic, leaning on magic abilities and ranged options. Nothing like the brute gravity of the Leviathan Axe or the Blades of Chaos. This is a different body with a different fighting philosophy, and Santa Monica committed to making that legible from the first second of gameplay. No 'lite Kratos' energy. She moves like someone who was never Kratos to begin with."),
      h2("Why this is the right call"),
      p("God of War has had Kratos as protagonist for over twenty years. Stepping off that is not a small decision. What makes Laufey the right choice is that she's the most loaded unknown in the franchise. Two full games mythologized her through absence — everything Kratos and Atreus know about the path they walked, Faye mapped first. Who she actually was, what she planned, what she knew and chose not to say — that's been sitting there since 2018."),
      p("Deborah Ann Woll is genuinely exciting casting. Daredevil fans know what she can do with a role that requires both warmth and violence to coexist. This is the right role at the right moment for someone with that range."),
      h2("Spider-sense"),
      p("No official release window yet — insider reports suggest first half of 2027. The twenty-minute gameplay trailer wasn't a sizzle reel; it was a working vertical slice. This is a real game in late production, not a CGI announcement. I believe the 2027 window."),
      p("Hot take meter below — how are we feeling about Faye as the lead?"),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "laufey_hype",
        questionText: "How hyped are you for God of War: Laufey?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-toy-story-5-vs-inside-out-2",
    title: "Versus: Toy Story 5 vs. Inside Out 2 — Which Pixar Universe Wins the 2020s",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Inside Out 2 made $1.7 billion in 2024. Toy Story 5 opens this weekend projecting $164M. Two Pixar franchises, two emotional registers. Which one is the future of the studio?",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["comparative", "thoughtful"],
    webRating: 93,
    readingTime: 8,
    spoilerFree: true,
    body: [
      p("Toy Story 5 opens in two days. I need to get my take on record before I actually see it."),
      p("Inside Out 2 is now two years old and still one of the best arguments that Pixar knows exactly what it's doing. It made $1.698 billion worldwide. It made adults cry in a movie about a cartoon emotion named Anxiety. In the context of a company that had a rough post-pandemic stretch, Inside Out 2 was a proof of concept that Pixar's best ideas still have legs."),
      p("Toy Story 5, by contrast, is a legacy move. The franchise that defined the studio is back for the fifth time, Andrew Stanton directing, Tom Hanks and Tim Allen returning, with a plot centered on a smart tablet named Lilypad that threatens the toy world. The opening weekend tracking has it at $160-170M — franchise record, best animated opening of 2026, top three all-time."),
      p("So: which of these franchises actually owns Pixar's future?"),
      h2("The case for Inside Out"),
      p("Inside Out works as a franchise concept in a way that Toy Story 4 quietly threatened to stop working. The emotional interior as a metaphor is infinitely scalable — every stage of human experience generates new dynamics the Inside Out framework can map. Joy, Sadness, Fear, Anger, Disgust covered childhood. Inside Out 2 added Anxiety, Envy, Ennui, and Embarrassment for adolescence. Every future sequel has a built-in thesis just by picking the life stage: young adulthood, parenthood, grief, late life. There's no expiration date on the concept."),
      p("Inside Out 2 is also emotionally ambitious in a way Toy Story stopped being after Toy Story 3. That film nailed the ending. It answered the core question — what does it mean to be loved and outgrown — so completely that every Toy Story since has been fighting against its own perfect conclusion. Inside Out 2 didn't have that problem. It had room to push."),
      h2("The case for Toy Story"),
      p("Here's the thing: Toy Story 4 shouldn't have worked and it mostly worked. The ending gave Woody an arc that genuinely moved where 3 had already closed things. And if Toy Story 5 is doing what the trailers suggest — positioning technology itself as the threat to the toy world — that's a smart angle for 2026 in a way that doesn't feel forced. Kids are growing up with tablets instead of toy boxes. The metaphor writes itself."),
      p("There's also something Toy Story has that Inside Out never will: warmth before cleverness. Inside Out is a brilliant concept. Toy Story is a feeling. Buzz and Woody don't need a thesis — they just need to be on screen together and the audience responds before the story has done anything yet. That's a different kind of equity and it doesn't go stale."),
      h2("The structural difference"),
      p("Inside Out is a franchise built on a concept that expands infinitely. Toy Story is a franchise built on characters we grew up with. The concept will always generate new material because life keeps providing it. The characters are finite — at some point, you run out of things to do with Buzz and Woody that don't quietly undermine what Toy Story 3 meant."),
      p("Toy Story 5 is the test of whether Pixar found something genuinely new to say, or whether this is IP maintenance dressed as storytelling. The opening weekend numbers will tell you which one the market is betting on. The films themselves will tell you who's right."),
      h2("My pick"),
      p("Inside Out owns the 2020s conceptually. It's the more scalable idea, the more emotionally forward franchise, and the one that doesn't require explaining why we're revisiting characters who already had their ending."),
      p("But Toy Story might just be good. I've been wrong about Pixar sequels before — I was wrong about 4. I'm seeing Toy Story 5 this weekend and I'm going in with my guard down. Pick your side before you see it and let me know how you land."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "toy_story_vs_inside_out",
        questionText: "Which Pixar franchise owns the 2020s?",
        questionType: "this_or_that",
        options: ["Toy Story", "Inside Out"],
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
