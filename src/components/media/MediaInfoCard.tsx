"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MediaInfo {
  title?: string;
  coverUrl?: string;
  posterUrl?: string;
  albumArtUrl?: string;
  releaseDate?: string;
  genres?: string[];
  averageScore?: number;
  runtime?: number;
  episodes?: number;
  chapters?: number;
  studio?: string;
  director?: string;
  developers?: string[];
  artists?: string[];
  platforms?: string[];
  synopsis?: string;
  description?: string;
  overview?: string;
  spotifyUrl?: string;
  mediaType?: string;
}

interface MediaInfoCardProps {
  externalId: string;
  source: "tmdb" | "igdb" | "spotify" | "anilist";
  mediaType?: string;
  className?: string;
}

function getApiUrl(source: string, externalId: string, mediaType?: string) {
  switch (source) {
    case "tmdb":
      return `/api/tmdb/${externalId}?type=${mediaType === "tv" ? "tv" : "movie"}`;
    case "igdb":
      return `/api/igdb/${externalId}`;
    case "spotify":
      return `/api/spotify/album/${externalId}`;
    case "anilist":
      return `/api/anilist/${externalId}?type=${mediaType === "manga" ? "MANGA" : "ANIME"}`;
    default:
      return null;
  }
}

const SOURCE_LABELS: Record<string, string> = {
  tmdb: "TMDB",
  igdb: "IGDB",
  spotify: "Spotify",
  anilist: "AniList",
};

export function MediaInfoCard({ externalId, source, mediaType, className = "" }: MediaInfoCardProps) {
  const [data, setData] = useState<MediaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = getApiUrl(source, externalId, mediaType);
    if (!url) {
      setLoading(false);
      return;
    }

    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [source, externalId, mediaType]);

  if (loading) {
    return (
      <div className={`rounded-lg bg-muted/50 p-4 animate-pulse ${className}`}>
        <div className="aspect-[2/3] w-full rounded bg-muted mb-3" />
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </div>
    );
  }

  if (!data) return null;

  const imageUrl = data.coverUrl || data.posterUrl || data.albumArtUrl || null;
  const description = data.synopsis || data.description || data.overview || null;

  return (
    <aside className={`rounded-lg border border-border bg-card p-4 ${className}`} aria-label="Media info">
      {imageUrl && (
        <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden mb-4">
          <Image
            src={imageUrl}
            alt={data.title || "Media poster"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      )}

      <div className="space-y-2">
        {data.title && <h3 className="font-bold text-lg leading-tight">{data.title}</h3>}

        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          via {SOURCE_LABELS[source] || source}
        </p>

        {data.releaseDate && (
          <p className="text-sm text-muted-foreground">
            {data.releaseDate.slice(0, 4)}
          </p>
        )}

        {data.genres && data.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {data.genres.slice(0, 4).map((g) => (
              <span key={g} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        )}

        {data.averageScore != null && (
          <p className="text-sm">
            <span className="font-semibold text-accent">{data.averageScore}</span>
            <span className="text-muted-foreground">/100</span>
          </p>
        )}

        {data.studio && <p className="text-sm text-muted-foreground">{data.studio}</p>}
        {data.director && <p className="text-sm text-muted-foreground">Dir: {data.director}</p>}
        {data.developers && data.developers.length > 0 && (
          <p className="text-sm text-muted-foreground">Dev: {data.developers.join(", ")}</p>
        )}
        {data.artists && data.artists.length > 0 && (
          <p className="text-sm text-muted-foreground">{data.artists.join(", ")}</p>
        )}
        {data.platforms && data.platforms.length > 0 && (
          <p className="text-sm text-muted-foreground">{data.platforms.join(", ")}</p>
        )}

        {data.episodes && <p className="text-sm text-muted-foreground">{data.episodes} episodes</p>}
        {data.chapters && <p className="text-sm text-muted-foreground">{data.chapters} chapters</p>}
        {data.runtime && <p className="text-sm text-muted-foreground">{data.runtime} min</p>}

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-4 mt-2">{description}</p>
        )}

        {data.spotifyUrl && (
          <a
            href={data.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-accent hover:text-accent-hover"
          >
            Listen on Spotify
          </a>
        )}
      </div>
    </aside>
  );
}
