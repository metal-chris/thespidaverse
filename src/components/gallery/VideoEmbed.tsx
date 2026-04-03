"use client";

import type { VideoPlatform } from "@/types";

interface VideoEmbedProps {
  videoUrl: string;
  videoPlatform?: VideoPlatform;
  className?: string;
}

function detectPlatform(url: string): VideoPlatform | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  return null;
}

function getYouTubeId(url: string): string | null {
  // youtube.com/shorts/ID
  const shortsMatch = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
}

function getTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

function getInstagramPath(url: string): string | null {
  // Match /p/SHORTCODE/ or /reel/SHORTCODE/
  const match = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? `${match[1]}/${match[2]}` : null;
}

export function VideoEmbed({ videoUrl, videoPlatform, className = "" }: VideoEmbedProps) {
  const platform = videoPlatform || detectPlatform(videoUrl);

  if (platform === "youtube") {
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) return <FallbackLink url={videoUrl} label="Watch on YouTube" />;

    // Landscape: fill available width, cap height to 80vh so it doesn't
    // overflow on ultra-wide monitors while still being large on standard ones
    return (
      <div className={`w-full mx-auto ${className}`} style={{ maxHeight: "80vh" }}>
        <div className="aspect-video w-full" style={{ maxHeight: "80vh" }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video"
          />
        </div>
      </div>
    );
  }

  if (platform === "tiktok") {
    const videoId = getTikTokId(videoUrl);
    if (!videoId) return <FallbackLink url={videoUrl} label="Watch on TikTok" />;

    // Portrait: cap width so it doesn't stretch absurdly wide, center it
    return (
      <div className={`max-w-sm mx-auto ${className}`}>
        <div className="aspect-[9/16] max-h-[80vh] w-full">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            className="w-full h-full rounded-lg"
            allowFullScreen
            title="TikTok video"
          />
        </div>
      </div>
    );
  }

  if (platform === "instagram") {
    const igPath = getInstagramPath(videoUrl);
    if (!igPath) return <FallbackLink url={videoUrl} label="Watch on Instagram" />;

    // Portrait: same treatment as TikTok
    return (
      <div className={`max-w-sm mx-auto ${className}`}>
        <div className="aspect-[9/16] max-h-[80vh] w-full">
          <iframe
            src={`https://www.instagram.com/${igPath}/embed/`}
            className="w-full h-full rounded-lg bg-neutral-900"
            allowFullScreen
            title="Instagram embed"
            style={{ border: "none", overflow: "hidden" }}
          />
        </div>
      </div>
    );
  }

  // Unknown platform — fallback to link
  return <FallbackLink url={videoUrl} label="Watch Video" />;
}

function FallbackLink({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-accent text-background font-medium hover:bg-accent-hover transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      {label}
    </a>
  );
}
