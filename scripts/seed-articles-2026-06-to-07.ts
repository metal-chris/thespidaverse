/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Extends the 4-week rolling horizon documented in docs/CONTENT_SCHEDULE.md.
 * Creates UNPUBLISHED drafts in Sanity. Drafts will only appear on the site
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
    slug: "witch-hat-atelier-is-the-show-frieren-fans-were-looking-for",
    title: "Witch Hat Atelier Is the Show Frieren Fans Have Been Looking For",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Crunchyroll dropped Spring 2026's answer to Frieren in April and I waited eight episodes before writing about it. I should not have waited eight episodes.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["cozy", "beautiful", "emotional"],
    webRating: 91,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Crunchyroll dropped Spring 2026's answer to Frieren in April and I waited eight episodes before writing about it. I should not have waited eight episodes."),
      p("Witch Hat Atelier — adapted from Kamome Shirahama's manga by director Ayumu Watanabe and Studio Madhouse — is the kind of anime that shows up once every few years and immediately resets the standard for what the medium can do in the fantasy-slice-of-life lane. It's not a perfect comp to Frieren. Frieren is elegiac, slow, about time and grief. Witch Hat Atelier is warmer, more concerned with the wonder of learning something new and the weight of keeping secrets. But they're cousins, and if you've been adrift since Frieren wrapped, this is the next stop."),
      h2("What it's about"),
      p("Coco wants to be a witch. The world she lives in has a rule: magic is genetic, bloodline-gated, and if you're not born to it, you're out. Then she watches a traveling sorcerer cast a spell and realizes magic is just written symbols — anyone could theoretically learn it. Then that same sorcerer catches her watching, and the consequences of that moment are what the whole show is about."),
      p("The show is careful in ways that current shōnen mostly isn't. The magic system is internally consistent, visually expressive, and bound by rules that the story actually respects. The conflict isn't 'girl learns to be strong enough.' It's closer to 'girl learns to exist in a system that wasn't built for her' — which is a much more interesting problem."),
      h2("The animation is doing work"),
      p("Shirahama's original art is extraordinarily detailed — hatching, cross-hatching, the kind of linework that takes years to develop and is deeply difficult to adapt into animation without losing something. Madhouse figured it out. The visual language of the anime preserves the textured quality of the manga while moving at the speed a TV budget allows. The color direction leans warm and saturated in a way that makes every establishing shot feel like you're looking at a painting."),
      p("The Ghibli comparisons write themselves and I understand why people keep making them. But Witch Hat Atelier is doing something slightly different — it's more interested in the mechanics of its world than Ghibli usually is, and the mentor-student dynamic between Coco and Qifrey has an edge to it that most Ghibli protagonists never have to deal with."),
      h2("Eight episodes in"),
      p("By episode eight the show has earned every character it's placed on screen. The ensemble — Coco, Agott, Richeh, Tetia, and the broader apprentice cohort — each has a defined emotional throughline that the writing is actually paying off. The competition arc in the middle of the season adds stakes without turning the show into a tournament anime, which takes genuine restraint."),
      p("Web rating: 91. The pacing in the first two episodes is deliberate, which will put some people off. Push through. The show opens up in episode three and doesn't look back."),
      p("Are you already watching? Tell me in the poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "witch_hat_watching",
        questionText: "Are you watching Witch Hat Atelier this season?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "star-fox-switch-2-june-2026",
    title: "Star Fox Is Back and It's a Switch 2 Exclusive — Barrel Roll Required",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Nintendo's June 25 launch includes online dogfights, revoiced dialogue, and a prologue where you play as Fox McCloud's dad. The franchise reset is actually happening.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["nostalgia", "hype"],
    readingTime: 2,
    spoilerFree: true,
    body: [
      p("Nintendo dropped the news in May's Direct and I've been sitting on it long enough: Star Fox is back. June 25. Switch 2 exclusive. Full remake of Star Fox 64 with new cutscenes, online multiplayer, mouse controls, and a prologue mission where you play as James McCloud."),
      p("James McCloud. Fox's dad. The one who got betrayed by Pigma and left in Andross's grip. Nintendo is going back to fill in the mythology and I am here for every second of it."),
      h2("What the remake actually is"),
      p("This isn't a remaster. Stage layouts are the same as Star Fox 64, but everything else has been rebuilt: character designs, dialogue, cutscenes, orchestral score, and a full revoice. Nintendo went full cinematic on the presentation in a way that suggests they want this entry to be the franchise reset Star Fox has needed since 2016's Zero missed the mark."),
      p("The online multiplayer is the new piece. Arwing dogfights were always a couch standby but now there's dedicated online support with ranked play. Whether that community has legs beyond launch week is a legitimate question, but the commitment is there."),
      h2("The Fox McCloud problem"),
      p("Star Fox has never found a stable gear since the N64. Command, Assault, Adventures — all interesting games, none of them the follow-up Star Fox 64 deserved. Zero on the Wii U was ambitious and misread the room completely. So it's been ten years since Nintendo genuinely tried."),
      p("This remake is a soft reset, not a sequel. But the James McCloud prologue suggests they're building toward a follow-up that actually advances the lore. If the gameplay is as clean as the early footage implies, June 25 might be the moment the franchise finally gets its footing back."),
      h2("Spider-sense"),
      p("$49.99 digital, $59.99 physical. For a Switch 2 exclusive with new story content and full online, that's reasonable. I'm buying it on launch day. Do a barrel roll."),
      p("How hyped are you? Hot take below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "star_fox_switch2_hype",
        questionText: "How hyped are you for Star Fox on Switch 2?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-jjk-s3-vs-demon-slayer-infinity-castle",
    title: "Versus: JJK S3 vs. Demon Slayer Infinity Castle — Which Shonen Actually Won 2026?",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "MAPPA brought the Culling Game to life and Ufotable delivered the Infinity Castle on the big screen. Two different philosophies. One question. Pick a side.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["comparative", "intense", "thoughtful"],
    webRating: 0,
    readingTime: 9,
    spoilerFree: false,
    body: [
      p("Two shonen juggernauts. Two completely different strategies. One question: which one actually won 2026?"),
      p("On one side: Jujutsu Kaisen Season 3, which ran January through March on Crunchyroll, adapted the Culling Game arc with MAPPA operating at their highest-possible-difficulty setting, and ended with a finale that left the fandom genuinely unsure whether anyone they like is still safe. On the other side: Demon Slayer: Infinity Castle Part 1, the theatrical film that dropped in Japan in July 2025 and has since reached a global streaming audience — a movie that reminded everyone Ufotable has no competition in what they do."),
      p("Two different mediums, two different target audiences, two different reasons to exist. Let's run the tape."),
      h2("The case for JJK S3"),
      p("MAPPA has been under impossible scrutiny since the Shibuya arc. Season 2's back half was a flex of production muscle that reportedly cost animators real health problems, and the internet was waiting for Season 3 to stumble. Then the Culling Game dropped and the conversation changed."),
      p("The animation in JJK S3 is, in some places, the best TV animation MAPPA has ever produced. The Yuta sequence — three simultaneous opponents, kinetic framing, colony-specific lighting that the manga could only gesture toward — is the kind of fight that gets frame-counted on YouTube for years. The decision to give each Culling Game colony its own color palette and visual grammar was world-building-through-direction, and it elevated the source material rather than just adapting it."),
      p("More importantly: JJK S3 fixed the pacing problem that haunted the manga. Akutami's Culling Game chapters were notoriously dense and occasionally incoherent. The anime compresses, reorders, and dramatizes in ways that make the arc more coherent than it read on the page. That's a genuine achievement — making difficult source material land harder than it did in print."),
      h2("The case for Demon Slayer Infinity Castle"),
      p("Ufotable has been building toward this arc for six seasons and they spent every frame of them proving they could handle it. The theatrical format — three films instead of a TV series — is the right call for an arc this sprawling, and Part 1 used that runtime to do something no Demon Slayer content since Mugen Train had managed: raise the emotional stakes in a way that makes you forget how much you already know about where this story ends."),
      p("Akaza's return is a different kind of beat on the big screen than on the page. The theater format, the orchestral Yuki Kajiura score, the 90-foot image — Infinity Castle uses every advantage of the medium and doesn't apologize for it. If you saw Part 1 in a theater, you already know what I mean. If you streamed it, you got roughly seventy percent of what theaters got and it still hit."),
      p("Demon Slayer's writing has never been JJK's strongest competition. But Infinity Castle doesn't need to compete on writing. It competes on spectacle, emotional sincerity, and the trust of an audience that has followed Tanjiro for years. It wins those three categories going away."),
      h2("The structural question"),
      p("JJK S3 is doing something formally ambitious. It's building a story about a system that chews people up, where the protagonist's power is morally complicated, and where 'winning' is contingent and temporary. Gege Akutami's whole thesis is that heroism in shōnen is usually a lie, and MAPPA found the exact right visual language to make that thesis land emotionally rather than just intellectually."),
      p("Demon Slayer is doing something formally classic. It's a story about good people doing hard things for clear reasons, where the emotional beats are earned over three-plus years of setup, and where the catharsis is real even when you know exactly what's coming. That's traditional shōnen executed at the highest possible level — and 'executed at the highest possible level' is not a small thing."),
      h2("The verdict"),
      p("JJK S3 is the smarter anime. Demon Slayer Infinity Castle is the better experience. And those aren't the same thing, which is what makes this fight actually interesting."),
      p("If you want an anime that will make you think about what shōnen is doing in 2026 and where it's capable of going — JJK. If you want an anime that will make you feel something real for characters you've already loved for years — Demon Slayer."),
      p("Both deserve to exist. Only one can win the poll."),
      p("Pick your side below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "jjk_vs_demon_slayer_2026",
        questionText: "Which shonen won 2026?",
        questionType: "this_or_that",
        options: ["Jujutsu Kaisen S3", "Demon Slayer: Infinity Castle"],
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
