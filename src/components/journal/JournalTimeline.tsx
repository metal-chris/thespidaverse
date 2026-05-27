"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Article, MediaDiaryEntry, MediaType, Story } from "@/types";
import { formatMediaType } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/image";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getCategoryConfig } from "@/lib/categories";
import { CategoryPlaceholder } from "@/components/ui/CategoryPlaceholder";
import { ArrowUpRight, Calendar, Clock, PenLine } from "lucide-react";

// Theme-aware status colors
const STATUS_COLORS: Record<string, Record<string, string>> = {
  miles: {
    watching: "bg-blue-500 text-white",
    playing: "bg-green-500 text-white",
    listening: "bg-purple-500 text-white",
    reading: "bg-amber-500 text-white",
    completed: "bg-emerald-500 text-white",
    dropped: "bg-red-500 text-white",
  },
  peter: {
    watching: "bg-blue-500 text-white",
    playing: "bg-green-500 text-white",
    listening: "bg-purple-500 text-white",
    reading: "bg-yellow-500 text-white",
    completed: "bg-teal-500 text-white",
    dropped: "bg-red-500 text-white",
  },
  venom: {
    watching: "bg-blue-400 text-black",
    playing: "bg-green-400 text-black",
    listening: "bg-purple-400 text-black",
    reading: "bg-yellow-400 text-black",
    completed: "bg-emerald-400 text-black",
    dropped: "bg-red-400 text-black",
  },
};

const DOT_COLORS: Record<string, Record<string, string>> = {
  miles: {
    watching: "bg-blue-500",
    playing: "bg-green-500",
    listening: "bg-purple-500",
    reading: "bg-amber-500",
    completed: "bg-emerald-500",
    dropped: "bg-red-500",
    story: "bg-accent",
    article: "bg-foreground",
  },
  peter: {
    watching: "bg-blue-500",
    playing: "bg-green-500",
    listening: "bg-purple-500",
    reading: "bg-yellow-500",
    completed: "bg-teal-500",
    dropped: "bg-red-500",
    story: "bg-accent",
    article: "bg-foreground",
  },
  venom: {
    watching: "bg-blue-400",
    playing: "bg-green-400",
    listening: "bg-purple-400",
    reading: "bg-yellow-400",
    completed: "bg-emerald-400",
    dropped: "bg-red-400",
    story: "bg-accent",
    article: "bg-foreground",
  },
};

const STATUS_KEYS: Record<string, string> = {
  watching: "journal.statusWatching",
  playing: "journal.statusPlaying",
  listening: "journal.statusListening",
  reading: "journal.statusReading",
  completed: "journal.statusCompleted",
  dropped: "journal.statusDropped",
};

// ─── Unified timeline item — discriminated union ───────────
type TimelineItem =
  | { kind: "diary"; date: string; entry: MediaDiaryEntry }
  | { kind: "story"; date: string; story: Story }
  | { kind: "article"; date: string; article: Article };

interface JournalTimelineProps {
  entries: MediaDiaryEntry[];
  stories: Story[];
  articles?: Article[];
}

type FilterType = "all" | "story" | "article" | MediaType;
type FilterStatus = "all" | MediaDiaryEntry["status"];

