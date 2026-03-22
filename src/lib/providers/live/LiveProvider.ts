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
import { sanityFetch } from "@/lib/sanity/client";
import {
  articlesQuery,
  articleBySlugQuery,
  articlesByCategoryQuery,
  articlesByTagQuery,
  articlesByMoodQuery,
  categoriesQuery,
  tagsQuery,
  moodTagsQuery,
  mediaDiaryQuery,
  collectionsQuery,
  collectionBySlugQuery,
  currentlyConsumingQuery,
  graphDataQuery,
  galleryPiecesQuery,
  gallerySpotlightQuery,
} from "@/lib/sanity/queries";

const EMPTY_REACTIONS: ReactionCounts = {
  fire: 0,
  love: 0,
  mindblown: 0,
  cool: 0,
  trash: 0,
};

export class LiveProvider implements DataProvider {
  // ─── Articles ──────────────────────────────────────────────

  async getArticles(filters?: ArticleFilters): Promise<Article[]> {
    try {
      let articles = await sanityFetch<Article[]>(
        articlesQuery,
        undefined,
        []
      );

      if (filters?.category) {
        articles = articles.filter(
          (a) => a.category?.slug?.current === filters.category
        );
      }
      if (filters?.tag) {
        articles = articles.filter((a) =>
          a.tags?.some((t) => t.slug?.current === filters.tag)
        );
      }
      if (filters?.mood) {
        articles = articles.filter((a) =>
          a.moodTags?.includes(filters.mood!)
        );
      }
      if (filters?.format) {
        articles = articles.filter((a) => a.format === filters.format);
      }

      const offset = filters?.offset ?? 0;
      const limit = filters?.limit ?? articles.length;
      return articles.slice(offset, offset + limit);
    } catch {
      return [];
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      return await sanityFetch<Article | null>(
        articleBySlugQuery,
        { slug },
        null
      );
    } catch {
      return null;
    }
  }

  async getArticlesByCategory(categorySlug: string): Promise<Article[]> {
    try {
      return await sanityFetch<Article[]>(
        articlesByCategoryQuery,
        { category: categorySlug },
        []
      );
    } catch {
      return [];
    }
  }

  async getArticlesByTag(tagSlug: string): Promise<Article[]> {
    try {
      return await sanityFetch<Article[]>(
        articlesByTagQuery,
        { tag: tagSlug },
        []
      );
    } catch {
      return [];
    }
  }

  async getArticlesByMood(mood: string): Promise<Article[]> {
    try {
      return await sanityFetch<Article[]>(
        articlesByMoodQuery,
        { mood },
        []
      );
    } catch {
      return [];
    }
  }

  // ─── Taxonomy ──────────────────────────────────────────────

  async getCategories(): Promise<Category[]> {
    try {
      return await sanityFetch<Category[]>(categoriesQuery, undefined, []);
    } catch {
      return [];
    }
  }

  async getTags(): Promise<Tag[]> {
    try {
      return await sanityFetch<Tag[]>(tagsQuery, undefined, []);
    } catch {
      return [];
    }
  }

  async getMoods(): Promise<string[]> {
    try {
      return await sanityFetch<string[]>(moodTagsQuery, undefined, []);
    } catch {
      return [];
    }
  }

  // ─── Media ─────────────────────────────────────────────────

  async getMediaById(id: string): Promise<MediaEntry | null> {
    try {
      const allMedia = await this.getAllMedia();
      return allMedia.find((m) => m._id === id) ?? null;
    } catch {
      return null;
    }
  }

  async getAllMedia(): Promise<MediaEntry[]> {
    try {
      // No dedicated media query exists yet; return empty until Phase 3
      return [];
    } catch {
      return [];
    }
  }

  // ─── Journal ───────────────────────────────────────────────

  async getJournalEntries(
    filters?: JournalFilters
  ): Promise<MediaDiaryEntry[]> {
    try {
      let entries = await sanityFetch<MediaDiaryEntry[]>(
        mediaDiaryQuery,
        undefined,
        []
      );

      if (filters?.status) {
        entries = entries.filter((e) => e.status === filters.status);
      }
      if (filters?.mediaType) {
        entries = entries.filter(
          (e) => e.mediaType === filters.mediaType
        );
      }

      const limit = filters?.limit ?? entries.length;
      return entries.slice(0, limit);
    } catch {
      return [];
    }
  }

