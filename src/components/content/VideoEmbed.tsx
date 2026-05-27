"use client";

import { useMemo } from "react";
import type { VideoEmbed as VideoEmbedData } from "@/types";

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m?.[1] ?? null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] ?? null;
}

/**
 * Renders a video — YouTube/Vimeo via iframe, direct MP4/WebM via <video>.
 * Used for both heroVideo (rendered at the top of the article body) and
 * inline videoEmbed blocks in Portable Text.
 */
export function VideoEmbed({ provider, url, caption }: VideoEmbedData) {
  const embedUrl = useMemo(() => {
    if (provider === "youtube") {
      const id = youtubeId(url);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (provider === "vimeo") {
      const id = vimeoId(url);
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  }, [provider, url]);

  return (
    <figure className="my-8 mx-auto max-w-[800px] not-prose">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black ring-1 ring-border">
        {provider === "mp4" ? (
          <video
            src={url}
            controls
            preload="metadata"
            className="w-full h-full"
            playsInline
          />
        ) : embedUrl ? (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={caption || "Embedded video"}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
            Couldn&apos;t parse {provider} URL: {url}
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
