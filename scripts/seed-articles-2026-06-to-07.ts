/**
 * Seed scheduled article drafts for the 2026-06-15 → 2026-06-20 extension.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-06-to-07.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   SANITY_WRITE_TOKEN
 *
 * Created by the weekly schedule-extension routine on 2026-05-24.
 * Slots: Mon 2026-06-15 (the-daily-bugle) | Wed 2026-06-17 (the-full-web) | Sat 2026-06-20 (cartoons-and-cereal)
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// --- Env ---

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

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

// --- Types ---

type QuestionType =
  | "yes_no"
  | "agree_scale"
  | "multiple_choice"
  | "slider"
  | "this_or_that"
  | "ranking"
  | "hot_take";

interface PollQuestion {
  questionKey: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[];
  rankingItems?: string[];
}

interface PortableTextBlock {
  _type: "block";
  style: string;
  children: { _type: "span"; _key: string; text: string }[];
  markDefs: unknown[];
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
  body: PortableTextBlock[];
  enableCommunityRating: boolean;
  pollQuestions: PollQuestion[];
}

// --- Helpers ---

function p(text: string): PortableTextBlock {
  return {
    _type: "block",
    style: "normal",
    children: [{ _type: "span", _key: "s0", text }],
    markDefs: [],
  };
}

function h2(text: string): PortableTextBlock {
  return {
    _type: "block",
    style: "h2",
    children: [{ _type: "span", _key: "s0", text }],
    markDefs: [],
  };
}

function makeBody(...blocks: PortableTextBlock[]): PortableTextBlock[] {
  return blocks.map((block, i) => ({ ...block, _key: `b${i}` }));
}

async function categoryIdBySlug(slug: string): Promise<string | null> {
  return client.fetch<string | null>(
    `*[_type == "category" && slug.current == $slug][0]._id`,
    { slug }
  );
}

// --- Articles ---

const ARTICLES: ArticleSeed[] = [
  // ─── Mon 2026-06-15 · The Daily Bugle ────────────────────────────────────
  {
    title: "Brand New Day Briefing: Everything We Know About Spider-Man's July Return",
    slug: "brand-new-day-briefing-june-2026",
    format: "the-daily-bugle",
    publishedAt: "2026-06-15T13:00:00.000Z",
    excerpt:
      "Six weeks out from Peter Parker's return to the MCU, the hype machine is running at full capacity. Here's every confirmed detail, the Sadie Sink mystery, Jon Bernthal's Punisher, and what we're watching for on July 31.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "anticipation"],
    webRating: 0,
    readingTime: 7,
    spoilerFree: true,
    body: makeBody(
      p(
        "Six weeks. That's how long we have before Tom Holland returns as Peter Parker in Spider-Man: Brand New Day, and the pre-release coverage has entered the phase where every new piece of information feels like a clue in a puzzle we're not quite allowed to solve yet. We know the broad strokes: four years after No Way Home, Peter is living alone in New York, his identity erased from everyone's memory, operating as Spider-Man without anyone who knows he exists. It's the most isolated the character has ever been in the MCU, and the question the film is clearly going to answer is whether that isolation is sustainable — or whether it was ever the right choice."
      ),
      h2("What We Definitely Know"),
      p(
        "Destin Daniel Cretton is directing, and that matters more than it might seem. Cretton is genuinely good with interiority — with characters who carry things they can't put down. His work on Shang-Chi trusted that emotional authenticity doesn't require grand gesture: a quiet moment can land harder than an explosion if the groundwork is right. Spider-Man: Brand New Day, if the trailer is any indication, is a quiet film wearing a blockbuster suit. Cretton is the right person for that specific assignment."
      ),
      p(
        "The trailer dropped in March and accumulated 718 million views in its first 24 hours — the all-time record for a movie trailer, beating the mark previously held by Deadpool & Wolverine. It established a specific tone: lonely, purposeful, haunted. Peter has rebuilt himself around the mission, and the film opens with him having been at this for four full years. Zendaya is back as MJ, which raises the obvious question: she doesn't remember him. Does he approach her anyway? Does he stay away? The trailer teases this reunion and then deliberately doesn't show you where it goes. That's intentional."
      ),
      h2("The Sadie Sink Question"),
      p(
        "Stranger Things star Sadie Sink holds third billing in the official credits — behind Tom Holland and Zendaya. In a Marvel film, third billing is not a supporting role; that's lead cast territory. And yet across the entire marketing rollout, Sink's character has been one of the most carefully concealed elements in the campaign. The theories range widely: some fans believe she's playing Anya Corazon (Araña), the Latina Spider-hero with decades of comics history who has never appeared in the MCU. Others argue she's an original creation built for this film. A few have suggested she could be playing a version of Mary Jane Watson separate from Zendaya's MJ. Reporting from earlier this month noted the trailers appear to be 'lying' about the size of her role, implying her screen time is significantly larger than the marketing suggests. If that's right, Brand New Day might have a second major lead that simply hasn't been shown yet."
      ),
      h2("The Villains We Know"),
      p(
        "Michael Mando returns as Mac Gargan/Scorpion, who appeared briefly in Homecoming. The gap between his debut and now has been filled — clearly by time served and a grudge that hasn't gotten smaller. Jon Bernthal's Frank Castle/Punisher is confirmed, which is the announcement that broke Stan Twitter twice over: Netflix Daredevil-era Bernthal, now officially canon in the MCU's main timeline, bringing his particular energy into direct contact with Holland's Spider-Man. The creative tension between those two characters — not just the obvious personality difference, but the fundamental disagreement about what justice actually requires — is exactly the kind of moral friction the film seems built to explore."
      ),
      h2("What We're Watching For"),
      p(
        "The test for Brand New Day is deceptively simple: can a Spider-Man film be emotionally interesting when Peter has nobody left? Into the Spider-Verse answered this with Miles by giving him a found family. No Way Home answered this by taking Peter's existing family away. Brand New Day is asking what happens after the grief sets in — what does a Spider-Man who has been alone for four years actually look like, and does that version of Peter have something to teach us about what the character is fundamentally about? If Cretton and Holland pull this off, July 31 could be the most emotionally ambitious Spider-Man film the MCU has ever produced."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "follow_story",
        questionText: "Are you following the Brand New Day hype?",
        questionType: "yes_no",
      },
    ],
  },

  // ─── Wed 2026-06-17 · The Full Web ───────────────────────────────────────
  {
    title: "The Weight of Being Forgotten: Peter Parker's Loneliness Is Brand New Day's Real Villain",
    slug: "brand-new-day-loneliness-full-web",
    format: "the-full-web",
    publishedAt: "2026-06-17T15:00:00.000Z",
    excerpt:
      "Four years after erasing himself from everyone's memory, Peter Parker didn't just lose his friends — he lost the social scaffolding that made him Spider-Man. Brand New Day asks the hardest question the MCU has ever posed to its hero: who are you when no one knows you exist?",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["analytical", "emotional", "intense"],
    webRating: 0,
    readingTime: 13,
    spoilerFree: true,
    body: makeBody(
      p(
        "The memory spell at the end of No Way Home is one of the most devastating moments in the MCU, and it tends to get framed as a sacrifice story — Peter chooses the world over himself, everyone forgets him, roll credits. That reading isn't wrong. But it misses something about the specific nature of the loss. Peter didn't just lose his friends. He lost the version of himself that existed in relation to them. Identity, the psychologists tell us, is not a solo project. We construct who we are through the accumulated evidence of how other people see us: their recognition of our history, their memory of our choices, their understanding of what we've been through. When the spell wiped everyone's memory of Peter Parker, it didn't just take his relationships. It took his witness."
      ),
      h2("What No One Talks About When They Talk About the Spell"),
      p(
        "There's a specific horror in Brand New Day's setup that the marketing has only brushed against: Peter is not just alone. He's alone in a way that means no one can ever fully know him. He could tell MJ everything — the whole story, from Tony Stark to the multiverse to the choice he made — and she would hear it as a stranger's confession. She has no context for who he is. The people who knew him as a person — Aunt May, who is dead; Happy Hogan, Ned, MJ — all exist but have been emptied of him. They're there. They just don't carry him anymore."
      ),
      p(
        "Superhero films don't usually dwell in this territory. They trade in cleaner emotional transactions: the mentor's death, the destroyed home, the lost family. Brand New Day, at least as the marketing frames it, is sitting in something harder — the question of what a person does when the social web that holds them together is cut. Not burned, not broken by conflict, but surgically removed. Peter chose this. He has to live inside that choice for four years before we pick him back up."
      ),
      h2("Destin Daniel Cretton and the Interior Film"),
      p(
        "This is where the director choice becomes significant. Cretton's work on Shang-Chi gets remembered mostly for its visual inventiveness — the bus fight, the mythological third act, the striking production design. But what made that film work emotionally was his refusal to let the superhero scaffolding crowd out the father-son story at its center. He has a clear preference for characters who are processing something that hasn't resolved, and who carry that processing in their bodies rather than their speeches."
      ),
      p(
        "Tom Holland is capable of the same register. His best MCU work — the conversation with Tony in Civil War, 'I don't want to go' in Infinity War, the entire second-act arc of Far From Home — happens in his face before it happens in his words. Brand New Day needs that version of Holland. The role isn't asking him to be exciting; it's asking him to be honest about what four years of chosen isolation does to a person who became Spider-Man because he loved the world enough to protect it."
      ),
      h2("The Loneliness Thesis"),
      p(
        "Here's the argument Brand New Day seems to be building toward, based on the available evidence: loneliness is not just an emotional condition for Peter. It's a philosophical one. The version of Spider-Man who has no one is operating on pure principle — helping strangers because the principle demands it, with no personal stakes attached. In theory, this should produce the most ideally motivated superhero. In practice, the trailer suggests it produces a version of Peter who is doing everything right and feeling nothing."
      ),
      p(
        "This is interesting territory. Most superhero narratives conflate virtue with connection — you fight harder when you have something to protect, you're a better hero when people believe in you. Brand New Day seems to be testing whether that's actually true, or whether it's a comfortable story we tell ourselves. Can Spider-Man function without his web in the social sense — without the relationships that give the mission meaning? The answer, four years in, appears to be: technically yes, and humanly no."
      ),
      h2("What Sadie Sink Changes"),
      p(
        "The film's wild card is whatever Sink's character turns out to be. If she's a new character who doesn't know Peter's history, she offers him something specific: the possibility of being known by someone who has no prior version of him to compare against. She meets him as he is now, not as who he was. That's either the most isolating thing possible — no history, no context, no one who remembers — or the most liberating: no one else's version of his choices to live up to. Either direction is dramatically interesting."
      ),
      p(
        "One possibility that keeps circling back: what if Sink is playing someone who, unlike everyone else, has a reason to seek Peter out — not because they remember him, but because the shape of what's missing is somehow legible? The spell erased him, but maybe the absence itself is visible in certain contexts. This is speculative. But it would best justify third billing and the extreme marketing discretion. Brand New Day is protecting something."
      ),
      h2("The Stakes"),
      p(
        "Brand New Day arrives at a moment when the MCU is finding its footing again after several years of mixed results. The Spider-Man trilogy is the franchise's most consistently successful emotional throughline — not because of the action sequences, but because Holland's Peter Parker has always been played as someone who feels things genuinely and in real time. The character's greatest strength is his humanity, which means the greatest risk is making him inhuman for story purposes."
      ),
      p(
        "The bet Brand New Day is making is that you can isolate Peter completely, strip away every relationship, and the humanity stays. That it's not contingent on his web of connections but is intrinsic to who he is. If Cretton and Holland pull this off — if the film genuinely earns its emotional payoff — it would retroactively make No Way Home's ending not just a tragedy but a setup for something. The weight of being forgotten, turned into the reason he's worth remembering."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "agree_take",
        questionText: "Loneliness is Brand New Day's real villain — do you agree?",
        questionType: "agree_scale",
      },
      {
        questionKey: "no_way_home_earned_it",
        questionText: "Did No Way Home's ending earn this setup?",
        questionType: "yes_no",
      },
    ],
  },

  // ─── Sat 2026-06-20 · Cartoons & Cereal ─────────────────────────────────
  {
    title: "My Dress-Up Darling Season 2 Full Review: Marin Finally Says It",
    slug: "my-dress-up-darling-s2-full-review",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-20T14:00:00.000Z",
    excerpt:
      "Nearly four weeks after My Dress-Up Darling Season 2 landed on Netflix, the full picture is clear: CloverWorks stuck the landing. The animation holds, the confession arc delivers, and Marin and Gojou feel like real people who found each other. 85/100.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["emotional", "chill"],
    webRating: 85,
    readingTime: 11,
    mediaLength: "12 episodes",
    spoilerFree: true,
    body: makeBody(
      p(
        "My Dress-Up Darling has always been a romance anime that was honest about itself. The central relationship between Marin Kitagawa and Wakana Gojou was never going to resolve in Season 1 — that was clear from episode one, when a girl whose cosplay ambitions were bigger than her ability to realize them walked into the workshop of a boy who makes traditional Hina dolls and has no social life to speak of. Season 1 was about the relationship forming: two people discovering each other across what should have been an uncrossable social gap, bound together by craft and the specific kind of respect that comes from watching someone work at something with total commitment. Season 2 is about what comes after they've already fallen. It has a different job to do, and it does it well."
      ),
      h2("What CloverWorks Got Right"),
      p(
        "The animation quality was what I was most worried about. Season 1 set a high bar — the cosplay construction sequences were shot and edited like action scenes, Marin's expressiveness was a genuine artistic achievement, and the show had a visual warmth that matched its emotional register. Season 2 maintains all of this. CloverWorks did not cut corners on a show that needed the budget to support its subject matter. The cosplay sequences are still treated with reverence. The color work is still precise. And Marin's face still tells you everything that's happening before anyone says a word."
      ),
      p(
        "The writing was the more interesting question. The manga wrapped in July 2025, which means the Season 2 adaptation was working from a complete story — a rare luxury for anime. The writers knew exactly where they were going. The result is a season that spends its first half carefully calibrating emotional stakes and its second half cashing them in. The confession arc — which fans had been waiting for since Season 1 ended — arrives at exactly the right moment and is handled with the kind of restraint that makes it hit harder than it would have if the show had rushed toward it."
      ),
      h2("Marin's Arc"),
      p(
        "What Season 2 understands about Marin that Season 1 was still establishing: she's not waiting for permission. She knows what she feels. The reason she doesn't say it in the first half of the season isn't because she's unsure of herself — it's because she's genuinely trying to understand what Gojou wants, rather than assuming her feelings are the only relevant data point. For a character who is often read as the emotionally direct one in the relationship, this season reveals a level of consideration that the show frames as its own kind of courage."
      ),
      p(
        "Gojou's arc is gentler and less dramatic, which is by design. He's been the show's emotional center without knowing it — the person everyone else's feelings have been orbiting — and Season 2 is partly the story of him catching up to where the audience has been for two years. When he finally arrives at clarity, the scene earns itself without being big about it. The show knows that sometimes the right emotional beat is quiet."
      ),
      h2("The Cosplay as Metaphor"),
      p(
        "One thing Dress-Up Darling has always done well, and does even better in Season 2: the cosplay is never just the cosplay. Marin's desire to bring fictional characters to life is consistently shown as an act of love — love for the source material, love for the craft, love for the experience of becoming something that matters to you. Gojou's role isn't just technical assistance. He's the person who makes it possible for Marin's interior world to have a physical form. The romance is embedded in that exchange of vulnerability: she shows him what she loves, he builds it for her, and both of them are changed by the process."
      ),
      p(
        "Season 2 introduces a new cosplay project that stretches Gojou's abilities in ways the show uses to revisit his relationship with his grandmother's craft and the traditional artistry that shaped him before Marin. This isn't a detour — it's the show insisting that who Gojou was before he met Marin matters just as much as who he's becoming. The romance lands because both characters arrive at it as fully-formed people, not as halves looking for completion."
      ),
      h2("The Verdict"),
      p(
        "My Dress-Up Darling Season 2 is what its first season promised it would be. It's warm without being saccharine, romantic without being naive, and genuinely funny without undermining its own emotional stakes. The confession arc delivers. The animation holds. And Marin and Gojou feel like real people who found each other, which in 2026's anime landscape is not a given and shouldn't be taken for granted."
      ),
      p(
        "Web rating: 85 out of 100. A rare thing: an anime romance that actually sticks the landing."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "have_you_watched",
        questionText: "Have you watched My Dress-Up Darling Season 2?",
        questionType: "yes_no",
      },
      {
        questionKey: "your_rating",
        questionText: "Rate it yourself",
        questionType: "slider",
      },
    ],
  },
];

// --- Main ---

async function main() {
  const slugs = [...new Set(ARTICLES.map((a) => a.categorySlug))];
  const categoryMap: Record<string, string> = {};

  for (const slug of slugs) {
    const id = await categoryIdBySlug(slug);
    if (id) {
      categoryMap[slug] = id;
    } else {
      console.warn(`Warning: category "${slug}" not found in Sanity — articles using it will be skipped.`);
    }
  }

  console.log(`\nSeeding ${ARTICLES.length} article drafts to Sanity (${dataset})...\n`);

  let ok = 0;
  let failed = 0;

  for (const article of ARTICLES) {
    const docId = `drafts.scheduled-${article.slug}`;
    const catId = categoryMap[article.categorySlug];

    if (!catId) {
      console.warn(`  ⚠ Skipping "${article.title}" — category not found`);
      failed++;
      continue;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (client as any).createOrReplace({
        _id: docId,
        _type: "article",
        title: article.title,
        slug: { _type: "slug", current: article.slug },
        format: article.format,
        ...(article.series ? { series: article.series } : {}),
        publishedAt: article.publishedAt,
        excerpt: article.excerpt,
        ...(article.mediaType ? { mediaType: article.mediaType } : {}),
        category: { _type: "reference", _ref: catId },
        moodTags: article.moodTags,
        webRating: article.webRating,
        readingTime: article.readingTime,
        ...(article.mediaLength ? { mediaLength: article.mediaLength } : {}),
        spoilerFree: article.spoilerFree,
        body: article.body,
        pollConfig: {
          enableCommunityRating: article.enableCommunityRating,
          pollQuestions: article.pollQuestions.map((q, i) => ({ ...q, _key: `pq${i}` })),
        },
      });
      console.log(`  ✓ ${article.title}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${article.title}: ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\nDone. ${ok} seeded, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
