"use client";

import type { GalleryPiece } from "@/types";
import { GalleryTile } from "./GalleryTile";

interface MasonryGridProps {
  pieces: GalleryPiece[];
  onPieceClick: (piece: GalleryPiece) => void;
}

export function MasonryGrid({ pieces, onPieceClick }: MasonryGridProps) {
  if (pieces.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No pieces to display yet. Check back soon!
      </p>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-2">
      {pieces.map((piece) => (
        <div key={piece._id} className="break-inside-avoid mb-2">
          <GalleryTile piece={piece} onClick={() => onPieceClick(piece)} />
        </div>
      ))}
    </div>
  );
}
