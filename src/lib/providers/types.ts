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

// --- Filter & Search types ---

export interface ArticleFilters {
  category?: string;
  tag?: string;
  mood?: string;
  format?: string;
  limit?: number;
  offset?: number;
}

export interface JournalFilters {
  status?: string;
  mediaType?: string;
  limit?: number;
}

export interface SearchFacets {
  category?: string;
  format?: string;
  mood?: string;
  tag?: string;
}

export interface SearchResults {
  articles: Article[];
  total: number;
}

export interface GalleryFilters {
  franchise?: string;
  pieceType?: string;
  limit?: number;
  offset?: number;
}

// --- External metadata types (Phase 3) ---

export interface MovieMetadata {
  tmdbId: string;
  title: string;
  overview: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate: string;
  voteAverage: number;
  genres: string[];
}

export interface GameMetadata {
  igdbId: string;
  title: string;
  summary: string;
  coverUrl: string;
  releaseDate?: string;
  rating?: number;
  platforms: string[];
  genres: string[];
}

export interface MusicMetadata {
  spotifyId: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  previewUrl?: string;
  durationMs: number;
}

export interface AnimeMetadata {
  anilistId: string;
  title: string;
  coverUrl: string;
  description: string;
  episodes?: number;
  status: string;
  genres: string[];
}

// --- Graph data ---

export interface GraphArticle {
  _id: string;
  _createdAt?: string;
  title: string;
  slug: { current: string };
  mediaType?: string;
  category?: { _id: string; title: string; slug: { current: string } };
  tags?: { _id: string; title: string; slug: { current: string } }[];
  relatedMedia?: {
    _id: string;
    title: string;
    mediaType: string;
    posterUrl?: string;
  }[];
}

// --- Emoji type ---

export type EmojiType = "fire" | "love" | "mindblown" | "cool" | "trash";

// --- The DataProvider contract ---

export interface DataProvider {
  // Articles
  getArticles(filters?: ArticleFilters): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
  getArticlesByCategory(categorySlug: string): Promise<Article[]>;
  getArticlesByTag(tagSlug: string): Promise<Article[]>;
  getArticlesByMood(mood: string): Promise<Article[]>;

  // Taxonomy
  getCategories(): Promise<Category[]>;
  getTags(): Promise<Tag[]>;
  getMoods(): Promise<string[]>;

  // Media
  getMediaById(id: string): Promise<MediaEntry | null>;
  getAllMedia(): Promise<MediaEntry[]>;

  // Journal
  getJournalEntries(filters?: JournalFilters): Promise<MediaDiaryEntry[]>;

  // Collections
  getCollections(): Promise<Collection[]>;
  getCollectionBySlug(slug: string): Promise<Collection | null>;

  // Live Widgets
  getCurrentlyConsuming(): Promise<CurrentlyConsuming | null>;

  // Reactions
  getReactions(slug: string): Promise<ReactionCounts>;
  addReaction(slug: string, emoji: EmojiType): Promise<ReactionCounts>;

  // Search
  search(query: string, facets?: SearchFacets): Promise<SearchResults>;

  // Graph
  getArticlesForGraph(): Promise<GraphArticle[]>;

  // Gallery
  getGalleryPieces(filters?: GalleryFilters): Promise<GalleryPiece[]>;
  getGalleryCount(): Promise<number>;
  getGallerySpotlight(): Promise<GalleryPiece | null>;

  // External metadata (Phase 3)
  fetchMovieMetadata(tmdbId: string): Promise<MovieMetadata | null>;
  fetchGameMetadata(igdbId: string): Promise<GameMetadata | null>;
  fetchMusicMetadata(spotifyId: string): Promise<MusicMetadata | null>;
  fetchAnimeMetadata(anilistId: string): Promise<AnimeMetadata | null>;
  fetchNowPlaying(): Promise<SpotifyNowPlaying | null>;
}
