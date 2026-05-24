/**
 * Seed the first batch of scheduled article drafts to Sanity.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SANITY_PROJECT_ID
 *   NEXT_PUBLIC_SANITY_DATASET   (defaults to "production")
 *   SANITY_WRITE_TOKEN
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

// --- Poll defaults ---

const DAILY_BUGLE_POLLS: PollQuestion[] = [
  { questionKey: "follow_story", questionText: "Are you following this story?", questionType: "yes_no" },
];

const FULL_WEB_POLLS: PollQuestion[] = [
  { questionKey: "agree_take", questionText: "Do you agree with this take?", questionType: "agree_scale" },
  { questionKey: "topic_depth", questionText: "How deep did this go?", questionType: "slider" },
];

const SINISTER_SIX_POLLS: PollQuestion[] = [
  { questionKey: "list_agree", questionText: "Did we get the list right?", questionType: "agree_scale" },
  { questionKey: "snub", questionText: "What got snubbed?", questionType: "hot_take" },
];

const CARTOONS_POLLS: PollQuestion[] = [
  { questionKey: "have_you_watched", questionText: "Have you watched/read this?", questionType: "yes_no" },
  { questionKey: "your_rating", questionText: "Rate it yourself", questionType: "slider" },
];

// --- Articles ---

const ARTICLES: ArticleSeed[] = [
  // ─── May 4 ─────────────────────────────────────────────────────────────────
  {
    title: "Marvel's Summer 2026 Is Here: Brand New Day Date Locked",
    slug: "marvel-summer-2026-just-got-real",
    format: "the-daily-bugle",
    publishedAt: "2026-05-04T13:00:00.000Z",
    excerpt:
      "July 31 is officially on the calendar, the summer slate is stacked, and the hype machine just shifted into second gear.",
    categorySlug: "culture",
    moodTags: ["hype", "anticipation"],
    webRating: 0,
    readingTime: 7,
    spoilerFree: true,
    body: makeBody(
      p(
        "It's official. Marvel locked in July 31 for Spider-Man: Brand New Day this week, and the summer 2026 box office picture is suddenly very clear. Tom Holland returns as Peter Parker four years after the memory wipe, Destin Daniel Cretton is in the director's chair, and the studio is clearly betting everything on this one. The trailer that dropped earlier this year already holds the record for most-viewed movie trailer in history — 718 million views in its first 24 hours. That's not a fluke. That's pent-up demand finally finding a release valve."
      ),
      p(
        "Beyond Brand New Day, the summer slate is stacked. Disclosure Day (Spielberg's UFO ensemble with Emily Blunt and Colin Firth, June 12), a new Paramount stunt franchise entry on June 26, and the early threads of Marvel's Avengers buildup all converge in a 90-day window. If you were ever going to buy a movie theater stock, the summer of 2026 is that moment."
      ),
      p(
        "We'll be breaking down every major release as we get closer. For now: mark July 31 in your calendar and prepare yourself emotionally. This one is going to be something."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── May 6 ─────────────────────────────────────────────────────────────────
  {
    title: "Wano's Shadow: Why One Piece Has Never Had More Room to Breathe",
    slug: "one-piece-post-wano-full-web",
    format: "the-full-web",
    publishedAt: "2026-05-06T15:00:00.000Z",
    excerpt:
      "Wano didn't just close an arc — it closed an era. The question now is what Oda does with all this newfound runway, and the answer is quietly one of the best stretches of One Piece in years.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["analytical", "nostalgic"],
    webRating: 0,
    readingTime: 12,
    spoilerFree: false,
    body: makeBody(
      h2("The Weight Wano Left Behind"),
      p(
        "Wano didn't just close an arc — it closed an era. By the time the war ended and the dust settled on Onigashima, One Piece had completed one of the most ambitious narrative undertakings in manga history: a years-long self-contained country saga, a decades-deferred payoff for Oden and his retainers, and a climactic confrontation with Kaido that demanded emotional stakes match all that buildup. It mostly delivered. And the question, hanging in the air ever since, has been: what does Oda do with all this newfound runway?"
      ),
      h2("The Elbaf Promise"),
      p(
        "The post-Wano arcs have quietly been doing something Oda hasn't had room for in years — breathing. The pacing is different. The Straw Hats have space to exist without a ticking clock, without an enemy looming over every conversation. Luffy's Gear Fifth, once revealed, needs time to normalize, and Oda seems to understand that showing us the crew living in the consequences of their biggest victory is more important than rushing to the next boss. Elbaf, long-promised as a destination, would be the natural culmination of Usopp's journey — and the Giant mythology woven throughout the series finally getting its moment."
      ),
      h2("Why Now Is the Right Time to Be a Fan"),
      p(
        "One Piece is 30 years old and still finding new things to say. The post-Wano stretch isn't perfect — some pacing hiccups, the occasional information overload — but it's the work of a creator who hasn't run out of ideas. That's rarer than it looks. Get in now while it's still unfolding. Netflix is adding Whole Cake Island batches this summer, which means the entry point has never been lower."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: FULL_WEB_POLLS,
  },

  // ─── May 9 ─────────────────────────────────────────────────────────────────
  {
    title: "Rewatching Fullmetal Alchemist Brotherhood in 2026: The Blueprint Still Hits",
    slug: "fmab-2026-rewatch-cartoons-cereal",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-09T14:00:00.000Z",
    excerpt:
      "Twenty years on, FMAB remains the answer to the question 'what's the best anime to show someone who doesn't watch anime?' Rewatching it in 2026 doesn't feel like nostalgia tourism. It feels like checking in with something that still has things to teach.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["nostalgic", "emotional"],
    webRating: 96,
    readingTime: 10,
    mediaLength: "64 episodes",
    spoilerFree: false,
    body: makeBody(
      p(
        "Twenty years on, Fullmetal Alchemist Brotherhood is still the answer to the question: 'What's the best anime to show someone who doesn't watch anime?' The Elric brothers' search for the Philosopher's Stone has never been just a fantasy adventure — it's a meditation on grief, consequence, and what it costs to chase what you've lost. Rewatching it in 2026 doesn't feel like nostalgia tourism. It feels like checking in with an old friend who still has something to teach you."
      ),
      p(
        "What holds up: everything. The pacing, which moves faster than almost any shonen of comparable length without ever feeling rushed. The villains, who are frightening because they understand exactly what they're doing and why. Winry. Mustang. The moment in Ishval that reframes everything you thought you knew about this world. The Brotherhood restructuring — following the manga rather than diverging like the 2003 series — turns out to have been the correct call at every junction."
      ),
      p(
        "Web rating: 96 out of 100. The one that set the bar for everyone else."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
  },

  // ─── May 11 ────────────────────────────────────────────────────────────────
  {
    title: "Pop Culture Rundown: May's Second Week Check-In",
    slug: "week-pop-culture-may-11",
    format: "the-daily-bugle",
    publishedAt: "2026-05-11T13:00:00.000Z",
    excerpt:
      "Mid-May and the cultural conversation is dense. Two major anime drops are incoming on May 25, the Miles Morales comic run is doing something interesting, and the summer movie discourse is running three weeks ahead of the actual content.",
    categorySlug: "culture",
    moodTags: ["chill", "analytical"],
    webRating: 0,
    readingTime: 6,
    spoilerFree: true,
    body: makeBody(
      p(
        "Mid-May and the cultural conversation is dense this week. The discourse around summer movies is heating up, with every new trailer getting a deep read and every casting announcement going viral within minutes. It's the kind of week where the conversation outruns the actual content by about three weeks."
      ),
      p(
        "A few things worth noting: the ongoing Netflix anime rollout for late May is shaping up to be more significant than anyone expected. Blue Lock VS U-20 Japan and My Dress-Up Darling Season 2 are both dropping on May 25, which is either a gift or a crime depending on how much free time you have. Full coverage on both as the week progresses."
      ),
      p(
        "Also: if you haven't been paying attention to the Miles Morales: Spider-Man comic run, this week's issues are making a case for it as one of the best superhero books currently running. The Brooklyn's Finest arc is doing something interesting with Miles's relationship to his own legacy. Worth picking up."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── May 13 ────────────────────────────────────────────────────────────────
  {
    title: "Six Anime Sequels We've Been Waiting On Way Too Long",
    slug: "six-anime-sequels-overdue",
    format: "the-sinister-six",
    publishedAt: "2026-05-13T15:00:00.000Z",
    excerpt:
      "Mushishi. Nana. Hunter x Hunter. No Game No Life. Berserk. The list of anime that deserve a continuation and have never gotten one is long, painful, and we're ranking it.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["nostalgic", "intense"],
    webRating: 0,
    readingTime: 10,
    spoilerFree: true,
    body: makeBody(
      h2("The List"),
      p(
        "Number 6: Mushishi. One of the most meditative series ever made, and a sequel that wouldn't need to be action-packed — just more of Ginko walking through fog, finding the strange and the beautiful. Number 5: Nana. Abandoned mid-story, the manga unfinished, the anime left on a cliffhanger that has never been addressed. A whole generation of fans is just supposed to live with this. Number 4: Hunter x Hunter. Togashi is writing, slowly, and a new adaptation following the completed Chimera Ant arc and beyond is the logical next step whenever he's ready. Number 3: Akame ga Kill. The anime diverged from the manga — a faithful adaptation of the full story still doesn't exist. Number 2: No Game No Life Season 2. The light novels are there. The demand is there. The budget was clearly available for Season 1. What is actually happening. Number 1: Berserk. A proper, faithful, feature-quality adaptation of the complete Berserk story remains the greatest unrealized project in anime history. Miura gave us everything. Someone needs to do it justice."
      ),
      p(
        "Honorable mentions: Code Geass R3, Noragami Season 3, and a full Great Teacher Onizuka remake that nobody explicitly asked for but that everyone would watch immediately."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: SINISTER_SIX_POLLS,
  },

  // ─── May 16 ────────────────────────────────────────────────────────────────
  {
    title: "Jujutsu Kaisen Season 3, One Year Later: Did the Culling Game Deliver?",
    slug: "jjk-season-3-one-year-later-cartoons",
    format: "one-year-later",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-16T14:00:00.000Z",
    excerpt:
      "A year after JJK Season 3 wrapped the Culling Game arc, the discourse has settled into grudging respect. Watching it back now — with time and distance — reveals a season that was doing more than it seemed.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["analytical", "emotional"],
    webRating: 82,
    readingTime: 9,
    mediaLength: "21 episodes",
    spoilerFree: false,
    body: makeBody(
      p(
        "A year after JJK Season 3 wrapped up the Culling Game arc, the discourse has largely settled into something that looks like grudging respect. In the moment, the season felt rushed — the sheer number of new sorcerers introduced, the kills that came too fast to process, the pacing that sacrificed clarity for chaos. Watching it back now, with time and distance, some of that still holds. But there's also a season-long argument being made about the cost of power and what it does to the people who wield it that you might have missed while trying to keep track of everyone's cursed technique."
      ),
      p(
        "Yuji is a different character by the end of Season 3 than he was at the start. That's the show doing its job. Whether the execution matched the ambition is still debatable — and this retrospective is genuinely trying to give it an honest second look."
      ),
      p(
        "Revisit verdict: better than you remember, not quite as good as it should have been. 82 out of 100."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
  },

  // ─── May 18 ────────────────────────────────────────────────────────────────
  {
    title: "Summer 2026 at the Movies: Every Release That Could Change the Game",
    slug: "summer-2026-movie-preview-daily-bugle",
    format: "the-daily-bugle",
    publishedAt: "2026-05-18T13:00:00.000Z",
    excerpt:
      "We're three months out from what could genuinely be the biggest box office summer in years. Here's what to watch, what to ignore, and what to approach with cautious optimism.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "anticipation"],
    webRating: 0,
    readingTime: 7,
    spoilerFree: true,
    body: makeBody(
      p(
        "We're three months out from what could genuinely be the biggest box office summer since the pandemic rearranged the old rules. Spider-Man: Brand New Day, Disclosure Day, and a handful of major franchise entries all land in a 90-day window — and the industry is watching to see whether theatrical still has the muscle."
      ),
      p(
        "The two films worth centering your summer around: Brand New Day (July 31) for obvious reasons, and Disclosure Day (June 12) for the Spielberg factor. When the director who made Close Encounters and E.T. returns to the UFO genre with Emily Blunt and Colin Firth, you pay attention. Everything else — the sequels, the reboots, the franchise entries — is noise until we see reviews."
      ),
      p(
        "We'll be tracking box office performance, audience scores, and the social media fallout in real time all summer. Buckle up. The next three months are going to be a lot."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── May 20 ────────────────────────────────────────────────────────────────
  {
    title: "Into the Spider-Verse vs. Across the Spider-Verse: Which Miles Movie Actually Hits Harder?",
    slug: "spider-verse-vs-across-versus",
    format: "versus",
    publishedAt: "2026-05-20T15:00:00.000Z",
    excerpt:
      "One invented a visual language. The other weaponized it. Both are extraordinary. Only one wins.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["analytical", "emotional"],
    webRating: 0,
    readingTime: 9,
    mediaLength: "Into: 1h 57m | Across: 2h 20m",
    spoilerFree: false,
    body: makeBody(
      h2("The Case for Into the Spider-Verse"),
      p(
        "Into the Spider-Verse did it first, and doing it first matters. Before Across existed, it had to invent the visual language — the ink-dot Ben-Day printing, the misaligned frame-rate, the typography-as-mood, the way different universes literally look like different animation styles. And it had to make you believe in Miles Morales without any audience goodwill built by previous films. It did all of this in under two hours, stuck the landing on an emotional climax that still wrecks you, and gave us 'What's Up Danger' doing its entire thing. Miles's leap of faith is one of the great movie moments of the decade."
      ),
      h2("The Case for Across the Spider-Verse"),
      p(
        "Across is doing something more ambitious. The canon event thesis — the idea that Spider-People's lives must rhyme with tragedy for the web to hold — is genuinely thought-provoking, and the film is honest about the fact that it might be wrong. Miguel's certainty versus Miles's refusal to accept predetermined limits is the kind of ideological conflict that great sequels are built on. Visually, Across pushed the original so far beyond what seemed possible that the first film looks like the rough draft. The Mumbattan sequence alone."
      ),
      h2("The Verdict"),
      p(
        "Into the Spider-Verse wins on emotional purity. Across the Spider-Verse wins on ambition and craft. Neither is more 'correct' — they're doing different things. If your heart picks Into, your gut is right. If your brain picks Across, your gut is also right. We're calling it for Into, by the narrowest margin, because it had to go first."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "winner",
        questionText: "Which Spider-Verse film hits harder?",
        questionType: "this_or_that",
        options: ["Into the Spider-Verse", "Across the Spider-Verse"],
      },
    ],
  },

  // ─── May 23 ────────────────────────────────────────────────────────────────
  {
    title: "Blue Lock Season 1 Revisit: Brushing Up Before VS U-20 Japan Drops",
    slug: "blue-lock-s1-revisit-cartoons-cereal",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-23T14:00:00.000Z",
    excerpt:
      "Blue Lock VS U-20 Japan drops on Netflix in two days. Here's a quick revisit of everything Season 1 set up — and why Isagi's specific brand of spatial intelligence is about to get its hardest test yet.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "analytical"],
    webRating: 92,
    readingTime: 10,
    mediaLength: "25 episodes",
    spoilerFree: false,
    body: makeBody(
      p(
        "With Blue Lock VS U-20 Japan dropping on Netflix in two days, it felt right to go back to Season 1 and remember what made this show break through when it did. The pitch — strip the teamwork out of soccer, find the striker with enough selfishness to be the best in the world — should have been an easy pass for most sports anime fans. Cooperation is the whole point of team sports. But Blue Lock understood something that most sports anime miss: the interesting part isn't the win, it's the player's relationship with their own hunger."
      ),
      p(
        "Yoichi Isagi is not a likeable protagonist in the traditional sense. He's not competing for anyone's approval. He's competing to understand himself. The show's first season is essentially a psychological thriller wearing a soccer uniform, and if you've seen it, VS U-20 Japan is going to hit differently — because you know exactly where Isagi's game was when we left him, and you understand why the U-20 match is the first real test of Ego's entire philosophy."
      ),
      p(
        "Come in prepared. The web is ready to shoot. Web rating for Season 1: 92 out of 100."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
  },

  // ─── May 25 ────────────────────────────────────────────────────────────────
  {
    title: "Netflix's May 25 Anime Drop Is a Crisis of Riches",
    slug: "netflix-may-25-anime-drop-daily-bugle",
    format: "the-daily-bugle",
    publishedAt: "2026-05-25T13:00:00.000Z",
    excerpt:
      "Blue Lock VS U-20 Japan and My Dress-Up Darling Season 2 both landed on Netflix this weekend. Both were among the most anticipated anime continuations of the year. Netflix has decided to give you a problem.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "chill"],
    webRating: 0,
    readingTime: 6,
    spoilerFree: true,
    body: makeBody(
      p(
        "Netflix dropped two major anime sequels on the same day this weekend — Blue Lock VS U-20 Japan and My Dress-Up Darling Season 2 — and the streaming platform has, once again, decided to give subscribers a genuine problem. Both shows were among the most anticipated continuations of their respective genres. Both are landing on the same Sunday. Your watchlist is full of nothing and everything at once."
      ),
      p(
        "Blue Lock VS U-20 is the higher-stakes arrival: the original season ended on a setup that made this match feel inevitable and necessary, and the VS U-20 arc is widely considered the peak of the manga's early run. My Dress-Up Darling Season 2 is the emotional one — the manga concluded last year, and whether the anime gives Marin and Gojou's relationship the landing it deserves has been the fandom's main preoccupation since Season 1 wrapped."
      ),
      p(
        "Full coverage on both this week. Start with whichever one you need more right now. (It's okay if that answer is 'both at 3am.')"
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── May 27 ────────────────────────────────────────────────────────────────
  {
    title: "Blue Lock's Anti-Team Philosophy Is Actually Correct (Hear Me Out)",
    slug: "blue-lock-philosophy-full-web",
    format: "the-full-web",
    publishedAt: "2026-05-27T15:00:00.000Z",
    excerpt:
      "Blue Lock thinks selfishness is the correct approach to becoming great. Not ruthlessness — selfishness. The distinction matters. And there's legitimate sports psychology behind Ego's entire premise.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["analytical", "intense"],
    webRating: 0,
    readingTime: 12,
    spoilerFree: false,
    body: makeBody(
      h2("What Blue Lock Is Actually Arguing"),
      p(
        "Here's the uncomfortable thesis at the center of Blue Lock: selfishness is the correct approach to becoming great. Not ruthlessness, not cruelty — selfishness. The distinction matters. Isagi doesn't want to hurt anyone. He just wants to win more than he wants to be liked. In a genre that has spent 40 years telling us that friendship and teamwork are the only path to excellence, Blue Lock looks at that premise and says: what if the reason Japanese soccer can't produce a world-class striker is because we've been training kids out of exactly the quality that would make them exceptional?"
      ),
      h2("The Psychological Case"),
      p(
        "There's legitimate sports psychology behind this. The research on elite individual performance consistently shows that the players who reach the highest levels have a quality best described as 'focused selfishness' — a capacity to prioritize their own development and clarity over team consensus. It's not that they don't function in teams; it's that they don't depend on teams for their sense of worth. Blue Lock isn't inventing Ego's philosophy from nothing."
      ),
      h2("Where the Argument Breaks Down"),
      p(
        "But Blue Lock also knows its thesis is incomplete. The VS U-20 Japan arc — which just hit Netflix — starts to show the cracks: when individual excellence meets something that requires genuine coordination, Isagi's model gets stress-tested. The show hasn't abandoned its premise, but it's starting to complicate it. And that complication is where Blue Lock gets genuinely interesting. A series confident enough to challenge its own central argument is a serious piece of storytelling."
      ),
      p(
        "Final word: Blue Lock is not a safe sports anime. It's asking you to sit with the idea that some of what we tell ourselves about cooperation might be a comfortable lie. You don't have to agree. But you should think about it."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: FULL_WEB_POLLS,
  },

  // ─── May 30 ────────────────────────────────────────────────────────────────
  {
    title: "My Dress-Up Darling Season 2, One Week In: Already Obsessed",
    slug: "my-dress-up-darling-s2-first-impressions",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-30T14:00:00.000Z",
    excerpt:
      "One week into My Dress-Up Darling Season 2, and the main thing I can report is that CloverWorks remembered what they were doing. Full review once the season completes.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["chill", "emotional"],
    webRating: 0,
    readingTime: 8,
    mediaLength: "12 episodes",
    spoilerFree: true,
    body: makeBody(
      p(
        "One week into My Dress-Up Darling Season 2, and the main thing I can say is: CloverWorks remembered what they were doing. Season 1's animation was one of its defining qualities — not just Marin's expressiveness, but the care given to the cosplay construction sequences, the way Gojou's craftsmanship is treated with the same reverence as any action anime's power system. Season 2 hasn't dropped that standard. The first three episodes establish a clear continuation of Season 1's tone, and the slow-building emotional chemistry between Marin and Gojou feels exactly where we left it."
      ),
      p(
        "What's new: the romantic tension has been dialed up in ways that suggest the season knows exactly where it's going. Marin's self-awareness of her feelings is clearer this season — she knows. The question is how and when she says it. For anyone who read the manga's finale (which wrapped in July 2025), you know how this ends. For anime-only fans, the season is clearly building toward something."
      ),
      p(
        "First impressions verdict: exactly what we wanted. Web rating pending — full review once the season wraps."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
  },

  // ─── Jun 1 ─────────────────────────────────────────────────────────────────
  {
    title: "June Drop Season Begins: What You Should Actually Watch",
    slug: "june-drop-season-daily-bugle",
    format: "the-daily-bugle",
    publishedAt: "2026-06-01T13:00:00.000Z",
    excerpt:
      "June opened with Assassination Classroom Season 2, Shangri-La Frontier Season 2, and more. The problem is no longer finding things to watch. The problem is deciding what actually deserves your time.",
    categorySlug: "culture",
    moodTags: ["chill", "hype"],
    webRating: 0,
    readingTime: 6,
    spoilerFree: true,
    body: makeBody(
      p(
        "June is here, and the entertainment calendar is absolutely loaded. Netflix opened the month with a batch that includes Assassination Classroom Season 2, Shangri-La Frontier Season 2, and a handful of other drops — on top of Blue Lock and My Dress-Up Darling, which are already running. The problem is no longer finding things to watch. The problem is deciding what actually deserves your time."
      ),
      p(
        "This week's actual recommendation: if you haven't started Assassination Classroom, now is the perfect time. Season 1 is on Netflix and Season 2 is here now. The premise — an alien creature is teaching a class of middle schoolers while being their assassination target — sounds like an absurdist comedy. But what it's really about is a group of kids who've been written off by their school finding purpose and genuine education from the most unexpected teacher possible. It earns every emotional beat it cashes."
      ),
      p(
        "Full June preview later this week. For now: pace yourself. There's too much of everything and that's not going to resolve on its own."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── Jun 3 ─────────────────────────────────────────────────────────────────
  {
    title: "Six Times Anime Ruined Us Emotionally and We're Still Not Over It",
    slug: "six-anime-emotional-gut-punches",
    format: "the-sinister-six",
    publishedAt: "2026-06-03T15:00:00.000Z",
    excerpt:
      "Violet Evergarden. Clannad: After Story. Hunter x Hunter. FMAB. AoT. Your Lie in April. Six moments that broke the community and never fully healed.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["emotional", "nostalgic"],
    webRating: 0,
    readingTime: 10,
    spoilerFree: false,
    body: makeBody(
      h2("Ranked, Without Apology"),
      p(
        "Number 6: Violet Evergarden, Episode 10. 'I know you wanted her to see you grow.' If you know, you know. If you don't, go find out. Number 5: Clannad: After Story, Episodes 16–18. The show builds a warm domestic life over half a season specifically so it can take it away from you in ways that feel genuinely unfair. Number 4: Hunter x Hunter, the Chimera Ant arc ending. Meruem and Komugi playing Gungi at the end of everything they are. It shouldn't work. It works completely. Number 3: Fullmetal Alchemist Brotherhood, Episode 10. The Gate. The price. The moment when the show stops being an adventure and becomes something else entirely. Number 2: Attack on Titan's Shiganshina arc. Not a single moment — the whole arc, which pays off years of worldbuilding in ways that are both devastating and satisfying simultaneously. Number 1: Your Lie in April, Episode 22. The letter. We're not talking about it. We're just acknowledging it."
      ),
      p(
        "What's not on this list: Anohana (disqualified for being too obvious), Code Geass's finale (it's complicated), and every moment of Made in Abyss Season 2 (protected status, we're not ready)."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: SINISTER_SIX_POLLS,
  },

  // ─── Jun 6 ─────────────────────────────────────────────────────────────────
  {
    title: "Shangri-La Frontier Season 2 Review: The VRMMO That Actually Gets Gaming",
    slug: "shangri-la-frontier-s2-cartoons-cereal",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-06T14:00:00.000Z",
    excerpt:
      "Shangri-La Frontier has a very specific audience: people who've played enough RPGs to know when a game is bad and when the players just aren't paying attention. Season 2 is for all of them.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "chill"],
    webRating: 87,
    readingTime: 10,
    spoilerFree: false,
    body: makeBody(
      p(
        "Shangri-La Frontier has a very specific audience: people who've played enough RPGs to know when a game is actually bad and when the players are just not paying attention. Rakuro Hizume — a trash-game connoisseur who decides to take on the top-tier VRMMO Shangri-La Frontier as his next challenge — is the correct protagonist for this premise. He approaches the game like a veteran reading the manual no one else bothered with, and the show's comedy comes from how systematically he undermines the expectations of players who got good the conventional way."
      ),
      p(
        "Season 2 continues where the first left off, with Sunraku's reputation in the game growing faster than his ability to stay anonymous. The Wethermon arc that was building throughout Season 1 starts to pay off, and the show earns the long setup. More importantly, the animation quality hasn't dropped — the studio is still treating this like a prestige production, which a show about VRMMO trash-grinding did not have to receive."
      ),
      p(
        "Web rating: 87 out of 100. The VRMMO anime that actually gets what makes games fun."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
  },

  // ─── Jun 8 ─────────────────────────────────────────────────────────────────
  {
    title: "Brand New Day Update: Everything We Know Seven Weeks Out",
    slug: "brand-new-day-july-update-daily-bugle",
    format: "the-daily-bugle",
    publishedAt: "2026-06-08T13:00:00.000Z",
    excerpt:
      "New character posters, the Sadie Sink mystery deepening, and a fan theory that's been breaking Stan Twitter for two weeks. Seven weeks from release, the Brand New Day hype machine is at full capacity.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "anticipation"],
    webRating: 0,
    readingTime: 7,
    spoilerFree: true,
    body: makeBody(
      p(
        "Seven weeks from release and the Spider-Man: Brand New Day promotional machine is running at full capacity. New character posters dropped this week showing Tom Holland's Peter in that unmistakable 'living alone, no civilian life, just the suit and the city' aesthetic that the trailer established. The visual language is doing its work — this doesn't look like the MCU Peter we've seen before. He looks tired and purposeful in a way that's genuinely new for the character."
      ),
      p(
        "The thing now everywhere in the fan conversation: Sadie Sink. She holds third billing behind Holland and Zendaya, which is not a minor detail. Third billing in a Marvel film is top-tier lead cast territory. The theories range from Anya Corazon (Araña, who has a long comics history and has never appeared in the MCU) to an original creation built for the film. The marketing's refusal to show her in action is doing exactly the job it's supposed to."
      ),
      p(
        "Brand New Day is also serving as a hinge point for Phase Six — early reporting suggests the film sets up at least two threads extending into the broader Avengers buildup. Whether that scaffolding enriches the standalone story or crowds it out is the question we'll be answering July 31."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: DAILY_BUGLE_POLLS,
  },

  // ─── Jun 10 ────────────────────────────────────────────────────────────────
  {
    title: "Satoru Gojo vs. Suguru Geto: JJK's Most Painful Versus Has No Real Winner",
    slug: "geto-vs-gojo-jjk-versus",
    format: "versus",
    publishedAt: "2026-06-10T15:00:00.000Z",
    excerpt:
      "Gojo is unreachable. Geto asked the questions no one else wanted to ask. The versus here isn't about power — it's about what a life in service to an unjust system does to the people who hold it up.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["analytical", "emotional", "intense"],
    webRating: 0,
    readingTime: 9,
    spoilerFree: false,
    body: makeBody(
      h2("Satoru Gojo"),
      p(
        "Gojo Satoru is what happens when talent so thoroughly eclipses human limitation that the person inside stops having to develop. The Infinity that no one can touch is more than a technique — it's a metaphor. Gojo is unreachable, not just physically but emotionally and philosophically. His certainty that the system can be changed from the inside, that the next generation trained correctly will make the difference, is a form of idealism that functions as distance. He doesn't have to fix the present because he's working on the future. The tragedy is that this might actually be correct — and that it cost Geto everything."
      ),
      h2("Suguru Geto"),
      p(
        "Geto Suguru arrived at his conclusion by being more honest than Gojo. The question — why do sorcerers protect people who would never extend the same protection back? — is not a wrong question. The answer he chose is wrong. But the journey that got him there, the accumulated weight of cursed spirits and innocent lives and a system that treats its own protectors as disposable, is more understandable than most people want to admit. Geto is the version of the JJK world's tragedy that didn't get to stay comfortable."
      ),
      h2("Who Wins"),
      p(
        "There's no winner. That's the point. The two of them are the same person's possible futures, split at the moment Gojo couldn't bring himself to bridge the gap. The versus here isn't about power — it's about what a life in service to an unjust system does to the people who hold it up. JJK is asking you to sit with the fact that neither answer was ever going to be enough."
      )
    ),
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "winner",
        questionText: "Who do you sympathize with more?",
        questionType: "this_or_that",
        options: ["Satoru Gojo", "Suguru Geto"],
      },
    ],
  },

  // ─── Jun 13 ────────────────────────────────────────────────────────────────
  {
    title: "Blue Lock VS U-20 Japan Full Review: Ego's Gamble Paid Off",
    slug: "blue-lock-vs-u20-full-review",
    format: "first-bite",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-13T14:00:00.000Z",
    excerpt:
      "Three weeks with Blue Lock VS U-20 Japan, and the consensus is settling where it should: this is the arc that proves Blue Lock wasn't a one-hit wonder. The match result is not what most sports anime would do with it, and that's exactly the point.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "intense", "analytical"],
    webRating: 89,
    readingTime: 11,
    mediaLength: "13 episodes",
    spoilerFree: false,
    body: makeBody(
      p(
        "Three weeks with Blue Lock VS U-20 Japan, and the consensus is settling in the right place: this is the arc that proves Blue Lock wasn't a one-hit wonder. The original season established the premise — the Blue Lock project, Ego's theory, Isagi's particular brand of spatial intelligence — but it was self-contained enough to feel like it could have been the whole thing. VS U-20 Japan is where the rubber meets the road. Blue Lock's training methods are being questioned. The match against the national under-20 team is the proof of concept, and the story earns it."
      ),
      p(
        "What works: Isagi's evolution feels earned rather than power-creep. The introduction of Rin Itoshi as a foil brings exactly the right kind of antagonism — not villainous, just excellent in a way that challenges everything Isagi thinks he knows. The animation holds its quality for the sequences that need to land. And the arc's ending commits to its thesis rather than pulling back at the critical moment."
      ),
      p(
        "The match result is not a conventional sports anime triumph, and the show is confident enough in its philosophy to let the outcome be complicated. Mild spoiler: what matters is what the result reveals about Isagi, not the scoreline. That's the mark of a show that knows what it's actually about."
      ),
      p(
        "Web rating: 89 out of 100."
      )
    ),
    enableCommunityRating: true,
    pollQuestions: CARTOONS_POLLS,
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
