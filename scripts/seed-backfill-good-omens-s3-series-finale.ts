/**
 * Backfill seed — one article for the 2026-05-13 Wednesday slot
 *
 * Subject: Good Omens Season 3 series finale (premiered May 13, 2026, Amazon Prime Video)
 * Format: the-full-web (long-form review)
 *
 * Usage:
 *   npx tsx scripts/seed-backfill-good-omens-s3-series-finale.ts          # Create / overwrite draft
 *   npx tsx scripts/seed-backfill-good-omens-s3-series-finale.ts --dry    # Print plan, no writes
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
  // ----- 1. Wed 2026-05-13 — the-full-web (backfill)
  {
    slug: "good-omens-s3-series-finale",
    title: "Good Omens Season 3 Finally Closed the Book — Here's How It Landed",
    format: "the-full-web",
    publishedAt: "2026-05-13T15:00:00.000Z",
    excerpt:
      "Six years after Aziraphale and Crowley first saved the world over dinner in The Ritz, the story is done. Season 3 had one impossible job after that ending. It mostly delivers.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["emotional", "bittersweet", "thoughtful"],
    webRating: 87,
    readingTime: 10,
    mediaLength: "Season 3 — Prime Video",
    spoilerFree: false,
    body: [
      p("Good Omens Season 3 is finally here and I have watched the whole thing in a sitting and a half, and now I need to write about it before I feel things even more than I already do."),
      p("Quick version: it's good. It does what a series finale is supposed to do. I have thoughts about how it gets there, and some notes, but the short answer is — if you loved S1 and you survived S2's ending, this is the season you were waiting for. Go watch it, come back."),
      p("Okay. The rest of this is for the people who've already watched."),
      h2("Where we left off"),
      p("Season 2 ended with what might be the most divisive final ten minutes in streaming TV since the last episode of any show people love. Metatron offered Aziraphale the job of Supreme Archangel. Aziraphale took it. Crowley told him exactly how he felt about that — first the kiss, then the damage — and drove off in the Bentley. 'I forgive you' became the line that launched a thousand arguments. The question of who was in the wrong got debated for two and a half years straight."),
      p("Season 3 opens into the aftermath of that, and the show knows it can't pretend the ending didn't happen. It doesn't try to. What it does instead — and this is the thing the show earns — is hold both sides of the argument as valid. Aziraphale's choice was sincere. Crowley's heartbreak was real. The show spent two seasons building a relationship out of friction and avoidance and coded devotion, and Season 3 is where it finally asks both characters to say out loud what they've been dancing around since the Garden of Eden."),
      h2("What the finale gets right"),
      p("Michael Sheen and David Tennant are, frankly, doing the best work of their respective television careers. That's not a small claim. Tennant's Crowley has always been the easier showcase — the sarcasm, the physical comedy, the sunglasses — but what Season 3 asks of him in its second half is quieter and harder to pull off, and he does it."),
      p("Sheen's Aziraphale is the one I want to talk about. The character has always been written as the more difficult one to love. He's fussy, he's self-deceiving, he hedges his bets with Heaven even when he knows better. What Season 3 does is let the show acknowledge that this has always been Aziraphale's flaw and his tragedy simultaneously — the need to be on the side of something official, even when the unofficial thing is the one that makes sense. Sheen plays the arc of that recognition with more precision than S2's ending deserved, which is to say: he's generous to the character and to the audience."),
      p("The finale sequence — I'll be deliberately vague here — earns the wait in the way that good series finales do. Not by giving everyone what they wanted in the tidiest possible way, but by being honest about what the show has been about. Good Omens has always been a story about two beings who love the earth and each other more than the cosmic factions they nominally serve. The ending serves that. I won't say more than that."),
      h2("The stuff that doesn't fully land"),
      p("The cosmic politics plotting has been a weak point since Season 2 and it's still a weak point in S3. There are extended sequences in the first two episodes that are doing a lot of table-setting for the finale's payoff, and they drag. The Heaven bureaucracy material, in particular, runs out of fresh jokes about forty minutes before it stops being the plot."),
      p("A couple of supporting arcs wrap too cleanly. The show has always had a cast of human characters orbiting the angel and the demon, and Season 3's finale-mode means some of them get endings that feel more like checkboxes than character work. It's a known cost of wrapping a series — everybody has to go somewhere — but it's visible."),
      p("The tonal whiplash between broad comedy and genuine emotional weight also gets harder to calibrate in a season that's building toward resolution. S1 had the advantage of adapting a novel that solved the problem by building the tonal mixture in from the ground up. S2 had the advantage of keeping the mystery going long enough to not have to land. S3 has to stick something, and the cost is that some of the comedic sequences in the middle stretch feel like they're buying time rather than building momentum."),
      h2("The show's place in the streaming landscape"),
      p("This is probably worth saying: Good Omens arrived in 2019 as a pretty clear signal that streaming TV could be the home for this kind of fantasy-comedy-drama hybrid — niche, specific, deeply funny, emotionally sincere. It was a love letter to Terry Pratchett as much as an adaptation of his novel, and it hit in a moment when that kind of careful, lavishly produced adaptation of beloved text was still something people were figuring out how to do."),
      p("The show runs on a simple engine: two characters who are incapable of being honest with each other about the thing that matters most, surrounded by cosmic comedy that exists to make the honesty more expensive when it finally arrives. Pratchett's humor and Gaiman's mythology fuse in the original novel in a way that's almost impossible to translate directly, and yet the show mostly pulls it off. That it took until Season 3 to fully close the loop on the central relationship is either a feature or a flaw, depending on how much patience you brought to S2."),
      p("The fact that it's done is also worth noting. In the current streaming landscape, where shows get cancelled mid-arc or dragged out past their expiration date, a three-season run that was planned as three seasons and actually made it to three seasons is worth celebrating on its own terms. The story is complete. That's not nothing."),
      h2("The verdict"),
      p("Web rating: 87. A series finale that does what series finales are supposed to do — closes the book on terms the show established for itself. It's not a perfect season. The middle stretch has friction. But the ending works, and the ending is the thing that had to work."),
      p("If you've been watching since S1, you owe it to yourself to finish. If you dropped off during S2 because the finale hurt — and that's valid — you can come back. The show sees you."),
      p("Tell me what you think in the poll. Did it stick the landing?"),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "good_omens_s3_landing",
        questionText: "Good Omens Season 3 stuck the landing.",
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
