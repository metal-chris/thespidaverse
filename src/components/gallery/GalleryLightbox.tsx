"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { ShareBar } from "@/components/content/ShareBar";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { VideoEmbed } from "./VideoEmbed";
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && prevPiece) onNavigate(prevPiece);
      if (e.key === "ArrowRight" && nextPiece) onNavigate(nextPiece);
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

  // Update URL
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
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      {prevPiece && (
        <button
          onClick={() => onNavigate(prevPiece)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
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
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next piece"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content */}
      <div className="relative h-full overflow-y-auto flex items-start justify-center pt-12 pb-8 px-4">
        <div className="w-full max-w-3xl">
          {/* Media */}
          <div className="rounded-xl overflow-hidden bg-card border border-border">
            {piece.pieceType === "image" && imageUrl ? (
              <Image
                src={imageUrl}
                alt={piece.image?.alt || piece.title}
                width={1200}
                height={0}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
                unoptimized
              />
            ) : piece.pieceType === "video" && piece.videoUrl ? (
              <VideoEmbed videoUrl={piece.videoUrl} videoPlatform={piece.videoPlatform} />
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">No media available</p>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="mt-4 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-start justify-between gap-4 flex-wrap">
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
              <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20">
                {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
              </span>
            </div>

            {piece.description && (
              <p className="text-sm text-muted-foreground mt-3">{piece.description}</p>
            )}

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
      </div>
    </div>
  );
}
