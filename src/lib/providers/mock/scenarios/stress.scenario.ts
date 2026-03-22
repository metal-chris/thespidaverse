import { faker } from "@faker-js/faker";
import type {
  Article,
  Category,
  Tag,
  ReactionCounts,
} from "@/types";
import {
  createArticle,
  createArticles,
  createCategory,
  createTag,
} from "../factories/article.factory";
import { createMediaList } from "../factories/media.factory";
import { createCollections } from "../factories/collection.factory";
import { createJournalEntries } from "../factories/journal.factory";
import { createReactions } from "../factories/reaction.factory";
import { createCurrentlyConsuming } from "../factories/consuming.factory";
import type { MockDataset } from "../seed";

/**
 * Stress scenario: large volume of data.
 * 200+ articles, 50+ tags, 30+ journal entries, 10+ collections.
 * Tests rendering performance, pagination, and memory at scale.
 */
export function buildStressScenario(): MockDataset {
  faker.seed(7777);

  // --- 8 categories ---
  const categories: Category[] = [
    createCategory({ title: "Movies & TV" }),
    createCategory({ title: "Video Games" }),
    createCategory({ title: "Anime & Manga" }),
    createCategory({ title: "Music" }),
    createCategory({ title: "Comics" }),
    createCategory({ title: "Streaming" }),
    createCategory({ title: "Retro" }),
    createCategory({ title: "Culture" }),
  ];

  // --- 50+ unique tags ---
  const tagNames = [
    "action", "horror", "sci-fi", "romance", "indie", "retro", "multiplayer",
    "studio-ghibli", "shonen", "seinen", "hip-hop", "electronic", "ost",
    "thriller", "comedy", "drama", "fantasy", "cyberpunk", "noir",
    "platformer", "roguelike", "rpg", "fps", "strategy", "mmorpg",
    "slice-of-life", "mecha", "isekai", "sports", "mystery",
    "psychological", "magical-girl", "post-apocalyptic", "steampunk",
    "western", "martial-arts", "supernatural", "historical",
    "documentary", "musical", "animation", "live-action",
    "co-op", "battle-royale", "sandbox", "simulation",
    "lo-fi", "jazz", "rock", "metal", "classical", "ambient",
  ];
  const tags: Tag[] = tagNames.map((title) => createTag({ title }));

  const moods = [
    "dark",
    "uplifting",
    "thought-provoking",
    "fun",
    "emotional",
    "intense",
  ];

  // --- 200+ articles distributed across categories ---
  const articles: Article[] = [];
  for (let i = 0; i < 210; i++) {
    const category = categories[i % categories.length];
    const articleTags = faker.helpers.arrayElements(tags, {
      min: 1,
      max: 5,
    });
    const articleMoods = faker.helpers.arrayElements(moods, {
      min: 1,
      max: 3,
    });

    articles.push(
      createArticle({
        category,
        tags: articleTags,
        moodTags: articleMoods,
      })
    );
  }

  // --- 40 media entries ---
  const media = createMediaList(40);

  // --- 12 collections, wired to articles ---
  const collections = createCollections(12, articles);

  // --- 35 journal entries ---
  const journalEntries = createJournalEntries(35);

  // Wire some journal entries to media
  journalEntries.forEach((entry, i) => {
    if (i < media.length) {
      entry.media = media[i % media.length];
    }
  });

  // --- Reactions for every article ---
  const reactions = new Map<string, ReactionCounts>();
  for (const article of articles) {
    reactions.set(article.slug.current, createReactions());
  }

  // --- Currently consuming: fully populated ---
  const consuming = createCurrentlyConsuming();

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
    galleryPieces: [],
  };
}
