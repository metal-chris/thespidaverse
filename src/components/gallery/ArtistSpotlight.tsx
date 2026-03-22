"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { GalleryPiece } from "@/types";

interface ArtistSpotlightProps {
  piece: GalleryPiece;
  onClick: () => void;
}

function getSpotlightImageUrl(piece: GalleryPiece): string {
  const fallbackUrl = piece.imageUrl || piece.videoThumbnailUrl || "";
  if (fallbackUrl) return fallbackUrl;
  const imageSource = piece.pieceType === "image" ? piece.image : piece.videoThumbnail;
  return imageSource ? urlFor(imageSource).width(1200).height(500).url() : "";
}

export function ArtistSpotlight({ piece, onClick }: ArtistSpotlightProps) {
  const imageUrl = getSpotlightImageUrl(piece);

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-xl overflow-hidden border border-border bg-card mb-8 cursor-pointer text-left"
      aria-label={`Artist Spotlight: ${piece.title} by ${piece.artistName}`}
    >
      {imageUrl ? (
        <div className="relative aspect-[21/9] sm:aspect-[3/1] overflow-hidden">
          <Image
            src={imageUrl}
            alt={piece.image?.alt || piece.videoThumbnail?.alt || piece.title}
            fill
            className="object-cover group-hover:scale-[1.03] transition-transform duration-700"
            sizes="100vw"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[21/9] sm:aspect-[3/1] bg-gradient-to-br from-accent/10 to-accent/5" />
      )}

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] rounded-md bg-accent text-background mb-2">
          Artist Spotlight
        </span>
        <h3 className="text-white text-lg sm:text-2xl font-bold">{piece.title}</h3>
        <p className="text-white/80 text-sm mt-1">
          by{" "}
          <span className="text-white font-medium">{piece.artistName}</span>
        </p>
        {piece.description && (
          <p className="text-white/60 text-sm mt-1.5 line-clamp-2 max-w-lg">
            {piece.description}
          </p>
        )}
      </div>

      {/* Video play indicator */}
      {piece.pieceType === "video" && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/50 backdrop-blur-sm">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span className="text-white text-[10px] font-semibold uppercase tracking-wider">Video</span>
        </div>
      )}
    </button>
  );
}
