"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { VideoEmbed } from "./VideoEmbed";
import { CollapsibleActions } from "@/components/ui/CollapsibleActions";
import type { GalleryPiece } from "@/types";

// ── Helpers ──────────────────────────────────────────────

const FRANCHISE_LABELS: Record<string, string> = {
  "spider-verse": "Spider-Verse",
  venom: "Venom",
  anime: "Anime",
  games: "Games",
  music: "Music",
  other: "Other",
};

function parseDimensions(ref?: string): { w: number; h: number } | null {
  if (!ref) return null;
  const m = ref.match(/-(\d+)x(\d+)-/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

function getAllImages(piece: GalleryPiece): { url: string; dims: { width: number; height: number }; alt: string }[] {
  if (piece.imageUrls?.length) {
    return piece.imageUrls.map((url, i) => ({
      url,
      dims: { width: 1200, height: 800 },
      alt: `${piece.title} (${i + 1})`,
    }));
  }
  if (piece.images?.length) {
    return piece.images.map((img, i) => {
      const dims = parseDimensions(img.asset._ref);
      const w = dims ? Math.min(dims.w, 2400) : 1200;
      return {
        url: urlFor(img).width(w).url() || "",
        dims: dims ? { width: dims.w, height: dims.h } : { width: 1200, height: 800 },
        alt: img.alt || `${piece.title} (${i + 1})`,
      };
    });
  }
  if (piece.imageUrl) {
    return [{ url: piece.imageUrl, dims: { width: 1200, height: 800 }, alt: piece.title }];
  }
  if (piece.image) {
    const dims = parseDimensions(piece.image.asset._ref);
    const w = dims ? Math.min(dims.w, 2400) : 1200;
    return [{
      url: urlFor(piece.image).width(w).url() || "",
      dims: dims ? { width: dims.w, height: dims.h } : { width: 1200, height: 800 },
      alt: piece.image.alt || piece.title,
    }];
  }
  return [];
}

function isInstagramSource(piece: GalleryPiece): boolean {
  return !!(
    piece.originalUrl?.includes("instagram.com") ||
    piece.videoUrl?.includes("instagram.com")
  );
}

function getInstagramEmbedUrl(piece: GalleryPiece): string | null {
  const url = piece.videoUrl || piece.originalUrl || "";
  const match = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
}

// ── Component ────────────────────────────────────────────

interface GalleryModalProps {
  piece: GalleryPiece;
  pieces: GalleryPiece[];
  onClose: () => void;
  onNavigate: (piece: GalleryPiece) => void;
}

export function GalleryModal({ piece, pieces, onClose, onNavigate }: GalleryModalProps) {
  const currentIndex = pieces.findIndex((p) => p._id === piece._id);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < pieces.length - 1;

  // Carousel state for multi-image pieces
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Reset carousel + iframe state when piece changes
  useEffect(() => {
    setCarouselIndex(0);
    setIframeLoaded(false);
  }, [piece._id]);

  // Share URL (built client-side)
  const [shareUrl, setShareUrl] = useState(`/gallery?piece=${piece.slug.current}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/gallery?piece=${piece.slug.current}`);
  }, [piece.slug]);

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard: Escape, ArrowLeft, ArrowRight
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && canGoPrev) {
      onNavigate(pieces[currentIndex - 1]);
    }
    if ((e.key === "ArrowRight" || e.key === "ArrowDown") && canGoNext) {
      onNavigate(pieces[currentIndex + 1]);
    }
  }, [onClose, onNavigate, pieces, currentIndex, canGoPrev, canGoNext]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Determine content type
  const isIG = isInstagramSource(piece);
  const igEmbedUrl = isIG ? getInstagramEmbedUrl(piece) : null;
  const isVideo = piece.pieceType === "video" && piece.videoUrl && !isIG;
  const isImage = piece.pieceType === "image" && !isIG;

  const images = isImage ? getAllImages(piece) : [];
  const isCarousel = images.length > 1;
  const currentImage = images[carouselIndex] || images[0];

  // Modal width adapts to content type
  const panelMaxW = isIG ? "max-w-lg" : isVideo ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-[60] gallery-modal-backdrop" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

      {/* Prev/Next arrows — outside the panel */}
      {canGoPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(pieces[currentIndex - 1]); }}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-[61] w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-card transition-colors"
          aria-label="Previous piece"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      {canGoNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(pieces[currentIndex + 1]); }}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-[61] w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-card transition-colors"
          aria-label="Next piece"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Modal panel */}
      <div
        className={`absolute inset-2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 ${panelMaxW} md:w-[95vw] md:max-h-[90vh] overflow-y-auto z-[60] rounded-xl bg-card border border-border shadow-2xl gallery-modal-panel`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: close + counter */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur-sm border-b border-border/50">
          <span className="text-xs text-muted-foreground font-mono">
            {currentIndex + 1} / {pieces.length}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content area */}
        <div className="p-4">
          {/* ── Instagram embed ── */}
          {isIG && igEmbedUrl && (
            <div className="relative w-full" style={{ minHeight: 480 }}>
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg animate-pulse">
                  <span className="text-muted-foreground text-sm">Loading embed...</span>
                </div>
              )}
              <iframe
                src={igEmbedUrl}
                className="w-full rounded-lg"
                style={{ border: "none", minHeight: 480, height: iframeLoaded ? 800 : 480 }}
                allowFullScreen
                title={`Instagram: ${piece.title}`}
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          )}

          {/* ── YouTube / TikTok video ── */}
          {isVideo && piece.videoUrl && (
            <VideoEmbed videoUrl={piece.videoUrl} videoPlatform={piece.videoPlatform} />
          )}

          {/* ── Sanity image (with carousel) ── */}
          {isImage && currentImage && (
            <div className="relative flex items-center justify-center">
              <Image
                key={currentImage.url}
                src={currentImage.url}
                alt={currentImage.alt}
                width={currentImage.dims.width}
                height={currentImage.dims.height}
                className="max-w-full h-auto rounded-lg object-contain"
                sizes="(max-width: 768px) 95vw, 640px"
                priority
                unoptimized
              />

              {/* Carousel arrows */}
              {isCarousel && (
                <>
                  <button
                    onClick={() => setCarouselIndex((i) => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
                    disabled={carouselIndex === 0}
                    aria-label="Previous image"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCarouselIndex((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
                    disabled={carouselIndex === images.length - 1}
                    aria-label="Next image"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Carousel dots */}
              {isCarousel && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === carouselIndex ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Image ${i + 1} of ${images.length}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── No content fallback ── */}
          {!isIG && !isVideo && !isImage && (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No media available</p>
            </div>
          )}
        </div>

        {/* Details panel — adaptive based on content type */}
        <div className="px-4 pb-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-lg font-bold">{piece.title}</h2>
              <p className="text-sm text-muted-foreground">
                by{" "}
                {piece.artistUrl ? (
                  <a href={piece.artistUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {piece.artistName}
                  </a>
                ) : (
                  <span className="text-foreground">{piece.artistName}</span>
                )}
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20 flex-shrink-0">
              {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
            </span>
          </div>

          {piece.description && !isIG && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{piece.description}</p>
          )}

          <CollapsibleActions
            slug={`gallery-${piece.slug.current}`}
            title={piece.title}
            shareUrl={shareUrl}
            originalUrl={piece.originalUrl}
          />
        </div>
      </div>
    </div>
  );
}
