"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { GalleryPiece } from "@/types";

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

function getImageUrl(piece: GalleryPiece): string {
  if (piece.pieceType === "image") {
    return piece.imageUrl || (piece.image ? urlFor(piece.image).width(600).url() : "") || "";
  }
  return piece.videoThumbnailUrl || (piece.videoThumbnail ? urlFor(piece.videoThumbnail).width(600).url() : "") || "";
}

export function GalleryTile({ piece, onClick }: GalleryTileProps) {
  const imageUrl = getImageUrl(piece);
  const altText = piece.image?.alt || piece.videoThumbnail?.alt || piece.title;

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-xl overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/30 cursor-pointer text-left"
      aria-label={`View "${piece.title}" by ${piece.artistName}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={altText}
          width={600}
          height={0}
          className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized
        />
      ) : (
        <div className="aspect-square bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/20" fill="currentColor">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
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

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold truncate">{piece.artistName}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-accent/80 text-white w-fit">
          {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
        </span>
      </div>

      {/* Franchise badge (always visible) */}
      <div className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-black/50 text-white backdrop-blur-sm">
        {FRANCHISE_LABELS[piece.franchise] || piece.franchise}
      </div>
    </button>
  );
}
