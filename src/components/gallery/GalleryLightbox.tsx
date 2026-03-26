"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { ShareBar } from "@/components/content/ShareBar";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { VideoEmbed } from "./VideoEmbed";
import { FilmStrip } from "./FilmStrip";
import type { GalleryPiece } from "@/types";

const FRANCHISE_LABELS: Record<string, string> = {
  "spider-verse": "Spider-Verse",
  venom: "Venom",
  anime: "Anime",
  games: "Games",
  music: "Music",
  other: "Other",
};

interface GalleryLightboxProps {
  piece: GalleryPiece;
  pieces: GalleryPiece[];
  onClose: () => void;
  onNavigate: (piece: GalleryPiece) => void;
}

export function GalleryLightbox({ piece, pieces, onClose, onNavigate }: GalleryLightboxProps) {
  const currentIndex = pieces.findIndex((p) => p._id === piece._id);
  const prevPiece = currentIndex > 0 ? pieces[currentIndex - 1] : null;
  const nextPiece = currentIndex < pieces.length - 1 ? pieces[currentIndex + 1] : null;

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/gallery?piece=${piece.slug.current}`
    : `/gallery?piece=${piece.slug.current}`;

  // Keyboard navigation — arrows + escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Left/Up = prev, Right/Down = next
      if ((e.key === "ArrowLeft" || e.key === "ArrowUp") && prevPiece) onNavigate(prevPiece);
      if ((e.key === "ArrowRight" || e.key === "ArrowDown") && nextPiece) onNavigate(nextPiece);
    },
    [onClose, onNavigate, prevPiece, nextPiece]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  // Update URL for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("piece", piece.slug.current);
    window.history.replaceState(null, "", url.toString());
    return () => {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("piece");
      window.history.replaceState(null, "", cleanUrl.toString());
    };
  }, [piece.slug]);

  const imageUrl = piece.imageUrl || (piece.image ? urlFor(piece.image).width(1200).url() : "") || "";

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label={piece.title}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ── Content wrapper ── */}
      <div className="relative h-full flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>

        {/* ══════ MOBILE LAYOUT (stacked) ══════ */}
        {/* Image → Info → Horizontal Film Strip */}

        {/* ══════ DESKTOP LAYOUT (3 columns) ══════ */}
        {/* Image (55%) │ Info (30%) │ Film Strip (15%) */}

        {/* ── Column 1: Media ── */}
        <div className="relative flex-1 min-h-0 max-h-[50vh] md:max-h-none flex items-center justify-center p-4 pt-14 md:pt-4">
          {/* Navigation arrows */}
          {prevPiece && (
            <button
              onClick={() => onNavigate(prevPiece)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous piece"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {nextPiece && (
            <button
              onClick={() => onNavigate(nextPiece)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Next piece"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Media content */}
          {piece.pieceType === "image" && imageUrl ? (
            <Image
              src={imageUrl}
              alt={piece.image?.alt || piece.title}
              width={1200}
              height={800}
              className="max-h-full max-w-full object-contain rounded-xl"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
              unoptimized
            />
          ) : piece.pieceType === "video" && piece.videoUrl ? (
            <div className="w-full max-w-2xl">
              <VideoEmbed videoUrl={piece.videoUrl} videoPlatform={piece.videoPlatform} />
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-xl flex items-center justify-center">
              <p className="text-muted-foreground">No media available</p>
            </div>
          )}
        </div>

        {/* ── Column 2: Info Sidebar ── */}
        <div className="flex-shrink-0 overflow-y-auto max-h-[35vh] md:max-h-none md:w-[280px] lg:w-[320px] p-4 md:pt-4 md:border-l md:border-border">
          <div className="rounded-xl bg-card border border-border p-4">
            {/* Title + franchise */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{piece.title}</h2>
                <p className="text-muted-foreground mt-0.5">
                  by{" "}
                  {piece.artistUrl ? (
                    <a
                      href={piece.artistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {piece.artistName}
                    </a>
                  ) : (
                    <span className="text-foreground">{piece.artistName}</span>
                  )}
                </p>
              </div>
              <span className="flex-shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20">
                {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
              </span>
            </div>

            {/* Description */}
            {piece.description && (
              <p className="text-sm text-muted-foreground mt-3">{piece.description}</p>
            )}

            {/* View Original */}
            {piece.originalUrl && (
              <a
                href={piece.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-accent hover:underline"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Original
              </a>
            )}

            {/* Piece counter */}
            <p className="text-xs text-muted-foreground mt-4">
              {currentIndex + 1} of {pieces.length}
            </p>

            {/* Reactions */}
            <div className="mt-4 pt-4 border-t border-border">
              <ReactionBar slug={`gallery-${piece.slug.current}`} />
            </div>

            {/* Share */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Share</span>
              <ShareBar title={piece.title} url={shareUrl} />
            </div>
          </div>
        </div>

        {/* ── Column 3: Film Strip (desktop = vertical, mobile = horizontal) ── */}
        {/* Desktop: vertical rail on the right */}
        <div className="hidden md:flex h-full">
          <FilmStrip
            pieces={pieces}
            currentPieceId={piece._id}
            onNavigate={onNavigate}
            orientation="vertical"
          />
        </div>

        {/* Mobile: horizontal strip at bottom */}
        <div className="md:hidden">
          <FilmStrip
            pieces={pieces}
            currentPieceId={piece._id}
            onNavigate={onNavigate}
            orientation="horizontal"
          />
        </div>
      </div>
    </div>
  );
}
