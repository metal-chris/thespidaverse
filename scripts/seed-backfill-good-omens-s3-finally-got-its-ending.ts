/**
 * Seed one backfill article draft: 2026-05-13 — Good Omens S3 (the-full-web)
 *
 * Backfills the 2026-05-13 Wednesday slot in the content gap documented in
 * docs/CONTENT_WORKFLOW.md. Draft _id uses the backfill- prefix to keep
 * it visually distinct from forward-scheduled content in Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-good-omens-s3-finally-got-its-ending.ts
 *   npx tsx scripts/seed-backfill-good-omens-s3-finally-got-its-ending.ts --dry
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
// Article seed
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
  // ----- Backfill: Wed 2026-05-13 — the-full-web
  {
    slug: "good-omens-s3-finally-got-its-ending",
    title: "Good Omens S3 Finally Got Its Ending — And It's Complicated",
    format: "the-full-web",
    publishedAt: "2026-05-13T15:00:00.000Z",
    excerpt:
      "One 90-minute special to close out six thousand years of Aziraphale and Crowley. It earned its emotional landing. The plot is a different story.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["emotional", "thoughtful", "heavy"],
    webRating: 78,
    readingTime: 7,
    mediaLength: "90 minutes (single episode)",
    spoilerFree: false,
    body: [
      p("Good Omens is done. One 90-minute special, dropped on Prime Video on May 13, and that's the end of Aziraphale and Crowley. They got their ending. Whether it's the ending the show deserved is a longer conversation — and that's what this is."),
      p("Here's the complicated truth: this episode is both better than it had any right to be and more limited than it should've been. Hold both of those at once. That's Good Omens S3 in a sentence."),
      h2("The context you need"),
      p("Season 3 was supposed to be a full season. Production was halted following credible sexual assault allegations against series creator Neil Gaiman. Those allegations are serious and have been extensively documented elsewhere. Amazon and the production company ultimately made the decision to let the cast and crew give the story a proper close rather than leave it unfinished — but under drastically reduced circumstances. One feature-length episode instead of a full run."),
      p("I say this not to relitigate the Gaiman situation here — that's not what The Spidaverse is for — but because you genuinely cannot review this finale without acknowledging that the shape of it was dictated by something outside the story. The writers and cast worked with what they had. Keep that in mind the whole time you're watching."),
      h2("What Good Omens is, for the late arrivals"),
      p("The short version: an angel named Aziraphale (Michael Sheen) and a demon named Crowley (David Tennant) have been loosely collaborating for six thousand years to quietly keep Earth from getting obliterated by Heaven or Hell. Season 1 was about the two of them stopping the Apocalypse. Season 2 expanded their world, gave them a proper central conflict, and ended with Aziraphale choosing to return to Heaven — leaving Crowley alone in their shared bookshop, a declaration of love apparently unheard. Season 3 picks up in that wreckage."),
      p("The show is based on the 1990 novel by Terry Pratchett and Neil Gaiman, and the adaptation has always lived or died on the central relationship. Everything else — Heaven's politics, Hell's incompetence, the various human and celestial figures orbiting the main story — is scaffolding. The scaffold matters, but it's not the point."),
      h2("What the finale gets right"),
      p("David Tennant and Michael Sheen are doing something genuinely rare on screen. They've been playing these characters across two seasons and a decade of real time, and the chemistry isn't just 'good for a TV show' — it's the kind of thing that only happens when two actors are fully inside what they're doing. The scenes where Crowley and Aziraphale are finally in the same room again — the arguments, the silences, the things neither of them can quite say — are the best work either actor has put on screen in years. I'm not exaggerating that."),
      p("The finale earns its emotional beats. I went in prepared to be underwhelmed and came out having felt the things I was supposed to feel. The specific way the ending resolves their arc — no spoilers — is the right answer. Not the easy answer, not the fan-service answer, but the answer that's true to who both of them have always been. That restraint is hard to pull off and the writers nailed it."),
      p("There's also a sequence midway through that plays almost entirely without dialogue, and it is a genuinely beautiful piece of television. The direction in that stretch is operating at a different level than the surrounding episode. If you see nothing else from Good Omens S3, find those ten minutes."),
      h2("Where it falls short"),
      p("The plot is a mess. Heaven and Hell are still at war in some form, there are several storylines from S2 that needed resolution, and you can feel the writers doing triage throughout the episode — cutting threads, compressing arcs, making calls you can tell were painful. Supporting characters who deserved full scenes get two minutes, maybe three. The larger mythology of the show, which had been expanding in genuinely interesting ways in S2, gets wrapped up in a way that's functional but not satisfying. Some threads just... end. Or disappear. You notice."),
      p("The pacing is the thing that keeps this from being a great finale instead of a good one. Emotionally, it lands. But you're always aware you're watching a 90-minute version of something that should have had six hours to breathe. The bones of a remarkable final season are visible in the episode's structure — the shape of what the writers had planned for is legible under what they were able to execute. That's both a tribute to how good the room was and a frustration you can't fully shake."),
      h2("Should you watch it"),
      p("If you've seen S1 and S2, yes. Immediately. This is the close the show earned and the close its cast deserved — even if the production circumstances cost the story the room it needed to fully land."),
      p("If you've never started Good Omens: watch S1 first. S1 is one of the better fantasy adaptations of the last decade, and it works on its own terms even if you stop there. S2 complicates it. S3 closes it."),
      p("If you bounced off S1 because the tone felt arch or the comedy wasn't doing it for you: S3 isn't going to fix that. The finale leans into the emotional register more than the comic one, but the sensibility is the same show."),
      h2("Web rating"),
      p("78. The emotional core is exceptional, Tennant and Sheen deliver career-level work for this kind of material, and the finale sticks its actual landing. The structural problems and the compressed runtime cost it real points. This is a finale you'll be glad you watched and quietly sad about at the same time — and I think that's probably the right feeling to walk away with."),
      p("Tell me where you landed in the poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "good_omens_s3_ending_deserved",
        questionText: "The S3 finale gave Crowley and Aziraphale the ending they deserved.",
        questionType: "agree_scale",
      },
    ],
  },
];

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------

async function main() {
  console.log(`Seeding ${ARTICLES.length} backfill article draft(s)...`);
  if (dryRun) console.log("(dry run — no writes)");

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
    const docId = `drafts.backfill-${article.slug}`;
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
