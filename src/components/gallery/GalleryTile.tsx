"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { GalleryPiece } from "@/types";

const FRANCHISE_STYLES: Record<string, { bg: string; text: string }> = {
  "spider-verse": { bg: "bg-red-500/80", text: "text-white" },
  venom: { bg: "bg-neutral-700/80", text: "text-white" },
  anime: { bg: "bg-pink-500/80", text: "text-white" },
  games: { bg: "bg-blue-500/80", text: "text-white" },
  music: { bg: "bg-purple-500/80", text: "text-white" },
  other: { bg: "bg-accent/80", text: "text-white" },
};

const FRANCHISE_LABELS: Record<string, string> = {
  "spider-verse": "Spider-Verse",
  venom: "Venom",
  anime: "Anime",
  games: "Games",
  music: "Music",
  other: "Other",
};

interface GalleryTileProps {
  piece: GalleryPiece;
  onClick: () => void;
}

function getYouTubeId(url: string): string | null {
  const shorts = url.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shorts) return shorts[1];
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watch) return watch[1];
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (short) return short[1];
  return null;
}

function safeUrl(url: string | undefined | null): string {
  if (!url || url.length < 10) return "";
  return url;
}

function getImageUrl(piece: GalleryPiece): string {
  if (piece.pieceType === "image") {
    const firstImage = piece.images?.[0] || piece.image;
    return safeUrl(piece.imageUrl) || (firstImage ? safeUrl(urlFor(firstImage).width(600).url()) : "") || "";
  }
  // Video thumbnail: Sanity thumbnail → YouTube auto-thumbnail → empty
  if (piece.videoThumbnailUrl) return safeUrl(piece.videoThumbnailUrl);
  if (piece.videoThumbnail) return safeUrl(urlFor(piece.videoThumbnail).width(600).url());
  // YouTube auto-thumbnail
  if (piece.videoUrl) {
    const ytId = getYouTubeId(piece.videoUrl);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return "";
}

function getCarouselCount(piece: GalleryPiece): number {
  if (piece.images?.length) return piece.images.length;
  if (piece.imageUrls?.length) return piece.imageUrls.length;
  return 0;
}

/** Extract aspect ratio from URL params for CLS prevention */
function getAspectFromUrl(url: string): string | undefined {
  const wMatch = url.match(/[?&]w=(\d+)/);
  const hMatch = url.match(/[?&]h=(\d+)/);
  if (wMatch && hMatch) {
    return `${wMatch[1]} / ${hMatch[1]}`;
  }
  return undefined;
}

export function GalleryTile({ piece, onClick }: GalleryTileProps) {
  const imageUrl = getImageUrl(piece);
  const altText = piece.image?.alt || piece.videoThumbnail?.alt || piece.title;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showPlaceholder = !imageUrl || imgError;
  const aspect = imageUrl ? getAspectFromUrl(imageUrl) : undefined;
  const franchiseStyle = FRANCHISE_STYLES[piece.franchise] || FRANCHISE_STYLES.other;
  const carouselCount = getCarouselCount(piece);

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-xl overflow-hidden border border-border bg-card transition-[box-shadow,border-color] duration-300 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`View "${piece.title}" by ${piece.artistName}`}
    >
      {!showPlaceholder ? (
        <div className="relative" style={aspect ? { aspectRatio: aspect } : undefined}>
          {!imgLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <Image
            src={imageUrl}
            alt={altText}
            width={600}
            height={0}
            className={`w-full h-auto object-cover !transition-none ${
              imgLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={aspect ? { aspectRatio: aspect } : { minHeight: "120px" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/20" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )}

      {/* Hover overlay — lighter on top, darker at bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Carousel indicator — top-right */}
      {carouselCount > 1 && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-black/60 text-white backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <rect x="6" y="6" width="20" height="20" rx="2" opacity="0.5" />
            </svg>
            {carouselCount}
          </span>
        </div>
      )}

      {/* Video play icon overlay */}
      {piece.pieceType === "video" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover:bg-accent/80 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white ml-0.5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Franchise badge — top-left, always visible */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${franchiseStyle.bg} ${franchiseStyle.text}`}>
          {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
        </span>
      </div>

      {/* Slide-up hover bar — title + artist */}
      <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 bg-black/50 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white text-xs font-bold truncate">{piece.title}</p>
        <p className="text-white/70 text-[11px] truncate mt-0.5">by {piece.artistName}</p>
      </div>
    </button>
  );
}
