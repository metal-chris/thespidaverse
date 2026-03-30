import Image from "next/image";
import type { CurrentlyConsuming } from "@/types";
import { NowPlaying } from "./NowPlaying";

const MEDIA_ICONS: Record<string, string> = {
  watching: "📺",
  playing: "🎮",
  reading: "📖",
  listening: "🎧",
};

/** Capitalize known abbreviations/terms for display */
const SUBTITLE_MAP: Record<string, string> = {
  tv: "TV",
  ps5: "PS5",
  ps4: "PS4",
  pc: "PC",
  xbox: "Xbox",
  switch: "Switch",
  manga: "Manga",
  anime: "Anime",
  movie: "Movie",
  music: "Music",
  podcast: "Podcast",
};

function capitalizeSubtitle(value: string): string {
  const lower = value.toLowerCase();
  if (SUBTITLE_MAP[lower]) return SUBTITLE_MAP[lower];
  // Title-case fallback: "some thing" → "Some Thing"
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ConsumingItemProps {
  label: string;
  title: string;
  imageUrl?: string;
  subtitle?: string;
  progress?: string;
}

function ConsumingItem({ label, title, imageUrl, subtitle, progress }: ConsumingItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      {imageUrl && (
        <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="48px" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          {MEDIA_ICONS[label] || ""} {label.charAt(0).toUpperCase() + label.slice(1)}
        </p>
        <p className="text-sm font-medium truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{capitalizeSubtitle(subtitle)}</p>}
        {progress && <p className="text-xs text-accent">{progress}</p>}
      </div>
    </div>
  );
}

interface CurrentlyConsumingWidgetProps {
  data: CurrentlyConsuming | null;
  className?: string;
}

export function CurrentlyConsumingWidget({ data, className = "" }: CurrentlyConsumingWidgetProps) {
  const hasAny = data?.watching || data?.playing || data?.reading || data?.listening;

  return (
    <section
      className={`relative rounded-xl border border-border/60 p-4 md:p-6 overflow-hidden ${className}`}
      aria-label="Currently consuming"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-card/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-accent/5 blur-3xl" aria-hidden="true" />

      <h2 className="relative text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-accent">///</span> Currently Consuming
      </h2>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data?.watching?.title && (
          <ConsumingItem
            label="watching"
            title={data.watching.title}
            imageUrl={data.watching.posterUrl}
            subtitle={data.watching.mediaType}
            progress={data.watching.progress}
          />
        )}
        {data?.playing?.title && (
          <ConsumingItem
            label="playing"
            title={data.playing.title}
            imageUrl={data.playing.coverUrl}
            subtitle={data.playing.platform}
            progress={data.playing.progress}
          />
        )}
        {data?.reading?.title && (
          <ConsumingItem
            label="reading"
            title={data.reading.title}
            imageUrl={data.reading.coverUrl}
            subtitle={data.reading.mediaType}
            progress={data.reading.progress}
          />
        )}
        {/* Spotify live widget */}
        {data?.listening?.useSpotifyLive ? (
          <NowPlaying />
        ) : data?.listening?.title ? (
          <ConsumingItem
            label="listening"
            title={data.listening.title}
            imageUrl={data.listening.coverUrl}
            subtitle={data.listening.artist}
          />
        ) : (
          <NowPlaying />
        )}
      </div>
      {!hasAny && (
        <p className="relative text-sm text-muted-foreground italic">Nothing tracked right now. Check back later!</p>
      )}
    </section>
  );
}
