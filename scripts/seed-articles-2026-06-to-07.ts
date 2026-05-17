/**
 * Seed scheduled article drafts into Sanity.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-06-to-07.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (default: production)
 *   SANITY_WRITE_TOKEN           (generate at sanity.io/manage → API → Tokens)
 *
 * Each article is upserted as a draft with _id = drafts.scheduled-<slug>.
 * Open Sanity Studio to review and publish.
 *
 * Slots covered:
 *   2026-06-08  Mon  the-daily-bugle       Masters of the Universe opening weekend
 *   2026-06-10  Wed  versus                Daemons of the Shadow Realm vs. FMA: Brotherhood
 *   2026-06-13  Sat  the-full-web (C&C)    Witch Hat Atelier — full season review
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_WRITE_TOKEN in .env.local\n" +
      "Generate one at: https://sanity.io/manage → your project → API → Tokens"
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// --- Types ---

interface PollQuestion {
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
}

interface ArticleSeed {
  title: string;
  slug: string;
  format: string;
  series?: string;
  publishedAt: string;
  excerpt: string;
  mediaType?: "movie" | "tv" | "game" | "anime" | "books" | "music";
  categorySlug: string;
  moodTags: string[];
  webRating: number;
  readingTime: number;
  mediaLength?: string;
  spoilerFree: boolean;
  body: ReturnType<typeof p>[];
  enableCommunityRating: boolean;
  pollQuestions: PollQuestion[];
}

// --- Helpers ---

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function p(text: string) {
  return {
    _type: "block" as const,
    _key: uid(),
    style: "normal",
    children: [{ _type: "span" as const, _key: uid(), text, marks: [] as string[] }],
    markDefs: [] as unknown[],
  };
}

function h2(text: string) {
  return {
    _type: "block" as const,
    _key: uid(),
    style: "h2",
    children: [{ _type: "span" as const, _key: uid(), text, marks: [] as string[] }],
    markDefs: [] as unknown[],
  };
}

function makeBody(...blocks: ReturnType<typeof p>[]) {
  return blocks;
}

async function categoryIdBySlug(slug: string): Promise<string> {
  const cat = await client.fetch<{ _id: string } | null>(
    `*[_type == "category" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!cat) {
    throw new Error(
      `Category "${slug}" not found. Create it in Sanity Studio first.`
    );
  }
  return cat._id;
}

// --- Articles ---

const ARTICLES: ArticleSeed[] = [
  // ── Mon 2026-06-08 ── the-daily-bugle ────────────────────────────────────
  {
    title:
      "He-Man Had His Opening Weekend. The Verdict? By the Power of Grayskull, It Slaps.",
    slug: "masters-of-the-universe-2026-opening-weekend",
    format: "the-daily-bugle",
    publishedAt: "2026-06-08T13:00:00Z",
    excerpt:
      "Masters of the Universe opened June 5 and the internet is still arguing about Jared Leto's Skeletor. Here's the opening-weekend vibe check on the He-Man revival.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "nostalgic", "debate"],
    webRating: 0,
    readingTime: 4,
    spoilerFree: true,
    body: makeBody(
      p(
        "He-Man just had his opening weekend, and the discourse is exactly as chaotic as you'd expect. Masters of the Universe landed June 5 to a mixed-but-mostly-good reception — the kind where half the internet is writing think pieces about Jared Leto's Skeletor and the other half is just vibing in the multiplex eating popcorn and having a genuinely good time. We're firmly in the second camp."
      ),
      p(
        "Let's be honest: nobody was ready to take this movie seriously. The franchise has been stuck in IP purgatory since the 1987 Dolph Lundgren film became a cult artifact of pure unhinged energy. Amazon MGM has been developing this thing for years, cycling through directors and release dates. Travis Knight finally got the call, and it turns out the guy who made Bumblebee a legitimately good blockbuster had a plan. He brings the same quality he's always had: he finds the humanity inside the spectacle and lets you care about the people before the punching starts."
      ),
      p(
        "Nicholas Galitzine as Prince Adam is the real discovery here. The actor sells the fish-out-of-water energy of a kid who grew up on Earth thinking he was just a normal person, then discovers he's essentially the most important guy in another universe. There's some real Shazam! DNA in the best way — the hero's journey filtered through someone who didn't sign up for this but shows up anyway. Camila Mendes as Teela is doing a lot of heavy lifting as the most grounded character in the film, and Idris Elba as Man-at-Arms is exactly what Idris Elba always is: the most competent person in any room, delivering every line like it's a royal decree."
      ),
      p(
        "And then there's Skeletor. Jared Leto is doing a thing with this character that shouldn't work but kind of does. He's leaning into theatrical villain energy — all menace and grandeur — rather than trying to anchor the character in gritty realism. When your villain is a skull-faced sorcerer-warlord, gritty realism was probably the wrong call anyway. The internet is going to be arguing about this performance for weeks, which is exactly what a franchise revival needs."
      ),
      p(
        "The bigger question this opening weekend is whether the film has legs. Initial tracking suggests a solid but not spectacular domestic debut. The real test is international and streaming — Amazon Prime Video subscribers are already circling, and this is exactly the kind of movie that might find its true audience at home. By the Power of Grayskull, He-Man is officially back. Whether the universe survives depends on word of mouth over the next two weeks."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "seen_it",
        questionText: "Have you caught Masters of the Universe yet?",
        questionType: "yes_no",
      },
      {
        questionKey: "hot_take",
        questionText: "Jared Leto's Skeletor is actually good.",
        questionType: "hot_take",
      },
    ],
  },

  // ── Wed 2026-06-10 ── versus ──────────────────────────────────────────────
  {
    title:
      "Daemons of the Shadow Realm vs. Fullmetal Alchemist: Brotherhood — Can Arakawa Strike Gold Twice?",
    slug: "daemons-shadow-realm-vs-fma-brotherhood",
    format: "versus",
    publishedAt: "2026-06-10T15:00:00Z",
    excerpt:
      "Hiromu Arakawa's new anime is drawing obvious comparisons to her masterpiece. Seven episodes in, we put them head to head across five categories and call a winner.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["analytical", "nostalgic", "debate", "hype"],
    webRating: 0,
    readingTime: 10,
    mediaLength: "64 eps (FMA:B) · 2-cour ongoing (Daemons)",
    spoilerFree: false,
    body: makeBody(
      p(
        "There's a particular kind of weight that only Hiromu Arakawa creates. It's the gravity of Fullmetal Alchemist: Brotherhood — arguably the greatest anime ever made — pressing down on every new thing she puts into the world. When Daemons of the Shadow Realm premiered April 4 on Crunchyroll with Studio Bones Film behind it, the comparisons started immediately. Seven weeks in, we have enough of the show to ask the question everyone's been dancing around: can Arakawa do it again?"
      ),
      p(
        "This isn't a take-down piece. Daemons is genuinely excellent. But you don't get to skip the comparison when you're the same creator working in the same studio tradition with overlapping thematic DNA. So let's run the tape."
      ),
      h2("The Setup"),
      p(
        "FMA: Brotherhood drops you into Amestris — a fictional country with European industrial-age texture — and immediately makes you feel the weight of its world. Edward and Alphonse Elric's backstory is established through tragedy in the opening episodes, and from that moment forward every decision the show makes has emotional stakes already baked in."
      ),
      p(
        "Daemons opens in premodern Higashi — think feudal Japan with supernatural undercurrents — and introduces twins Yuru and Asa through prophecy and separation. Both shows use sibling relationships as their emotional core. But where FMA:B gives you the tragedy upfront and asks you to fight for redemption, Daemons is layering its mystery slowly. The twins spend much of the first arc apart, discovering their abilities independently, which generates a different kind of dramatic tension — anticipation rather than grief."
      ),
      p(
        "Edge: FMA:B for immediate emotional impact. Daemons is playing a longer game, and seven episodes in it's not clear whether that patience will pay off the same way."
      ),
      h2("The Siblings Factor"),
      p(
        "Ed and Al Elric are one of the best sibling pairs in anime history, full stop. Ed's guilt and Al's quiet dignity create a dynamic that evolves constantly across 64 episodes. Their relationship isn't just the emotional core — it is the show. Everything else is scaffolding around it."
      ),
      p(
        "Yuru and Asa are still finding their footing seven episodes in. Asa, who can control Daemons in ways nobody anticipated, is arguably the more compelling character so far — her arc has a quiet intensity that sneaks up on you. Yuru is a more conventional shonen lead, but Arakawa has never written a truly conventional protagonist; the sense here is that what looks like setup is going to become something stranger and more interesting."
      ),
      p(
        "Edge: FMA:B by significant margin, but only because it's a completed work. Daemons has trajectory."
      ),
      h2("Animation and Presentation"),
      p(
        "Studio Bones made FMA:Brotherhood in 2009 and it remains some of the best-looking television animation from that era. The action sequences — particularly the battles in the later arcs — set a technical and choreographic standard that still holds up."
      ),
      p(
        "Bones Film is handling Daemons, and they've brought that mid-2000s craft energy back with renewed purpose. The Daemon designs are striking: these are creatures that feel genuinely supernatural rather than just large and dangerous. Director Masahiro Andō has a patient quality — he lets scenes breathe before they accelerate. The opening theme 'Tobu Toki' by Vaundy hits differently every week. The ending 'Tobō yo' by Yama is the kind of haunting closer that makes you sit through credits you'd normally skip."
      ),
      p(
        "FMA:Brotherhood had a different sonic world but the same intent: music that felt like it belonged to the story rather than existing alongside it. This one's a draw. Both series use their aesthetic craft to deepen the narrative."
      ),
      h2("The World-Building"),
      p(
        "Amestris, Xing, Ishval, the Northern Wall — FMA:B constructs an entire geopolitical world that the story inhabits and eventually dismantles. The alchemy system isn't just a power mechanic; it's a metaphysical framework that the story challenges, breaks, and rebuilds. You understand why the world works the way it works, and then you understand why that's horrifying."
      ),
      p(
        "Daemons is building its world through implication right now. The Daemon system — certain humans can form bonds with and command supernatural creatures — has rules that are being revealed gradually. There are hints of a larger mythology surrounding the twins' origin prophecy that suggests Arakawa is thinking in structural terms, not just in plot terms. But we're seven episodes into a two-cour run, and the scaffolding is still visible."
      ),
      p(
        "Edge: FMA:B, because it's finished. You can hold the whole thing up to the light. Daemons gets significant credit for ambition and early architecture."
      ),
      h2("The Verdict"),
      p(
        "Comparing a completed masterpiece to seven episodes of a freshman season will always favor the former. Fullmetal Alchemist: Brotherhood wins this matchup because it already did everything it set out to do — with an ending that remains one of the most satisfying in the medium's history. There's no qualifier needed. It's a ten."
      ),
      p(
        "But here's the more interesting question: does Daemons of the Shadow Realm have the potential to reach that level? Seven episodes in, the honest answer is yes. Arakawa isn't retreading old ground — the sibling-and-supernatural premise is hers to play with in an entirely new register. Bones Film is bringing the same craft lineage that made FMA:B an animation landmark. And for the first time in years, there's a Thursday-morning anime that genuinely feels like required viewing rather than recommended."
      ),
      p(
        "FMA:Brotherhood is the ceiling. Daemons is climbing. Check back when it's done."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "winner",
        questionText: "Right now, which show has the stronger foundation?",
        questionType: "this_or_that",
        options: ["Daemons of the Shadow Realm", "Fullmetal Alchemist: Brotherhood"],
      },
      {
        questionKey: "convincing",
        questionText: "The comparison is fair given where Daemons currently stands.",
        questionType: "agree_scale",
      },
      {
        questionKey: "overall_quality",
        questionText: "Rate this matchup (1–10)",
        questionType: "slider",
      },
    ],
  },

  // ── Sat 2026-06-13 ── the-full-web / cartoons-and-cereal ─────────────────
  {
    title: "Witch Hat Atelier Is Everything We Waited a Decade For",
    slug: "witch-hat-atelier-spring-2026-review",
    format: "the-full-web",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00Z",
    excerpt:
      "Ten episodes in, BUG FILMS' adaptation of Kamome Shirahama's manga has delivered on nine years of anticipation. A full verdict on Spring 2026's best anime.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["chill", "emotional", "hype", "nostalgic"],
    webRating: 88,
    readingTime: 9,
    mediaLength: "ongoing — Spring 2026 (Crunchyroll)",
    spoilerFree: false,
    body: makeBody(
      p(
        "Witch Hat Atelier has been in the hands of manga readers since Kamome Shirahama began serializing it in July 2016. That's nine years of readers waiting — nine years of gorgeous chapter covers, painstaking hatching-style artwork, and a magic system so thoughtfully constructed that debates about its internal logic still appear in comment sections without provocation. BUG FILMS' anime adaptation premiered on Crunchyroll in early April, and now ten episodes in, the verdict is in: the wait was worth it."
      ),
      p(
        "This isn't simple 'good adaptation' praise. Witch Hat Atelier is doing something rarer than that. It's translating a work whose entire identity is tied to its visual craft into a different medium that has to solve entirely different visual problems. And so far, BUG FILMS is solving them beautifully, in ways that make you understand why it took this long to find the right studio."
      ),
      h2("What Is Witch Hat Atelier?"),
      p(
        "Coco is a young girl who wants desperately to become a witch in a world where magic is real but strictly controlled — only those born into witch bloodlines are permitted to learn it. When she accidentally witnesses forbidden magic and sets off a chain of events that upends her understanding of her world, she ends up under the tutelage of the mysterious Qifrey, a witch with a complicated history he keeps close to his chest."
      ),
      p(
        "The magic system is the show's quiet secret weapon. Magic here is a craft — literally. Witches draw sigils using special inks and writing instruments. The art is learned, not innate, despite what the world's official mythology insists. This repositions magic as a form of labor and artistry rather than a birthright, which turns the usual fantasy hierarchy on its head. Coco's desire to learn isn't just coming-of-age wish fulfillment; it's a form of resistance against a system designed to exclude people like her. Shonen anime doesn't always let its premises have real political implications. This one does."
      ),
      h2("The Animation"),
      p(
        "BUG FILMS is a relatively young studio making an enormous statement with this production. The central challenge — preserving the manga's storybook quality while introducing motion — required careful decisions about what to animate and what to let breathe."
      ),
      p(
        "What they've landed on is a measured approach that feels exactly right for the material. Background art is lush and intricate. Character animation tends toward deliberate stillness punctuated by precise, meaningful movement — rather than the constant-kinetic style that defines most shonen adaptations. When a witch draws a sigil, the camera holds on the gesture. When magic activates, the visuals open up. This is a show that understands its own rhythms."
      ),
      p(
        "The premiere's sequence of Coco watching magic through a doorway — light and wonder and just a touch of forbidden transgression — is already iconic. BUG FILMS storyboarded that moment with the same care Shirahama drew it on the page. These two objects are in dialogue with each other, not competition."
      ),
      h2("Coco and Qifrey — The Heart of the Show"),
      p(
        "The show lives or dies on its central relationship, and the adaptation gets it right. Coco is curious and determined without being insufferably earnest — she makes real mistakes, carries real doubt, and has a scene in episode five that communicates more about her character in thirty seconds of silence than most anime manage in a full episode of dialogue."
      ),
      p(
        "Qifrey is a mentor-figure with obvious secrets who nonetheless seems to genuinely care about his apprentice's development. The balance is tricky — too mysterious and he becomes withholding, too warm and the secrets lose their weight — and the show walks it carefully. His expression when Coco solves a problem he didn't expect her to, in episode seven, is the best character beat of the spring season."
      ),
      p(
        "The ensemble of fellow apprentices adds texture rather than just function. Agott's initial hostility has evolved into a reluctant respect that feels earned rather than expedient. Tetia is genuinely warm without being naive. Richeh is being held in reserve, and the show knows it."
      ),
      h2("How Does It Compare to the Manga?"),
      p(
        "Ten episodes covers roughly the first two volumes with some expansions and reordering. The pacing is slower than a straight page-to-screen adaptation would run, which in this case is the right call. Rushing this material would be like speed-running an art museum — technically possible, but you'd miss everything that makes it worth entering."
      ),
      p(
        "What doesn't translate perfectly: Shirahama's crosshatching-style linework is one of the most distinctive visual signatures in contemporary manga, and animation can't replicate it directly. BUG FILMS' solution — creating a different but coherent aesthetic that feels like it's in conversation with the source — is more sophisticated than trying to be a moving version of it."
      ),
      p(
        "What works better in motion: the magic activations. Seeing sigils glow and spells unfold in real time adds kinetic joy that even the manga's most carefully composed pages couldn't fully capture. This is adaptation doing what it's supposed to do — finding what the new medium can do that the source couldn't."
      ),
      h2("Verdict"),
      p(
        "Witch Hat Atelier sits at a 4.9 on Crunchyroll and an 8.75 on MyAnimeList, and neither number feels exaggerated. This is a show that rewards patience — it asks you to sit with its world rather than rush through it, and trusts that the quietness is part of the point rather than a pacing flaw."
      ),
      p(
        "It's the kind of adaptation that sends you back to the manga with new eyes: not because the anime improved on it, but because both works are now in active dialogue with each other. Both are worth having. The two together are something special."
      ),
      p(
        "If you've been waiting since 2016, your faith was not misplaced. If you're coming in fresh, you're about to have ten very good hours of television and a manga library to fall into afterward. Spring 2026 handed us something rare. Don't sleep on it."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "watching",
        questionText: "Are you watching Witch Hat Atelier?",
        questionType: "yes_no",
      },
      {
        questionKey: "rating",
        questionText: "Rate it (1–10)",
        questionType: "slider",
      },
      {
        questionKey: "continue",
        questionText: "You're keeping up with this through the finale.",
        questionType: "agree_scale",
      },
    ],
  },
];

// --- Main ---

async function main() {
  console.log(
    `\nSeeding ${ARTICLES.length} scheduled article drafts → Sanity (${dataset})...\n`
  );

  for (const seed of ARTICLES) {
    const categoryId = await categoryIdBySlug(seed.categorySlug);

    const doc = {
      _id: `drafts.scheduled-${seed.slug}`,
      _type: "article",
      title: seed.title,
      slug: { _type: "slug", current: seed.slug },
      format: seed.format,
      ...(seed.series ? { series: seed.series } : {}),
      publishedAt: seed.publishedAt,
      excerpt: seed.excerpt,
      ...(seed.mediaType ? { mediaType: seed.mediaType } : {}),
      category: { _type: "reference", _ref: categoryId },
      moodTags: seed.moodTags,
      webRating: seed.webRating,
      readingTime: seed.readingTime,
      ...(seed.mediaLength ? { mediaLength: seed.mediaLength } : {}),
      spoilerFree: seed.spoilerFree,
      body: seed.body,
      pollConfig: {
        enableCommunityRating: seed.enableCommunityRating,
        pollQuestions: seed.pollQuestions.map((q) => ({ _key: uid(), ...q })),
      },
    };

    try {
      await client.createOrReplace(doc);
      console.log(`  ✓ ${seed.publishedAt.slice(0, 10)}  ${seed.title}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${seed.slug}: ${msg}`);
    }
  }

  console.log(
    "\nDone. Open Sanity Studio to review drafts before publishing.\n"
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
