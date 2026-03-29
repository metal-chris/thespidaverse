import type {
  Article,
  MediaEntry,
  Collection,
  MediaDiaryEntry,
  CurrentlyConsuming,
  ReactionCounts,
  SpotifyNowPlaying,
  Category,
  Tag,
  GalleryPiece,
} from "@/types";
import type {
  DataProvider,
  ArticleFilters,
  JournalFilters,
  SearchFacets,
  SearchResults,
  GraphArticle,
  EmojiType,
  MovieMetadata,
  GameMetadata,
  MusicMetadata,
  AnimeMetadata,
  GalleryFilters,
} from "../types";
import { loadScenario, type MockDataset } from "./seed";
import { createEmptyReactions } from "./factories/reaction.factory";

export class MockProvider implements DataProvider {
  private dataPromise: Promise<MockDataset>;

  constructor() {
    this.dataPromise = loadScenario();
  }

  private async getData(): Promise<MockDataset> {
    return this.dataPromise;
  }

  // ─── Articles ──────────────────────────────────────────────

  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    try {
      const data = await this.getData();
      let results = [...data.articles];

      if (filters?.category) {
        results = results.filter(
          (a) => a.category?.slug?.current === filters.category
        );
      }
      if (filters?.tag) {
        results = results.filter((a) =>
          a.tags?.some((t) => t.slug?.current === filters.tag)
        );
      }
      if (filters?.mood) {
        results = results.filter((a) =>
          a.moodTags?.includes(filters.mood!)
        );
      }
      if (filters?.format) {
        results = results.filter((a) => a.format === filters.format);
      }

      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? results.length;
      return results.slice(offset, offset + limit);
    } catch {
      return [];
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const data = await this.getData();
      return (
        data.articles.find((a) => a.slug.current === slug) ?? null
      );
    } catch {
      return null;
    }
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    try {
      const data = await this.getData();
      return data.articles.filter(
        (a) => a.category?.slug?.current === categorySlug
      );
    } catch {
      return [];
    }
  }

  async getArticlesByTag(tagSlug: string): Promise<Article[]> {
    try {
      const data = await this.getData();
      return data.articles.filter((a) =>
        a.tags?.some((t) => t.slug?.current === tagSlug)
      );
    } catch {
      return [];
    }
  }

  async getArticlesByMood(mood: string): Promise<Article[]> {
    try {
      const data = await this.getData();
      return data.articles.filter((a) =>
        a.moodTags?.includes(mood)
      );
    } catch {
      return [];
    }
  }

  // ─── Taxonomy ──────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    try {
      const data = await this.getData();
      return [...data.categories];
    } catch {
      return [];
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      const data = await this.getData();
      return [...data.tags];
    } catch {
      return [];
    }
  }

  async getMoods(): Promise<string[]> {
    try {
      const data = await this.getData();
      return [...data.moods];
    } catch {
      return [];
    }
  }

  // ─── Media ─────────────────────────────────────────────────

  async getMediaById(id: string): Promise<MediaEntry | null> {
    try {
      const data = await this.getData();
      return data.media.find((m) => m._id === id) ?? null;
    } catch {
      return null;
    }
  }

  async getAllMedia(): Promise<MediaEntry[]> {
    try {
      const data = await this.getData();
      return [...data.media];
    } catch {
      return [];
    }
  }

  // ─── Journal ───────────────────────────────────────────────

  async getJournalEntries(
    filters?: JournalFilters
  ): Promise<MediaDiaryEntry[]> {
    try {
      const data = await this.getData();
      let results = [...data.journalEntries];

      if (filters?.status) {
        results = results.filter((e) => e.status === filters.status);
      }
      if (filters?.mediaType) {
        results = results.filter(
          (e) => e.mediaType === filters.mediaType
        );
      }

      const limit = filters?.limit ?? results.length;
      return results.slice(0, limit);
    } catch {
      return [];
    }
  }

  // ─── Collections ───────────────────────────────────────────

  async getCollections(): Promise<Collection[]> {
    try {
      const data = await this.getData();
      // Strip full articles but keep a stub array matching the real count
      // so that callers using c.articles.length get the correct number.
      return data.collections.map((c) => ({
        ...c,
        articles: Array.from({ length: c.articles?.length ?? 0 }) as Collection["articles"],
      }));
    } catch {
      return [];
    }
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    try {
      const data = await this.getData();
      return (
        data.collections.find((c) => c.slug.current === slug) ??
        null
      );
    } catch {
      return null;
    }
  }

  // ─── Live Widgets ──────────────────────────────────────────

  async getCurrentlyConsuming(): Promise<CurrentlyConsuming | null> {
    try {
      const data = await this.getData();
      return data.consuming;
    } catch {
      return null;
    }
  }

  // ─── Reactions ─────────────────────────────────────────────

  async getReactions(slug: string): Promise<ReactionCounts> {
    try {
      const data = await this.getData();
      return data.reactions.get(slug) ?? createEmptyReactions();
    } catch {
      return createEmptyReactions();
    }
  }

  async addReaction(
    slug: string,
    emoji: EmojiType
  ): Promise<ReactionCounts> {
    try {
      const data = await this.getData();
      const current =
        data.reactions.get(slug) ?? createEmptyReactions();
      const updated: ReactionCounts = {
        ...current,
        [emoji]: current[emoji] + 1,
      };
      data.reactions.set(slug, updated);
      return updated;
    } catch {
      return createEmptyReactions();
    }
  }

  // ─── Search ────────────────────────────────────────────────

  async search(
    query: string,
    facets?: SearchFacets
  ): Promise<SearchResults> {
    try {
      const data = await this.getData();
      const lowerQuery = query.toLowerCase();

      let results = data.articles.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(lowerQuery);
        const excerptMatch = a.excerpt
          ?.toLowerCase()
          .includes(lowerQuery);
        return titleMatch || excerptMatch;
      });

      if (facets?.category) {
        results = results.filter(
          (a) => a.category?.slug?.current === facets.category
        );
      }
      if (facets?.format) {
        results = results.filter((a) => a.format === facets.format);
      }
      if (facets?.mood) {
        results = results.filter((a) =>
          a.moodTags?.includes(facets.mood!)
        );
      }
      if (facets?.tag) {
        results = results.filter((a) =>
          a.tags?.some((t) => t.slug?.current === facets.tag)
        );
      }

      return { articles: results, total: results.length };
    } catch {
      return { articles: [], total: 0 };
    }
  }

  // ─── Graph ─────────────────────────────────────────────────

  async getArticlesForGraph(): Promise<GraphArticle[]> {
    try {
      const data = await this.getData();
      return data.articles.map((a) => ({
        _id: a._id,
        title: a.title,
        slug: a.slug,
        mediaType: a.mediaType,
        category: a.category
          ? { _id: a.category._id, title: a.category.title, slug: a.category.slug }
          : undefined,
        tags: a.tags?.map((t) => ({ _id: t._id, title: t.title, slug: t.slug })),
      }));
    } catch {
      return [];
    }
  }

  // ─── Gallery ──────────────────────────────────────────────

  async getGalleryPieces(filters?: GalleryFilters): Promise<GalleryPiece[]> {
    try {
      const data = await this.getData();
      let pieces = [...(data.galleryPieces || [])];

      if (filters?.franchise) {
        pieces = pieces.filter((p) => p.franchise === filters.franchise);
      }
      if (filters?.pieceType) {
        pieces = pieces.filter((p) => p.pieceType === filters.pieceType);
      }

      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? pieces.length;
      return pieces.slice(offset, offset + limit);
    } catch {
      return [];
    }
  }

  async getGallerySpotlight(): Promise<GalleryPiece | null> {
    try {
      const data = await this.getData();
      return (data.galleryPieces || []).find((p) => p.isSpotlight) ?? null;
    } catch {
      return null;
    }
  }

  // ─── External Metadata (Phase 3 stubs) ────────────────────

  async fetchMovieMetadata(): Promise<MovieMetadata | null> {
    return null;
  }

  async fetchGameMetadata(): Promise<GameMetadata | null> {
    return null;
  }

  async fetchMusicMetadata(): Promise<MusicMetadata | null> {
    return null;
  }

  async fetchAnimeMetadata(): Promise<AnimeMetadata | null> {
    return null;
  }

  async fetchNowPlaying(): Promise<SpotifyNowPlaying | null> {
    return null;
  }
}
