/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Creates UNPUBLISHED drafts in Sanity for the next 3 slots in the forward
 * calendar documented in docs/CONTENT_SCHEDULE.md. Drafts will only appear
 * on the site once published manually in Studio.
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
    slug: "witch-hat-atelier-anime-dont-sleep-on-it",
    title: "Witch Hat Atelier Is the Anime of the Season — Don't Sleep on It",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Bug Films made the impossible adaptation work. Kamome Shirahama's intricate storybook manga is running at near-perfect ratings and the finale is two weeks out. Catch up now.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["wonder", "magical", "thoughtful"],
    webRating: 88,
    readingTime: 5,
    mediaLength: "13 episodes (Spring 2026)",
    spoilerFree: true,
    body: [
      p("There's a version of this where Bug Films adapts Witch Hat Atelier and it comes out looking like every other fantasy anime — clean digital lines, standardized expressions, perfectly readable and forgettable in six months."),
      p("That is not what happened. Not even close."),
      h2("What the manga is"),
      p("Kamome Shirahama's Witch Hat Atelier is one of the most visually distinctive manga being published right now. The linework reads like an illustrated manuscript — borderline engraved, dense with detail, spell circles drawn as if someone actually consulted a grimoire. It's the kind of art that does not translate to animation easily, which is exactly why this adaptation has been sitting on the 'I'll believe it when I see it' list since it was announced."),
      p("The story matches the aesthetic. Coco is a girl born into a world where magic is treated as an inherited gift — you're either born with it or you're not, and the magical class protects that belief as fiercely as any institution protects its gatekeeping. When Coco discovers the truth — that magic is about drawing the right symbols, which means anyone who learns the craft could theoretically do it — she accidentally crystallizes her mother and gets taken in by the witch Qifrey. The 'born vs. made' question is not just a plot point. It's the whole argument of the show. Shirahama credited Michael Ende and Tolkien; the DNA shows."),
      h2("What the anime does"),
      p("Director Ayumu Watanabe and Bug Films made a bet: instead of flattening the manga's aesthetic into a production-line style, lean harder into the storybook quality. Soft edges. Muted pastels. Moments where the spell circles bloom like illuminated pages. The score is by Yuka Kitamura — the composer behind Dark Souls and Elden Ring — and it does exactly what you'd expect from someone who scores games about ancient, half-understood power."),
      p("It's not always technically flawless. The mid-season run had one episode where the budget clearly got stretched. But the visual identity is so coherent that even the rough patches feel like the same show. That kind of consistency doesn't happen by accident."),
      p("ANN had it at the top of their weekly rankings for most of the season. Crunchyroll scores are sitting near-perfect. The show has been the surprise consensus pick for Spring 2026, and the community chatter has the energy of something people are going to be recommending for years."),
      h2("Where you should start"),
      p("Episode one. No context needed. The show does the work of building its world from the ground up and it paces it well enough that you won't feel lost. If you bounced on similar shows before — Ascendance of a Bookworm, Frieren, Dungeon Meshi — give this three episodes. The show reveals its hand fast."),
      p("The finale drops June 22 and Season 2 is already announced. Two weeks to catch up is exactly enough time."),
      h2("The provisional rating"),
      p("Web rating: 88. That number is carrying a 'this could go up' asterisk depending on how the finale lands. The back half of the season has been accelerating and the show has earned the right to stick its ending."),
      p("Provisional because I'm not rating a finale I haven't seen yet. But the show has been good enough this season that I'm putting the number down anyway."),
      p("Poll below — add it to the list or hold out for the season wrap?"),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "witch_hat_adding_to_list",
        questionText: "Adding Witch Hat Atelier to your list?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "supergirl-dcu-trailer-milly-alcock",
    title: "The Supergirl Trailer Is Here and the DCU Might Actually Have Its Next Franchise",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Craig Gillespie directed a space-western starring Milly Alcock as a Kryptonian who just wants one birthday off. It looks nothing like a superhero origin story. Good.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("DCU dropped the full Supergirl trailer this week and I've watched it four times because I keep expecting the catch."),
      p("There is no catch. It's good."),
      h2("The pitch"),
      p("Milly Alcock — Rhaenyra Targaryen in House of the Dragon — is playing Kara Zor-El. The film is directed by Craig Gillespie, the person who made I, Tonya and Cruella, and adapted from Tom King and Bilquis Evely's Woman of Tomorrow miniseries. The tone is explicitly space-western. The trailer opens with Kara getting into a bar fight in some dusty off-world settlement. The location looks like a frontier town on a planet with the wrong color sun."),
      p("This is not an origin story about a plucky hero discovering her powers. Kara already knows what she can do. She's on her own birthday trip when she gets pulled into a revenge quest with a girl named Ruthye Marye Knoll, and the road ahead of them runs through a villain named Krem of the Yellow Hills. The King comics run leaned deliberately anti-heroic and morally ambiguous — Kara is competent, tired, and not particularly interested in being inspirational. The trailer commits to that framing."),
      h2("Why this one matters"),
      p("The new DCU's first real test was Superman, which landed well enough to prove James Gunn's reboot has legs. Supergirl is the second film in the continuity and it's a bigger creative swing — lesser-known character, unconventional director, source material that was a critical darling but not a mainstream title. If this works, Gunn has a repeatable formula: pick IP that has room to breathe, pick a filmmaker with a distinctive voice, get out of the way."),
      p("Alcock is the reason to be optimistic. The role needs someone who can alternate between quiet menace and genuine warmth scene-to-scene. House of the Dragon proved she can do that. The trailer's best moment is the quietest one — Kara sitting alone, not flying, not fighting, looking like someone who has been doing this too long."),
      h2("Spider-sense"),
      p("Craig Gillespie has never directed a movie that looks like any other movie. I, Tonya used mockumentary to do something genuinely uncomfortable. Cruella used fashion excess to make a villain origin feel like a music video. Supergirl using dusty space-western texture instead of sterile Krypton-chrome is that same instinct. It's the most interesting creative bet DC has made in years."),
      p("Opens June 26. Two weeks out. Poll below — how's the hype meter sitting?"),
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
    slug: "versus-re-requiem-vs-re4-remake",
    title: "Versus: Resident Evil Requiem vs. RE4 Remake — Which Leon Is the Real One?",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "RE4 Remake is the benchmark. Resident Evil Requiem launched four months ago and it's been arguing with that benchmark ever since. Let's settle it.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["comparative", "intense", "thoughtful"],
    webRating: 0,
    readingTime: 9,
    spoilerFree: false,
    body: [
      p("Resident Evil Requiem launched in February and the discourse has not stopped. Most of it circles the same question: is it better than RE4 Remake?"),
      p("That question is actually two questions, and the answer to each is 'maybe, but not in the same way.'"),
      h2("What Resident Evil Requiem is"),
      p("Requiem is technically a sequel to both RE4 Remake and Village. Leon Kennedy carries his campaign's DNA from RE4R — the parry system, the over-the-shoulder action loop, the sense of a man who has been doing this too long and is now simply efficient at it. Grace Ashcroft's chapters inherit Village's survival horror rhythm: resource scarcity, environmental dread, the specific terror of knowing you're outgunned in every room."),
      p("The game is roughly ten hours split evenly between them. Leon gets about five hours. Grace gets about five. The structural argument is that those five-hour blocks belong in the same story — that Requiem is doing something with the contrast that neither character could pull off alone."),
      p("When it works, that contrast is genuinely new for the franchise. Going from Leon's action-movie competence into a Grace section where the same category of hallway becomes terrifying does something to your head. The tonal whiplash is the design."),
      h2("What RE4 Remake is"),
      p("RE4 Remake is the benchmark. It rebuilt a game already widely considered one of the greatest action games ever made, updated every system for modern controls, expanded Ada and Ashley's roles beyond their original function, and somehow landed better than the original on most counts. The parry system elevated the franchise's action feel above anything else in the genre at the time. The castle section alone — which is roughly thirty percent of the game — never loses momentum."),
      p("Requiem borrows RE4R's parry system. That is a compliment and a concession at the same time. The system is good enough to borrow directly, and borrowing it means Requiem's combat DNA is a subset of what RE4R established. You feel it whenever you play as Leon: the instinct is the same, but the ceiling is slightly lower."),
      h2("The case for Requiem"),
      p("The dual-protagonist structure is genuinely new territory. RE2 did two characters. RE6 did more than that. But Requiem is the first time the game makes a structural argument that two play loops with fundamentally different feel belong in the same narrative. Grace's chapters are scary in a way Leon's aren't. That matters."),
      p("The villain is the best the franchise has had since RE8. The backstory integration earns its runtime, and the design work is the kind that makes you stop in the menu screen just to look at it. No spoilers, but the final confrontation hits harder than the marketing implies."),
      p("And the third act — specifically the convergence of Leon and Grace's storylines — is the most assured RE storytelling since RE2 Remake. The game gets where it's going and it doesn't apologize for the path it took."),
      h2("The case for RE4 Remake"),
      p("RE4R is longer, meaner, and more confident. Fifteen hours against Requiem's ten, and the extra runtime doesn't feel padded — every section earns its place. The upgrade system is more satisfying to engage with. The set pieces are bigger. The boss designs are more creative, start to finish."),
      p("Leon in RE4R is the definitive modern version of the character. Requiem's Leon is inheriting that characterization, and he feels like a slightly deflated version of the same person — competent, sure, but written as someone reacting to events rather than driving them. In RE4R, Leon drives the whole thing. That energy difference compounds over a full playthrough."),
      p("If you can only play one: RE4R. It's a complete game that doesn't require the other to land."),
      h2("Which one is actually better"),
      p("RE4 Remake is the better game. Requiem is the more interesting experiment. Those aren't mutually exclusive, and in survival horror in 2026, the most interesting experiment might be the more valuable artifact."),
      p("What Requiem proves is that the dual-protagonist structure works for this franchise and deserves a second try with more budget and a tighter Leon campaign. If RE9 takes what Grace's chapters established and builds a whole game around that tone, Requiem will look like the necessary step in hindsight."),
      p("For now: RE4R is the answer you give someone who asks which RE to play. Requiem is the answer you give someone who's already played RE4R and wants to argue about it."),
      p("Pick your side in the poll. This one I expect to be close."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "re_requiem_vs_re4r",
        questionText: "Better Resident Evil?",
        questionType: "this_or_that",
        options: ["RE4 Remake", "Resident Evil Requiem"],
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