  // ─── Collections ───────────────────────────────────────────

  async getCollections(): Promise<Collection[]> {
    try {
      return await sanityFetch<Collection[]>(
        collectionsQuery,
        undefined,
        []
      );
    } catch {
      return [];
    }
  }

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    try {
      return await sanityFetch<Collection | null>(
        collectionBySlugQuery,
        { slug },
        null
      );
    } catch {
      return null;
    }
  }

  // ─── Live Widgets ──────────────────────────────────────────

  async getCurrentlyConsuming(): Promise<CurrentlyConsuming | null> {
    try {
      return await sanityFetch<CurrentlyConsuming | null>(
        currentlyConsumingQuery,
        undefined,
        null
      );
    } catch {
      return null;
    }
  }

  // ─── Reactions ─────────────────────────────────────────────
  // Reactions are managed via API routes. Since the provider runs
  // server-side where internal fetch to /api/ is unreliable during
  // SSR, we return zero-counts. Client components should call the
  // API routes directly for live reaction data.

  async getReactions(): Promise<ReactionCounts> {
    return { ...EMPTY_REACTIONS };
  }

  async addReaction(): Promise<ReactionCounts> {
    return { ...EMPTY_REACTIONS };
  }

  // ─── Search ────────────────────────────────────────────────

  async search(
    query: string,
    facets?: SearchFacets
  ): Promise<SearchResults> {
    try {
      const allArticles = await sanityFetch<Article[]>(
        articlesQuery,
        undefined,
        []
      );

      const lowerQuery = query.toLowerCase();

      let results = allArticles.filter((a) => {
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
      return await sanityFetch<GraphArticle[]>(
        graphDataQuery,
        undefined,
        []
      );
    } catch {
      return [];
    }
  }

  // ─── Gallery ──────────────────────────────────────────────

  async getGalleryPieces(filters?: GalleryFilters): Promise<GalleryPiece[]> {
    try {
      let pieces = await sanityFetch<GalleryPiece[]>(
        galleryPiecesQuery,
        undefined,
        []
      );

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
      return await sanityFetch<GalleryPiece | null>(
        gallerySpotlightQuery,
        undefined,
        null
      );
    } catch {
      return null;
    }
  }

  // ─── External Metadata (Phase 3) ──────────────────────────

  async fetchMovieMetadata(
    tmdbId: string
  ): Promise<MovieMetadata | null> {
    try {
      const res = await fetch(`/api/tmdb/${tmdbId}`);
      if (!res.ok) return null;
      return (await res.json()) as MovieMetadata;
    } catch {
      return null;
    }
  }

  async fetchGameMetadata(
    igdbId: string
  ): Promise<GameMetadata | null> {
    try {
      const res = await fetch(`/api/igdb/${igdbId}`);
      if (!res.ok) return null;
      return (await res.json()) as GameMetadata;
    } catch {
      return null;
    }
  }

  async fetchMusicMetadata(
    spotifyId: string
  ): Promise<MusicMetadata | null> {
    try {
      const res = await fetch(`/api/spotify/track/${spotifyId}`);
      if (!res.ok) return null;
      return (await res.json()) as MusicMetadata;
    } catch {
      return null;
    }
  }

  async fetchAnimeMetadata(
    anilistId: string
  ): Promise<AnimeMetadata | null> {
    try {
      const res = await fetch(`/api/anilist/${anilistId}`);
      if (!res.ok) return null;
      return (await res.json()) as AnimeMetadata;
    } catch {
      return null;
    }
  }

  async fetchNowPlaying(): Promise<SpotifyNowPlaying | null> {
    try {
      const res = await fetch("/api/spotify/now-playing");
      if (!res.ok) return null;
      return (await res.json()) as SpotifyNowPlaying;
    } catch {
      return null;
    }
  }
}
