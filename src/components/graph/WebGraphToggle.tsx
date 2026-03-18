"use client";

import { useState } from "react";
import { WebGraphRadial } from "./WebGraphRadial";
import { WebGraphMarkmap } from "./WebGraphMarkmap";
import { WebGraphTVA } from "./WebGraphTVA";

interface GraphNode {
  id: string;
  label: string;
  type: "article" | "media" | "collection" | "tag" | "category";
  category?: string;
  slug?: string;
  posterUrl?: string;
  connections?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

interface WebGraphToggleProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function WebGraphToggle({ nodes, edges }: WebGraphToggleProps) {
  const [view, setView] = useState<"radial" | "markmap" | "tva">("tva");

  return (
    <div className="relative w-full h-full">
      {/* View toggle */}
      <div className="absolute top-4 right-4 z-30 flex gap-1 bg-card/95 backdrop-blur-sm rounded-lg border border-border shadow-lg p-1">
        <button
          onClick={() => setView("radial")}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            view === "radial"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Radial
        </button>
        <button
          onClick={() => setView("markmap")}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            view === "markmap"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Markmap
        </button>
        <button
          onClick={() => setView("tva")}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            view === "tva"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Timeline
        </button>
      </div>

      {/* Render selected view */}
      {view === "radial" ? (
        <WebGraphRadial nodes={nodes} edges={edges} />
      ) : view === "markmap" ? (
        <WebGraphMarkmap nodes={nodes} edges={edges} />
      ) : (
        <WebGraphTVA nodes={nodes} edges={edges} />
      )}
    </div>
  );
}
