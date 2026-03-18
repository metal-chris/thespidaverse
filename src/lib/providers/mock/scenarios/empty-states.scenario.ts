import type { MockDataset } from "../seed";
import { createEmptyReactions } from "../factories/reaction.factory";
import { createEmptyConsuming } from "../factories/consuming.factory";

/**
 * Empty-states scenario: zero content across the board.
 * Tests empty state UI in every section of the app.
 */
export function buildEmptyStatesScenario(): MockDataset {
  return {
    articles: [],
    media: [],
    collections: [],
    journalEntries: [],
    categories: [],
    tags: [],
    moods: [],
    consuming: null,
    reactions: new Map(),
  };
}
