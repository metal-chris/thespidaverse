import { faker } from "@faker-js/faker";
import type {
  Article,
  Category,
  Tag,
  MediaEntry,
  MediaDiaryEntry,
  ReactionCounts,
} from "@/types";
import {
  createArticle,
  createCategory,
  createTag,
} from "../factories/article.factory";
import { createMedia } from "../factories/media.factory";
import { createCollection } from "../factories/collection.factory";
import { createJournalEntry } from "../factories/journal.factory";
import { createReactions, createEmptyReactions } from "../factories/reaction.factory";
import { createCurrentlyConsuming } from "../factories/consuming.factory";
import type { MockDataset } from "../seed";

/**
 * Edge-cases scenario: boundary values, unusual content, and corner cases.
 * Tests truncation, Unicode, rating extremes, missing fields,
 * future dates, and duplicate-date journal entries.
 */
export function buildEdgeCasesScenario(): MockDataset {
  faker.seed(99);

  const category: Category = createCategory({ title: "Edge Cases" });
  const tag: Tag = createTag({ title: "edge" });

  // --- Articles with specific edge cases ---
  const articles: Article[] = [
    // Extremely long title (tests truncation)
    createArticle({
      title:
        "This Is an Extremely Long Article Title That Should Absolutely Test Every Single Truncation " +
        "Boundary in the UI Including Card Titles, SEO Meta Tags, Open Graph Previews, Breadcrumbs, " +
        "and Any Other Place Where a Title Might Appear Because You Never Know How Long a Real User " +
        "Might Make Their Title When They Are Really Passionate About a Subject",
      category,
      tags: [tag],
      webRating: 50,
    }),

    // Minimal article: short title, everything optional null/empty
    createArticle({
      title: "Hi",
      category,
      tags: [],
      moodTags: [],
      webRating: 0,
      excerpt: undefined,
      mediaLength: undefined,
      mediaType: undefined,
      ambientAudioUrl: undefined,
      readingTime: undefined,
    }),

    // Unicode title with Japanese + English
    createArticle({
      title: "\u9032\u6483\u306E\u5DE8\u4EBA \u2014 Attack on Titan: The Final Season \u5B8C\u7D50\u7DE8",
      category,
      tags: [createTag({ title: "anime" })],
      moodTags: ["dark", "intense", "emotional"],
      format: "the-full-web",
      mediaType: "anime",
      webRating: 88,
    }),

    // webRating: 0 (worst)
    createArticle({
      title: "The Worst Movie I Have Ever Seen",
      category,
      tags: [tag],
      moodTags: ["dark"],
      webRating: 0,
      mediaType: "movie",
    }),

    // webRating: 99 (almost perfect)
    createArticle({
      title: "So Close to Perfection",
      category,
      tags: [tag],
      moodTags: ["thought-provoking"],
      webRating: 99,
      mediaType: "tv",
    }),

    // webRating: 1 (just above zero)
    createArticle({
      title: "One Point of Redemption",
      category,
      tags: [tag],
      moodTags: ["dark"],
      webRating: 1,
      mediaType: "game",
    }),

    // webRating: 50 (half)
    createArticle({
      title: "Perfectly Mediocre",
      category,
      tags: [tag],
      moodTags: ["fun"],
      webRating: 50,
      mediaType: "movie",
    }),

    // webRating: 100 (triggers burst animation)
    createArticle({
      title: "An Absolute Masterpiece \u2014 100/100",
      category,
      tags: [tag],
      moodTags: ["uplifting", "emotional"],
      webRating: 100,
      mediaType: "anime",
    }),

    // Very short body (short-take, readingTime: 1)
    createArticle({
      title: "Quick Thought",
      category,
      tags: [tag],
      format: "first-bite",
      readingTime: 1,
      body: [
        {
          _key: "short1",
          _type: "block",
          style: "normal",
          children: [
            {
              _key: "s1",
              _type: "span",
              text: "Sometimes a sentence is all you need.",
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
      mediaType: "movie",
      webRating: 60,
    }),

    // All moods selected
    createArticle({
      title: "Every Mood at Once",
      category,
      tags: [tag],
      moodTags: [
        "dark",
        "uplifting",
        "thought-provoking",
        "fun",
        "emotional",
        "intense",
      ],
      webRating: 75,
      mediaType: "tv",
    }),

    // spoilerFree: false (article contains spoilers)
    createArticle({
      title: "Full Spoiler Discussion: Major Plot Twists",
      category,
      tags: [tag],
      moodTags: ["intense"],
      webRating: 70,
      mediaType: "movie",
      // Note: spoilerFree is not on the Article type, but body may contain spoilerBlock nodes.
      // The body here simulates a spoiler-heavy article.
      body: [
        {
          _key: "sp1",
          _type: "block",
          style: "h2",
          children: [
            {
              _key: "sp1a",
              _type: "span",
              text: "Warning: Spoilers Ahead",
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _key: "sp2",
          _type: "spoilerBlock",
          children: [
            {
              _key: "sp2a",
              _type: "span",
              text: "The villain was the hero's father all along.",
              marks: [],
            },
          ],
          markDefs: [],
        },
        {
          _key: "sp3",
          _type: "block",
          style: "normal",
          children: [
            {
              _key: "sp3a",
              _type: "span",
              text: "This reveal completely recontextualizes the first act.",
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
    }),

    // Future-dated article
    createArticle({
      title: "Scheduled: Upcoming Coverage Preview",
      category,
      tags: [tag],
      moodTags: ["fun"],
      webRating: 0,
      mediaType: "tv",
      _createdAt: "2027-12-31T00:00:00Z",
      _updatedAt: "2027-12-31T00:00:00Z",
    }),
  ];

  // --- Media edge cases ---
  const media: MediaEntry[] = [
    // Media with no posterUrl
    createMedia({
      title: "No Poster Available",
      mediaType: "movie",
      posterUrl: undefined,
    }),

    // Media with very long overview
    createMedia({
      title: "War and Peace: The Adaptation",
      mediaType: "tv",
      overview: Array.from({ length: 20 }, () => faker.lorem.paragraph())
        .join(" "),
    }),

    createMedia({ title: "Normal Media Entry", mediaType: "game" }),
  ];

  // --- Journal edge cases ---
  const journalEntries: MediaDiaryEntry[] = [
    // Status: dropped
    createJournalEntry({
      title: "Dropped After 2 Episodes",
      mediaType: "tv",
      status: "dropped",
      rating: 20,
      notes: "Just wasn't for me.",
      completedAt: "2026-02-15T00:00:00Z",
    }),

    // No notes and no rating
    createJournalEntry({
      title: "Silent Entry",
      mediaType: "movie",
      status: "completed",
      rating: undefined,
      notes: undefined,
    }),

    // 3 journal entries on same date: 2026-03-04
    createJournalEntry({
      title: "Morning Watch: Anime",
      mediaType: "anime",
      status: "watching",
      _createdAt: "2026-03-04T08:00:00Z",
      startedAt: "2026-03-04T08:00:00Z",
    }),
    createJournalEntry({
      title: "Afternoon Game Session",
      mediaType: "game",
      status: "playing",
      _createdAt: "2026-03-04T14:00:00Z",
      startedAt: "2026-03-04T14:00:00Z",
    }),
    createJournalEntry({
      title: "Evening Music Listen",
      mediaType: "music",
      status: "listening",
      _createdAt: "2026-03-04T20:00:00Z",
      startedAt: "2026-03-04T20:00:00Z",
    }),
  ];

  // --- Wiring ---
  const collections = [
    createCollection({
      title: "Edge Case Collection",
      articles: articles.slice(0, 4),
    }),
  ];

  const reactions = new Map<string, ReactionCounts>();
  for (const article of articles) {
    reactions.set(article.slug.current, createReactions());
  }
  // Give the minimal article empty reactions
  reactions.set(articles[1].slug.current, createEmptyReactions());

  const consuming = createCurrentlyConsuming();

  const tags: Tag[] = [tag, createTag({ title: "anime" })];
  const moods = [
    "dark",
    "uplifting",
    "thought-provoking",
    "fun",
    "emotional",
    "intense",
  ];

  return {
    articles,
    media,
    collections,
    journalEntries,
    categories: [category],
    tags,
    moods,
    consuming,
    reactions,
    galleryPieces: [],
  };
}
