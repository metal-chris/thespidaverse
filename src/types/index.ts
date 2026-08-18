import type { PortableTextBlock } from "@portabletext/react";

export type ArticleFormat =
  | "first-bite"
  | "the-full-web"
  | "spin-the-block"
  | "the-sinister-six"
  | "the-gauntlet"
  | "versus"
  | "the-daily-bugle"
  | "spida-sense"
  | "the-web-sling"
  | "state-of-the-game"
  | "the-rotation"
  | "one-year-later";

export type ArticleSeries = "cartoons-and-cereal";

export type MediaType = "movie" | "tv" | "game" | "anime" | "books" | "music";

export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
}

/** Source types for the citation card. Mirrors SOURCE_TYPES in sanity/schemas/objects/sourceLink.ts */
export type SourceType =
  | "reporting"
  | "interview"
  | "review"
  | "data"
  | "primary"
  | "reference";

export type SourceAccess = "free" | "metered" | "paywalled";

/**
 * The `link` annotation. Everything past `href` is optional — a link with no
 * source metadata renders as an ordinary anchor with no card.
 */
export interface SourceLinkValue {
  href?: string;
  sourceName?: string;
  sourceTitle?: string;
  context?: string;
  sourceDate?: string;
  sourceType?: SourceType;
  sourceImage?: SanityImage;
  duration?: string;
  access?: SourceAccess;
  archiveUrl?: string;
  artistCredit?: string;
  spoilerSource?: boolean;
}

export type VideoProvider = "youtube" | "vimeo" | "mp4";

export interface VideoEmbed {
  provider: VideoProvider;
  url: string;
  caption?: string;
}

/** One chip on a tier-list chart. Everything past the phase-0 fields is
 * optional: `content` powers the capsule write-up, `rating`/`href` its footer. */
export interface TierEntry {
  _key: string;
  title: string;
  year?: string;
  /** Generalizes `year`: "Season 2", an artist. Chart label uses subtitle ?? year. */
  subtitle?: string;
  image?: SanityImage & { mockUrl?: string };
  anchor?: string;
  /** Capsule write-up. Renders through portableTextComponents, so source cards work here. */
  content?: PortableTextBlock[];
  /** Optional per-entry Web Rating shown in the capsule header. */
  rating?: number;
  /** "Full review" link when the entry has its own article. */
  href?: string;
}

export type TierListMode = "index" | "capsule";
export type TierChipAspect = "poster" | "square" | "wide";
export type TierListType = "tiers" | "numbered";

export interface TierRow {
  _key: string;
  label: string;
  color?: string;
  /** What the tier means — rank criteria or general prose. Rendered in a
   *  popover off the tier badge; absent leaves the badge inert. */
  description?: PortableTextBlock[];
  entries: TierEntry[];
}

export interface TierListBlock {
  _type: "tierList";
  /** Portable Text block key — identifies this list when an article has two. */
  _key?: string;
  title?: string;
  tiers: TierRow[];
  /** index (default): body keeps the write-ups; capsule: they live in the entries. */
  mode?: TierListMode;
  /** Chip shape per block: poster 2:3, square 1:1, wide 16:9. */
  chipAspect?: TierChipAspect;
  /** tiers (default): S/A/B grades. numbered: an ordered 1,2,3… list whose
   *  `tiers` are tie buckets. See src/lib/tierlist/arrangement.ts. */
  listType?: TierListType;
  /** Phase 5: collect reader arrangements. Absent reads as true, so lists
   *  published before the poll existed take part without being re-saved. */
  poll?: boolean;
}

export interface ImageGallery {
  _type: "imageGallery";
  images: (SanityImage & { caption?: string })[];
  layout?: "grid" | "two-col" | "three-col";
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
  series?: ArticleSeries;
  publishedAt?: string;
  excerpt?: string;
  body: PortableTextBlock[];
  category: Category;
  tags: Tag[];
  moodTags: string[];
  webRating?: number;
  heroImage: SanityImage;
  heroImageUrl?: string;
  heroVideo?: VideoEmbed;
  readingTime?: number;
  mediaLength?: string;
  ambientAudioUrl?: string;
  mediaType?: MediaType;
  pollConfig?: PollConfig;
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

export type CollectionTemplate = "poster" | "vinyl" | "books" | "default";

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

export interface Story {
  _id: string;
  _createdAt: string;
  _updatedAt?: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  excerpt?: string;
  body?: PortableTextBlock[];
  heroImage?: SanityImage;
  heroImageUrl?: string;
  tags?: Tag[];
  mediaType?: MediaType;
  relatedMedia?: MediaEntry[];
  readingTime?: number;
  spoilerFree?: boolean;
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
    isLive?: boolean;
  };
  playing?: {
    title: string;
    coverUrl?: string;
    externalId?: string;
    platform?: string;
    progress?: string;
    isLive?: boolean;
  };
  reading?: {
    title: string;
    mediaType: string;
    coverUrl?: string;
    externalId?: string;
    externalSource?: string;
    progress?: string;
    isLive?: boolean;
  };
  listening?: {
    title: string;
    artist?: string;
    coverUrl?: string;
    spotifyUrl?: string;
    useSpotifyLive?: boolean;
    isPlaying?: boolean;
  };
}

// ── Engagement / Polls ──

export type PollQuestionType =
  | "yes_no"
  | "agree_scale"
  | "multiple_choice"
  | "slider"
  | "this_or_that"
  | "ranking"
  | "hot_take";

export interface PollQuestion {
  questionKey: string;
  questionText: string;
  questionType: PollQuestionType;
  options?: string[];
  rankingItems?: string[];
}

export interface PollConfig {
  enableCommunityRating: boolean;
  pollQuestions?: PollQuestion[];
}

export interface WebRatingStats {
  avgScore: number;
  totalRatings: number;
  distribution: Record<string, number>;
}

export type PollResults = Record<string, Record<string, number>>;

export interface EngagementResults {
  webRating: WebRatingStats;
  polls: PollResults;
}

// ── Reactions ──

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
export type GalleryFranchise = "spider-verse" | "venom" | "anime" | "books" | "games" | "movies" | "tv" | "music" | "culture" | "other";
export type VideoPlatform = "youtube" | "tiktok" | "instagram";

export interface GalleryPiece {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  pieceType: GalleryPieceType;
  image?: SanityImage;
  images?: SanityImage[];
  imageUrl?: string;
  imageUrls?: string[];
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