export function JournalTimeline({ entries, stories, articles = [] }: JournalTimelineProps) {
  const t = useTranslations();
  const { theme } = useTheme();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const statusColors = STATUS_COLORS[theme] || STATUS_COLORS.miles;
  const dotColors = DOT_COLORS[theme] || DOT_COLORS.miles;

  // Merge diary entries + stories into one timeline, sorted by date desc.
  const allItems = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = [];
    for (const entry of entries) {
      items.push({
        kind: "diary",
        date: entry.startedAt || entry._createdAt,
        entry,
      });
    }
    for (const story of stories) {
      items.push({
        kind: "story",
        date: story.publishedAt || story._createdAt,
        story,
      });
    }
    for (const article of articles) {
      items.push({
        kind: "article",
        date: article.publishedAt || article._createdAt,
        article,
      });
    }
    items.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return items;
  }, [entries, stories, articles]);

  const filtered = useMemo(() => {
    return allItems.filter((item) => {
      if (typeFilter === "story") return item.kind === "story";
      if (typeFilter === "article") return item.kind === "article";
      if (item.kind === "story") {
        // When filtering by a media type, stories only match if they declare one
        if (typeFilter !== "all" && item.story.mediaType !== typeFilter)
          return false;
        // Status filter only applies to diary entries
        if (statusFilter !== "all") return false;
        return true;
      }
      if (item.kind === "article") {
        // When filtering by a media type, articles only match if they declare one
        if (typeFilter !== "all" && item.article.mediaType !== typeFilter)
          return false;
        // Status filter only applies to diary entries
        if (statusFilter !== "all") return false;
        return true;
      }
      // diary entry
      if (typeFilter !== "all" && item.entry.mediaType !== typeFilter)
        return false;
      if (statusFilter !== "all" && item.entry.status !== statusFilter)
        return false;
      return true;
    });
  }, [allItems, typeFilter, statusFilter]);

  // Group by month
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of filtered) {
      const key = item.date ? item.date.slice(0, 7) : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  const mediaTypes: FilterType[] = [
    "all",
    "article",
    "story",
    "movie",
    "tv",
    "game",
    "anime",
    "books",
    "music",
  ];
  const statuses: FilterStatus[] = [
    "all",
    "watching",
    "playing",
    "listening",
    "reading",
    "completed",
    "dropped",
  ];

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      {/* Filter bar — compact toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            hasActiveFilters
              ? "border-accent/50 text-accent bg-accent/10"
              : "border-border text-muted-foreground hover:border-accent/30"
          )}
        >
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
          </svg>
          {t("journal.filter")}
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>

        <span className="text-xs text-muted-foreground tabular-nums">
          {t("journal.entryCount", { count: filtered.length })}
        </span>
      </div>

      {/* Expandable filter panel */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          filtersOpen ? "max-h-[200px] opacity-100 mb-6" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-border bg-card/50">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
              {t("journal.typeLabel")}
            </label>
            <div className="flex flex-wrap gap-1">
              {mediaTypes.map((mt) => (
                <button
                  key={mt}
                  onClick={() => setTypeFilter(mt)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-colors",
                    typeFilter === mt
                      ? "bg-accent text-background border-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {mt === "all"
                    ? t("journal.all")
                    : mt === "story"
                    ? t("journal.stories")
                    : mt === "article"
                    ? t("journal.articles")
                    : formatMediaType(mt)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
              {t("journal.statusLabel")}
            </label>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-colors",
                    statusFilter === s
                      ? "bg-accent text-background border-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {s === "all"
                    ? t("journal.all")
                    : STATUS_KEYS[s]
                    ? t(STATUS_KEYS[s])
                    : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline — single continuous line */}
      <div className="relative">
        <div
          className="absolute left-[11px] top-0 bottom-0 w-0.5"
          style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
          aria-hidden="true"
        />
        {grouped.map(([month, items]) => {
          const monthLabel =
            month === "unknown"
              ? t("journal.undated")
              : new Date(month + "-01").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                });

          return (
            <div key={month} className="mb-6">
              <h3 className="text-lg font-bold mb-3 sticky top-16 bg-background/90 backdrop-blur-sm py-2 z-10 pl-8">
                {monthLabel}
              </h3>
              <div className="space-y-3">
                {items.map((item) => {
                  if (item.kind === "diary") {
                    return (
                      <DiaryCard
                        key={item.entry._id}
                        entry={item.entry}
                        dotColors={dotColors}
                        statusColors={statusColors}
                        t={t}
                      />
                    );
                  }
                  if (item.kind === "story") {
                    return (
                      <StoryCard
                        key={item.story._id}
                        story={item.story}
                        dotColor={dotColors.story}
                        t={t}
                      />
                    );
                  }
                  return (
                    <ArticleCard
                      key={item.article._id}
                      article={item.article}
                      dotColor={dotColors.article}
                      t={t}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <p className="text-muted-foreground text-sm">
            {t("journal.noEntries")}
          </p>
          <button
            onClick={() => {
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            className="mt-2 text-xs text-accent hover:underline"
          >
            {t("journal.clearFilters")}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Diary card (extracted from original render) ───────────
function DiaryCard({
  entry,
  dotColors,
  statusColors,
  t,
}: {
  entry: MediaDiaryEntry;
  dotColors: Record<string, string>;
  statusColors: Record<string, string>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="flex gap-4 pl-8 relative">
      <div
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background",
          dotColors[entry.status] || "bg-muted"
        )}
        title={
          STATUS_KEYS[entry.status] ? t(STATUS_KEYS[entry.status]) : entry.status
        }
      />
      <div className={cn(CARD_CHROME, "border-border")}>
        <CardThumb
          src={entry.media?.posterUrl}
          alt={entry.title}
          categoryTitle={MEDIA_TYPE_TO_CATEGORY[entry.mediaType]}
        />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full",
                statusColors[entry.status] || "bg-muted text-muted-foreground"
              )}
            >
              {STATUS_KEYS[entry.status]
                ? t(STATUS_KEYS[entry.status])
                : entry.status}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
              {formatMediaType(entry.mediaType)}
            </span>
          </div>
          <h4 className="font-semibold text-base leading-snug text-foreground">
            {entry.title}
          </h4>
          {entry.notes && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {entry.notes}
            </p>
          )}
          <CardMetaRow date={entry.startedAt} t={t} />
          {entry.linkedArticle && (
            <Link
              href={`/articles/${entry.linkedArticle.slug.current}`}
              className="inline-flex items-center gap-1.5 mt-3 self-start px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20 hover:border-accent/50 transition-colors"
            >
              {t("journal.readReview")}
              <ArrowUpRight className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared card chrome (link wrapper + thumbnail + meta row) ───────────
function CardMetaRow({
  date,
  readingTime,
  t,
}: {
  date?: string;
  readingTime?: number | null;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
      {date && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
          <time dateTime={date} className="tabular-nums">
            {new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </span>
      )}
      {readingTime != null && (
        <>
          <span
            className="w-px h-3 bg-foreground"
            style={{ opacity: 0.3 }}
            aria-hidden="true"
          />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3 h-3" strokeWidth={1.75} aria-hidden="true" />
            <span>{t("article.minRead", { minutes: readingTime })}</span>
          </span>
        </>
      )}
    </div>
  );
}

const CARD_CHROME =
  "flex-1 flex gap-4 p-4 rounded-xl border bg-card relative group";

const CARD_LINK_BASE =
  CARD_CHROME +
  " transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/5";

/** mediaType ("movie", "tv", …) → category title for CategoryPlaceholder fallback */
const MEDIA_TYPE_TO_CATEGORY: Record<string, string> = {
  movie: "Movies",
  tv: "TV",
  game: "Video Games",
  anime: "Anime",
  books: "Books",
  music: "Music",
};

function CardThumb({
  src,
  alt,
  categoryTitle,
}: {
  src?: string | null;
  alt: string;
  categoryTitle?: string;
}) {
  return (
    <div
      className="relative w-28 h-28 md:w-32 md:h-32 rounded-lg overflow-hidden flex-shrink-0 ring-1"
      style={{ "--tw-ring-color": "rgba(255,255,255,0.08)" } as React.CSSProperties}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          sizes="128px"
        />
      ) : (
        <CategoryPlaceholder
          category={categoryTitle}
          className="absolute inset-0"
          intensity="medium"
          iconVisible
        />
      )}
    </div>
  );
}

function CornerArrow() {
  return (
    <ArrowUpRight
      className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-accent transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0"
      aria-hidden="true"
    />
  );
}

// ─── Story card ────────────────────────────────────────────
function StoryCard({
  story,
  dotColor,
  t,
}: {
  story: Story;
  dotColor: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const heroSrc = story.heroImageUrl
    ? story.heroImageUrl
    : story.heroImage
    ? urlFor(story.heroImage).width(160).height(224).url()
    : null;

  const date = story.publishedAt || story._createdAt;

  return (
    <div className="flex gap-4 pl-8 relative">
      <div
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background",
          dotColor
        )}
        title={t("journal.story")}
      />
      <Link
        href={`/stories/${story.slug.current}`}
        className={cn(CARD_LINK_BASE, "border-accent/20 hover:border-accent/50")}
      >
        <CardThumb src={heroSrc} alt={story.heroImage?.alt || story.title} />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-accent/15 text-accent border border-accent/30">
                <PenLine className="w-2.5 h-2.5" strokeWidth={2.25} />
                {t("journal.story")}
              </span>
              {story.mediaType && (
                <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  {formatMediaType(story.mediaType)}
                </span>
              )}
            </div>
            <CornerArrow />
          </div>
          <h4 className="font-semibold text-base leading-snug text-foreground group-hover:text-accent transition-colors">
            {story.title}
          </h4>
          {story.excerpt && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {story.excerpt}
            </p>
          )}
          <CardMetaRow date={date} readingTime={story.readingTime} t={t} />
        </div>
      </Link>
    </div>
  );
}

// ─── Article card ──────────────────────────────────────────
const ARTICLE_FORMAT_LABELS: Record<string, string> = {
  "first-bite": "First Bite",
  "the-full-web": "The Full Web",
  "spin-the-block": "Spin the Block",
  "the-sinister-six": "The Sinister Six",
  "the-gauntlet": "The Gauntlet",
  versus: "Versus",
  "the-daily-bugle": "The Daily Bugle",
  "spida-sense": "Spida Sense",
  "the-web-sling": "The Web Sling",
  "state-of-the-game": "State of the Game",
  "the-rotation": "The Rotation",
  "one-year-later": "One Year Later",
};

function ArticleCard({
  article,
  dotColor,
  t,
}: {
  article: Article;
  dotColor: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const heroSrc = article.heroImageUrl
    ? article.heroImageUrl
    : article.heroImage
    ? urlFor(article.heroImage).width(128).height(180).url()
    : null;

  const date = article.publishedAt || article._createdAt;
  const catConfig = article.category ? getCategoryConfig(article.category.title) : null;
  const CatIcon = catConfig?.icon;
  const formatLabel = article.format ? ARTICLE_FORMAT_LABELS[article.format] || article.format : null;

  return (
    <div className="flex gap-4 pl-8 relative">
      <div
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background",
          dotColor
        )}
        title={t("journal.article")}
      />
      <Link
        href={`/articles/${article.slug.current}`}
        className={cn(CARD_LINK_BASE, "border-border hover:border-accent/40")}
      >
        <CardThumb
          src={heroSrc}
          alt={article.heroImage?.alt || article.title}
          categoryTitle={article.category?.title}
        />
        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {article.category && catConfig && CatIcon && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border",
                    catConfig.pill
                  )}
                >
                  <CatIcon className="w-2.5 h-2.5" strokeWidth={2} />
                  {article.category.title}
                </span>
              )}
              {formatLabel && (
                <span className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                  {formatLabel}
                </span>
              )}
            </div>
            <CornerArrow />
          </div>
          <h4 className="font-semibold text-base leading-snug text-foreground group-hover:text-accent transition-colors">
            {article.title}
          </h4>
          {article.excerpt && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <CardMetaRow date={date} readingTime={article.readingTime} t={t} />
        </div>
      </Link>
    </div>
  );
}
