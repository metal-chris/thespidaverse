/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Creates UNPUBLISHED drafts in Sanity for the next 3 slots in the
 * forward calendar documented in docs/CONTENT_SCHEDULE.md. Drafts hold
 * body, polls, and metadata — they only appear on the site once published
 * manually in Studio.
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
    slug: "witch-hat-atelier-best-thing-airing",
    title: "Witch Hat Atelier Is the Best Thing Airing Right Now and You're Missing It",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "BUG FILMS and Ayumu Watanabe adapted Kamome Shirahama's manga and made one of the most quietly stunning anime in recent memory. Ten episodes in and it has not put a foot wrong.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["beautiful", "thoughtful", "chill"],
    webRating: 93,
    readingTime: 5,
    mediaLength: "13 episodes (ongoing)",
    spoilerFree: false,
    body: [
      p("Ten episodes in. Three left. I've been running it on Saturday mornings and I have not once been disappointed."),
      p("Witch Hat Atelier is this spring's consensus best-in-season, and if you've been sleeping on it because the synopsis sounds like 'magical girl coming-of-age story' — that's accurate, but it undersells what the show is actually doing. This is the one."),
      h2("What it's about"),
      p("Coco lives in a world where magic is locked to the people who were born able to do it. She's not one of those people. She loves magic anyway, studies it, reads about it, watches practitioners whenever she can. Then she does something she shouldn't: she sneaks a look at a traveling wizard named Qifrey casting a spell, and the sight alone — a spell that was never meant for her eyes — turns her mother to stone."),
      p("The rest of the show is about Coco learning magic under Qifrey's tutelage, trying to earn the right to undo what she did, and slowly realizing that the rules about who can and can't do magic might not be as natural as the world has been told."),
      h2("Why the animation matters"),
      p("BUG FILMS is the studio and Ayumu Watanabe is directing, and the two of them together have made something that looks like a storybook that decided to start moving. Kamome Shirahama's manga is already one of the most visually distinctive works in modern shōjo — her linework is dense and architectural in a way that most manga doesn't try to be — and the anime doesn't just adapt it, it translates it into motion."),
      p("Every frame has a tactile quality. The paper Coco draws her spells on has weight. The robes the witches wear catch light correctly. The magic effects are geometric and deliberate and feel like they were designed by someone who actually thought about how a spell would look if it were a physical thing you were drawing with your hands."),
      h2("The thing it's actually about"),
      p("The show's real subject is access. In this world, magic is treated as an innate gift — you're born with the aptitude or you're not, and if you're not, you don't get to participate. Coco's entire situation — the crime she committed, the apprenticeship she's been allowed to keep, the secrets that are slowly unraveling around Qifrey — all of it is built on top of a question the world has decided not to ask: what if the gatekeeping is the problem?"),
      p("For a Saturday morning anime, that's a heavier thesis than most. Witch Hat Atelier earns it by not rushing. The show breathes. Episodes move at their own pace and trust you to stay engaged."),
      h2("Why it's the right Saturday show"),
      p("Dandadan (which we covered a few weeks back) is the Saturday show for caffeine. Witch Hat Atelier is the Saturday show for when you actually want to sit with something. Pour the coffee, let it run, don't check your phone."),
      p("The finale is June 22. No second season is confirmed. The ending will reportedly not close the arc — based on where the manga is, there is a lot of story left — which means this first season is going to end on a note that sends you to the manga."),
      p("That is the highest compliment I can give."),
      h2("Web rating"),
      p("93. Show of the season. Not negotiable. Add it to your queue before the finale airs and then come find me to talk about the Pointed Caps."),
      p("Are you watching? Tell me in the poll."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "watching_witch_hat",
        questionText: "Are you watching Witch Hat Atelier?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "toy-story-5-opens-friday-legacy-check",
    title: "Toy Story 5 Opens Friday — Here's Where I'm At on the Franchise",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Pixar brought back Woody, Buzz, and the gang for a story about what happens when Bonnie gets a tablet. Keanu Reeves is a toy. I'm choosing to believe in this.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["nostalgic", "hype"],
    readingTime: 2,
    spoilerFree: true,
    body: [
      p("Toy Story 5 opens Friday and I've watched the final trailer four times in the last week. I'm not going to pretend I'm not excited. I'm excited."),
      p("The setup: Bonnie has gotten a tablet — specifically a device named Lilypad — and Lilypad has opinions about what's best for Bonnie. The toys have thoughts about this. Woody has a lot of thoughts. The conflict is 'beloved childhood toys vs. the digital age,' which is either a layup or the most Pixar thing Pixar has ever done, depending on how you feel about Pixar."),
      h2("The cast situation"),
      p("Tom Hanks is back as Woody. Tim Allen is back as Buzz. Annie Potts is back as Bo Peep. Andrew Stanton, who directed the original Toy Story and Finding Nemo and Wall-E, is back in the director's chair alongside co-director Kenna Harris. This is a legitimate legacy reunion."),
      p("New additions: Keanu Reeves as a toy, which is something I've needed in my life longer than I realized. Conan O'Brien as an excitable camera toy named Snappy. Greta Lee in a role the studio has kept quiet about, which is either very good or the whole movie."),
      h2("Where I'm at on the franchise"),
      p("Toy Story 4 was polarizing. I was in the 'it was fine' camp, not the 'it was necessary' camp. The ending felt conclusive in a way that made a fifth film feel like it would have to earn its place."),
      p("Based on the trailers, Toy Story 5 knows that. The whole thing is framed around what it means to still be relevant when the world has moved on — which is either meta-commentary on Pixar's own output or a sincere story about change. Given that Stanton is back and the script apparently went through a lot of drafts, I'm choosing to believe it's the latter."),
      h2("Spider-sense"),
      p("This is Pixar's biggest theatrical bet of 2026. It's going to do numbers regardless. The question is whether it leaves people the way Toy Story 3 left people — quietly crying in a movie theater about toys — or whether it's a fine entry that everyone agrees didn't need to exist."),
      p("I'm going Friday. I'll update."),
      p("How hyped are you? Be honest in the poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "toy_story_5_hype",
        questionText: "How hyped are you for Toy Story 5?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-witch-hat-atelier-vs-frieren",
    title: "Versus: Witch Hat Atelier vs. Frieren — Fantasy Anime's Two Best Slow Burns",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Frieren redefined what a fantasy anime could be in 2023. Witch Hat Atelier is doing the same thing in 2026. They're doing it differently. Pick a side.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["thoughtful", "comparative", "emotional"],
    webRating: 92,
    readingTime: 10,
    spoilerFree: false,
    body: [
      p("Two fantasy anime. Two wildly different approaches to the same question: what does it mean to live inside a world where magic is real?"),
      p("Frieren: Beyond Journey's End arrived in Fall 2023 and took the season by storm. Witch Hat Atelier has been doing the same thing to Spring 2026. Both are based on acclaimed manga. Both move at a pace most seasonal anime would consider glacial. Both are some of the most visually accomplished shows of their respective years. And both are about something deeper than their premise implies."),
      p("Time to pick a side."),
      h2("The case for Frieren"),
      p("Frieren's central conceit is one of the best in modern fantasy. Frieren is an elf mage — essentially immortal. She spent a decade adventuring with a party of heroes, including Himmel, who she did not realize she had feelings for until after he died of old age, because ten years is nothing to an elf. The show picks up sixty years later, when Frieren is finally beginning to understand what it means to be mortal around people who are always dying."),
      p("The emotional leverage Frieren holds is enormous. You know, going in, that everyone Frieren meets is temporary. The show uses that knowledge like a blade — held at your back, pressing slightly harder every time you get attached to someone. Himmel's flashbacks hit harder each time they appear because the show has earned them."),
      p("On a technical level, Madhouse put in some of the best animation work of the decade. The magic system is elemental and satisfying. The fight sequences — which the show uses sparingly — hit precisely because the show has been quiet for so long before them."),
      h2("The case for Witch Hat Atelier"),
      p("Witch Hat Atelier comes at the same genre from a different angle. Where Frieren is about an immortal learning to feel mortal, Witch Hat is about a mortal girl trying to earn a place in a world that decided she didn't belong. Coco isn't born with magic. She learns it. And the show is interested in what that says about who gets to participate in the world, and who gets locked out."),
      p("The animation from BUG FILMS is genuinely unlike anything else this year. Kamome Shirahama's source manga has some of the most intricate panel design in contemporary shōjo, and the anime matches it — the spell-casting sequences in particular look like illuminated manuscript pages that have started moving. It is beautiful in a way that demands you watch it rather than put it on in the background."),
      p("Where Frieren is about grief and time, Witch Hat Atelier is about guilt and growth. Coco carries the weight of what she did to her mother in every scene. The show lets that weight exist without resolving it quickly. That patience is rare."),
      h2("Pacing: where they differ"),
      p("Both shows are slow. But they're slow differently."),
      p("Frieren's pacing is elegiac. Episodes feel like chapters in a book you want to stretch out. The show moves forward in time in jumps — sometimes skipping decades — and trusts that the accumulation of small moments will matter more than plot momentum. It does. It's right to trust that."),
      p("Witch Hat Atelier's pacing is methodical. Coco is learning, and the show moves at the pace of learning — deliberate, with setbacks, with discoveries that feel earned because you watched the work that led to them. Each episode has a lesson baked in below the surface. Not didactic. Just honest."),
      h2("What they're doing with the fantasy genre"),
      p("Frieren is a post-quest fantasy. The dragon was already slain. The kingdom was already saved. The show takes place in the aftermath — in the world that exists after the story that fantasy is supposed to be about has already concluded. That structural decision lets Frieren examine the genre's conventions from outside them."),
      p("Witch Hat Atelier is an in-genre fantasy questioning its own rules from inside. The premise — that magic is gatekept by birth — is presented as natural law that the world accepts, and the show is gradually asking whether natural law is the same thing as just law. It's working from within the genre rather than above it."),
      h2("The verdict"),
      p("Asking which is better is almost a category error. They're doing such different things with similar tools that picking one isn't really possible without deciding what you want from a fantasy anime."),
      p("If you want emotional devastation and a meditation on mortality, watch Frieren. It is one of the best-paced anime of the decade and it will make you feel something about an elf and a human man you barely see on screen together."),
      p("If you want a story about someone earning their place in the world through learning and guilt and hard work — and you want to do it while watching some of the most beautiful animation of 2026 — watch Witch Hat Atelier. The first season isn't finished yet. It's not too late."),
      p("Both are correct answers. Pick your side in the poll below, but know I'm judging you either way."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "witch_hat_vs_frieren",
        questionText: "Which fantasy slow-burn hits harder?",
        questionType: "this_or_that",
        options: ["Witch Hat Atelier", "Frieren: Beyond Journey's End"],
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
