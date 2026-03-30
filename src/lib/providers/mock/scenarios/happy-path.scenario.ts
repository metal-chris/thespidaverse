import { faker } from "@faker-js/faker";
import type {
  Article,
  Category,
  Tag,
  MediaEntry,
  Collection,
  MediaDiaryEntry,
  CurrentlyConsuming,
  ReactionCounts,
  GalleryPiece,
} from "@/types";
import {
  createArticle,
  createCategory,
  createTag,
  generateRichBody,
} from "../factories/article.factory";
import { createMedia } from "../factories/media.factory";
import {
  createCollection,
} from "../factories/collection.factory";
import { createJournalEntry } from "../factories/journal.factory";
import { createCurrentlyConsuming } from "../factories/consuming.factory";
import { createGalleryPiece } from "../factories/gallery.factory";
import type { MockDataset } from "../seed";

/**
 * Happy-path scenario: the default dev experience.
 * ~40 articles across all categories with REAL excerpts and rich body content.
 * Includes edge cases for UI stress testing.
 * Reactions correlated to article quality.
 * All entries hand-crafted — no faker-generated placeholders.
 */
export function buildHappyPathScenario(): MockDataset {
  faker.seed(42);

  // ─── Taxonomy ────────────────────────────────────────────────────────

  const categories: Category[] = [
    createCategory({ title: "Movies & TV" }),
    createCategory({ title: "Video Games" }),
    createCategory({ title: "Anime & Manga" }),
    createCategory({ title: "Music" }),
  ];

  const tags: Tag[] = [
    createTag({ title: "action" }),       // 0
    createTag({ title: "horror" }),       // 1
    createTag({ title: "sci-fi" }),       // 2
    createTag({ title: "romance" }),      // 3
    createTag({ title: "indie" }),        // 4
    createTag({ title: "retro" }),        // 5
    createTag({ title: "shonen" }),       // 6
    createTag({ title: "hip-hop" }),      // 7
    createTag({ title: "thriller" }),     // 8
    createTag({ title: "cyberpunk" }),    // 9
    createTag({ title: "comedy" }),       // 10
    createTag({ title: "drama" }),        // 11
  ];

  const moods = [
    "dark",
    "uplifting",
    "thought-provoking",
    "fun",
    "emotional",
    "intense",
  ];

  // ─── Articles ────────────────────────────────────────────────────────

  const articles: Article[] = [
    // ── Movies & TV ──────────────────────────────────────────────────

    createArticle({
      title: "Dune: Part Two Is a Masterclass in Sci-Fi Filmmaking",
      excerpt: "Denis Villeneuve didn't just adapt the book — he made you feel the sand in your lungs. Part Two is the rare sequel that makes the first film better in hindsight.",
      category: categories[0],
      tags: [tags[2], tags[8]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 92,
      readingTime: 12,
      mediaLength: "166 min",
      body: generateRichBody([
        {
          heading: "The desert swallows everything",
          paragraphs: [
            "There is a moment about forty minutes into Dune: Part Two where Paul Atreides rides a sandworm for the first time, and the theater went silent. Not movie-quiet — actually silent. The kind where you can hear the person three rows back holding their breath.",
            "That is what Denis Villeneuve does better than almost anyone working today. He makes spectacle feel earned. Every wide shot of the desert carries weight because the intimate moments that precede them carry weight too.",
          ],
          image: { seed: "dune-sandworm", alt: "Paul riding a sandworm across the desert", caption: "The sandworm ride sequence is one of the most breathtaking scenes in modern cinema." },
        },
        {
          heading: "Chalamet finally becomes Muad'Dib",
          paragraphs: [
            "Timothée Chalamet's performance in Part One was restrained to a fault — intentionally so, but it left some viewers cold. Part Two lets him loose. The transformation from reluctant heir to messianic figure is gradual, unsettling, and completely convincing.",
            "The scenes with Zendaya's Chani ground the political mythology in something human. Their chemistry isn't just romantic — it is the moral anchor of the entire film. When that anchor breaks in the third act, you feel it.",
          ],
          spoiler: { label: "Third act spoilers", text: "The final sequence where Paul declares holy war and Chani walks away is devastating. Villeneuve holds on her face for what feels like an eternity, and Zendaya delivers an entire monologue with just her eyes. The Fremen cheering while Chani weeps is the most unsettling juxtaposition in the film." },
        },
        {
          heading: "A new standard for blockbusters",
          paragraphs: [
            "In an era of four-quadrant superhero fatigue, Dune: Part Two proves audiences are hungry for ambitious, challenging blockbusters that respect their intelligence. It is not a perfect film — the Baron Harkonnen arena sequence runs long — but it is a monumental one.",
          ],
        },
      ]),
    }),

    createArticle({
      title: "Top 10 Horror Movies That Actually Scared Me",
      excerpt: "I've watched hundreds of horror films. Most of them are fine. These ten made me check behind the shower curtain for a week straight.",
      category: categories[0],
      tags: [tags[1], tags[8]],
      moodTags: ["dark", "intense"],
      format: "ranked-list",
      mediaType: "movie",
      webRating: 85,
      readingTime: 8,
      body: generateRichBody([
        {
          paragraphs: [
            "Horror is subjective. What terrifies me might bore you to tears. But these ten films all share something in common: they found the exact frequency of my fear and tuned into it like a radio signal from hell.",
          ],
        },
        {
          heading: "10. The Descent (2005)",
          paragraphs: [
            "Claustrophobia plus cave creatures plus an all-female cast that actually makes smart decisions. The real horror is the tight spaces — the monsters are almost a relief because at least you can fight those.",
          ],
        },
        {
          heading: "9. Hereditary (2018)",
          paragraphs: [
            "Ari Aster turned family grief into a supernatural nightmare. Toni Collette deserved every award. The dinner table scene alone is more terrifying than most entire horror franchises.",
          ],
          spoiler: { label: "Major spoiler", text: "Charlie's death in the first act is the most shocking narrative choice in modern horror. You spend the first thirty minutes thinking she is the protagonist. She is not." },
        },
      ]),
    }),

    createArticle({
      title: "The Bear Season 3: A Quick Take",
      excerpt: "Two episodes in. The kitchen is hotter than ever, and Carmy still hasn't learned to breathe.",
      category: categories[0],
      tags: [tags[11], tags[10]],
      moodTags: ["emotional", "intense"],
      format: "short-take",
      mediaType: "tv",
      webRating: 35,
      readingTime: 3,
      mediaLength: "10 episodes",
    }),

    createArticle({
      title: "Everything Everywhere Still Hits Different on Rewatch",
      excerpt: "On first watch it is an action movie. On second watch it is a family drama. On third watch it is the most tender film about generational trauma ever disguised as a multiverse comedy.",
      category: categories[0],
      tags: [tags[2], tags[10], tags[11]],
      moodTags: ["emotional", "fun", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 95,
      readingTime: 10,
      mediaLength: "139 min",
      body: generateRichBody([
        {
          paragraphs: [
            "I have watched Everything Everywhere All at Once four times now. Each time it reveals something new. The first time through, you are dazzled by the visual invention. Hot dog fingers, googly eyes, that raccoon. It is maximalism as philosophy.",
            "But strip all of that away, and the core of this film is a mother and daughter trying — and mostly failing — to understand each other. That is it. That is the multiverse.",
          ],
          image: { seed: "eeaao-laundry", alt: "The laundromat from Everything Everywhere", caption: "The humble laundromat setting grounds an otherwise cosmic narrative." },
        },
        {
          heading: "Why the rocks scene works",
          paragraphs: [
            "There is a scene where two rocks sit on the edge of a cliff. They have googly eyes. They talk about the meaninglessness of existence. It should be ridiculous. Instead it made me cry. That is the genius of this film — it earns absurdity by committing to it completely.",
          ],
        },
      ]),
    }),

    createArticle({
      title: "Weekend Roundup: What I Watched This Week",
      excerpt: "Three shows, one movie, zero productivity. Here is everything I consumed between Friday and Sunday.",
      category: categories[0],
      tags: [tags[11]],
      moodTags: ["fun"],
      format: "roundup",
      mediaType: "tv",
      webRating: 60,
      readingTime: 5,
    }),

    createArticle({
      title: "Civil War Is the Most Intense Film of 2024",
      excerpt: "Alex Garland made a war film that refuses to pick a side, and that refusal is the most political statement of all.",
      category: categories[0],
      tags: [tags[8], tags[11]],
      moodTags: ["intense", "dark"],
      format: "essay",
      mediaType: "movie",
      webRating: 88,
      readingTime: 9,
      mediaLength: "109 min",
    }),

    createArticle({
      title: "Shogun Season 1: A Masterpiece of Patience",
      excerpt: "In a streaming landscape obsessed with pace, Shogun dares to be slow. Every episode rewards your attention with layers you did not see building.",
      category: categories[0],
      tags: [tags[11], tags[0]],
      moodTags: ["thought-provoking", "intense"],
      format: "essay",
      mediaType: "tv",
      webRating: 94,
      readingTime: 14,
      mediaLength: "10 episodes",
    }),

    createArticle({
      title: "The Substance: Body Horror Done Right",
      excerpt: "Demi Moore deserves a standing ovation for this one. Equal parts satirical, revolting, and heartbreaking.",
      category: categories[0],
      tags: [tags[1], tags[8]],
      moodTags: ["dark", "intense"],
      format: "short-take",
      mediaType: "movie",
      webRating: 15,
      readingTime: 4,
      mediaLength: "140 min",
    }),

    createArticle({
      title: "Arcane Season 2 Sticks the Landing",
      excerpt: "Riot proved season one was not a fluke. Arcane's second season is darker, bolder, and somehow even more beautifully animated.",
      category: categories[0],
      tags: [tags[0], tags[11]],
      moodTags: ["emotional", "intense"],
      format: "essay",
      mediaType: "tv",
      webRating: 93,
      readingTime: 11,
      mediaLength: "9 episodes",
    }),

    createArticle({
      title: "Nosferatu: A Love Letter to Gothic Horror",
      excerpt: "Robert Eggers did not just remake a classic — he summoned something ancient from the earth and put it on screen.",
      category: categories[0],
      tags: [tags[1], tags[11]],
      moodTags: ["dark", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 85,
      readingTime: 8,
      mediaLength: "132 min",
    }),

    createArticle({
      title: "Quick Take: Fallout TV Is Better Than It Should Be",
      excerpt: "Against all odds, the Fallout show actually gets it. The tone, the dark humor, the retro-futurism — it is all here.",
      category: categories[0],
      tags: [tags[2], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "tv",
      webRating: 81,
      readingTime: 3,
      mediaLength: "8 episodes",
    }),

    // ── Video Games ──────────────────────────────────────────────────

    createArticle({
      title: "Elden Ring DLC: Shadow of the Erdtree Review",
      excerpt: "FromSoftware said 'what if we made the hardest content we have ever created and also made it beautiful enough to cry over.' The answer is Shadow of the Erdtree.",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["dark", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 97,
      readingTime: 15,
      mediaLength: "40+ hours",
      body: generateRichBody([
        {
          paragraphs: [
            "I have died to Messmer approximately forty-seven times. Each death taught me something new about his attack patterns, about my own impatience, about the gap between where I am and where I need to be. This is the FromSoftware loop at its most refined.",
          ],
          image: { seed: "erdtree-boss", alt: "Messmer the Impaler boss fight", caption: "Messmer is a top-tier FromSoftware boss — aggressive, fair, and visually stunning." },
        },
        {
          heading: "The Land of Shadow is From's best world yet",
          paragraphs: [
            "Forget the Lands Between. The Land of Shadow takes everything that made Elden Ring's open world special — the sense of discovery, the hidden caves, the bizarre NPC questlines — and compresses it into a tighter, denser package. Every direction you walk reveals something worth finding.",
            "The new weapon types are the real star. The perfume bottles, the beast claws, the martial arts. From has clearly been studying their community's creativity and channeled it into official movesets that feel just as inventive.",
          ],
        },
        {
          heading: "The final boss will test your resolve",
          paragraphs: [
            "Without spoiling the encounter, I will say this: the final boss of Shadow of the Erdtree is the hardest thing FromSoftware has ever created. It is a multi-phase fight that requires mastering the DLC's new Scadutree blessing system.",
          ],
          spoiler: { label: "Final boss details", text: "Radahn, Consort of Miquella is a two-phase fight where the second phase takes place in a cosmic void. He wields holy light and gravity magic simultaneously. I spent four hours on phase two alone. Worth every second." },
        },
      ]),
    }),

    createArticle({
      title: "Best Indie Games You Missed in 2025",
      excerpt: "While everyone was arguing about AAA releases, these indie gems were quietly delivering some of the best gaming experiences of the year.",
      category: categories[1],
      tags: [tags[4], tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "ranked-list",
      mediaType: "game",
      webRating: 28,
      readingTime: 7,
    }),

    createArticle({
      title: "Hollow Knight: Silksong Was Worth the Wait",
      excerpt: "Team Cherry took their time, and it shows. Silksong is not just a sequel — it is a statement about what a small team with a clear vision can accomplish.",
      category: categories[1],
      tags: [tags[4], tags[0]],
      moodTags: ["dark", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 88,
      readingTime: 10,
      mediaLength: "30+ hours",
    }),

    createArticle({
      title: "Quick Take: Balatro Is Pure Addiction",
      excerpt: "It is poker meets roguelike meets 'wait, it is 3 AM already?' The simplest concept with the deepest hooks.",
      category: categories[1],
      tags: [tags[4]],
      moodTags: ["fun"],
      format: "short-take",
      mediaType: "game",
      webRating: 45,
      readingTime: 2,
    }),

    createArticle({
      title: "The Cyberpunk Renaissance: From 2077 to Edgerunners",
      excerpt: "CD Projekt Red fumbled the launch, rebuilt from the ground up, and accidentally created a multimedia franchise that defines modern cyberpunk. This is how redemption arcs work.",
      category: categories[1],
      tags: [tags[9], tags[2]],
      moodTags: ["dark", "intense", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 91,
      readingTime: 13,
      mediaLength: "60+ hours",
      body: generateRichBody([
        {
          paragraphs: [
            "Let me take you back to December 2020. Cyberpunk 2077 launches. The internet is on fire — and not in a good way. Bugs, crashes, missing features. CDPR's stock tanks. It is, by all accounts, a disaster.",
          ],
        },
        {
          heading: "The slow rebuild",
          paragraphs: [
            "But here is what happened next. Instead of abandoning ship, CDPR committed to fixing every single issue. Patch after patch, update after update. The Phantom Liberty DLC did not just fix the game — it reimagined entire systems. Then Edgerunners dropped on Netflix and suddenly everyone cared about Night City again.",
          ],
          image: { seed: "night-city", alt: "Night City skyline at dusk", caption: "Night City after Phantom Liberty feels like a completely different game." },
        },
      ]),
    }),

    createArticle({
      title: "Why Retro Games Keep Pulling Me Back",
      excerpt: "Modern games are gorgeous. They are immersive. They are also sometimes exhausting. There is a reason I keep returning to a SNES controller.",
      category: categories[1],
      tags: [tags[5], tags[4]],
      moodTags: ["fun", "uplifting"],
      format: "essay",
      mediaType: "game",
      webRating: 72,
      readingTime: 6,
    }),

    createArticle({
      title: "Metaphor: ReFantazio Is Atlus at Their Best",
      excerpt: "The Persona team made a fantasy RPG, and surprise — it is incredible. Metaphor blends political allegory with JRPG combat in a way nobody else is doing.",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["thought-provoking", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 93,
      readingTime: 11,
      mediaLength: "80+ hours",
    }),

    createArticle({
      title: "Quick Take: Astro Bot Is Pure Joy",
      excerpt: "Fifteen minutes with Astro Bot and you remember why you fell in love with video games in the first place.",
      category: categories[1],
      tags: [tags[4], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "game",
      webRating: 88,
      readingTime: 3,
    }),

    createArticle({
      title: "Black Myth: Wukong Exceeded Every Expectation",
      excerpt: "A Chinese studio's debut action game has no right being this polished. Wukong is a landmark moment for the global games industry.",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 90,
      readingTime: 9,
      mediaLength: "25+ hours",
    }),

    createArticle({
      title: "Final Fantasy VII Rebirth: A Worthy Sequel",
      excerpt: "Square Enix expanded Midgar into a continent and somehow made every side quest feel meaningful. Rebirth is the best open-world JRPG in years.",
      category: categories[1],
      tags: [tags[0], tags[11]],
      moodTags: ["emotional", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 89,
      readingTime: 12,
      mediaLength: "70+ hours",
    }),

    // ── Anime & Manga ────────────────────────────────────────────────

    createArticle({
      title: "Chainsaw Man Part 2 Is Unhinged in the Best Way",
      excerpt: "Tatsuki Fujimoto threw the rulebook into a woodchipper and somehow created art. Part 2 is wilder, sadder, and funnier than anything in shonen.",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["dark", "intense", "fun"],
      format: "essay",
      mediaType: "anime",
      webRating: 90,
      readingTime: 8,
      mediaLength: "24 episodes",
    }),

    createArticle({
      title: "Top 5 Manga That Defined the Seinen Genre",
      excerpt: "Seinen manga does not get the mainstream love shonen does, but these five titles shaped an entire generation of storytelling.",
      category: categories[2],
      tags: [tags[11], tags[8]],
      moodTags: ["dark", "thought-provoking"],
      format: "ranked-list",
      mediaType: "manga",
      webRating: 87,
      readingTime: 10,
    }),

    createArticle({
      title: "Frieren: Beyond Journey's End Is Quietly Perfect",
      excerpt: "An elf who outlives everyone she loves goes on a journey to understand what those relationships meant. It is the most emotionally devastating anime told at the pace of a Sunday afternoon walk.",
      category: categories[2],
      tags: [tags[11], tags[3]],
      moodTags: ["emotional", "uplifting", "thought-provoking"],
      format: "essay",
      mediaType: "anime",
      webRating: 96,
      readingTime: 11,
      mediaLength: "28 episodes",
      body: generateRichBody([
        {
          paragraphs: [
            "Frieren begins where most fantasy stories end. The demon king is defeated. The party disbands. The hero eventually dies of old age. And Frieren — an elf mage who measures time in decades — realizes she barely knew him at all.",
            "That is the premise. An immortal being learning, too late, that the fleeting connections she dismissed were the most important things she ever had. It should be depressing. Instead, it is one of the most hopeful anime I have ever watched.",
          ],
          image: { seed: "frieren-sunset", alt: "Frieren watching a sunset", caption: "Frieren's landscapes are painted with a melancholy that mirrors its themes." },
        },
        {
          heading: "Pacing as philosophy",
          paragraphs: [
            "Frieren is slow. Deliberately, beautifully slow. Episodes pass where nothing dramatic happens. Characters walk through fields, collect spells, eat meals. And yet every scene builds emotional infrastructure that pays off episodes — sometimes seasons — later.",
          ],
        },
      ]),
    }),

    createArticle({
      title: "Spring 2026 Anime Roundup",
      excerpt: "Fourteen shows, three standouts, and one that made me question my taste entirely. Here is the full seasonal breakdown.",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["fun"],
      format: "roundup",
      mediaType: "anime",
      webRating: 70,
      readingTime: 7,
    }),

    createArticle({
      title: "One Piece Live-Action Season 2: Better Than Expected",
      excerpt: "Netflix somehow did it again. Season two expands the world without losing the heart that made season one a surprise hit.",
      category: categories[2],
      tags: [tags[6], tags[0], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "tv",
      webRating: 75,
      readingTime: 4,
      mediaLength: "8 episodes",
    }),

    createArticle({
      title: "Romance Anime That Broke Me: A Ranked List",
      excerpt: "I did not sign up for emotional devastation when I clicked play on these. And yet here we are, five tissue boxes later.",
      category: categories[2],
      tags: [tags[3], tags[11]],
      moodTags: ["emotional", "uplifting"],
      format: "ranked-list",
      mediaType: "anime",
      webRating: 86,
      readingTime: 9,
    }),

    createArticle({
      title: "Solo Leveling Finally Gets the Anime It Deserves",
      excerpt: "The manhwa was a sensation. The anime adaptation nails the power fantasy while upgrading the animation to jaw-dropping levels.",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["intense", "fun"],
      format: "essay",
      mediaType: "anime",
      webRating: 52,
      readingTime: 7,
      mediaLength: "24 episodes",
    }),

    createArticle({
      title: "Blue Lock Is Football Meets Death Note",
      excerpt: "Imagine if competitive sports anime was written by someone who thought sportsmanship was for quitters. That is Blue Lock.",
      category: categories[2],
      tags: [tags[6], tags[8]],
      moodTags: ["intense", "fun"],
      format: "short-take",
      mediaType: "anime",
      webRating: 77,
      readingTime: 4,
      mediaLength: "24 episodes",
    }),

    createArticle({
      title: "Dandadan Is the Wildest Anime of the Year",
      excerpt: "Aliens, ghosts, a banana curse, and genuine teenage romance. Dandadan should not work this well, but it absolutely does.",
      category: categories[2],
      tags: [tags[6], tags[10]],
      moodTags: ["fun", "intense"],
      format: "short-take",
      mediaType: "anime",
      webRating: 84,
      readingTime: 4,
      mediaLength: "12 episodes",
    }),

    createArticle({
      title: "Vinland Saga Season 2 Made Me Rethink Violence in Media",
      excerpt: "A Viking show about a warrior who renounces war. Season two replaces swords with wheat fields, and it is somehow the most gripping thing on screen.",
      category: categories[2],
      tags: [tags[11], tags[8]],
      moodTags: ["thought-provoking", "emotional"],
      format: "essay",
      mediaType: "anime",
      webRating: 95,
      readingTime: 13,
      mediaLength: "24 episodes",
    }),

    // ── Music ────────────────────────────────────────────────────────

    createArticle({
      title: "Kendrick Lamar's GNX Changed the Game Again",
      excerpt: "No rollout. No singles. Just a surprise drop that reminded everyone why Kendrick is the best rapper alive. GNX is a statement album in every sense.",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "music",
      webRating: 94,
      readingTime: 12,
      mediaLength: "52 min",
      body: generateRichBody([
        {
          paragraphs: [
            "Kendrick Lamar does not do rollouts anymore. He does not need to. GNX appeared on streaming platforms at midnight with zero warning, and by sunrise it had already reshaped the conversation around hip-hop in 2025.",
          ],
        },
        {
          heading: "Production that defies categorization",
          paragraphs: [
            "The beats on GNX pull from everywhere — West Coast funk, Memphis bass, afrobeat, electronic glitch. Jack Antonoff co-produced three tracks, which should not work but somehow does. The sonic palette is wider than anything Kendrick has attempted, and he rides every switch with the confidence of someone who has nothing left to prove.",
          ],
          image: { seed: "gnx-cover", alt: "GNX album artwork", caption: "The minimalist cover art belies the maximalist sound within." },
        },
      ]),
    }),

    createArticle({
      title: "Best Video Game Soundtracks of 2025",
      excerpt: "From orchestral epics to chiptune masterpieces, these are the scores that made us hit pause just to listen.",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["emotional", "uplifting"],
      format: "ranked-list",
      mediaType: "music",
      webRating: 83,
      readingTime: 8,
    }),

    createArticle({
      title: "Lo-Fi Beats and Chill: My Coding Playlist",
      excerpt: "The perfect background music for late-night coding sessions. Low-key enough to focus, interesting enough to vibe.",
      category: categories[3],
      tags: [tags[4]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 65,
      readingTime: 2,
    }),

    createArticle({
      title: "Tyler the Creator's Chromakopia: A Deep Dive",
      excerpt: "Tyler peeled back another layer. Chromakopia is his most vulnerable work — part confession, part jazz suite, entirely brilliant.",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["thought-provoking", "emotional"],
      format: "essay",
      mediaType: "music",
      webRating: 88,
      readingTime: 10,
      mediaLength: "53 min",
    }),

    createArticle({
      title: "The Rise of Japanese City Pop in Western Culture",
      excerpt: "How a 40-year-old genre from Tokyo became the soundtrack to late-night YouTube and vaporwave playlists worldwide.",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "essay",
      mediaType: "music",
      webRating: 76,
      readingTime: 7,
    }),

    createArticle({
      title: "Quick Take: Charli XCX Made the Album of the Summer",
      excerpt: "Brat summer is real. Charli XCX made a pop album that sounds like a warehouse rave at 3 AM and somehow topped every chart.",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 84,
      readingTime: 3,
      mediaLength: "43 min",
    }),

    createArticle({
      title: "How Anime Soundtracks Became My Comfort Music",
      excerpt: "I used to listen to anime OSTs ironically. Now they are my most-played genre on Spotify. Here is the pipeline.",
      category: categories[3],
      tags: [tags[5], tags[4]],
      moodTags: ["emotional", "uplifting"],
      format: "essay",
      mediaType: "music",
      webRating: 71,
      readingTime: 6,
    }),

    createArticle({
      title: "SZA's Follow-Up to SOS: Was It Worth the Wait?",
      excerpt: "Three years of anticipation, a thousand leaked snippets, and finally the album dropped. The verdict: complicated.",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["emotional", "thought-provoking"],
      format: "essay",
      mediaType: "music",
      webRating: 82,
      readingTime: 9,
      mediaLength: "61 min",
    }),

    createArticle({
      title: "Best Hip-Hop Beats of 2025: A Producer's Perspective",
      excerpt: "Forget the bars for a second — let us talk about the instrumentals. These are the beats that had producers rewinding and taking notes.",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["fun", "intense"],
      format: "ranked-list",
      mediaType: "music",
      webRating: 78,
      readingTime: 8,
    }),

    createArticle({
      title: "The Weeknd's Final Album: How Dawn FM Connects It All",
      excerpt: "Abel said this is the last chapter. Dawn FM is not just an album — it is the keystone of a decade-long concept arc that started with House of Balloons.",
      category: categories[3],
      tags: [tags[7], tags[11]],
      moodTags: ["dark", "emotional"],
      format: "essay",
      mediaType: "music",
      webRating: 91,
      readingTime: 11,
      mediaLength: "51 min",
    }),

    createArticle({
      title: "Why Vinyl Collecting Is Making a Comeback",
      excerpt: "In a streaming world, people are spending $40 on a plastic disc they can only play on a turntable. It makes perfect sense.",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 62,
      readingTime: 3,
    }),

    // ── EDGE CASES ───────────────────────────────────────────────────

    // Edge case: extremely long title
    createArticle({
      title: "I Spent 200 Hours Playing Every Soulslike Released in 2025 and Here Is What I Learned About Difficulty, Patience, and Why I Need to Go Outside More",
      excerpt: "The title says it all. My therapist is concerned.",
      category: categories[1],
      tags: [tags[0], tags[4]],
      moodTags: ["dark", "fun"],
      format: "essay",
      mediaType: "game",
      webRating: 74,
      readingTime: 18,
    }),

    // Edge case: 100 rating (perfect score — tests WebRating burst animation)
    createArticle({
      title: "The Perfect Game: Outer Wilds",
      excerpt: "I have never given anything a perfect score before. Outer Wilds is the exception. A game about curiosity, time loops, and the end of the universe.",
      category: categories[1],
      tags: [tags[4], tags[2]],
      moodTags: ["emotional", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 100,
      readingTime: 14,
      mediaLength: "20+ hours",
    }),

    // Edge case: 0 rating (tests WebRating empty state)
    createArticle({
      title: "Concord: A Post-Mortem",
      excerpt: "Sony pulled the plug after two weeks. Here is what went wrong with the biggest flop in PlayStation history.",
      category: categories[1],
      tags: [tags[0]],
      moodTags: ["dark"],
      format: "essay",
      mediaType: "game",
      webRating: 0,
      readingTime: 7,
    }),

    // Edge case: no excerpt (tests Card fallback)
    createArticle({
      title: "Thoughts on the Nintendo Direct",
      category: categories[1],
      tags: [tags[10]],
      moodTags: ["fun"],
      format: "short-take",
      mediaType: "game",
      webRating: 55,
      readingTime: 2,
    }),

    // Edge case: no tags (tests TagFilter empty state)
    createArticle({
      title: "A Quiet Week in Media",
      excerpt: "Sometimes nothing drops and that is okay. Here is what I did with an empty release calendar.",
      category: categories[0],
      tags: [],
      moodTags: [],
      format: "roundup",
      mediaType: "tv",
      webRating: 40,
      readingTime: 3,
    }),

    // Edge case: no webRating (tests missing rating display)
    createArticle({
      title: "First Impressions: A New Show I Cannot Name Yet",
      excerpt: "Under embargo until next week, but I have thoughts. Lots of them. Check back soon.",
      category: categories[0],
      tags: [tags[8]],
      moodTags: ["intense"],
      format: "short-take",
      mediaType: "tv",
    }),
  ];

  // ─── Media ───────────────────────────────────────────────────────────

  const media: MediaEntry[] = [
    createMedia({ title: "Dune: Part Two", mediaType: "movie", posterUrl: "https://picsum.photos/seed/dune2/300/450" }),
    createMedia({ title: "The Bear", mediaType: "tv", posterUrl: "https://picsum.photos/seed/thebear/300/450" }),
    createMedia({ title: "Elden Ring", mediaType: "game", posterUrl: "https://picsum.photos/seed/eldenring/300/450" }),
    createMedia({ title: "Chainsaw Man", mediaType: "anime", posterUrl: "https://picsum.photos/seed/chainsawman/300/450" }),
    createMedia({ title: "Frieren: Beyond Journey's End", mediaType: "anime", posterUrl: "https://picsum.photos/seed/frieren/300/450" }),
    createMedia({ title: "Kendrick Lamar - GNX", mediaType: "music", posterUrl: "https://picsum.photos/seed/gnx/300/300" }),
    createMedia({ title: "Hollow Knight: Silksong", mediaType: "game", posterUrl: "https://picsum.photos/seed/silksong/300/450" }),
    createMedia({ title: "One Piece", mediaType: "manga", posterUrl: "https://picsum.photos/seed/onepiece/300/450" }),
    // Replaced faker entries with real data
    createMedia({ title: "Arcane", mediaType: "tv", posterUrl: "https://picsum.photos/seed/arcane/300/450" }),
    createMedia({ title: "Cyberpunk 2077", mediaType: "game", posterUrl: "https://picsum.photos/seed/cyberpunk/300/450" }),
    createMedia({ title: "Vinland Saga", mediaType: "anime", posterUrl: "https://picsum.photos/seed/vinland/300/450" }),
    createMedia({ title: "Tyler the Creator - Chromakopia", mediaType: "music", posterUrl: "https://picsum.photos/seed/chromakopia/300/300" }),
  ];

  // ─── Collections ─────────────────────────────────────────────────────

  const collections: Collection[] = [
    // poster template → "Credits"
    createCollection({
      title: "Best of 2025",
      description: "The cream of the crop. Every piece of media that earned a Web Rating of 85 or higher this year — the stuff I will still be thinking about next December.",
      articles: articles.filter((a) => (a.webRating ?? 0) >= 85),
      season: "Winter 2026",
      theme: "best-of",
      featured: true,
      heroImageUrl: "https://picsum.photos/seed/best-of-2025/600/900",
    }),
    // poster template → "Credits"
    createCollection({
      title: "The Cyberpunk Canon",
      description: "Every essential cyberpunk experience across games, anime, film, and music. If neon-lit dystopias are your thing, start here.",
      articles: articles.filter(
        (a) => a.tags.some((t) => t.title === "cyberpunk") || a.tags.some((t) => t.title === "sci-fi")
      ),
      theme: "essentials",
      heroImageUrl: "https://picsum.photos/seed/cyberpunk-canon/600/900",
    }),
    // poster template → "Credits"
    createCollection({
      title: "Summer 2025 Standouts",
      description: "The movies, shows, games, and albums that defined the season. Blockbusters, sleeper hits, and everything in between.",
      articles: articles.filter((a) => (a.webRating ?? 0) >= 60).slice(0, 8),
      season: "Summer 2025",
      theme: "seasonal-picks",
      heroImageUrl: "https://picsum.photos/seed/summer-standouts/600/900",
    }),
    // manga template → "Chapters"
    createCollection({
      title: "Hidden Gems & Underrated Picks",
      description: "Not everything needs to be a 90+ banger. These are the quiet releases, the niche picks, and the titles that deserved way more attention than they got.",
      articles: articles.filter((a) => (a.webRating ?? 50) > 0 && (a.webRating ?? 50) <= 75),
      theme: "underrated",
      season: "Spring 2026",
      heroImageUrl: "https://picsum.photos/seed/hidden-gems/600/800",
    }),
    // vinyl template → "Tracklist"
    createCollection({
      title: "Guilty Pleasures I Won't Apologize For",
      description: "The stuff I know isn't 'peak' but I genuinely don't care. Every comfort rewatch, every popcorn flick, every album I play on repeat when nobody's watching.",
      articles: articles.filter((a) => (a.webRating ?? 50) >= 30 && (a.webRating ?? 50) <= 70).slice(0, 6),
      theme: "guilty-pleasures",
      heroImageUrl: "https://picsum.photos/seed/guilty-pleasures/600/600",
    }),
    // vinyl template → "Tracklist"
    createCollection({
      title: "Deep Cuts & B-Sides",
      description: "The things you probably haven't heard of yet. Obscure anime, indie games, underground albums, and the kind of movies that only play at 11pm on a Tuesday.",
      articles: articles.filter((a) => a.tags.some((t) => t.title === "indie" || t.title === "retro")).slice(0, 5),
      theme: "deep-cuts",
      heroImageUrl: "https://picsum.photos/seed/deep-cuts/600/600",
    }),
    // default template → "Articles" (no theme = default)
    createCollection({
      title: "Comfort Zone Rotation",
      description: "No theme, no rules. Just the stuff I keep coming back to when I need to decompress. The media equivalent of a warm blanket.",
      articles: articles.slice(0, 4),
      theme: undefined,
      heroImageUrl: "https://picsum.photos/seed/comfort-zone/600/800",
    }),
  ];

  // ─── Journal Entries ─────────────────────────────────────────────────

  const journalEntries: MediaDiaryEntry[] = [
    createJournalEntry({
      title: "Dune: Part Two",
      mediaType: "movie",
      status: "completed",
      rating: 92,
      notes: "Absolutely stunning. Villeneuve did it again.",
      media: media[0],
    }),
    createJournalEntry({
      title: "The Bear S3",
      mediaType: "tv",
      status: "watching",
      notes: "Two episodes in, already hooked.",
      media: media[1],
    }),
    createJournalEntry({
      title: "Elden Ring: Shadow of the Erdtree",
      mediaType: "game",
      status: "playing",
      notes: "Mesmer is destroying me. Forty-seven deaths and counting.",
      media: media[2],
    }),
    createJournalEntry({
      title: "Chainsaw Man Part 2",
      mediaType: "anime",
      status: "watching",
      notes: "The Falling Devil arc is peak fiction.",
      media: media[3],
    }),
    createJournalEntry({
      title: "Frieren: Beyond Journey's End",
      mediaType: "anime",
      status: "completed",
      rating: 96,
      notes: "One of the best fantasy anime ever made. The sunrise scene broke me.",
      media: media[4],
    }),
    createJournalEntry({
      title: "GNX by Kendrick Lamar",
      mediaType: "music",
      status: "listening",
      notes: "On my fifth full listen. Still catching new bars.",
      media: media[5],
    }),
    createJournalEntry({
      title: "Hollow Knight: Silksong",
      mediaType: "game",
      status: "playing",
      notes: "The movement feels incredible. Hornet is so much faster than the Knight.",
      media: media[6],
    }),
    createJournalEntry({
      title: "One Piece (Manga)",
      mediaType: "manga",
      status: "reading",
      notes: "Chapter 1120. Oda keeps finding new ways to make me cry.",
      media: media[7],
    }),
    // Replaced faker entries with real data
    createJournalEntry({
      title: "Arcane Season 2",
      mediaType: "tv",
      status: "completed",
      rating: 93,
      notes: "The ending hit harder than I expected. Jinx deserved better.",
      media: media[8],
    }),
    createJournalEntry({
      title: "Cyberpunk 2077: Phantom Liberty",
      mediaType: "game",
      status: "completed",
      rating: 91,
      notes: "Idris Elba was perfect. The spy thriller angle elevated everything.",
      media: media[9],
    }),
    createJournalEntry({
      title: "Vinland Saga Season 2",
      mediaType: "anime",
      status: "completed",
      rating: 95,
      notes: "Thorfinn's growth across two seasons is the best character arc in anime.",
      media: media[10],
    }),
    createJournalEntry({
      title: "Chromakopia by Tyler the Creator",
      mediaType: "music",
      status: "listening",
      notes: "The jazz production on this is unlike anything he has done before.",
      media: media[11],
    }),
  ];

  // ─── Reactions (correlated to quality) ───────────────────────────────

  const reactions = new Map<string, ReactionCounts>();
  for (const article of articles) {
    const rating = article.webRating ?? 50;
    // Higher-rated articles get more positive reactions
    const hype = rating / 100;
    const baseEngagement = Math.floor(50 + hype * 400);
    reactions.set(article.slug.current, {
      fire: Math.floor(baseEngagement * (0.6 + hype * 0.4) * (0.8 + Math.random() * 0.4)),
      love: Math.floor(baseEngagement * (0.4 + hype * 0.3) * (0.7 + Math.random() * 0.6)),
      mindblown: Math.floor(baseEngagement * hype * 0.5 * (0.5 + Math.random() * 1.0)),
      cool: Math.floor(baseEngagement * 0.3 * (0.6 + Math.random() * 0.8)),
      // Trash is inversely correlated — bad articles get more, good ones get some (haters)
      trash: Math.floor((1 - hype) * 30 * (0.5 + Math.random() * 1.0) + Math.random() * 5),
    });
  }

  // ─── Currently Consuming ─────────────────────────────────────────────

  const consuming: CurrentlyConsuming = createCurrentlyConsuming({
    watching: {
      title: "The Bear",
      mediaType: "tv",
      posterUrl: "https://picsum.photos/seed/thebear/300/450",
      externalId: "tb-s3",
      externalSource: "tmdb",
      progress: "Episode 3 of 10",
    },
    playing: {
      title: "Elden Ring: Shadow of the Erdtree",
      coverUrl: "https://picsum.photos/seed/erdtree/300/300",
      externalId: "er-dlc",
      platform: "PS5",
      progress: "42%",
    },
    reading: {
      title: "One Piece",
      mediaType: "manga",
      coverUrl: "https://picsum.photos/seed/onepiece/300/450",
      externalId: "op-1120",
      externalSource: "anilist",
      progress: "Chapter 1120",
    },
    listening: {
      title: "GNX",
      artist: "Kendrick Lamar",
      coverUrl: "https://picsum.photos/seed/gnx/300/300",
      spotifyUrl: "https://open.spotify.com/album/example",
      useSpotifyLive: false,
    },
  });

  // ─── Gallery Pieces ──────────────────────────────────────────────────

  const galleryPieces: GalleryPiece[] = [
    // Spotlight piece
    createGalleryPiece({
      title: "Miles Morales — Into the Spider-Verse Fan Poster",
      artistName: "Alex Chen",
      artistUrl: "https://instagram.com/alexchenart",
      originalUrl: "https://instagram.com/p/abc123",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=1000&fit=crop",
      description: "An incredible neon-lit reimagining of Miles swinging through Brooklyn.",
      isSpotlight: true,
    }),
    createGalleryPiece({
      title: "Spider-Gwen Watercolor",
      artistName: "Maya Rodriguez",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&h=900&fit=crop",
    }),
    createGalleryPiece({
      title: "Spider-Man 2099 Cityscape",
      artistName: "Kai Tanaka",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800&h=500&fit=crop",
      description: "A futuristic skyline inspired by Spider-Man 2099's Nueva York.",
    }),
    createGalleryPiece({
      title: "Peter Parker Portrait",
      artistName: "Sarah Kim",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&h=750&fit=crop",
    }),
    createGalleryPiece({
      title: "Venom Symbiote Splash Art",
      artistName: "Marcus Black",
      franchise: "venom",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&h=600&fit=crop",
      description: "Dark, gritty symbiote art with incredible texture work.",
    }),
    createGalleryPiece({
      title: "Carnage Unleashed",
      artistName: "Lena Wolf",
      franchise: "venom",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=800&fit=crop",
    }),
    createGalleryPiece({
      title: "Anti-Venom Digital Painting",
      artistName: "Jordan Lee",
      franchise: "venom",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=700&h=500&fit=crop",
    }),
    createGalleryPiece({
      title: "Chainsaw Man — Denji Fan Art",
      artistName: "Yuki Sato",
      franchise: "anime",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=850&fit=crop",
    }),
    createGalleryPiece({
      title: "Frieren Landscape Study",
      artistName: "Emma Liu",
      franchise: "anime",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
      description: "A serene landscape inspired by Frieren's journey.",
    }),
    createGalleryPiece({
      title: "One Piece — Gear 5 Luffy",
      artistName: "Taro Yamamoto",
      franchise: "anime",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=600&h=600&fit=crop",
    }),
    createGalleryPiece({
      title: "Jujutsu Kaisen Gojo Poster",
      artistName: "Nina Park",
      franchise: "anime",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&h=700&fit=crop",
    }),
    createGalleryPiece({
      title: "Elden Ring — Erdtree at Dusk",
      artistName: "David Hart",
      franchise: "games",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=800&h=500&fit=crop",
    }),
    createGalleryPiece({
      title: "Hollow Knight Fan Illustration",
      artistName: "Cleo Reyes",
      franchise: "games",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=600&h=800&fit=crop",
      description: "Beautiful ink-style illustration of the Knight.",
    }),
    createGalleryPiece({
      title: "Cyberpunk Night City Panorama",
      artistName: "Viktor Kozlov",
      franchise: "games",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=900&h=400&fit=crop",
    }),
    createGalleryPiece({
      title: "Kendrick Lamar — GNX Album Art Reimagined",
      artistName: "Andre Williams",
      franchise: "music",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=600&fit=crop",
    }),
    createGalleryPiece({
      title: "Lo-Fi Girl Study Session",
      artistName: "Mika Chen",
      franchise: "music",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=700&h=500&fit=crop",
    }),
    createGalleryPiece({
      title: "Spider-Verse Animation Test",
      artistName: "Frame Studio",
      franchise: "spider-verse",
      pieceType: "video",
      videoUrl: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      videoPlatform: "youtube",
      videoThumbnailUrl: "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?w=600&h=400&fit=crop",
    }),
    createGalleryPiece({
      title: "Anime Drawing Timelapse — Gojo",
      artistName: "DrawWithNina",
      franchise: "anime",
      pieceType: "video",
      videoUrl: "https://www.tiktok.com/@drawwithnina/video/1234567890",
      videoPlatform: "tiktok",
      videoThumbnailUrl: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400&h=600&fit=crop",
      description: "Incredible timelapse of a Gojo Satoru drawing.",
    }),
    createGalleryPiece({
      title: "Venom Sculpt Process",
      artistName: "ClayMaster",
      franchise: "venom",
      pieceType: "video",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoPlatform: "youtube",
      videoThumbnailUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
    }),
    createGalleryPiece({
      title: "Spider-Punk Poster",
      artistName: "Rico Santos",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=500&h=700&fit=crop",
    }),
    createGalleryPiece({
      title: "Noir Spider-Man Detective Scene",
      artistName: "Jack Morrison",
      franchise: "spider-verse",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&h=500&fit=crop",
    }),
    createGalleryPiece({
      title: "Anime Eyes Study Sheet",
      artistName: "Hana Ito",
      franchise: "anime",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=400&fit=crop",
    }),
    createGalleryPiece({
      title: "Gaming Setup Aesthetic",
      artistName: "NeonPixel",
      franchise: "games",
      pieceType: "image",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=450&fit=crop",
    }),
  ];

  return {
    articles,
    media,
    collections,
    journalEntries,
    categories,
    tags,
    moods,
    consuming,
    reactions,
    galleryPieces,
  };
}
