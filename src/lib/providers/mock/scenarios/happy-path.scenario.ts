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
} from "@/types";
import {
  createArticle,
  createArticles,
  createCategory,
  createTag,
} from "../factories/article.factory";
import { createMedia, createMediaList } from "../factories/media.factory";
import {
  createCollection,
  createCollections,
} from "../factories/collection.factory";
import { createJournalEntry, createJournalEntries } from "../factories/journal.factory";
import { createReactions } from "../factories/reaction.factory";
import { createCurrentlyConsuming } from "../factories/consuming.factory";
import type { MockDataset } from "../seed";

/**
 * Happy-path scenario: the default dev experience.
 * ~20 articles across all categories, formats, media types, ratings, and moods.
 * 10+ journal entries, 3 collections, reactions on every article,
 * and all currently-consuming widgets populated.
 */
export function buildHappyPathScenario(): MockDataset {
  faker.seed(42);

  // --- Taxonomy ---
  const categories: Category[] = [
    createCategory({ title: "Movies & TV" }),
    createCategory({ title: "Video Games" }),
    createCategory({ title: "Anime & Manga" }),
    createCategory({ title: "Music" }),
  ];

  const tags: Tag[] = [
    createTag({ title: "action" }),
    createTag({ title: "horror" }),
    createTag({ title: "sci-fi" }),
    createTag({ title: "romance" }),
    createTag({ title: "indie" }),
    createTag({ title: "retro" }),
    createTag({ title: "shonen" }),
    createTag({ title: "hip-hop" }),
    createTag({ title: "thriller" }),
    createTag({ title: "cyberpunk" }),
    createTag({ title: "comedy" }),
    createTag({ title: "drama" }),
  ];

  const moods = [
    "dark",
    "uplifting",
    "thought-provoking",
    "fun",
    "emotional",
    "intense",
  ];

  // --- Articles: 20 across all dimensions ---
  const articles: Article[] = [
    // Movies & TV
    createArticle({
      title: "Dune: Part Two Is a Masterclass in Sci-Fi Filmmaking",
      category: categories[0],
      tags: [tags[2], tags[8]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 92,
    }),
    createArticle({
      title: "Top 10 Horror Movies That Actually Scared Me",
      category: categories[0],
      tags: [tags[1], tags[8]],
      moodTags: ["dark", "intense"],
      format: "ranked-list",
      mediaType: "movie",
      webRating: 85,
    }),
    createArticle({
      title: "The Bear Season 3: A Quick Take",
      category: categories[0],
      tags: [tags[11], tags[10]],
      moodTags: ["emotional", "intense"],
      format: "short-take",
      mediaType: "tv",
      webRating: 78,
      readingTime: 3,
    }),
    createArticle({
      title: "Everything Everywhere Still Hits Different on Rewatch",
      category: categories[0],
      tags: [tags[2], tags[10], tags[11]],
      moodTags: ["emotional", "fun", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 95,
    }),
    createArticle({
      title: "Weekend Roundup: What I Watched This Week",
      category: categories[0],
      tags: [tags[11]],
      moodTags: ["fun"],
      format: "roundup",
      mediaType: "tv",
      webRating: 60,
    }),

    // Video Games
    createArticle({
      title: "Elden Ring DLC: Shadow of the Erdtree Review",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["dark", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 97,
    }),
    createArticle({
      title: "Best Indie Games You Missed in 2025",
      category: categories[1],
      tags: [tags[4], tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "ranked-list",
      mediaType: "game",
      webRating: 80,
    }),
    createArticle({
      title: "Hollow Knight: Silksong Was Worth the Wait",
      category: categories[1],
      tags: [tags[4], tags[0]],
      moodTags: ["dark", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 88,
    }),
    createArticle({
      title: "Quick Take: Balatro Is Pure Addiction",
      category: categories[1],
      tags: [tags[4]],
      moodTags: ["fun"],
      format: "short-take",
      mediaType: "game",
      webRating: 82,
      readingTime: 2,
    }),

    // Anime & Manga
    createArticle({
      title: "Chainsaw Man Part 2 Is Unhinged in the Best Way",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["dark", "intense", "fun"],
      format: "essay",
      mediaType: "anime",
      webRating: 90,
    }),
    createArticle({
      title: "Top 5 Manga That Defined the Seinen Genre",
      category: categories[2],
      tags: [tags[11], tags[8]],
      moodTags: ["dark", "thought-provoking"],
      format: "ranked-list",
      mediaType: "manga",
      webRating: 87,
    }),
    createArticle({
      title: "Frieren: Beyond Journey's End Is Quietly Perfect",
      category: categories[2],
      tags: [tags[11], tags[3]],
      moodTags: ["emotional", "uplifting", "thought-provoking"],
      format: "essay",
      mediaType: "anime",
      webRating: 96,
    }),
    createArticle({
      title: "Spring 2026 Anime Roundup",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["fun"],
      format: "roundup",
      mediaType: "anime",
      webRating: 70,
    }),
    createArticle({
      title: "One Piece Live-Action Season 2: Better Than Expected",
      category: categories[2],
      tags: [tags[6], tags[0], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "tv",
      webRating: 75,
    }),

    // Music
    createArticle({
      title: "Kendrick Lamar's GNX Changed the Game Again",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "music",
      webRating: 94,
    }),
    createArticle({
      title: "Best Video Game Soundtracks of 2025",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["emotional", "uplifting"],
      format: "ranked-list",
      mediaType: "music",
      webRating: 83,
    }),
    createArticle({
      title: "Lo-Fi Beats and Chill: My Coding Playlist",
      category: categories[3],
      tags: [tags[4]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 65,
      readingTime: 2,
    }),

    // Cross-category extras
    createArticle({
      title: "The Cyberpunk Renaissance: From 2077 to Edgerunners",
      category: categories[1],
      tags: [tags[9], tags[2]],
      moodTags: ["dark", "intense", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 91,
    }),
    createArticle({
      title: "Why Retro Games Keep Pulling Me Back",
      category: categories[1],
      tags: [tags[5], tags[4]],
      moodTags: ["fun", "uplifting"],
      format: "essay",
      mediaType: "game",
      webRating: 72,
    }),
    createArticle({
      title: "Romance Anime That Broke Me: A Ranked List",
      category: categories[2],
      tags: [tags[3], tags[11]],
      moodTags: ["emotional", "uplifting"],
      format: "ranked-list",
      mediaType: "anime",
      webRating: 86,
    }),

    // Additional Movies & TV (to test pagination: need 10+ per category)
    createArticle({
      title: "Civil War Is the Most Intense Film of 2024",
      category: categories[0],
      tags: [tags[8], tags[11]],
      moodTags: ["intense", "dark"],
      format: "essay",
      mediaType: "movie",
      webRating: 88,
    }),
    createArticle({
      title: "Shogun Season 1: A Masterpiece of Patience",
      category: categories[0],
      tags: [tags[11], tags[0]],
      moodTags: ["thought-provoking", "intense"],
      format: "essay",
      mediaType: "tv",
      webRating: 94,
    }),
    createArticle({
      title: "The Substance: Body Horror Done Right",
      category: categories[0],
      tags: [tags[1], tags[8]],
      moodTags: ["dark", "intense"],
      format: "short-take",
      mediaType: "movie",
      webRating: 79,
    }),
    createArticle({
      title: "Arcane Season 2 Sticks the Landing",
      category: categories[0],
      tags: [tags[0], tags[11]],
      moodTags: ["emotional", "intense"],
      format: "essay",
      mediaType: "tv",
      webRating: 93,
    }),
    createArticle({
      title: "Nosferatu: A Love Letter to Gothic Horror",
      category: categories[0],
      tags: [tags[1], tags[11]],
      moodTags: ["dark", "thought-provoking"],
      format: "essay",
      mediaType: "movie",
      webRating: 85,
    }),
    createArticle({
      title: "Quick Take: Fallout TV Is Better Than It Should Be",
      category: categories[0],
      tags: [tags[2], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "tv",
      webRating: 81,
    }),

    // Additional Video Games
    createArticle({
      title: "Metaphor: ReFantazio Is Atlus at Their Best",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["thought-provoking", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 93,
    }),
    createArticle({
      title: "Quick Take: Astro Bot Is Pure Joy",
      category: categories[1],
      tags: [tags[4], tags[10]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "game",
      webRating: 88,
    }),
    createArticle({
      title: "Black Myth: Wukong Exceeded Every Expectation",
      category: categories[1],
      tags: [tags[0], tags[9]],
      moodTags: ["intense", "thought-provoking"],
      format: "essay",
      mediaType: "game",
      webRating: 90,
    }),
    createArticle({
      title: "Final Fantasy VII Rebirth: A Worthy Sequel",
      category: categories[1],
      tags: [tags[0], tags[11]],
      moodTags: ["emotional", "intense"],
      format: "essay",
      mediaType: "game",
      webRating: 89,
    }),

    // Additional Anime & Manga
    createArticle({
      title: "Solo Leveling Finally Gets the Anime It Deserves",
      category: categories[2],
      tags: [tags[6], tags[0]],
      moodTags: ["intense", "fun"],
      format: "essay",
      mediaType: "anime",
      webRating: 82,
    }),
    createArticle({
      title: "Blue Lock Is Football Meets Death Note",
      category: categories[2],
      tags: [tags[6], tags[8]],
      moodTags: ["intense", "fun"],
      format: "short-take",
      mediaType: "anime",
      webRating: 77,
    }),
    createArticle({
      title: "Dandadan Is the Wildest Anime of the Year",
      category: categories[2],
      tags: [tags[6], tags[10]],
      moodTags: ["fun", "intense"],
      format: "short-take",
      mediaType: "anime",
      webRating: 84,
    }),
    createArticle({
      title: "Vinland Saga Season 2 Made Me Rethink Violence in Media",
      category: categories[2],
      tags: [tags[11], tags[8]],
      moodTags: ["thought-provoking", "emotional"],
      format: "essay",
      mediaType: "anime",
      webRating: 95,
    }),

    // Additional Music
    createArticle({
      title: "Tyler the Creator's Chromakopia: A Deep Dive",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["thought-provoking", "emotional"],
      format: "essay",
      mediaType: "music",
      webRating: 88,
    }),
    createArticle({
      title: "The Rise of Japanese City Pop in Western Culture",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "essay",
      mediaType: "music",
      webRating: 76,
    }),
    createArticle({
      title: "Quick Take: Charli XCX Made the Album of the Summer",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 84,
    }),
    createArticle({
      title: "How Anime Soundtracks Became My Comfort Music",
      category: categories[3],
      tags: [tags[5], tags[4]],
      moodTags: ["emotional", "uplifting"],
      format: "essay",
      mediaType: "music",
      webRating: 71,
    }),
    createArticle({
      title: "SZA's Follow-Up to SOS: Was It Worth the Wait?",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["emotional", "thought-provoking"],
      format: "essay",
      mediaType: "music",
      webRating: 82,
    }),
    createArticle({
      title: "Best Hip-Hop Beats of 2025: A Producer's Perspective",
      category: categories[3],
      tags: [tags[7]],
      moodTags: ["fun", "intense"],
      format: "ranked-list",
      mediaType: "music",
      webRating: 78,
    }),
    createArticle({
      title: "The Weeknd's Final Album: How Dawn FM Connects It All",
      category: categories[3],
      tags: [tags[7], tags[11]],
      moodTags: ["dark", "emotional"],
      format: "essay",
      mediaType: "music",
      webRating: 91,
    }),
    createArticle({
      title: "Why Vinyl Collecting Is Making a Comeback",
      category: categories[3],
      tags: [tags[5]],
      moodTags: ["fun", "uplifting"],
      format: "short-take",
      mediaType: "music",
      webRating: 62,
    }),
  ];

  // --- Media ---
  const media: MediaEntry[] = [
    createMedia({ title: "Dune: Part Two", mediaType: "movie" }),
    createMedia({ title: "The Bear", mediaType: "tv" }),
    createMedia({ title: "Elden Ring", mediaType: "game" }),
    createMedia({ title: "Chainsaw Man", mediaType: "anime" }),
    createMedia({ title: "Frieren: Beyond Journey's End", mediaType: "anime" }),
    createMedia({ title: "Kendrick Lamar - GNX", mediaType: "music" }),
    createMedia({ title: "Hollow Knight: Silksong", mediaType: "game" }),
    createMedia({ title: "One Piece", mediaType: "manga" }),
    ...createMediaList(4),
  ];

  // --- Collections ---
  const collections: Collection[] = [
    createCollection({
      title: "Best of 2025",
      articles: articles.filter((a) => a.webRating! >= 85),
      season: "Winter 2026",
      theme: "best-of",
    }),
    createCollection({
      title: "Hidden Gems & Underrated Picks",
      articles: articles.filter((a) => a.webRating! <= 75),
      theme: "underrated",
    }),
    createCollection({
      title: "The Cyberpunk Canon",
      articles: articles.filter(
        (a) => a.tags.some((t) => t.title === "cyberpunk") || a.tags.some((t) => t.title === "sci-fi")
      ),
      theme: "essentials",
    }),
  ];

  // --- Journal Entries ---
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
      notes: "Mesmer is destroying me.",
      media: media[2],
    }),
    createJournalEntry({
      title: "Chainsaw Man Part 2",
      mediaType: "anime",
      status: "watching",
      media: media[3],
    }),
    createJournalEntry({
      title: "Frieren",
      mediaType: "anime",
      status: "completed",
      rating: 96,
      notes: "One of the best fantasy anime ever made.",
      media: media[4],
    }),
    createJournalEntry({
      title: "GNX Album",
      mediaType: "music",
      status: "listening",
      media: media[5],
    }),
    createJournalEntry({
      title: "Silksong",
      mediaType: "game",
      status: "playing",
      notes: "The movement feels incredible.",
      media: media[6],
    }),
    createJournalEntry({
      title: "One Piece (Manga)",
      mediaType: "manga",
      status: "reading",
      media: media[7],
    }),
    ...createJournalEntries(4),
  ];

  // --- Reactions: one entry per article slug ---
  const reactions = new Map<string, ReactionCounts>();
  for (const article of articles) {
    reactions.set(article.slug.current, createReactions());
  }

  // --- Currently Consuming ---
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
  };
}
