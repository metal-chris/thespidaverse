/**
 * Backfill seed: nine articles across the 2026-03-30 → 2026-05-13 window.
 *
 * Consolidates what were fourteen open PRs, each adding its own
 * seed-backfill-<slug>.ts. Three of those were duplicate coverage of the same
 * events (Good Omens S3 twice, Golden Kamuy twice, AnimeJapan/Steel Ball Run
 * twice) and two used the `first-bite` format, which the backfill calendar
 * allocates no slots for — those are held for the live cadence instead.
 *
 * Every one of the fourteen stamped one of two dates: eleven on 2026-03-30 and
 * three on 2026-05-13, because nothing ever marked a calendar slot as claimed.
 * Dates here are allocated per format, newest-first, and `assertSlots()` below
 * refuses to run if any two collide or if one does not match its format's slot.
 *
 * Prose was rewritten against scripts/voice-audit.ts before landing: the
 * originals carried 86 em dashes between them against a published baseline of
 * zero, and 0% bold against the 15–19% the Brand New Day pieces set. All nine
 * pass the audit with emphasis between 16.6% and 19.4%.
 *
 * Articles land as drafts (`drafts.backfill-<slug>`). They do not appear on the
 * site until published by hand in Studio.
 *
 * Usage: npx tsx scripts/seed-backfill-2026-03-to-05.ts [--dry-run]
 */
import { createClient, type SanityClient } from "@sanity/client";
import dotenv from "dotenv";
import { BACKFILL_SLOTS } from "./lib/backfillSlots";
import { makeBody, p, h2, boldShare, type BodyItem } from "./lib/portableText";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;
const dryRun = process.argv.includes("--dry-run");

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false,
});

type PollQuestion = {
  questionKey: string;
  questionText: string;
  questionType: "yes_no" | "agree_scale" | "multiple_choice" | "slider" | "this_or_that" | "hot_take" | "ranking";
  options?: string[];
};

