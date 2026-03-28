"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { CollapsibleActions } from "./CollapsibleActions";
import { VideoEmbed } from "./VideoEmbed";
import { useGalleryNavigation } from "@/hooks/useGalleryNavigation";
import type { GalleryPiece } from "@/types";

const FRANCHISE_LABELS: Record<string, string> = {
  "spider-verse": "Spider-Verse",
  venom: "Venom",
  anime: "Anime",
  games: "Games",
  music: "Music",
  other: "Other",
};

function frameNumber(index: number): string {
  const base = Math.floor(index / 2) + 1;
  const suffix = index % 2 === 1 ? "A" : "";
  return `${base}${suffix}`;
}

/** Parse width×height from a Sanity asset _ref like "image-abc123-1200x630-jpg" */
function parseDimensions(ref?: string): { w: number; h: number } | null {
  if (!ref) return null;
  const m = ref.match(/-(\d+)x(\d+)-/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

function getThumbnailUrl(piece: GalleryPiece): string {
  if (piece.pieceType === "image") {
    return piece.imageUrl || (piece.image ? urlFor(piece.image).width(150).url() : "") || "";
  }
  return piece.videoThumbnailUrl || (piece.videoThumbnail ? urlFor(piece.videoThumbnail).width(150).url() : "") || "";
}

function getFullImageUrl(piece: GalleryPiece): string {
  if (piece.imageUrl) return piece.imageUrl;
  if (!piece.image) return "";
  const dims = parseDimensions(piece.image.asset._ref);
  // Request at natural width, capped at 2400px for perf
  const w = dims ? Math.min(dims.w, 2400) : 1200;
  return urlFor(piece.image).width(w).url() || "";
}

function getImageDimensions(piece: GalleryPiece): { width: number; height: number } {
  const dims = parseDimensions(piece.image?.asset._ref);
  return dims ? { width: dims.w, height: dims.h } : { width: 1200, height: 800 };
}

interface GalleryViewerProps {
  initialPiece: GalleryPiece;
  pieces: GalleryPiece[];
}

export function GalleryViewer({ initialPiece, pieces }: GalleryViewerProps) {
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);

  const initialIndex = pieces.findIndex((p) => p._id === initialPiece._id);

  const {
    activeIndex,
    direction,
    isAnimating,
    swipeProgress,
    goTo,
    containerRef,
  } = useGalleryNavigation({
    totalPieces: pieces.length,
    initialIndex: Math.max(0, initialIndex),
    animationDuration: 300,
    cooldownDuration: 80,
    wheelThreshold: 60,
    swipeThreshold: 50,
  });

  const activePiece = pieces[activeIndex];
  const imageUrl = getFullImageUrl(activePiece);
  const imageDims = getImageDimensions(activePiece);
  const isPortrait = imageDims.height > imageDims.width;

  // Track if user has interacted (hides the swipe hint)
  const [hasInteracted, setHasInteracted] = useState(false);

  // Share URL — built client-side to avoid hydration mismatch
  const [shareUrl, setShareUrl] = useState(`/gallery?piece=${activePiece.slug.current}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/gallery?piece=${activePiece.slug.current}`);
  }, [activePiece.slug]);

  // Update URL for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("piece", activePiece.slug.current);
    window.history.replaceState(null, "", url.toString());
  }, [activePiece.slug]);

  // Hide hint on first navigation
  useEffect(() => {
    if (activeIndex !== Math.max(0, initialIndex)) {
      setHasInteracted(true);
    }
  }, [activeIndex, initialIndex]);

  // Escape to go back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/gallery");
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [router]);

  // Sync film strip position to active index
  useEffect(() => {
    if (!stripRef.current) return;
    const el = stripRef.current.querySelector(
      `[data-piece-id="${activePiece._id}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: isAnimating ? "smooth" : "auto", block: "center", inline: "center" });
    }
  }, [activeIndex, activePiece._id, isAnimating]);

  // Handle thumbnail tap (mobile) — navigate to that piece
  const handleThumbTap = useCallback((index: number) => {
    setHasInteracted(true);
    goTo(index);
  }, [goTo]);

  // Transition class for the main image
  const transitionClass = isAnimating
    ? direction === "next"
      ? "gallery-piece-enter-next"
      : "gallery-piece-enter-prev"
    : "gallery-piece-active";

  // Swipe-follow transform — moves image with finger during drag
  const swipeTransform = !isAnimating && Math.abs(swipeProgress) > 0
    ? `translateY(${-swipeProgress * 30}px) scale(${1 - Math.abs(swipeProgress) * 0.02})`
    : undefined;

  return (
    <div ref={containerRef} className="gallery-viewer">
      {/* ── Back button ── */}
      <button
        onClick={() => router.push("/gallery")}
        className="gallery-viewer-back"
        aria-label="Back to gallery"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline text-sm">Gallery</span>
      </button>

      {/* ── Swipe hint (mobile only, first visit) ── */}
      {!hasInteracted && (
        <div className="gallery-swipe-hint">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Swipe to browse
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="gallery-viewer-content">
        <div className="gallery-viewer-main">
          {/* ── Image with transition + swipe follow ── */}
          <div className="gallery-viewer-media">
            <div
              key={activePiece._id}
              className={`gallery-piece-wrapper ${transitionClass}`}
              style={swipeTransform ? { transform: swipeTransform } : undefined}
            >
              {activePiece.pieceType === "image" && imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={activePiece.image?.alt || activePiece.title}
                  width={imageDims.width}
                  height={imageDims.height}
                  className={`max-h-full max-w-full object-contain ${isPortrait ? "gallery-media-portrait" : ""}`}
                  sizes={isPortrait ? "(max-width: 768px) 90vw, 50vw" : "(max-width: 768px) 100vw, 75vw"}
                  priority
                  unoptimized
                />
              ) : activePiece.pieceType === "video" && activePiece.videoUrl ? (
                <div className="gallery-video-container">
                  <VideoEmbed videoUrl={activePiece.videoUrl} videoPlatform={activePiece.videoPlatform} />
                </div>
              ) : (
                <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center max-w-2xl">
                  <p className="text-muted-foreground">No media available</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Details bar ── */}
          <div className="gallery-viewer-details">
            <div
              key={`details-${activePiece._id}`}
              className={`gallery-details-inner ${isAnimating ? "gallery-details-fade" : "gallery-details-visible"}`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <h1 className="text-lg md:text-xl font-bold truncate">{activePiece.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    by{" "}
                    {activePiece.artistUrl ? (
                      <a
                        href={activePiece.artistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {activePiece.artistName}
                      </a>
                    ) : (
                      <span className="text-foreground">{activePiece.artistName}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20">
                    {FRANCHISE_LABELS[activePiece.franchise] || activePiece.franchise}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeIndex + 1} / {pieces.length}
                  </span>
                </div>
              </div>

              {activePiece.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{activePiece.description}</p>
              )}

              <CollapsibleActions
                slug={`gallery-${activePiece.slug.current}`}
                title={activePiece.title}
                shareUrl={shareUrl}
                originalUrl={activePiece.originalUrl}
              />
            </div>
          </div>
        </div>

        {/* ── Film Strip — interactive on mobile, passive on desktop ── */}
        <div
          className="gallery-viewer-strip"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <span className="film-stock-label" aria-hidden="true">
            Parker TX 35mm
          </span>

          <div
            ref={stripRef}
            className="gallery-viewer-strip-scroll"
            role="navigation"
            aria-label="Gallery film strip"
          >
            {/* Top/left spacer */}
            <div className="gallery-viewer-snap-spacer" aria-hidden="true" />

            {pieces.map((piece, i) => {
              const isActive = piece._id === activePiece._id;
              const thumbUrl = getThumbnailUrl(piece);

              return (
                <div
                  key={piece._id}
                  data-piece-id={piece._id}
                  className={`film-frame ${isActive ? "film-frame-active" : ""}`}
                >
                  <div className="film-frame-number" aria-hidden="true">
                    {frameNumber(i)}
                  </div>

                  <button
                    className="film-frame-thumb"
                    aria-label={`${piece.title} by ${piece.artistName}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => handleThumbTap(i)}
                  >
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="88px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}

                    {piece.pieceType === "video" && (
                      <div className="film-frame-video-badge">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-white drop-shadow-md"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            {/* Bottom/right spacer */}
            <div className="gallery-viewer-snap-spacer" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
