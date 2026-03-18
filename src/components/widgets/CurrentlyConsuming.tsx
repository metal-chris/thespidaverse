import Image from "next/image";
import type { CurrentlyConsuming } from "@/types";
import { NowPlaying } from "./NowPlaying";

const MEDIA_ICONS: Record<string, string> = {
  watching: "📺",
  playing: "🎮",
  reading: "📖",
  listening: "🎧",
};

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
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
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
    <section className={className} aria-label="Currently consuming">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-accent">///</span> Currently Consuming
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <p className="text-sm text-muted-foreground italic">Nothing tracked right now. Check back later!</p>
      )}
    </section>
  );
}
