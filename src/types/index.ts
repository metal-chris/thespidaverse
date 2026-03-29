import type { PortableTextBlock } from "@portabletext/react";

export type ArticleFormat = "essay" | "short-take" | "ranked-list" | "roundup";

export type MediaType = "movie" | "tv" | "game" | "anime" | "manga" | "music";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Tag {
  _id: string;
  title: string;
  slug: { current: string };
}

export interface Article {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: { current: string };
  format: ArticleFormat;
  excerpt?: string;
  body: PortableTextBlock[];
  category: Category;
  tags: Tag[];
  moodTags: string[];
  webRating?: number;
  heroImage: SanityImage;
  heroImageUrl?: string;
  readingTime?: number;
  mediaLength?: string;
  ambientAudioUrl?: string;
  mediaType?: MediaType;
}

export interface MediaEntry {
  _id: string;
  title: string;
  mediaType: MediaType;
  externalId: string;
  posterUrl?: string;
  overview?: string;
  releaseDate?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export type CollectionTemplate = "poster" | "vinyl" | "manga" | "default";

export interface Collection {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  heroImage?: SanityImage;
  heroImageUrl?: string;
  articles: Article[];
  season?: string;
  theme?: string;
  featured?: boolean;
}

export interface MediaDiaryEntry {
  _id: string;
  _createdAt: string;
  title: string;
  mediaType: MediaType;
  status: "watching" | "playing" | "listening" | "reading" | "completed" | "dropped";
  startedAt?: string;
  completedAt?: string;
  rating?: number;
  notes?: string;
  media?: MediaEntry;
  linkedArticle?: { _id: string; slug: { current: string }; title: string };
}

export interface CurrentlyConsuming {
  watching?: {
    title: string;
    mediaType: string;
    posterUrl?: string;
    externalId?: string;
    externalSource?: string;
    progress?: string;
  };
  playing?: {
    title: string;
    coverUrl?: string;
    externalId?: string;
    platform?: string;
    progress?: string;
  };
  reading?: {
    title: string;
    mediaType: string;
    coverUrl?: string;
    externalId?: string;
    externalSource?: string;
    progress?: string;
  };
  listening?: {
    title: string;
    artist?: string;
    coverUrl?: string;
    spotifyUrl?: string;
    useSpotifyLive?: boolean;
  };
}

export interface ReactionCounts {
  fire: number;
  love: number;
  mindblown: number;
  cool: number;
  trash: number;
}

export interface SpotifyNowPlaying {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumArtUrl?: string;
  spotifyUrl?: string;
  lastPlayed?: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "article" | "media" | "collection" | "tag";
  category?: string;
  slug?: string;
  posterUrl?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

// --- Gallery ---

export type GalleryPieceType = "image" | "video";
export type GalleryFranchise = "spider-verse" | "venom" | "anime" | "games" | "music" | "other";
export type VideoPlatform = "youtube" | "tiktok" | "instagram";

export interface GalleryPiece {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  pieceType: GalleryPieceType;
  image?: SanityImage;
  imageUrl?: string;
  videoUrl?: string;
  videoPlatform?: VideoPlatform;
  videoThumbnail?: SanityImage;
  videoThumbnailUrl?: string;
  artistName: string;
  artistUrl?: string;
  originalUrl?: string;
  franchise: GalleryFranchise;
  description?: string;
  isSpotlight: boolean;
  publishedAt: string;
}
