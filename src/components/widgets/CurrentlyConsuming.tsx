"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CurrentlyConsuming } from "@/types";

const MEDIA_ICONS: Record<string, string> = {
  watching: "📺",
  playing: "🎮",
  reading: "📖",
  listening: "🎧",
};

const SUBTITLE_MAP: Record<string, string> = {
  tv: "TV",
  ps5: "PS5",
  ps4: "PS4",
  pc: "PC",
  xbox: "Xbox",
  switch: "Switch",
  manga: "Manga",
  anime: "Anime",
  books: "Books",
  comic: "Comic",
  movie: "Movie",
  music: "Music",
  podcast: "Podcast",
  steam: "Steam",
};

function capitalizeSubtitle(value: string): string {
  const lower = value.toLowerCase();
  if (SUBTITLE_MAP[lower]) return SUBTITLE_MAP[lower];
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

function NowPlayingBars({ liveLabel }: { liveLabel: string }) {
  return (
    <span className="flex gap-0.5 items-end h-3" aria-label={liveLabel}>
      <span className="w-0.5 bg-accent rounded-full animate-now-playing-1 h-2" />
      <span className="w-0.5 bg-accent rounded-full animate-now-playing-2 h-3" />
      <span className="w-0.5 bg-accent rounded-full animate-now-playing-3 h-1.5" />
    </span>
  );
}

interface ConsumingItemProps {
  label: string;
  title: string;
  imageUrl?: string;
  subtitle?: string;
  progress?: string;
  isLive?: boolean;
  href?: string;
  statusText: string;
  liveLabel: string;
}

function ConsumingItem({ label, title, imageUrl, subtitle, progress, isLive, href, statusText, liveLabel }: ConsumingItemProps) {
  const isListeningLive = label === "listening" && isLive;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      {imageUrl && (
        <div className={`relative ${label === "listening" ? "w-12 h-12" : "w-12 h-16"} rounded overflow-hidden flex-shrink-0`}>
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="48px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isListeningLive && <NowPlayingBars liveLabel={liveLabel} />}
          <p className="text-xs text-muted-foreground">
            {MEDIA_ICONS[label] || ""}{" "}
            {statusText}
          </p>
        </div>
        <p className="text-sm font-medium truncate">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{capitalizeSubtitle(subtitle)}</p>}
        {progress && <p className="text-xs text-accent">{progress}</p>}
      </div>
    </div>
  );
}

function getConsumingStatusText(
  t: ReturnType<typeof useTranslations>,
  label: string,
  isLive?: boolean,
): string {
  if (isLive) {
    if (label === "listening") return t("consuming.nowPlaying");
    if (label === "watching") return t("consuming.watchingNow");
    return t("consuming.playingNow");
  }
  if (label === "listening") return t("consuming.lastPlayed");
  if (label === "watching") return t("consuming.recentlyWatched");
  if (label === "playing") return t("consuming.lastPlayed");
  return t("consuming.reading");
}

interface CurrentlyConsumingWidgetProps {
  data?: CurrentlyConsuming | null;
  className?: string;
}

export function CurrentlyConsumingWidget({ data: initialData, className = "" }: CurrentlyConsumingWidgetProps) {
  const t = useTranslations();
  const [data, setData] = useState<CurrentlyConsuming | null>(initialData ?? null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const res = await fetch("/api/currently-consuming");
        if (res.ok && mounted) {
          setData(await res.json());
        }
      } catch {
        // Keep existing data on error
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const hasAny = data?.watching || data?.playing || data?.reading || data?.listening;
  const liveLabel = t("consuming.live");

  return (
    <section
      className={`relative rounded-xl border border-border/60 p-4 md:p-6 overflow-hidden ${className}`}
      aria-label={t("consuming.heading")}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl" aria-hidden="true" />

      <h2 className="relative text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-accent">///</span> {t("consuming.heading")}
      </h2>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data?.watching?.title && (
          <ConsumingItem
            label="watching"
            title={data.watching.title}
            imageUrl={data.watching.posterUrl}
            subtitle={data.watching.mediaType}
            progress={data.watching.progress}
            isLive={data.watching.isLive}
            statusText={getConsumingStatusText(t, "watching", data.watching.isLive)}
            liveLabel={liveLabel}
          />
        )}
        {data?.playing?.title && (
          <ConsumingItem
            label="playing"
            title={data.playing.title}
            imageUrl={data.playing.coverUrl}
            subtitle={data.playing.platform}
            progress={data.playing.progress}
            isLive={data.playing.isLive}
            statusText={getConsumingStatusText(t, "playing", data.playing.isLive)}
            liveLabel={liveLabel}
          />
        )}
        {data?.reading?.title && (
          <ConsumingItem
            label="reading"
            title={data.reading.title}
            imageUrl={data.reading.coverUrl}
            subtitle={data.reading.mediaType}
            progress={data.reading.progress}
            statusText={getConsumingStatusText(t, "reading")}
            liveLabel={liveLabel}
          />
        )}
        {data?.listening?.title && (
          <ConsumingItem
            label="listening"
            title={data.listening.title}
            imageUrl={data.listening.coverUrl}
            subtitle={data.listening.artist}
            isLive={data.listening.isPlaying}
            href={data.listening.spotifyUrl}
            statusText={getConsumingStatusText(t, "listening", data.listening.isPlaying)}
            liveLabel={liveLabel}
          />
        )}
      </div>
      {!hasAny && (
        <p className="relative text-sm text-muted-foreground italic">{t("consuming.nothingTracked")}</p>
      )}
    </section>
  );
}
