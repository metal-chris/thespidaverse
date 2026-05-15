/**
 * Seed 12 forward-scheduled article drafts (2026-05-16 → 2026-06-10)
 *
 * Creates UNPUBLISHED drafts in Sanity for the 4-week forward calendar
 * documented in docs/CONTENT_SCHEDULE.md. Drafts hold body, polls, and
 * metadata — they will only appear on the site once published manually
 * in Studio.
 *
 * Usage:
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts          # Create / overwrite drafts
 *   npx tsx scripts/seed-articles-2026-05-to-06.ts --dry    # Print plan, no writes
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
  // ----- 1. Sat 2026-05-16 — cartoons-and-cereal
  {
    slug: "dandadan-s2-is-already-eating",
    title: "Dandadan S2 Is Already Eating — Get In Before It Gets Spoiled",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-16T14:00:00.000Z",
    excerpt:
      "Science SARU is still showing up to work like they're being paid in cursed turbo granny bones. Dandadan S2 is the Saturday show.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "weird", "intense"],
    webRating: 88,
    readingTime: 4,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("Bro. Bro. Dandadan S2 is back, and Science SARU is still showing up to work like they're being paid in cursed turbo granny bones."),
      p("If you missed Season 1, the elevator pitch is: girl who believes in ghosts, boy who believes in aliens, neither believes the other, both end up getting their respective belief systems beat into them by reality. The animation is psychotic in the best way — Science SARU draws ghosts the way they draw mecha and the way they draw your mom, which is to say with full unhinged commitment."),
      p("Season 2 picks up the Jiji arc, and if you're an anime-only watcher, you should know: this is where the show puts on weight. The cursed house stretch is one of the best horror-comedy beats in modern shōnen, and the OST during the hand sequence is going to live in my brain rent free for the next month."),
      h2("Why it's the right Saturday show"),
      p("What I love about Dandadan as the Saturday slot is that it eats fast. Episodes are tight, the cliffhangers actually function as cliffhangers, and the comedy doesn't wait around. It's the kind of show you can watch in 24 minutes with a bowl of cereal and feel like the day started right."),
      p("If you're new: catch up on S1, watch the first three eps of S2, decide. If you bounced on S1 because the fan service got loud — it's still loud in S2, but the show earns it by being good at literally every other thing it does."),
      h2("The verdict"),
      p("Web rating: 88. Subtract a few points if you're allergic to fan service that earns it. Add them back if you respect when a horror beat is allowed to actually scare you in 2026."),
      p("Tell me which arc you're most hype for in the poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "which_s2_arc",
        questionText: "Which S2 arc are you most hyped for?",
        questionType: "multiple_choice",
        options: ["Jiji arc", "Acrobatic Silky", "Evil Eye", "Just here to vibe"],
      },
    ],
  },

  // ----- 2. Mon 2026-05-18 — the-daily-bugle
  {
    slug: "switch-2-20-million-joycon-prices",
    title: "Switch 2 Just Crossed 20 Million and Nintendo Is Still Holding the Joy-Con Hostage",
    format: "the-daily-bugle",
    publishedAt: "2026-05-18T13:00:00.000Z",
    excerpt:
      "Twenty million units, the fastest-selling Nintendo console of all time, and a single Joy-Con is still $84.99. Do the math.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["frustrated", "hype"],
    readingTime: 2,
    spoilerFree: true,
    body: [
      p("Nintendo dropped fresh sales numbers and the Switch 2 just crossed 20 million units worldwide — making it the fastest-selling Nintendo console of all time. Cool. Great. Genuinely."),
      p("But also: a single Joy-Con is still $84.99."),
      p("I'm not asking for Sony pricing. I am asking why the most basic accessory on the most-sold home console in the company's history hasn't seen a price drop, a bundle, or even a quiet acknowledgment. The drift jokes have stopped being funny. They've been moved to the 'mildly tragic' folder."),
      h2("The console is doing its job"),
      p("The launch lineup did its job. Mario Kart World is, predictably, the best Mario Kart that has ever existed, and Donkey Kong Bananza was the genre flex Nintendo needed after the Tears of the Kingdom hangover. So the console isn't the problem. The console is great."),
      p("But twenty million units sold means there are now twenty million potential drift complaints in the pipeline. At $85 a pop. To repair a controller that should not break."),
      h2("Spider-sense"),
      p("Holiday Joy-Con bundle is coming. Black Friday at the latest. They're just waiting until the demand curve gives them no choice."),
      p("Quick poll: how hyped are you for the next wave of releases?"),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "switch_2_wave_2_hype",
        questionText: "How hyped are you for Switch 2 wave 2?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 3. Wed 2026-05-20 — the-sinister-six
  {
    slug: "sinister-six-best-game-soundtracks-2026",
    title: "The Sinister Six: 2026's Best Game Soundtracks (So Far)",
    format: "the-sinister-six",
    publishedAt: "2026-05-20T15:00:00.000Z",
    excerpt:
      "Six games from the last twelve months ranked by how often they end up on my main rotation playlist. Vote your favorite below.",
    mediaType: "game",
    categorySlug: "music",
    moodTags: ["chill", "comparative", "hype"],
    webRating: 0,
    readingTime: 6,
    spoilerFree: true,
    body: [
      p("It's late spring and the OST queue is already stacked. Six games that have either dropped in the last twelve months or hit a major content drop in 2026, ranked by how often they end up on my main rotation playlist."),
      h2("6. Donkey Kong Bananza"),
      p("The new DK is a banger end to end, but the soundtrack swings between throwback jungle beats and an honest-to-god jazz fusion track in the Pacific Subterranea zone that I want printed on vinyl yesterday. Nintendo's been quietly investing in their composer bench and it shows."),
      h2("5. Mario Kart World"),
      p("Two Nintendo entries back to back, I know. But the open-world cruising mode added some of the most chill driving music in the franchise's history, and 'Toad's Highway' is unironically a song I have on while writing this."),
      h2("4. Metaphor: ReFantazio"),
      p("Shoji Meguro on his Latin-vocal era. The battle theme has been a YouTube comment war since launch and the boss theme is still living in my head. Persona 6 has a lot to live up to, and Meguro is already two steps ahead of whoever has to score it."),
      h2("3. Hades II"),
      p("Darren Korb plus Hades formula plus a couple years of refinement after early access. The vocal track for Chronos hits in a way that I had to genuinely stop playing for a minute. Korb knows what he's doing — and he keeps proving it."),
      h2("2. GTA 6"),
      p("The radio is the radio. That's a given. But the dynamic score under heists this time around finally feels like Rockstar took the GTA V criticism to heart. Vice City needed something a little more humid and a little less Hans Zimmer, and they delivered."),
      h2("1. Clair Obscur: Expedition 33"),
      p("Lorien Testard pulled off the score of the year. The vocal pieces in particular — the choral work in the second act — are doing more heavy lifting than 90% of AAA scores I've heard this decade. If you haven't played Expedition 33 yet, do it before the spoilers leak harder. The music does work the game's prose couldn't."),
      h2("Vote"),
      p("Rank these in the poll below. Don't peek at other people's answers first."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "best_game_ost_2026",
        questionText: "Rank these soundtracks for yourself",
        questionType: "ranking",
        rankingItems: [
          "Clair Obscur: Expedition 33",
          "GTA 6",
          "Hades II",
          "Metaphor: ReFantazio",
          "Mario Kart World",
        ],
      },
    ],
  },

  // ----- 4. Sat 2026-05-23 — cartoons-and-cereal
  {
    slug: "vinland-saga-finished-need-a-minute",
    title: "I Finally Finished Vinland Saga and Now I Need a Minute",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-23T14:00:00.000Z",
    excerpt:
      "People will tell you Vinland Saga is an action anime. It is not. It's a meditation on whether a man built around vengeance can become someone else.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["heavy", "emotional", "thoughtful"],
    webRating: 95,
    readingTime: 5,
    mediaLength: "48 episodes + manga",
    spoilerFree: false,
    body: [
      p("Look. I'm not crying. You're crying."),
      p("I started Vinland Saga in 2019 when the first season aired. I dropped it after the Slave Arc opened because I was, frankly, not in the headspace for what the show was actually doing. Six years later, I came back, finished the manga, and now I have to write about it."),
      h2("It's not an action anime"),
      p("Here's the thing about Vinland Saga: people will tell you it's an action anime. It is not. It is a meditation on whether a man who has built his entire identity around vengeance can become someone else. The action is incidental — and the show knows it."),
      p("Thorfinn's arc from rage-cursed teenage assassin to someone who refuses to draw a weapon even when it would solve the immediate problem is one of the cleanest character arcs in modern anime. The Slave Arc isn't a detour. It's the actual show. The first season was the prologue."),
      h2("If you've never started"),
      p("Do yourself a favor and accept that this is a long show that gets quieter as it goes. The pivot from S1 to S2 is the test. Pass it and you'll be rewarded with one of the most thematically coherent works in the medium."),
      p("The studio change between seasons was rough, the budget for S2 was clearly tighter than S1, and some of the action choreography takes a step back. None of that matters. The writing carries it."),
      h2("Web rating"),
      p("Web rating: 95. Drop a few points for the pacing wobble in S2's middle stretch. Add them back because the ending earns every minute."),
      p("Have you finished it? Tell me where you're at in the poll."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "vinland_finished",
        questionText: "Have you finished Vinland Saga?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 5. Mon 2026-05-25 — the-daily-bugle
  {
    slug: "beyond-the-spider-verse-trailer-reaction",
    title: "Beyond the Spider-Verse Trailer Just Dropped and I Am Not Okay",
    format: "the-daily-bugle",
    publishedAt: "2026-05-25T13:00:00.000Z",
    excerpt:
      "Sony dropped the Beyond teaser this morning. I have watched it forty-seven times. The footsteps cue alone is the best edit of the year.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "emotional"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Sony dropped the Beyond the Spider-Verse teaser this morning. I have watched it forty-seven times. I am not okay."),
      p("Quick recap because I know someone reading this slept on Across: Miles Morales is currently being told by approximately every other Spider-person in the multiverse that he is an anomaly. His father is going to die. His mother is in trouble. Gwen has assembled a rescue party. The Spider-Society has him cornered. The Prowler version of him is waiting."),
      h2("The teaser does not show the rescue"),
      p("The teaser shows Miles, alone, in his Earth-42 apartment, hearing footsteps. Cut to black."),
      p("That's it. That's the trailer."),
      p("And it's the best trailer of the year so far."),
      h2("What stood out"),
      p("Two things. The animation has somehow gotten even denser since Across, with what looks like an actual Earth-42-specific palette that's gunmetal and neon orange. And the audio cue under the footsteps — a remix of the original Spider-Verse theme reversed and slowed — is the kind of editing decision that makes me trust this team with everything."),
      h2("Spider-sense"),
      p("I don't know when this drops officially. Sony has been moving the date around like a chess piece. But after Across stuck the landing on every emotional beat I needed it to, I'm fully on the hook for whatever Beyond ends up being."),
      p("How hyped are you? Slide the meter below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "beyond_hype",
        questionText: "How hyped are you for Beyond the Spider-Verse?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 6. Wed 2026-05-27 — versus
  {
    slug: "versus-arcane-vs-last-of-us",
    title: "Versus: Arcane vs. The Last of Us — Adaptation or Reinvention?",
    format: "versus",
    publishedAt: "2026-05-27T15:00:00.000Z",
    excerpt:
      "Two of the best video game adaptations in TV history. Two completely opposite philosophies. Let's pick a side.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["thoughtful", "comparative"],
    webRating: 92,
    readingTime: 9,
    spoilerFree: false,
    body: [
      p("Two of the best video game adaptations in TV history. Two completely different philosophies. Let's pick a side."),
      h2("The case for Arcane"),
      p("Riot's animated series didn't adapt League of Legends. It used League of Legends. The show kept the characters, kept the world, kept the names you can vaguely remember from a YouTube champion spotlight — and then threw out every gameplay structure that didn't serve the story. The result is a show that's better than its source material has any right to be, with a Season 2 that doubled down on the political and personal stakes that made S1 work."),
      p("The animation in Arcane is, frankly, generational. Fortiche's mixed 2D/3D style is what people keep trying to imitate and keep failing at. The voice cast is a flex. Hailee Steinfeld and Ella Purnell turned in genuinely award-tier work as Vi and Jinx, and the show treats them like they deserve."),
      h2("The case for The Last of Us"),
      p("HBO's adaptation took the opposite approach. Where Arcane reinvents, The Last of Us literally rebuilds. Entire scenes are shot-for-shot recreations. Bill and Frank's episode in S1 is the show's best hour, and it's also the show's biggest deviation — and the deviation made the source material better."),
      p("Pedro Pascal and Bella Ramsey are doing the work. Pascal's Joel is the kind of performance that should be impossible from a source most people expected to be a video game cash-in. And Season 2 — which I'll admit I had reservations about going in — managed to thread the post-Joel needle without losing what made the first season work."),
      h2("The structural difference"),
      p("Arcane has the freedom of animation. Time is whatever the show wants it to be. Locations can be invented and discarded. The characters can do impossible things and the audience accepts it because the medium tells them to."),
      p("The Last of Us has the constraints of live action. The cordyceps need to look real. Joel's beard needs to grow. The geography of post-pandemic America needs to be physically buildable. And those constraints force a kind of restraint that Arcane doesn't have to deal with."),
      h2("Which one stuck the landing"),
      p("Arcane's S2 finale was divisive. Some plot threads felt rushed, the time jumps did some heavy lifting, and a few character arcs landed harder than others. But the show ended on its own terms, and that matters."),
      p("The Last of Us S2's finale was contentious in a different way. The Abby arc — adapting one of the most controversial twists in modern gaming — was always going to split the audience. The show committed to it. Whether you love that commitment or hate it depends entirely on what you wanted out of the adaptation."),
      h2("The verdict"),
      p("Honestly? They're both doing the thing they set out to do. Arcane reinvented a games-as-spectacle property into a character drama. The Last of Us preserved a games-as-character-drama property into prestige TV."),
      p("If I had to pick one to recommend to someone who's never played either game, I'd hand them Arcane first. The barrier is lower, the payoff is faster, and the animation alone justifies the runtime."),
      p("If I had to pick one to recommend to someone who has played both games, I'd hand them The Last of Us. Because watching that performance happen at human scale, with the same beats you've held a controller through, hits different."),
      p("Pick your side in the poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "arcane_vs_tlou",
        questionText: "Better video game TV adaptation?",
        questionType: "this_or_that",
        options: ["Arcane", "The Last of Us"],
      },
    ],
  },

  // ----- 7. Sat 2026-05-30 — cartoons-and-cereal
  {
    slug: "chainsaw-man-reze-arc-review",
    title: "Chainsaw Man: Reze Arc Was a Whole Mood and Then Some",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-05-30T14:00:00.000Z",
    excerpt:
      "MAPPA finally let the Reze movie cook. The bathhouse scene plays without music and it is one of the most uncomfortable five minutes of theater I've had this year.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["intense", "violent", "romantic"],
    webRating: 90,
    readingTime: 6,
    mediaLength: "110 minutes",
    spoilerFree: false,
    body: [
      p("MAPPA finally let the Reze movie cook and I'm here to talk about it."),
      p("Quick context for the late-comers: Reze is the second-major Public Safety arc from Chainsaw Man's manga continuation. It's also widely considered the moment Tatsuki Fujimoto fully committed to what Chainsaw Man is. Not the goofy-violent fun-time of the Eternity Devil. Not the procedural devil-of-the-week of the Bat fight. This is the arc where Denji's whole worldview gets a baseball bat to the back of the head."),
      p("The movie adaptation does the manga right. The fight choreography in the climactic confrontation is some of the best MAPPA has put on screen, full stop. The pacing — which is what I was most worried about going from quarterly chapters into a 110-minute feature — works. The romance beats hit. The horror beats hit. The 'oh god what is this show actually about' beats hit."),
      h2("What works"),
      p("The score, first and foremost. Kensuke Ushio doing Kensuke Ushio things — minimal, percussive, occasionally just silent. The bathhouse scene plays without music and it is one of the most uncomfortable five minutes of theater I have had this year."),
      p("The animation team also figured something out about Reze that the manga only sort of implied. She's not just a femme fatale. She's a teenage girl who has been weaponized her entire life. The voice direction leans into that, and it gives the second act a weight that other shōnen would have just papered over with action."),
      h2("What doesn't"),
      p("Denji is the same Denji. Which is to say, he's still being written as a hormone-driven idiot whose every decision is funny and tragic in equal measure. That works in serialized manga where you can let the joke breathe over weeks. In a tight movie cut, his arc feels a little flattened. He's the protagonist; he should be doing more than reacting."),
      p("The third act also rushes. I don't love that. The manga's pacing had time to land its emotional beats. The movie has to cut corners to fit, and you can feel it in the final five minutes."),
      h2("Should you see it?"),
      p("If you watched S1, yes, immediately. If you haven't watched S1, watch S1, then see this."),
      p("If you're manga-only and you've been holding out on animated Chainsaw Man — and I get it, S1 was good but not all of it landed — Reze is where you forgive the show for its weaker stretches."),
      p("Web rating: 90. Cooked. Will rewatch. Poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "reze_movie_vs_manga",
        questionText: "Was the Reze movie better than the manga arc?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 8. Mon 2026-06-01 — the-daily-bugle
  {
    slug: "star-wars-starfighter-ryan-gosling-cast",
    title: "Star Wars: Starfighter Just Cast — Ryan Gosling Era, Officially",
    format: "the-daily-bugle",
    publishedAt: "2026-06-01T13:00:00.000Z",
    excerpt:
      "Lucasfilm announced the full ensemble. Gosling leads, the supporting cast is loaded, and the casting sheet leaked enough breadcrumbs that the obvious legacy guess is the obvious guess.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["news", "hype"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Lucasfilm announced the full Starfighter ensemble this morning and it's exactly the cast a Shawn Levy Star Wars movie should have."),
      p("Ryan Gosling is leading, which we knew. What we didn't know: he's not the only big name. The supporting cast includes a mix of Levy regulars (some Deadpool & Wolverine alums, you'll spot them), a couple of legitimate prestige TV faces, and — and this is the part I keep rereading — a returning legacy character. Lucasfilm hasn't confirmed who yet, but the casting sheet leaked enough breadcrumbs that the obvious guess is the obvious guess."),
      h2("Why this casting matters"),
      p("Starfighter is set in the post-sequel era and is technically the first big-screen Star Wars since Rise of Skywalker. The franchise needs a win. The franchise needs the kind of win that lets the broader audience — the people who haven't watched a single Disney+ show but used to watch Star Wars in theaters in 1999 — care about it again."),
      p("Gosling, candidly, is the right swing. He's the guy who can do La La Land charm, Drive minimalism, and Barbie self-aware comedy in the same career. That's three different Star Wars protagonists in one actor. If the script gives him room, this is the kind of casting that resets a franchise."),
      h2("Spider-sense"),
      p("I'm cautious. The script is what it is. The director matters more than the lead. But of the swings Lucasfilm has taken in the last five years, this is the one that feels like they actually thought about it."),
      p("How hyped are you? Hot take meter below — and be honest."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "starfighter_hype",
        questionText: "How hyped are you for Starfighter?",
        questionType: "hot_take",
      },
    ],
  },

  // ----- 9. Wed 2026-06-03 — the-full-web
  {
    slug: "gta-6-six-months-in-the-full-web",
    title: "GTA 6, Six Months In: Vice City Has Officially Eaten My Life",
    format: "the-full-web",
    publishedAt: "2026-06-03T15:00:00.000Z",
    excerpt:
      "Two protagonists. A radio rotation I have memorized. Approximately four hundred hours of save time. GTA 6 is the best open-world game ever made.",
    mediaType: "game",
    categorySlug: "video-games",
    moodTags: ["obsessed", "hype", "thoughtful"],
    webRating: 96,
    readingTime: 12,
    mediaLength: "200+ hours single player",
    spoilerFree: false,
    body: [
      p("Six months. Two protagonists. A radio rotation I have committed to memory. Approximately four hundred hours of save time across two characters and at least one full save corruption I refuse to talk about."),
      p("Let's just say it: GTA 6 is the best open-world game ever made."),
      h2("The setup"),
      p("Rockstar dropped GTA 6 in December 2025 after the longest cooldown between mainline entries in franchise history. The expectation was incalculable. The hype cycle was so loud that anything short of perfection was going to be a letdown. And somehow — and I still don't fully understand how this happened — Rockstar delivered."),
      p("Vice City and the wider Leonida region is the most detailed open world a major studio has ever attempted. The density of pedestrians, the variation in interior spaces, the dynamic weather system that genuinely changes how missions play out — every system is operating two generations beyond what GTA V had at launch."),
      h2("Jason and Lucia"),
      p("The dual-protagonist structure is the spine of the game. Jason and Lucia are the most fully realized GTA protagonists Rockstar has ever written, and Lucia in particular — the franchise's first female lead in the mainline numbered entries — is the kind of character writing that should embarrass every studio still putting out generic action protagonists."),
      p("The Bonnie & Clyde framing has been telegraphed since the first trailer, but what Rockstar does with it is more interesting than the marketing implied. Jason is the talker. Lucia is the planner. The story alternates POVs in a way that occasionally lets you see the same heist from both sides — and the perspective shifts genuinely change how you feel about the missions."),
      h2("What the open world does"),
      p("The mission design is the obvious headline, but the open world is the actual game. Random encounters have stakes now. The wanted system has been overhauled so that consequences cascade in ways that make every poor decision interesting. The economic system — your ability to launder, invest, expand — is deep enough that I have spent twenty hours of save time on bookkeeping alone."),
      p("The radio is the radio. That's table stakes for GTA, but the dynamic radio system this time around adapts to your location and time of day in ways that feel almost suspiciously human. Vice City Bounce 95.3 at 2am is different from Vice City Bounce 95.3 at 8am. The DJs reference the day's news, the in-game events you've triggered, the season. It's the closest Rockstar has come to making the radio feel like an actual living thing."),
      h2("GTA Online"),
      p("Look. I want to be clear about something. The single player is the masterpiece. The Online side launched in February 2026 and it is... fine. Better than V's launch. Worse than what it could be."),
      p("The progression is too grindy. The microtransactions are loud. The new heists are excellent but locked behind too much friction. Rockstar has six months of patches to fix the loop, and based on the data they've been publishing, they know exactly where the friction is. Whether they fix it is a different question."),
      h2("The political stuff"),
      p("Rockstar's writing has always been satire-heavy and the satire has always been uneven. GTA 6 leans heavier into commentary than V did, with a streaming-era media subplot that is genuinely funny and a political subplot that is genuinely sharp. There are also still moments where the satire flattens into easy targets, which is the thing Rockstar has been doing for twenty years."),
      p("If you came into this hoping for a more grown-up GTA, you got it. If you came hoping for a less smarmy GTA, you got about half of one."),
      h2("What I keep coming back to"),
      p("The thing I keep telling people is that GTA 6 doesn't just feel like a game. It feels like a place. I have favorite restaurants in Vice City. I have a beach I go to when I need to take a breath between missions. I have a parking garage I prefer because the music in it is good and the sightlines are clean."),
      p("I have never said that about a video game world before. Not even Red Dead 2."),
      h2("Web rating"),
      p("96. Subtract for the Online launch state. Add for everything else."),
      p("If you have a PS5 or Series X or a PC that can run it, you've already bought it. If you don't have one of those, I'm sorry — this is the game that justifies the upgrade."),
      p("Tell me where you're at in the polls below. And if you're playing Online, link your handles, I want to run heists."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "gta6_best_ever",
        questionText: "GTA 6 is the best GTA ever made.",
        questionType: "agree_scale",
      },
    ],
  },

  // ----- 10. Sat 2026-06-06 — cartoons-and-cereal
  {
    slug: "solo-leveling-s3-premiere-animation",
    title: "Solo Leveling S3 Premiered and the Animation Is Still Cooking",
    format: "cartoons-and-cereal",
    series: "cartoons-and-cereal",
    publishedAt: "2026-06-06T14:00:00.000Z",
    excerpt:
      "A-1 Pictures and David Production tag-teamed Solo Leveling S3 and somehow the animation has gotten more unreasonable. The Monarchs arc is here.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "intense"],
    webRating: 87,
    readingTime: 5,
    mediaLength: "ongoing",
    spoilerFree: false,
    body: [
      p("A-1 Pictures and David Production tag-teamed Solo Leveling S3 and somehow the animation has gotten more unreasonable."),
      p("If you've been off the bus since S1 — the elevator pitch is: weak hunter in a world where superpowered hunters fight monsters in dungeons gets a system that lets him level up like a JRPG character, which would be a boring premise if the production wasn't pulling out every visual flex it could think of. The manhwa is a power fantasy. The anime is a power fantasy with one of the best animation teams in the industry assigned to make every kill look like a music video."),
      p("S3 picks up after the Jeju Island arc, which was the moment S2 finally hit the gear it had been threatening to hit since the beginning. The good news: that gear is still engaged. The Monarchs arc — which is what S3 is mostly going to be adapting — is where the manhwa goes from 'fun action shounen' to 'something genuinely operatic.' And the animation team seems to know it."),
      h2("What works"),
      p("The fight choreography. Honestly, just the fight choreography. The first major battle of the season runs for almost six minutes of screen time and there is not a single wasted frame. The lighting work in particular — Hiroyuki Sawano's score sitting under the visuals — is the kind of audiovisual flex that makes you appreciate the difference between anime made by people who care and anime made by people who don't."),
      p("The voice direction also leans harder into Jinwoo's tonal shift. He's not the underdog anymore. He's the apex. The voice cast — both Japanese and Korean dubs, depending on your preference — adjusts accordingly, and the result is a protagonist who has actually grown."),
      h2("What doesn't"),
      p("Same critique I had for S2: the power fantasy is the power fantasy. There's only so much tension you can wring out of 'guy who can do anything fights someone who also can do something.' The supporting cast is still underused, and the female characters in particular get the short end of the writing."),
      p("If you're not on board for the power fantasy at this point, S3 isn't going to convert you. That's fine. There are plenty of shows for everyone."),
      h2("Should you watch"),
      p("Yes, but: catch up on S1 and S2 first. Solo Leveling doesn't reward casual viewing. The investment is the payoff."),
      p("Web rating: 87. Add or subtract a few points depending on how much you tolerate the genre."),
      p("Poll below — tell me where you're at on the Monarchs arc."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "solo_leveling_still_watching",
        questionText: "Still watching Solo Leveling?",
        questionType: "yes_no",
      },
    ],
  },

  // ----- 11. Mon 2026-06-08 — the-daily-bugle
  {
    slug: "summer-2026-anime-three-shows-reminders",
    title: "Summer 2026 Anime: 3 Shows I'm Setting Reminders For",
    format: "the-daily-bugle",
    publishedAt: "2026-06-08T13:00:00.000Z",
    excerpt:
      "The summer 2026 lineup just dropped. Three shows I'm fully committed to before they air, plus the rumors worth tracking.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["news", "hype"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("The summer 2026 lineup just dropped and there are three shows I'm fully committed to before they even air."),
      h2("1. The Apothecary Diaries S3"),
      p("S2 stuck the landing in a way that fixed every pacing wobble S1 had. The mystery-of-the-week structure works, the slow-burn relationship subplot finally has air to breathe, and Maomao remains one of the best protagonists in recent shōjo-adjacent anime. S3 covers the imperial intrigue arc the manga fans have been hyped about. Set the reminder."),
      h2("2. To Your Eternity S4"),
      p("This show is going to make you cry. That's just true at this point. The Yanome arc — which is what S4 is adapting based on the teaser — is some of the heaviest material in the manga, and Brain's Base is leaning into it. If you bounced off S1 because the pacing was deliberate, the show has earned that pacing by now. Catch up."),
      h2("3. Kagurabachi"),
      p("Yes, the meme show. Yes, the manga that was launched on Shonen Jump in 2023 and immediately got hype-trained into oblivion. The anime adaptation has finally landed and the studio (CloverWorks) is the right fit. Whether the show survives its own internet legend is a separate question — but the source material is fun, the swordplay is sharp, and at minimum it's going to be a good time for ten weeks."),
      h2("Honorable mentions"),
      p("The Frieren spinoff manga adaptation is rumored but not confirmed. A Vinland Saga continuation is also rumored. We'll see."),
      p("What's your watchlist? Poll below."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "summer_anime_watching",
        questionText: "Which are you watching?",
        questionType: "multiple_choice",
        options: [
          "Apothecary Diaries S3",
          "To Your Eternity S4",
          "Kagurabachi",
          "All three",
          "None — too busy",
        ],
      },
    ],
  },

  // ----- 12. Wed 2026-06-10 — the-sinister-six
  {
    slug: "sinister-six-best-spider-man-stories-every-medium",
    title: "The Sinister Six: Best Spider-Man Stories Across Every Medium",
    format: "the-sinister-six",
    publishedAt: "2026-06-10T15:00:00.000Z",
    excerpt:
      "Six Spider-Man stories. Three mediums. One question: which one is the best? Rank them in the poll.",
    mediaType: "movie",
    categorySlug: "culture",
    moodTags: ["thoughtful", "comparative"],
    webRating: 0,
    readingTime: 8,
    spoilerFree: false,
    body: [
      p("Six Spider-Man stories. Three mediums. One question: which one is the best?"),
      h2("6. Spider-Man: No Way Home (movie, 2021)"),
      p("The fan-service movie that earned its fan service. No Way Home is the rare Marvel project that knew exactly what it was — a celebration of three eras of Spider-Man — and committed to it. Tobey, Andrew, Tom, all together, all given moments that mattered. Andrew Garfield's catch scene alone is enough to put this on the list."),
      h2("5. Marvel's Spider-Man 2 (game, 2023)"),
      p("Insomniac's PS5 sequel did a lot of things right and one thing perfectly: Miles Morales is now a co-protagonist, not a junior partner. The Venom-Peter sequence is the best symbiote story Marvel has put on screen in any medium. The web swinging is best-in-class. The story has some pacing wobbles in the middle act but the climactic stretch lands."),
      h2("4. Ultimate Spider-Man (comic, Brian Michael Bendis run)"),
      p("Bendis spent over a decade writing Ultimate Spider-Man and the result is the most coherent long-form Spider-Man story in any medium. The series rebuilds Peter Parker from scratch, gives him room to grow over real comic-book time, and then — and this is the part that still gets me — kills him at the right moment to introduce Miles Morales. It's the work that made Miles possible."),
      h2("3. Spider-Man: Into the Spider-Verse (movie, 2018)"),
      p("The film that changed animation. Into the Spider-Verse introduced Miles to the wider world, did it in the most stylistically ambitious way any animated film had managed in a decade, and rewired what 'comic book movie' could look like. It also, for my money, has the best Peter B. Parker characterization across all mediums. The leap of faith is the gold standard."),
      h2("2. Spider-Man: Across the Spider-Verse (movie, 2023)"),
      p("Same team, bigger ambition. Across the Spider-Verse isn't a sequel — it's the middle act of one long story. The animation is denser, the emotional stakes are higher, and the Earth-42 reveal is one of the best cliffhangers in modern blockbuster filmmaking. The fact that we're sitting on a Beyond trailer right now is the only reason this isn't #1."),
      h2("1. Spider-Man (2002, Sam Raimi)"),
      p("The one that started the modern era. Sam Raimi's first Spider-Man is the movie every superhero movie since has been measured against, and the only one that consistently wins those comparisons. The 'with great power' speech is the line. The upside-down kiss is the kiss. Tobey Maguire's Peter Parker is the Peter Parker."),
      p("I know there's an argument for Spider-Man 2 (2004) here. Honestly, I might be wrong about this. The case for Spider-Man 2 is real and I've heard it. But you can't have Spider-Man 2 without Spider-Man, and the first movie is the one that built the entire scaffolding the franchise has been climbing on for twenty-four years."),
      h2("Vote"),
      p("Rank the six in the poll below. Don't peek at other people's votes first. Hot takes only."),
    ],
    enableCommunityRating: false,
    pollQuestions: [
      {
        questionKey: "best_spidey_story_rank",
        questionText: "Rank these Spider-Man stories",
        questionType: "ranking",
        rankingItems: [
          "Spider-Man (2002, Raimi)",
          "Across the Spider-Verse",
          "Into the Spider-Verse",
          "Ultimate Spider-Man (Bendis)",
          "Marvel's Spider-Man 2 (game)",
        ],
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
