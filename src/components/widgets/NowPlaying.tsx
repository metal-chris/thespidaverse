"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { SpotifyNowPlaying } from "@/types";

export function NowPlaying() {
  const [data, setData] = useState<SpotifyNowPlaying | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchNowPlaying() {
      try {
        const res = await fetch("/api/spotify/now-playing");
        if (res.ok && mounted) {
          setData(await res.json());
        }
      } catch {
        // Silently fail
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000); // Poll every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!data || (!data.title && !data.isPlaying)) return null;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
      {data.albumArtUrl && (
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={data.albumArtUrl}
            alt={data.title || "Album art"}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {data.isPlaying && (
            <span className="flex gap-0.5 items-end h-3" aria-label="Now playing">
              <span className="w-0.5 bg-accent rounded-full animate-now-playing-1 h-2" />
              <span className="w-0.5 bg-accent rounded-full animate-now-playing-2 h-3" />
              <span className="w-0.5 bg-accent rounded-full animate-now-playing-3 h-1.5" />
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {data.isPlaying ? "Now Playing" : "Last Played"}
          </span>
        </div>
        <p className="text-sm font-medium truncate">
          {data.spotifyUrl ? (
            <a href={data.spotifyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              {data.title}
            </a>
          ) : (
            data.title
          )}
        </p>
        {data.artist && <p className="text-xs text-muted-foreground truncate">{data.artist}</p>}
      </div>
    </div>
  );
}
