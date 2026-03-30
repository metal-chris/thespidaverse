"use client";

import { useMemo, useState, useEffect } from "react";
import type { GalleryPiece } from "@/types";
import { GalleryTile } from "./GalleryTile";

interface MasonryGridProps {
  pieces: GalleryPiece[];
  onPieceClick: (piece: GalleryPiece) => void;
}

/** Extract aspect ratio from Unsplash URL params or return a default */
function getAspectRatio(piece: GalleryPiece): number {
  const url = piece.imageUrl || piece.videoThumbnailUrl || "";
  const wMatch = url.match(/[?&]w=(\d+)/);
  const hMatch = url.match(/[?&]h=(\d+)/);
  if (wMatch && hMatch) {
    return parseInt(wMatch[1]) / parseInt(hMatch[1]);
  }
  // Default: portrait-ish for art, 16:9 for video
  return piece.pieceType === "video" ? 16 / 9 : 4 / 5;
}

/** Distribute pieces into balanced columns (shortest-column-first algorithm) */
function balanceColumns(pieces: GalleryPiece[], numColumns: number): GalleryPiece[][] {
  const columns: GalleryPiece[][] = Array.from({ length: numColumns }, () => []);
  const heights: number[] = new Array(numColumns).fill(0);

  for (const piece of pieces) {
    const ratio = getAspectRatio(piece);
    // Approximate height in a normalized column width (1 unit)
    const height = 1 / ratio;

    // Find the shortest column
    let shortest = 0;
    for (let i = 1; i < numColumns; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }

    columns[shortest].push(piece);
    heights[shortest] += height;
  }

  return columns;
}

function useColumnCount(): number {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w < 640) setCols(2);
      else if (w < 1024) setCols(2);
      else if (w < 1280) setCols(3);
      else setCols(4);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

export function MasonryGrid({ pieces, onPieceClick }: MasonryGridProps) {
  const numColumns = useColumnCount();

  const columns = useMemo(
    () => balanceColumns(pieces, numColumns),
    [pieces, numColumns]
  );

  if (pieces.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No pieces to display yet. Check back soon!
      </p>
    );
  }

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}
    >
      {columns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-2">
          {column.map((piece, pieceIndex) => (
            <div
              key={piece._id}
              className="gallery-tile-appear"
              style={{ animationDelay: `${(colIndex * 0.05) + (pieceIndex * 0.03)}s` }}
            >
              <GalleryTile piece={piece} onClick={() => onPieceClick(piece)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
