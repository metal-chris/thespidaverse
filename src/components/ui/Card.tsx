"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn, formatDate } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/image";
import { WebRating } from "@/components/content/WebRating";
import { CategoryPlaceholder } from "@/components/ui/CategoryPlaceholder";
import { getCategoryConfig } from "@/lib/categories";
import type { Article, MediaType } from "@/types";

/** Map Sanity category titles → i18n keys */
const CATEGORY_I18N_KEY: Record<string, string> = {
  Movies: "categories.movies",
  TV: "categories.tv",
  "Video Games": "categories.videoGames",
  Anime: "categories.anime",
  Books: "categories.books",
  Music: "categories.music",
  Culture: "categories.culture",
  Tech: "categories.tech",
};

interface CardProps {
  article: Article;
  featured?: boolean;
}

/* ── Format badge labels ── */
const formatBadge: Record<string, string> = {
  "first-bite": "First Bite",
  "the-full-web": "The Full Web",
  "spin-the-block": "Spin the Block",
  "the-sinister-six": "The Sinister Six",
  "the-gauntlet": "The Gauntlet",
  "versus": "Versus",
  "the-daily-bugle": "The Daily Bugle",
  "spida-sense": "Spida Sense",
  "the-web-sling": "The Web Sling",
  "state-of-the-game": "State of the Game",
  "the-rotation": "The Rotation",
  "one-year-later": "One Year Later",
};

/* ── Category pill color (from shared config) ── */

/* ── Media type → inline SVG icon (16×16) ── */
const mediaIcons: Record<MediaType, React.ReactNode> = {
  movie: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1H2V3zm0 2h12v7a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm5 1.5v4l3-2-3-2z" />
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M1.5 3A1.5 1.5 0 003 13h10a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0013 3H3A1.5 1.5 0 001.5 4.5v7zM5 14.5a.5.5 0 000 1h6a.5.5 0 000-1H5z" />
    </svg>
  ),
  game: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M6 3.5A1.5 1.5 0 017.5 2h1A1.5 1.5 0 0110 3.5V4h2.5A1.5 1.5 0 0114 5.5v5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 10.5v-5A1.5 1.5 0 013.5 4H6v-.5zM5 7H4v1h1v1h1V8h1V7H6V6H5v1zm4.5 0a.5.5 0 100 1 .5.5 0 000-1zm2 1a.5.5 0 100 1 .5.5 0 000-1z" />
    </svg>
  ),
  anime: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M8 1a.5.5 0 01.5.5V3h5a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3h5V1.5A.5.5 0 018 1zM6.5 6.5v4l4-2-4-2z" />
    </svg>
  ),
  books: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 000 2.5v11a.5.5 0 00.707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 00.78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0016 13.5v-11a.5.5 0 00-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.895 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 01.9-.995l8-.8a1 1 0 011.1.995V3L6 4V2.905z" />
    </svg>
  ),
};

const mediaLabel: Record<MediaType, string> = {
  movie: "Movie",
  tv: "TV",
  game: "Game",
  anime: "Anime",
  books: "Books",
  music: "Music",
};

export function Card({ article, featured = false }: CardProps) {
  const t = useTranslations();

  /** Translate a Sanity category title using i18n, with fallback to raw title */
  const translateCategory = (title?: string) => {
    if (!title) return "";
    const key = CATEGORY_I18N_KEY[title];
    return key ? t(key) : title;
  };

  /* Prefer direct URL (mock data) → fall back to Sanity urlFor (live data) */
  const sanityUrl = article.heroImage
    ? urlFor(article.heroImage)
        .width(featured ? 800 : 400)
        .height(featured ? 450 : 225)
        .url()
    : null;
  const imageUrl = article.heroImageUrl || sanityUrl || null;

  const catColor =
    getCategoryConfig(article.category?.title).pill;

  /* ── Featured card: image with text overlaid ── */
  if (featured) {
    return (
      <Link
        href={`/articles/${article.slug.current}`}
        className={cn(
          "group relative block rounded-xl overflow-hidden border-2 border-border card-tendril-hover",
          "transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1",
          "hover:border-accent/40"
        )}
      >
        {/* Full-bleed image — viewport-fill on mobile, cinematic on desktop */}
        <div className="relative min-h-[60svh] sm:min-h-0 sm:aspect-[16/9] lg:aspect-[21/9] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.heroImage?.alt || article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          ) : (
            <CategoryPlaceholder category={article.category?.title} className="absolute inset-0" intensity="bold" />
          )}

          {/* Gradient overlay for real images (placeholder handles its own) */}
          {imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
          )}

          {/* Rating badge */}
          {article.webRating != null && (
            <div className="absolute top-3 right-3">
              <WebRating score={article.webRating} variant="badge" />
            </div>
          )}

          {/* Format badge */}
          {article.format && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-sm">
                {formatBadge[article.format] || article.format}
              </span>
            </div>
          )}

          {/* Overlaid text content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
            {/* Category pill with Lucide icon */}
            {article.category && (() => {
              const catConfig = getCategoryConfig(article.category.title);
              const CatIcon = catConfig.icon;
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full border backdrop-blur-sm mb-2",
                    catColor
                  )}
                >
                  <CatIcon className="w-3 h-3" strokeWidth={2} />
                  {translateCategory(article.category.title)}
                </span>
              );
            })()}

            <h3 className="font-bold text-lg md:text-xl text-white leading-snug group-hover:text-accent transition-colors">
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="mt-1.5 text-xs md:text-sm text-white/85 leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-white/70">
              <time dateTime={article._createdAt} className="tabular-nums">
                {formatDate(article.publishedAt || article._createdAt)}
              </time>
              <span className="w-1 h-1 rounded-full bg-white/30" aria-hidden="true" />
              {article.readingTime && <span>{article.readingTime} min read</span>}
              {article.mediaLength && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" aria-hidden="true" />
                  <span>{article.mediaLength}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Standard card ── */
  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className={cn(
        "group relative block rounded-xl overflow-hidden bg-card border-2 border-border card-tendril-hover",
        "transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1",
        "hover:border-accent/40"
      )}
    >
      {/* Image area */}
      {imageUrl ? (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.heroImage?.alt || article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Subtle gradient for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Rating badge */}
          {article.webRating != null && (
            <div className="absolute top-3 right-3">
              <WebRating score={article.webRating} variant="badge" />
            </div>
          )}

          {/* Format badge */}
          {article.format && (
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/70 text-white border border-white/20 backdrop-blur-md shadow-sm">
                {formatBadge[article.format] || article.format}
              </span>
            </div>
          )}
        </div>
      ) : (
        <CategoryPlaceholder category={article.category?.title} className="aspect-[16/10]" intensity="medium" />
      )}

      {/* Text content */}
      <div className="p-4">
        {/* Category pill with Lucide icon */}
        {article.category && (() => {
          const catConfig = getCategoryConfig(article.category.title);
          const CatIcon = catConfig.icon;
          return (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border",
                catColor
              )}
            >
              <CatIcon className="w-3 h-3" strokeWidth={2} />
              {translateCategory(article.category.title)}
            </span>
          );
        })()}

        <h3 className="mt-2 font-bold text-base text-card-foreground group-hover:text-accent transition-colors leading-snug">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <time dateTime={article._createdAt} className="tabular-nums">
            {formatDate(article.publishedAt || article._createdAt)}
          </time>
          {article.readingTime && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <span>{article.readingTime} min read</span>
            </>
          )}
          {article.mediaLength && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
              <span>{article.mediaLength}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
