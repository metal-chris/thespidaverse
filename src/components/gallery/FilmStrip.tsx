"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import type { GalleryPiece } from "@/types";

interface FilmStripProps {
  pieces: GalleryPiece[];
  currentPieceId: string;
  onNavigate: (piece: GalleryPiece) => void;
  /** Desktop = vertical right rail, Mobile = horizontal bottom strip */
  orientation?: "vertical" | "horizontal";
}

function getThumbnailUrl(piece: GalleryPiece): string {
  if (piece.pieceType === "image") {
    return piece.imageUrl || (piece.image ? urlFor(piece.image).width(150).url() : "") || "";
  }
  return piece.videoThumbnailUrl || (piece.videoThumbnail ? urlFor(piece.videoThumbnail).width(150).url() : "") || "";
}

/** Generate a Kodak-style frame number: 1, 1A, 2, 2A, 3... */
function frameNumber(index: number): string {
  const base = Math.floor(index / 2) + 1;
  const suffix = index % 2 === 1 ? "A" : "";
  return `${base}${suffix}`;
}

export function FilmStrip({
  pieces,
  currentPieceId,
  onNavigate,
  orientation = "vertical",
}: FilmStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep current piece centered
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeEl = scrollRef.current.querySelector(
      `[data-piece-id="${currentPieceId}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: orientation === "vertical" ? "center" : "nearest",
        inline: orientation === "horizontal" ? "center" : "nearest",
      });
    }
  }, [currentPieceId, orientation]);

  if (pieces.length === 0) return null;

  // ── Vertical (Desktop) ──
  if (orientation === "vertical") {
    return (
      <div
        className="film-strip-vertical"
        role="navigation"
        aria-label="Gallery film strip"
      >
        {/* Film stock branding */}
        <span className="film-stock-label" aria-hidden="true">
          Parker TX 35mm &nbsp;&bull;&nbsp; Spidaverse 400
        </span>

        <div ref={scrollRef} className="film-strip-scroll-v">
          {/* Top spacer */}
          <div className="h-16" aria-hidden="true" />

          {pieces.map((piece, i) => {
            const isActive = piece._id === currentPieceId;
            const thumbUrl = getThumbnailUrl(piece);

            return (
              <div
                key={piece._id}
                data-piece-id={piece._id}
                className={cn("film-frame", isActive && "film-frame-active")}
              >
                {/* Frame number */}
                <div className="film-frame-number" aria-hidden="true">
                  {frameNumber(i)}
                </div>

                {/* Thumbnail */}
                <button
                  onClick={() => onNavigate(piece)}
                  className="film-frame-thumb"
                  aria-label={`${piece.title} by ${piece.artistName}`}
                  aria-current={isActive ? "true" : undefined}
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

                  {/* Video indicator */}
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

          {/* Bottom spacer */}
          <div className="h-16" aria-hidden="true" />
        </div>
      </div>
    );
  }

  // ── Horizontal (Mobile) ──
  return (
    <div
      className="film-strip-horizontal"
      role="navigation"
      aria-label="Gallery film strip"
    >
      <div ref={scrollRef} className="film-strip-scroll-h">
        {/* Left spacer */}
        <div className="flex-shrink-0 w-[calc(50vw-36px)]" aria-hidden="true" />

        {pieces.map((piece, i) => {
          const isActive = piece._id === currentPieceId;
          const thumbUrl = getThumbnailUrl(piece);

          return (
            <div
              key={piece._id}
              data-piece-id={piece._id}
              className={cn("film-frame-h", isActive && "film-frame-active")}
            >
              <button
                onClick={() => onNavigate(piece)}
                className="film-frame-thumb"
                aria-label={`${piece.title} by ${piece.artistName}`}
                aria-current={isActive ? "true" : undefined}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="52px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800" />
                )}

                {piece.pieceType === "video" && (
                  <div className="film-frame-video-badge">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3 h-3 text-white drop-shadow-md"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </button>

              <div className="film-frame-number" aria-hidden="true">
                {frameNumber(i)}
              </div>
            </div>
          );
        })}

        {/* Right spacer */}
        <div className="flex-shrink-0 w-[calc(50vw-36px)]" aria-hidden="true" />
      </div>
    </div>
  );
}