type ArticleSeed = {
  slug: string;
  title: string;
  format: string;
  publishedAt: string;
  excerpt: string;
  mediaType: string;
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
  // ----- Backfill: Mon 2026-03-30 — the-daily-bugle (was PR #14)
  {
    slug: "project-hail-mary-second-weekend",
    title: "Project Hail Mary Just Had Its Second Weekend and Hollywood Still Hasn't Processed It",
    format: "the-daily-bugle",
    publishedAt: "2026-03-30T13:00:00.000Z",
    excerpt:
      "A 32% second-weekend drop. $164M domestic and climbing. Original sci-fi doing Oppenheimer numbers. Someone needs to explain to the studios what just happened.",
    mediaType: "movie",
    categorySlug: "movies",
    moodTags: ["hype", "thoughtful", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("Ten days in. One hundred and sixty-four million domestic. **A thirty-two percent second-weekend drop that is frankly indecent for a non-franchise sci-fi film in 2026.**"),
      p("Project Hail Mary just closed out its second weekend at $54.5M and **it is still accelerating on word of mouth**. This is not what the algorithm predicted. This is not what the studios planned for. This is what happens when a genuinely good movie gets seen by one person who tells five people who each tell five more, and then you look up and it's doing Oppenheimer numbers."),
      h2("The setup"),
      p("Andy Weir wrote the novel in 2021. If you haven't read it, the pitch is: a scientist wakes up alone on a spacecraft millions of miles from Earth with no memory of who he is or why he's there, and has to figure both of those things out simultaneously. It's the kind of science-communication-disguised-as-thriller that The Martian made Weir famous for, and **Project Hail Mary is the better book**."),
      p("Ryan Gosling is carrying the film. Not 'carrying it despite the script.' Not 'carrying it in spite of some production-committee choices.' Actually, genuinely carrying it. **The majority of the runtime is Gosling alone on a set, doing math and reacting to things, and it never once loses pace.** That's a performance. That's a director who understood the assignment. That's a script that trusted the source material."),
      h2("What the numbers mean"),
      p("The opening weekend was $80.6M domestic, **the biggest debut for a non-franchise PG-13 film in recent memory**. The only comparable in the last decade is Oppenheimer. For people who haven't been tracking this: Oppenheimer was a three-hour film about nuclear physics. Project Hail Mary is a two-hour film about a lone scientist and an alien he meets in deep space. These are not movies the algorithm clears for $80M openings."),
      p("**The 32% hold in week two is the number that matters.** Big openings happen. Holds like this happen when the film is actually good and word of mouth is clean. A film with a dirty hold bleeds 50 to 60% in week two. A film with a clean hold, one that's picking up new viewers because people are actively telling other people to go, holds in the low thirties. Project Hail Mary held 32%."),
      h2("What this should mean"),
      p("Studios have been telling themselves and the trade press for a decade that **mid-budget original films don't work at the theatrical level**. Too niche. Not IP. No pre-awareness. Every year the conversation resets to the same conclusion: franchise or nothing."),
      p("Project Hail Mary is the loudest counterargument that argument has had in years. It's an adaptation, yes, but it isn't a sequel, a reboot, or a superhero. **It opened $80M and it held.** The correct response is to look at what Amazon MGM did right and do more of it."),
      h2("Spider-sense"),
      p("The actual response will be to greenlight a Project Hail Mary sequel. The book doesn't have one. Weir hasn't announced one. It doesn't matter. **The sequel will be announced by summer.**"),
      p("The other prediction: every studio that passed on this project is right now having a very uncomfortable Monday morning meeting. Good. How hard did this one hit for you? Hot take meter below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "project_hail_mary_hit",
        questionText: "How hard did Project Hail Mary hit for you?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Mon 2026-04-06 — the-daily-bugle (was PR #22)
  {
    slug: "animejapan-2026-netflix-fumbled-steel-ball-run",
    title: "AnimeJapan 2026 Gave Us Everything — Then Netflix Fumbled Steel Ball Run in Real Time",
    format: "the-daily-bugle",
    publishedAt: "2026-04-06T13:00:00.000Z",
    excerpt:
      "AnimeJapan 2026 wrapped with massive energy. JJK panels, Demon Slayer, One Piece, all of it. Then Netflix walked up to the mic and announced Steel Ball Run Stage 2 was coming 'later in 2026.' No date. Just vibes. The internet went feral.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["frustrated", "hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 just wrapped and the weekend was, by most accounts, a certified moment. Tokyo Big Sight was packed. The stage lineups were stacked. Demon Slayer, Jujutsu Kaisen, One Piece, Blue Box, JoJo, **the whole industry showed up to remind everyone why we're still doing this**."),
      p("Then Netflix stepped up to the microphone and announced that Steel Ball Run Stage 2 was coming 'later in 2026.' No date. No month. No release window. 'Later in 2026.' **The fandom responded exactly how you'd expect.**"),
      h2("What AnimeJapan actually gave us"),
      p("The weekend was genuinely good before the fumble. **The JJK panel was the highlight.** Culling Game Part 2 is clearly in motion and the cast was visibly hyped in the way actors get when they know the material they're working with is going to hit. No spoilers from me, but the energy in that room was real."),
      p("Demon Slayer's panel leaned into the post-Infinity Castle world, the right call. They're not going to overpromise anything until the movie's numbers settle globally, but the fact that they showed up at all tells you the franchise isn't cooling off."),
      p("Blue Box Season 2 getting an **October 2026 window confirmed** is genuinely exciting if you're on the romance-anime pipeline. Blue Box S1 was a slow burn that stuck the landing, and S2 picking up where it left off has good-faith energy. Then there was the Steel Ball Run stage, which should have been the crown jewel of the whole convention."),
      h2("The Netflix fumble"),
      p("JoJo Part 7 is, depending on who you ask, one of the greatest manga arcs ever written. The Stage 1 anime adaptation dropped on Netflix earlier this year with a batch release, then quietly halted. The Stage 2 announcement at AnimeJapan was supposed to be the moment fans exhaled."),
      p("Instead, Netflix confirmed that Stage 2 is coming 'later this year.' No premiere date. No schedule. Just a teaser and a vague gesture at a calendar."),
      p("The Johnny Joestar anti-piracy meme is already on every Netflix social post. The comment sections are in rare form. **Netflix has a specific talent for taking franchise goodwill and leaving it in a parking lot.**"),
      h2("Spider-sense"),
      p("They'll eventually announce a fall 2026 weekly schedule and act like the gap never happened. **The show will be good because the source material is great and the production committee cares about it more than Netflix does.** We're going to lose a few months of goodwill in the meantime. How mad are you right now? Be honest in the poll."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "netflix_steel_ball_run_anger",
        questionText: "How mad are you at Netflix over Steel Ball Run?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Mon 2026-04-13 — the-daily-bugle (was PR #43)
  {
    slug: "ghost-in-the-shell-science-saru-trailer",
    title: "Science SARU Just Set the Bar: Ghost in the Shell Trailer Hit AnimeJapan and Nobody Is Ready",
    format: "the-daily-bugle",
    publishedAt: "2026-04-13T13:00:00.000Z",
    excerpt:
      "The trailer dropped at AnimeJapan 2026, the director said 'zero GenAI' out loud, and Production I.G.'s 30-year franchise run just ended. July 7 cannot come fast enough.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news", "thoughtful"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 ran March 28-29 and the biggest drop from the entire weekend wasn't a sequel announcement or a new season pickup. Science SARU walked up to the Bandai Namco Filmworks booth at Tokyo Big Sight, played a new Ghost in the Shell trailer, and **quietly ended Production I.G.'s 30-year run with the franchise**. In one weekend. No warning."),
      p("The trailer is what you'd expect from the studio that made Keep Your Hands Off Eizouken! and Inu-Oh: **technically unhinged in the best possible way**. Motoko Kusanagi doesn't look like she came out of a Photoshop filter. The environments feel hand-built. The action choreography has weight. It's giving 'we actually studied the source material' energy rather than 'we studied what other studios already did with the source material.'"),
      h2("The 'zero GenAI' quote that broke the internet"),
      p("The moment that's going to live in my head longer than any frame of the trailer is the quote the director gave in the press line: **'Zero GenAI was used in this production.'** In 2026. With the industry where it is. That sentence went viral within about forty minutes of being published, and honestly I understand why."),
      p("I'm not going to get deep into the AI-in-animation discourse today. That's a longer piece for a Wednesday slot. The practical effect of that statement is that **Science SARU is putting their production reputation behind it**, and that is a flex. Eizouken was a flex. Inu-Oh was a flex. Dungeon Meshi was a flex. These people do not show up to work to phone it in."),
      h2("The handoff"),
      p("Production I.G.'s Ghost in the Shell run spans 30 years, going back to Mamoru Oshii's 1995 original and through every Stand Alone Complex season that followed. That's **a generational handoff, the equivalent of a new studio picking up Evangelion**. And Science SARU is the right studio to receive it. They're not reverential in a way that calcifies them. They're reverential in a way that makes them **do something new with the thing they love**."),
      h2("Spider-sense"),
      p("July 7, Prime Video. That's the premiere date. **The summer 2026 anime season just got its headliner.** How hyped are you? Meter below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "ghost_in_the_shell_hype",
        questionText: "How hyped are you for Science SARU's Ghost in the Shell?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Mon 2026-04-20 — the-daily-bugle (was PR #47)
  {
    slug: "kyoani-sparks-of-tomorrow-animejapan-2026",
    title: "KyoAni Dropped the Sparks of Tomorrow Trailer at AnimeJapan and It Has the Budget",
    format: "the-daily-bugle",
    publishedAt: "2026-04-20T13:00:00.000Z",
    excerpt:
      "AnimeJapan 2026 just wrapped and the trailer everyone is talking about is a steampunk KyoAni Netflix exclusive premiering July 5. Yes, it looks exactly like a KyoAni anime. Yes, that's the compliment.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "thoughtful"],
    readingTime: 2,
    spoilerFree: true,
    body: [
      p("AnimeJapan 2026 closed out over the weekend, and in a convention floor full of sequel announcements and returning franchises, the one that had my tab count climbing was **the Sparks of Tomorrow trailer drop from Kyoto Animation**. Quick setup if you missed it. Sparks of Tomorrow is an adaptation of Hiro Yuki's light novel 20 Seiki Denki Mokuroku, roughly Electric Catalog of the 20th Century, set in **a dark, smoke-covered world where electricity is still a dream on the horizon**. Steampunk-adjacent. Coming-of-age spine. Two young protagonists chasing a future that doesn't exist yet. KyoAni is doing it, and that sentence alone carries weight."),
      h2("What the trailer shows"),
      p("The main trailer that dropped at AnimeJapan is doing what KyoAni trailers do, which means **not showing you action sequences**. It's showing you fabric, and light, and the specific way a character exhales when they're about to say something they mean. **The animation quality in two minutes is unreasonable.**"),
      p("There's a shot of candlelight catching the edge of a mechanical device that looks like it belongs in a museum. **That's a shot designed by people who think about shots.** Minoru Ota is directing, with Yuma Uchida and Sora Amamiya voicing the leads. Uchida has been on a run lately (Kashimo in JJK, Takemichi in Tokyo Revengers) and Amamiya brings the controlled warmth this kind of material needs."),
      h2("Netflix exclusive, July 5"),
      p("Worldwide exclusive on Netflix, premiering July 5. I have complicated feelings about Netflix as an anime platform, and the weekly-versus-drop debate is a whole other post, but **the production values this deal clearly bought are hard to argue with**. The trailer looks like KyoAni had a budget and instruction to use all of it."),
      h2("Spider-sense"),
      p("KyoAni hasn't done straight-up steampunk-adjacent sci-fi before. **This is new territory for them.** The studio's fingerprints are all over every frame of the trailer, but the setting is doing something they haven't tried. That makes me **cautiously very excited**, the only rational way to feel about a KyoAni show that just got a July premiere at AnimeJapan."),
      p("Mark the calendar: July 5. The cereal bowl will be full. How hyped are you? Slide the meter."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "sparks_of_tomorrow_hype",
        questionText: "How hyped are you for Sparks of Tomorrow?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Wed 2026-04-22 — the-full-web (was PR #38)
  {
    slug: "devil-may-cry-s2-vergil-show",
    title: "Devil May Cry S2 Is the Vergil Show — and I'm Not Complaining",
    format: "the-full-web",
    publishedAt: "2026-04-22T15:00:00.000Z",
    excerpt:
      "Netflix dropped all eight episodes of Devil May Cry Season 2 yesterday. Studio Mir animated it. Adi Shankar wrote it. Robbie Daymond's Vergil immediately made you forget Dante exists.",
    mediaType: "tv",
    categorySlug: "tv",
    moodTags: ["hype", "intense", "thoughtful"],
    webRating: 84,
    readingTime: 8,
    mediaLength: "8 episodes",
    spoilerFree: false,
    body: [
      p("Netflix dropped all eight episodes of Devil May Cry Season 2 yesterday. I watched all eight episodes of Devil May Cry Season 2 yesterday. These are related events."),
      p("I've been sitting with it overnight and the verdict is that **Adi Shankar and Studio Mir built a sharper, meaner season**. The secret weapon isn't Dante. It's never been Dante. **It's Vergil.**"),
      h2("What this show is (catch-up for the uninitiated)"),
      p("Devil May Cry the animated series is Adi Shankar's adaptation of Capcom's 20-year-old hack-and-slash franchise. Season 1 dropped in 2024 and followed Dante, **a half-demon demon hunter who runs the world's least profitable office**, fights creatures from hell for money, and has the fashion sense of a man who has never once seen himself in a mirror. He has big hair, a big sword, and a bigger gun, and the show leaned into all of it."),
      p("**What Season 1 got right was the tone.** Dante is supposed to be ridiculous. The games are ridiculous. The whole franchise runs on 'so cool it's stupid, so stupid it's cool,' and the animated series understood that. What Season 1 didn't quite get right was the stakes. By the time the final boss arrived, **the emotional weight was thinner than it needed to be**."),
      p("Season 2 fixes that by introducing **the only person who has ever made Dante feel genuinely small**: his twin brother Vergil."),
      h2("The Vergil problem"),
      p("If you know the games, you know **the Dante/Vergil dynamic is the beating heart of the franchise**. DMC3: Dante's Awakening, which Season 2 is largely pulling from, is the game that gave the franchise its emotional backbone. Two brothers, same demonic heritage, completely opposite responses to it. Dante embraces the chaos. Vergil rejects it, buries it, turns himself into something colder than a person."),
      p("The show gives Robbie Daymond room to work with that tension, and he delivers. **Vergil in this season is terrifying not because he's powerful, but because he's reasonable.** He is also extremely, unreasonably powerful. Every choice he makes has a logic. The logic is horrifying, but it's there. Daymond plays him with a register that sits just below menace, patient and precise, and it makes every scene he shares with Johnny Yong Bosch's Dante **feel like a coiled wire about to snap**."),
      p("Bosch is doing the same Dante he did in Season 1, and that is correct. Dante should be the same guy. What the writers do differently this time is **put that consistent guy in rooms where his consistency is the problem**, where the joke and the casual confidence and the red-coat swagger run directly into something that doesn't care about any of it. That's the show this season."),
      h2("Studio Mir doing what Studio Mir does"),
      p("If you're here for the animation discourse: yes, it's excellent. Studio Mir has been flexing a specific muscle since The Legend of Korra, and that muscle is **action choreography that reads in still frames**. You can pause Devil May Cry Season 2 at almost any moment during a fight and it looks like a promotional still. The rooftop sequence with the Artemis weapon in Episode 4 is **the season's visual centerpiece**, and it runs almost seven minutes without a cut that doesn't earn itself."),
      p("**The lighting work is where Mir distinguishes itself** from a lot of Western-produced animation. They understand that a fight between two half-demons should look supernatural without looking cheap, and supernatural lighting is the difference between a stylized action sequence and a screenshot from a game cutscene. DMC S2 is firmly in the former category."),
      p("Where it occasionally stumbles is in the quieter scenes. The character animation during dialogue is fine. It isn't bad, it just **isn't as locked-in as the action work**, and the contrast is noticeable when you go from a hallway conversation to a boss fight in the span of two minutes. Some of the facial acting during the heavier emotional beats needed another pass."),
      h2("Lady and the supporting bench"),
      p("Scout Taylor-Compton's Lady gets more to do this season, and it's welcome. In Season 1 she was **the show's designated ground-level perspective**, the human who doesn't fully trust the demons she's working with, and that's a useful narrative function the show underutilized. Season 2 expands her role into something closer to co-protagonist status in the back half, and Taylor-Compton handles the shift well."),
      p("Arius as the season's surface-level antagonist is serviceable. He's a corporate villain, a gear the DMC games have leaned on before, and the show doesn't do anything especially original with him. **He works as a mechanism for getting Dante and Vergil into conflict.** He doesn't work as someone you're particularly invested in as a threat on his own terms. That's a minor complaint given how clearly the show understands that **the real antagonist is Vergil**."),
      h2("What doesn't quite land"),
      p("**The pacing in the middle of the season has a wobble.** Episodes 4 and 5 both feel like they're setting up the back half rather than doing their own work, and there's a subplot in Episode 5 involving a secondary demon faction that gets introduced and then largely abandoned before it can breathe. Shankar clearly had a lot of mythology to establish for the Dante/Vergil confrontation and it shows in **how compressed some of the world-building feels**."),
      p("There's also a question about what the show wants to be tonally. Season 1 leaned into the camp, the swagger, the demon pizza, Dante being objectively insufferable in a way the show was in on. Season 2 leans harder into the emotional stakes of the Vergil arc, and **some of the tonal whiplash is more abrupt than it should be**. Both registers work. The show doesn't always know which one it's in."),
      h2("The verdict"),
      p("**Devil May Cry Season 2 is better than Season 1 in almost every way that matters.** It has a clearer emotional core, a stronger central conflict, and in Vergil it has a character who can actually match Dante at the level the show needs. The animation is still the best-looking American-produced action animation on any streaming service right now. Studio Mir is not slowing down."),
      p("If you watched Season 1 and it didn't fully grab you, give this season two episodes. **The show knows what it's doing now.** If you haven't watched Season 1: watch it, it's eight episodes, it's on Netflix, and it ends on a setup that Season 2 pays off properly."),
      p("Web rating: 84. **The wobble in the middle keeps it out of the high 80s.** Everything else pushes it up there. Tell me if you watched Season 1 in the poll below, curious how many people are coming in cold."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "dmc_s2_watched_s1",
        questionText: "Did you watch Devil May Cry Season 1 first?",
        questionType: "yes_no",
      },
    ],
  },
  // ----- Backfill: Mon 2026-04-27 — the-daily-bugle (was PR #51)
  {
    slug: "made-in-abyss-movie-series-not-s3",
    title: "Made in Abyss Is Getting Movies Instead of S3 and I Have Feelings About It",
    format: "the-daily-bugle",
    publishedAt: "2026-04-27T13:00:00.000Z",
    excerpt:
      "AnimeJapan just dropped the news: Made in Abyss isn't getting a Season 3. It's getting a film series. First movie hits October 2026. This is either genius or a slow-motion betrayal.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "thoughtful", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("AnimeJapan happened this weekend and the biggest anime news to come out of it wasn't a new trailer or a season renewal. **Made in Abyss confirmed what the production rumor mill had been whispering for months: there is no Season 3.** Instead, Kinema Citrus is taking the story forward through a series of theatrical films."),
      p("The first entry is called Made in Abyss: Awakening Mystery. **It hits Japanese theaters October 23, 2026.** No international window confirmed yet. Director Masayuki Kojima is back, the core voice cast is returning, and the studio's press release describes it as the first in a 'series'. We are officially in movie-arc territory."),
      h2("Okay, but why?"),
      p("I get the business logic. After Season 2 ended in 2022, the gap between chapters in Tsukushi's manga has been long enough that adapting into a serialized TV format is increasingly awkward. A theatrical run gives you more flexibility on pacing, bigger production budgets per minute of runtime, and the kind of big-event energy a new season in a crowded simulcast calendar doesn't always get."),
      p("Evangelion did it. Mushishi did it for its second half. Formats change. That's fine."),
      p("There's a real tension here, though. **Made in Abyss works because it breathes.** The descent into the Abyss is slow and deliberate, the horror creeps in, the emotional weight builds over episodes. **A 90-minute theatrical window does different things to that pacing** than 12 episodes with end-credits music that makes you wait a week."),
      h2("What we know"),
      p("Kinema Citrus. Masayuki Kojima directing. Hideyuki Kurata on script. Kazuchika Kise and Yuka Kuroda back on character design. **The actual team is back**, not a production-in-name-only situation. And for what it's worth, the studio knows how to make something feel cinematic rather than a cut-down TV episode."),
      p("October 23 for the first film. If the pattern holds, subsequent films could follow every six to twelve months. **A full arc adaptation could stretch across 2027 and into 2028.** Patience is the move."),
      h2("My take"),
      p("Cautiously on board. The production pedigree checks out, and if they're going theatrical it probably means **they want to do the source material justice rather than rush it**. The Riko and Reg story deserves the full treatment."),
      p("I will be watching the first trailer very closely. And I'll be watching the runtime even more closely. Hot take meter below. Are you here for the movie era, or do you want your Season 3?"),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "mia_movies_vs_s3",
        questionText: "Movies instead of S3 — are you here for it?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Mon 2026-05-04 — the-daily-bugle (was PR #55)
  {
    slug: "demon-slayer-infinity-castle-40-billion-yen",
    title: "Demon Slayer: Infinity Castle Just Crossed ¥40 Billion in Japan and the Anime Film Era Is Real",
    format: "the-daily-bugle",
    publishedAt: "2026-05-04T13:00:00.000Z",
    excerpt:
      "The first Infinity Castle film hit ¥40 billion in Japan today — over 27 million tickets sold. It's also the highest-grossing foreign film in US history. Part 2 isn't even announced yet.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("The numbers for Demon Slayer: Infinity Castle keep getting bigger. As of today the first film in the trilogy has **crossed ¥40 billion at the Japan box office**, over 27 million tickets sold, making it one of the highest-grossing films in Japanese theatrical history. Not one of the highest-grossing anime films. **One of the highest-grossing films, full stop.**"),
      p("Meanwhile in North America it already holds the record for **highest-grossing foreign-language film in US box office history**, passing Crouching Tiger, Hidden Dragon's 25-year-old mark. Crunchyroll and Sony brought it back to US theaters earlier this month in ScreenX. People showed up again."),
      h2("Why this matters beyond the numbers"),
      p("It's easy to look at 'Mugen Train did $1 billion globally' and **file it under pandemic-era anomaly**. Japan was starved for event cinema, the franchise was at peak heat, blame the circumstances. Fine."),
      p("Infinity Castle makes that argument impossible to hold onto. Part 1 **opened wide internationally against normal market conditions**. No pandemic asterisk. No 'right place, right time' excuse. It performed like a major studio blockbuster. Not 'decent for anime.' A major. Studio. Blockbuster."),
      p("That's the actual story underneath the ¥40 billion. Anime film is no longer a niche category with occasional crossover hits. It's **a reliable commercial force with a global audience** that will show up the way they show up for Marvel. Studios are watching. Everyone is watching."),
      h2("What comes next"),
      p("Part 2 has not been officially announced yet. At this point that is just Ufotable doing Ufotable things. They're working. The Infinity Castle arc was **always a three-film structure by design**."),
      p("The manga material for Parts 2 and 3 covers some of the heaviest, most emotionally brutal sequences in the entire run. If Part 1 was the 'this is the scale of what we're doing' film, Parts 2 and 3 are **the ones that are going to break people in theaters**."),
      p("I am not ready. None of us are. Poll below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "infinity_castle_part2_hype",
        questionText: "How hyped are you for Infinity Castle Part 2?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Mon 2026-05-11 — the-daily-bugle (was PR #63)
  {
    slug: "golden-kamuy-runaway-train-arc-announced",
    title: "Golden Kamuy Just Set Up Its Endgame and MHA: Vigilantes Is Done for Now",
    format: "the-daily-bugle",
    publishedAt: "2026-05-11T13:00:00.000Z",
    excerpt:
      "March 30 is doing double duty for anime news: Runaway Train Arc locked in for winter, and MHA: Vigilantes just wrapped Season 2 with nothing announced after it. Good Monday.",
    mediaType: "anime",
    categorySlug: "anime",
    moodTags: ["hype", "news", "emotional"],
    readingTime: 3,
    spoilerFree: true,
    body: [
      p("March 30 is doing a lot for anime watchers today. Two pieces of news landed and they point in opposite directions emotionally: **Golden Kamuy got an arc announcement that has me looking forward to winter**, and MHA: Vigilantes quietly wrapped Season 2 on a note that left me needing a minute. Both of those things happened on a Monday. We take what we can get."),
      h2("Golden Kamuy: Runaway Train Arc Is Locked In"),
      p("Anime News Network confirmed this morning that **the Golden Kamuy Final Arc is pushing into winter with the Runaway Train Arc**, and dropped a new visual alongside the announcement. The current arc just closed out Episode 13 after building toward the series climax for a full year. The manga ended. The story is known to anyone who read ahead. **The anime is now animating the actual ending of one of the best adventure series of the decade.**"),
      p("The Runaway Train arc is exactly what the name implies: stakes, motion, something happening at speed on tracks while most of the cast makes a sequence of questionable decisions under pressure. If you've been off the Golden Kamuy bus for a while, **now is the window**. You have until winter to catch up and the complete run is sitting there."),
      p("The new visual is clean. Production looks like it's in good shape. I'm not going to pretend I'm calm about this."),
      h2("MHA: Vigilantes S2 Is Done"),
      p("My Hero Academia: Vigilantes dropped its Season 2 finale today after 13 episodes, and I want to have a word with everyone who still has not watched this series. **Vigilantes is the best non-main MHA content that exists.** Full stop. It covers the underground hero scene in a way the main series never had space for, it lets characters breathe at a different pace, and the two seasons together are 26 episodes of genuinely well-constructed hero fiction. Season 2 stuck its landing. It ends somewhere satisfying and also somewhere that sets up more story with no announced continuation."),
      p("Season 3 has not been announced. This is Bones. They will announce it when they are ready. In the meantime, **Vigilantes sits at 26 episodes and is fully worth the time**."),
      h2("The Monday Situation"),
      p("Two arcs closing on the same Monday is either strong scheduling or pure chaos depending on what your watchlist looked like going in. I'm personally landing on grateful that Golden Kamuy has a winter return date confirmed, while simultaneously annoyed the wait starts now. How hyped are you for the Runaway Train Arc? Meter below."),
    ],
    enableCommunityRating: true,
    pollQuestions: [
      {
        questionKey: "runaway_train_arc_hype",
        questionText: "How hyped are you for Golden Kamuy's Runaway Train Arc?",
        questionType: "hot_take",
      },
    ],
  },
  // ----- Backfill: Wed 2026-05-13 — the-full-web (was PR #68)
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
      p("Good Omens is done. One 90-minute special, dropped on Prime Video on May 13, and that's the end of Aziraphale and Crowley. They got their ending. **Whether it's the ending the show deserved is a longer conversation**, and that's what this is."),
      p("The complicated truth is that **this episode is both better than it had any right to be and more limited than it should've been**. Hold both of those at once. That's Good Omens S3 in a sentence."),
      h2("The context you need"),
      p("Season 3 was supposed to be a full season. Production was halted following credible sexual assault allegations against series creator Neil Gaiman. Those allegations are serious and have been extensively documented elsewhere. Amazon and the production company ultimately made the decision to **let the cast and crew give the story a proper close rather than leave it unfinished**, but under drastically reduced circumstances. One feature-length episode instead of a full run."),
      p("I say this not to relitigate the Gaiman situation here. That is not what The Spidaverse is for. I say it because **you genuinely cannot review this finale without acknowledging that the shape of it was dictated by something outside the story**. The writers and cast worked with what they had. Keep that in mind the whole time you're watching."),
      h2("What Good Omens is, for the late arrivals"),
      p("The short version: an angel named Aziraphale (Michael Sheen) and a demon named Crowley (David Tennant) have been loosely collaborating for six thousand years to **quietly keep Earth from getting obliterated by Heaven or Hell**. Season 1 was about the two of them stopping the Apocalypse. Season 2 expanded their world, gave them a proper central conflict, and ended with Aziraphale choosing to return to Heaven, leaving Crowley alone in their shared bookshop, a declaration of love apparently unheard. Season 3 picks up in that wreckage."),
      p("The show is based on the 1990 novel by Terry Pratchett and Neil Gaiman, and **the adaptation has always lived or died on the central relationship**. Everything else, Heaven's politics, Hell's incompetence, the various human and celestial figures orbiting the main story, is scaffolding. The scaffold matters, but it's not the point."),
      h2("What the finale gets right"),
      p("David Tennant and Michael Sheen are doing something genuinely rare on screen. They've been playing these characters across two seasons and a decade of real time, and the chemistry isn't just 'good for a TV show.' It's the kind of thing that only happens when two actors are fully inside what they're doing. The scenes where Crowley and Aziraphale are finally in the same room again, the arguments, the silences, the things neither of them can quite say, are **the best work either actor has put on screen in years**. I'm not exaggerating that."),
      p("**The finale earns its emotional beats.** I went in prepared to be underwhelmed and came out having felt the things I was supposed to feel. The specific way the ending resolves their arc, no spoilers, is the right answer. Not the easy answer, not the fan-service answer, but the answer that's true to who both of them have always been. **That restraint is hard to pull off and the writers nailed it.**"),
      p("There's also a sequence midway through that plays almost entirely without dialogue, and **it is a genuinely beautiful piece of television**. The direction in that stretch is operating at a different level than the surrounding episode. If you see nothing else from Good Omens S3, find those ten minutes."),
      h2("Where it falls short"),
      p("**The plot is a mess.** Heaven and Hell are still at war in some form, there are several storylines from S2 that needed resolution, and you can feel the writers doing triage throughout the episode, cutting threads, compressing arcs, making calls you can tell were painful. Supporting characters who deserved full scenes get two minutes, maybe three. The larger mythology of the show, which had been expanding in genuinely interesting ways in S2, gets wrapped up in a way that's functional but not satisfying. Some threads just end. Or disappear. You notice."),
      p("**The pacing is the thing that keeps this from being a great finale instead of a good one.** Emotionally, it lands. But you're always aware you're watching a 90-minute version of something that should have had six hours to breathe. The bones of a remarkable final season are visible in the episode's structure. The shape of what the writers had planned for is legible under what they were able to execute. That's both a tribute to how good the room was and a frustration you can't fully shake."),
      h2("Should you watch it"),
      p("If you've seen S1 and S2, yes. Immediately. **This is the close the show earned and the close its cast deserved**, even if the production circumstances cost the story the room it needed to fully land."),
      p("If you've never started Good Omens: watch S1 first. S1 is one of the better fantasy adaptations of the last decade, and it works on its own terms even if you stop there. S2 complicates it. S3 closes it."),
      p("If you bounced off S1 because the tone felt arch or the comedy wasn't doing it for you, S3 isn't going to fix that. The finale leans into the emotional register more than the comic one, but the sensibility is the same show."),
      h2("Web rating"),
      p("78. **The emotional core is exceptional**, Tennant and Sheen deliver career-level work for this kind of material, and the finale sticks its actual landing. The structural problems and the compressed runtime cost it real points. This is a finale you'll be glad you watched and quietly sad about at the same time, and I think that's probably the right feeling to walk away with."),
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
  },];

/** Refuse to run on colliding or mis-formatted dates — the original defect. */
function assertSlots() {
  const seen = new Set<string>();
  for (const a of ARTICLES) {
    const date = a.publishedAt.slice(0, 10);
    const slot = BACKFILL_SLOTS.find((s) => s.date === date);
    if (!slot) throw new Error(`${a.slug}: ${date} is not a backfill slot.`);
    if (slot.format !== a.format) {
      throw new Error(`${a.slug}: slot ${date} is ${slot.format}, article is ${a.format}.`);
    }
    if (seen.has(date)) throw new Error(`${a.slug}: ${date} already taken by another article.`);
    seen.add(date);
  }
}

async function main() {
  assertSlots();
  const categories = await client.fetch<Array<{ _id: string; slug: { current: string } }>>(
    `*[_type=="category" && slug.current in $slugs]{_id, slug}`,
    { slugs: [...new Set(ARTICLES.map((a) => a.categorySlug))] }
  );
  const categoryId = new Map(categories.map((c) => [c.slug.current, c._id]));

  for (const a of ARTICLES) {
    const catId = categoryId.get(a.categorySlug);
    if (!catId) throw new Error(`Category not found: "${a.categorySlug}". Create it in Studio first.`);

    const doc = {
      _id: `drafts.backfill-${a.slug}`,
      _type: "article",
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      format: a.format,
      publishedAt: a.publishedAt,
      excerpt: a.excerpt,
      mediaType: a.mediaType,
      category: { _type: "reference", _ref: catId },
      moodTags: a.moodTags,
      ...(a.webRating !== undefined ? { webRating: a.webRating } : {}),
      readingTime: a.readingTime,
      ...(a.mediaLength ? { mediaLength: a.mediaLength } : {}),
      spoilerFree: a.spoilerFree,
      body: makeBody(a.body),
      pollConfig: {
        enableCommunityRating: a.enableCommunityRating,
        pollQuestions: a.pollQuestions.map((q, i) => ({ _key: `pq${i}`, ...q })),
      },
    };

    const bold = boldShare(a.body).toFixed(1);
    if (dryRun) {
      console.log(`  [dry] ${a.publishedAt.slice(0, 10)}  bold ${bold}%  ${a.slug}`);
      continue;
    }
    await client.createOrReplace(doc);
    console.log(`  seeded ${a.publishedAt.slice(0, 10)}  bold ${bold}%  ${a.slug}`);
  }
  console.log(`\n${dryRun ? "Dry run" : "Seeded"}: ${ARTICLES.length} backfill drafts.`);
  if (!dryRun) console.log("They stay hidden until published by hand in Studio.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
