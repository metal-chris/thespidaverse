import type { DataProvider } from "./types";

let cachedProvider: DataProvider | null = null;

export function getProvider(): DataProvider {
  if (cachedProvider) return cachedProvider;

  const mode = process.env.DATA_PROVIDER || "mock";

  switch (mode) {
    case "mock": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { MockProvider } = require("./mock/MockProvider");
      cachedProvider = new MockProvider();
      break;
    }
    case "live": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { LiveProvider } = require("./live/LiveProvider");
      cachedProvider = new LiveProvider();
      break;
    }
    default:
      throw new Error(`Unknown DATA_PROVIDER: ${mode}`);
  }

  return cachedProvider!;
}

export type { DataProvider } from "./types";
export type {
  ArticleFilters,
  JournalFilters,
  SearchFacets,
  SearchResults,
  EmojiType,
  GraphArticle,
  MovieMetadata,
  GameMetadata,
  MusicMetadata,
  AnimeMetadata,
} from "./types";
