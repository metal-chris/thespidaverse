import { faker } from "@faker-js/faker";
import type { ReactionCounts } from "@/types";
import {
  createArticle,
  createCategory,
  createTag,
} from "../factories/article.factory";
import { createMedia } from "../factories/media.factory";
import { createJournalEntry } from "../factories/journal.factory";
import { createReactions } from "../factories/reaction.factory";
import type { MockDataset } from "../seed";

/**
 * New-user scenario: minimal content representing a first-time experience.
 * 2 articles, 1 journal entry, 0 collections, 1 currently-consuming widget.
 */
export function buildNewUserScenario(): MockDataset {
  faker.seed(1);

  const category = createCategory({ title: "Movies & TV" });
  const tag = createTag({ title: "action" });
  const moods = ["fun", "intense"];

  const articles = [
    createArticle({
      title: "My First Review: Starting the Journey",
      category,
      tags: [tag],
      moodTags: ["fun"],
      format: "the-full-web",
      mediaType: "movie",
      webRating: 80,
    }),
    createArticle({
      title: "Quick Take on Last Night's Episode",
      category,
      tags: [tag],
      moodTags: ["intense"],
      format: "first-bite",
      mediaType: "tv",
      webRating: 65,
      readingTime: 2,
    }),
  ];

  const media = [
    createMedia({ title: "First Movie", mediaType: "movie" }),
  ];

  const journalEntries = [
    createJournalEntry({
      title: "First Movie Watch",
      mediaType: "movie",
      status: "completed",
      rating: 80,
      notes: "Great start to my tracking journey!",
      media: media[0],
    }),
  ];

  const reactions = new Map<string, ReactionCounts>();
  for (const article of articles) {
    reactions.set(article.slug.current, createReactions());
  }

  // Only watching widget populated -- everything else empty
  const consuming = {
    watching: {
      title: "Getting Started",
      mediaType: "tv",
      posterUrl: "https://picsum.photos/seed/newuser/300/450",
      progress: "Episode 1",
    },
    playing: undefined,
    reading: undefined,
    listening: undefined,
  };

  return {
    articles,
    media,
    collections: [],
    journalEntries,
    categories: [category],
    tags: [tag],
    moods,
    consuming,
    reactions,
    galleryPieces: [],
  };
}
