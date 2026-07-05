/**
 * Seed 3 forward-scheduled article drafts (2026-06-13 → 2026-06-17)
 *
 * Extends the 4-week forward calendar documented in docs/CONTENT_SCHEDULE.md
 * past the existing horizon of 2026-06-10. Drafts hold body, polls, and
 * metadata — they will only appear on the site once published manually
 * in Studio.
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
    slug: "ghost-in-the-shell-2026-science-saru-preview",
    title: "The Ghost in the Shell Is Back — and Science SARU Has the Keys",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Production I.G. held the Ghost in the Shell franchise for 30 years. Science SARU takes over in July 2026, and the Annecy premiere footage already looks like they earned it.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "thoughtful", "cinematic"],
    webRating: 0,
    readingTime: 5,
    spoilerFree: true,
    body: [
      p("Production I.G. made Ghost in the Shell for thirty years. Thirty. Years. From the 1995 film through Stand Alone Complex, through Arise, through the 2015 movie — one studio held the keys to one of the most influential sci-fi anime franchises in history."),
      p("This summer, those keys change hands. Science SARU's The Ghost in the Shell premieres July 7 on Amazon Prime Video, and based on the Annecy preview footage, the transition is in good hands."),
      h2("Who is Science SARU"),
      p("If you're not already on the Science SARU wavelength, a quick orientation. This is the studio behind Dandadan — which you've seen in this column before — the Devilman Crybaby adaptation that went viral in 2018, and Inu-Oh, the Masaaki Yuasa film that was criminally underseen in theaters. Science SARU has a reputation for taking source material and finding a visual language that feels like something only they could have made."),
      p("The director on this adaptation is Mokochan, a Science SARU regular whose previous work has been quietly building a signature style. The Annecy screening reportedly drew a standing ovation. I believe that."),
      h2("What's different this time"),
      p("The most interesting production note from Annecy: Mokochan confirmed zero generative AI was used in the production. In an industry where AI-generated backgrounds have already started appearing in other studios' work, that commitment matters — not just ethically, but aesthetically. The frame-by-frame integrity that makes Science SARU's work feel the way it does depends on human authorship down to the background art."),
      p("The visual approach is also a departure from Production I.G.'s deliberately desaturated, shadow-heavy aesthetic. The 2026 adaptation uses a brighter, more colorful palette — which sounds wrong on paper until you remember that the original Shirow Masamune manga was, in fact, a lot more colorful than any of the anime adaptations. This is closer to the source material and further from the version most people know, which is either a problem or a feature depending on how attached you are."),
      h2("Why it belongs in this column"),
      p("Ghost in the Shell is anime history. The 1995 film influenced The Matrix. Stand Alone Complex is the gold standard for episodic cyberpunk worldbuilding. Any new adaptation in 2026 carries thirty years of accumulated weight."),
      p("I want to watch the first episode before saying anything definitive. But based on what Science SARU has done with every property they've touched before — and based on the Annecy reaction — this has the potential to be the summer 2026 show. Set the reminder for July 7."),
      h2("For the uninitiated"),
      p("If you've never seen any version of Ghost in the Shell: this new adaptation is explicitly designed to work without prior catalog knowledge. The script, by EnJoe Toh, goes back to Shirow's original manga rather than riffing on the 1995 film's continuity. You don't need to have watched Stand Alone Complex to get it. That's intentional, and it's the right call."),
      p("Poll below — tell me if it's on your list."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "gits_2026_on_list",
        questionText: "Adding The Ghost in the Shell (2026) to your list?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 2. Mon 2026-06-15 — the-daily-bugle
  {
    slug: "zelda-ocarina-of-time-remake-switch-2-confirmed",
    title: "Nintendo Finally Confirmed the Zelda Remake and I Don't Know How to Process This",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "After years of leaks that went nowhere, The Legend of Zelda: Ocarina of Time is officially getting a full Switch 2 remake. The Nintendo Direct closed on it. It's real.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["hype", "nostalgic"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Last Tuesday's Nintendo Direct closed with something that has been rumored approximately forty times in the last decade and turned out to be nothing approximately forty times. This time it's real."),
      p("The Legend of Zelda: Ocarina of Time is getting a full remake on Switch 2. Complete visual overhaul. Exclusive to Switch 2. Coming later this year. That's all Nintendo gave us — a teaser and a logo — but for a game this significant, that's already everything."),
      h2("Why this matters"),
      p("Ocarina of Time is not just a great game. It's the game that proved 3D action-adventure was a viable genre, that taught a generation of developers what a lock-on targeting system should feel like, and that holds up as a narrative achievement even thirty years on. Every Zelda game since has been measured against it."),
      p("The 3DS port from 2011 was a light remaster — higher resolution, some touch controls, Master Quest included. Good, not a remake. This is apparently a remake, meaning rebuilt from scratch. The teaser footage was deliberately sparse, but what lighting and geometry you can see looks like a current engine, not an upscaled N64 asset pack."),
      h2("The question worth asking"),
      p("What do they preserve and what do they modernize? Ocarina in 2026 has some deeply 1998 design decisions — the Water Temple, certain item gates, the camera in the Gerudo Valley stretch. A good remake doesn't sand those down into nothing; it solves the legitimate frustrations while leaving the soul intact."),
      p("Nintendo rebuilt Metroid Prime in 2023 and got that balance exactly right. Retro-faithful, not retro-locked. That's the benchmark this has to clear."),
      h2("Spider-sense"),
      p("Holiday 2026. They're keeping this for the holiday window — everything about the announcement timing and the absence of a release date suggests they have a date they're not ready to say yet. Adjust your expectations calendar accordingly."),
      p("The June Direct also showed Xenoblade Genesis, Kingdom Hearts IV, and a new Fire Emblem. But let's be honest: those are side notes. The Zelda reveal is the headline, and it's going to stay the headline until we see gameplay."),
      p("How hyped? Hot take meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "zelda_oot_remake_hype",
        questionText: "How hyped are you for the Zelda: OoT remake?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-06-17 — versus
  {
    slug: "versus-xbox-showcase-vs-playstation-state-of-play-june-2026",
    title: "Versus: Xbox vs. PlayStation — Who Had the Better June 2026?",
    format: "versus",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Xbox dropped Fable gameplay and doubled down on exclusives. PlayStation brought Wolverine and God of War Laufey. Two stacked showcases, one week apart. Pick a side.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["comparative", "hype", "thoughtful"],
    webRating: 0,
    readingTime: 8,
    spoilerFree: true,
    body: [
      p("Every June, both platforms clear their throats and try to win the internet for a week. This year, the week of June 2–9 delivered two legitimately stacked showcases, and the hot takes have been flying ever since. Let's adjudicate."),
      h2("The case for PlayStation"),
      p("Sony's State of Play ran June 2 and it knew what it was there to do. The show opened with extended Marvel's Wolverine gameplay — and I'll be honest, I had been skeptical about Insomniac's Wolverine for a while. The traversal mechanics look genuinely different from the Spider-Man games. The adamantium claw movement, the berserker rage system, the Logan-specific environmental storytelling. Insomniac seems to understand that Wolverine needs to play nothing like Peter Parker."),
      p("The State of Play also revealed God of War Laufey, the Santa Monica Studio follow-up to Ragnarök. Laufey is set in a time period we haven't seen before, with a protagonist who isn't Kratos — which is either the most interesting creative decision Santa Monica has made since the Norse saga began, or a massive miscalculation. The teaser was deliberately light on gameplay. The vibes were immaculate."),
      p("Beyond the two headlines: Onimusha: Way of the Sword got a release date (Capcom delivering again), Until Dawn 2 finally looked like it earned the sequel title, and the third-party slate was better than the usual State of Play padding. A tight, confident 60-minute show."),
      h2("The case for Xbox"),
      p("The Xbox Games Showcase ran June 7 and it came in swinging on the one thing PlayStation has not been swinging on lately: exclusivity. Microsoft confirmed that Gears of War: E-Day and Clockwork Revolution are Xbox console exclusives — not timed, not 'we'll see,' specifically not coming to PS5. That's a strategic pivot from the last few years of Xbox releasing everything everywhere, and it signals that Microsoft believes it has products worth fighting for again."),
      p("The showcase also had real Fable. Extended gameplay Fable. The English countryside looked gorgeous, the tone is landing somewhere between the irreverence of the originals and the open-world grammar players expect in 2026. Hayley Atwell in the cast is an inspired choice — she gives the franchise a voice it was missing since Peter Molyneux stopped making promises."),
      p("Halo: Combat Evolved remake with three new story missions is either the best fan service in the franchise's history or Microsoft buying goodwill with a player base they've been disappointing since 2021. Probably both. The Persona 4 Revival release date was a genuine surprise, and Wo Long 2: Wings of Ember looks like Team Ninja doing Team Ninja things, which is always welcome."),
      h2("The structural difference"),
      p("Here's the honest read: PlayStation's two headliners — Wolverine and Laufey — are bigger individual announcements than anything Xbox showed. These are franchise tentpoles with the production weight to justify the hype. When Sony has those in the chamber, it's hard to beat on prestige alone."),
      p("But Xbox's showcase was deeper. By total number of games I personally added to my wishlist after watching, Xbox won the week by a comfortable margin. And the exclusivity commitment — whether you think it's good for gaming broadly or not — shows a platform with a spine again."),
      h2("Which one stuck"),
      p("Two weeks later, what am I still thinking about? Wolverine gameplay. The God of War Laufey protagonist mystery. Fable's English countryside. The Zelda OoT remake that closed the Nintendo Direct the same week."),
      p("June 2026 was, quietly, one of the best gaming weeks in years. All three platform holders showed up. That's not always the case."),
      h2("The verdict"),
      p("On brand prestige: PlayStation. Wolverine and God of War are the names that cut through to people who don't follow gaming closely."),
      p("On momentum: Xbox. The exclusivity pivot and the Fable depth signal a platform trying to become necessary again."),
      p("On what I'd put in front of someone who hasn't thought about gaming in five years: PlayStation, because those are the names they'll recognize."),
      p("Pick your side in the poll."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "xbox_vs_playstation_june_2026",
        questionText: "Who had the better June 2026?",
        questionType: "this_or_that",
        options: ["Xbox", "PlayStation"],
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
