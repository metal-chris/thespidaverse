"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { GraphControls } from "./GraphControls";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
      Loading graph&hellip;
    </div>
  ),
});

interface GraphNode {
  id: string;
  label: string;
  type: "article" | "media" | "collection" | "tag" | "category";
  category?: string;
  slug?: string;
  posterUrl?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

interface WebGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const typeColors: Record<string, string> = {
  article: "#E82334",
  media: "#3B82F6",
  collection: "#8B5CF6",
  category: "#F59E0B",
  tag: "#6B7280",
};

const typeLabels: Record<string, string> = {
  article: "Article",
  media: "Media",
  collection: "Collection",
  category: "Category",
  tag: "Tag",
};

/** Theme-aware colors for canvas rendering */
function getThemeColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "venom";
  return {
    isDark,
    bg: isDark ? "#0A0A0A" : "#FAFAFA",
    labelColor: isDark ? "#ffffffcc" : "#1A1A1Acc",
    labelDimmed: isDark ? "#ffffff20" : "#1A1A1A20",
    linkBase: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
    linkDimmed: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    linkHighlight: "rgba(232,35,52,0.7)",
    searchHighlight: isDark ? "#fff" : "#1A1A1A",
    hoverStroke: isDark ? "#fff" : "#1A1A1A",
    webStroke: "#E82334",
  };
}

export function WebGraph({ nodes, edges }: WebGraphProps) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState(120);
  const [themeColors, setThemeColors] = useState(() => ({
    isDark: true,
    bg: "#0A0A0A",
    labelColor: "#ffffffcc",
    labelDimmed: "#ffffff20",
    linkBase: "rgba(255,255,255,0.15)",
    linkDimmed: "rgba(255,255,255,0.04)",
    linkHighlight: "rgba(232,35,52,0.7)",
    searchHighlight: "#fff",
    hoverStroke: "#fff",
    webStroke: "#E82334",
  }));

  useEffect(() => {
    function measure() {
      const headerH = overlayRef.current?.getBoundingClientRect().height ?? 0;
      setOverlayHeight(headerH);
      setDimensions({
        width: window.innerWidth,
        // Subtract nav (64) + header area from canvas height
        height: window.innerHeight - 64 - headerH,
      });
    }
    function updateTheme() {
      setThemeColors(getThemeColors());
    }
    // Measure after first paint so overlayRef is populated
    requestAnimationFrame(() => {
      measure();
      setMounted(true);
    });
    updateTheme();
    window.addEventListener("resize", measure);

    // Watch for theme changes via MutationObserver on data-theme attribute
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    nodes.forEach((n) => {
      if (n.type) cats.add(n.type);
    });
    return Array.from(cats);
  }, [nodes]);

  const filteredNodes = useMemo(() => {
    let filtered = nodes;
    if (activeFilter) {
      filtered = filtered.filter((n) => n.type === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => n.label.toLowerCase().includes(q));
    }
    return filtered;
  }, [nodes, activeFilter, searchQuery]);

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  );

  const filteredEdges = useMemo(
    () =>
      edges.filter(
        (e) => filteredNodeIds.has(e.source as string) && filteredNodeIds.has(e.target as string)
      ),
    [edges, filteredNodeIds]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (node.type === "article" && node.slug) {
        router.push(`/articles/${node.slug}`);
      } else if (node.type === "tag") {
        router.push(`/tags/${node.label.toLowerCase().replace(/\s+/g, "-")}`);
      } else if (node.type === "collection" && node.slug) {
        router.push(`/collections/${node.slug}`);
      } else if (node.type === "category") {
        router.push(`/category/${node.label.toLowerCase().replace(/\s+/g, "-")}`);
      }
    },
    [router]
  );

  const handleNodeHover = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: GraphNode | null, _prevNode: GraphNode | null) => {
      setHoveredNode(node);
      if (node) {
        const graphEl = graphRef.current;
        if (graphEl) {
          const coords = graphEl.graph2ScreenCoords(node.x || 0, node.y || 0);
          setTooltipPos({ x: coords.x, y: coords.y });
        }
      }
    },
    []
  );

  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoom(1.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoom(0.67, 300);
  }, []);

  const handleReset = useCallback(() => {
    graphRef.current?.zoomToFit(400);
  }, []);

  // Connection neighbors for glow effect on hover
  const neighborSet = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const set = new Set<string>();
    set.add(hoveredNode.id);
    edges.forEach((e) => {
      const src = typeof e.source === "string" ? e.source : (e.source as GraphNode).id;
      const tgt = typeof e.target === "string" ? e.target : (e.target as GraphNode).id;
      if (src === hoveredNode.id) set.add(tgt);
      if (tgt === hoveredNode.id) set.add(src);
    });
    return set;
  }, [hoveredNode, edges]);

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const baseR = node.type === "article" ? 7 : node.type === "collection" || node.type === "category" ? 5 : 4;
      const r = baseR;
      const color = typeColors[node.type] || "#666";
      const isHighlighted =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const isHovered = hoveredNode?.id === node.id;
      const isNeighbor = hoveredNode && neighborSet.has(node.id);
      const isDimmed = hoveredNode && !isNeighbor;

      // Glow effect for hovered/neighbor nodes
      if (isHovered || isNeighbor) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(x, y, r, x, y, r + 8);
        grad.addColorStop(0, color + "60");
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDimmed ? color + "30" : color;
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = themeColors.searchHighlight;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isHovered) {
        ctx.strokeStyle = themeColors.hoverStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Labels — always show for articles, show for others when zoomed
      const showLabel = node.type === "article" || globalScale > 1.2;
      if (showLabel && !isDimmed) {
        const fontSize = Math.min(Math.max(11 / globalScale, 2.5), 5);
        ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDimmed ? themeColors.labelDimmed : themeColors.labelColor;
        const truncated = node.label.length > 28 ? node.label.slice(0, 26) + "…" : node.label;
        ctx.fillText(truncated, x, y + r + 2);
      }
    },
    [searchQuery, hoveredNode, neighborSet, themeColors]
  );

  const linkColor = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      if (!hoveredNode) return themeColors.linkBase;
      const src = typeof link.source === "string" ? link.source : link.source?.id;
      const tgt = typeof link.target === "string" ? link.target : link.target?.id;
      if (src === hoveredNode.id || tgt === hoveredNode.id) {
        return themeColors.linkHighlight;
      }
      return themeColors.linkDimmed;
    },
    [hoveredNode, themeColors]
  );

  const linkWidth = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      const base = (link.weight || 1) * 0.8;
      if (!hoveredNode) return base;
      const src = typeof link.source === "string" ? link.source : link.source?.id;
      const tgt = typeof link.target === "string" ? link.target : link.target?.id;
      if (src === hoveredNode.id || tgt === hoveredNode.id) {
        return base * 3;
      }
      return base * 0.3;
    },
    [hoveredNode]
  );

  return (
    <div className="w-full bg-background">
      {/* Header + Controls — normal flow above graph */}
      <div ref={overlayRef} className="relative z-10 bg-background pb-3">
        {/* Page heading */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Everything connected. Hover to explore, click to dive in.
          </p>
        </div>

        {/* Controls row */}
        <GraphControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          categories={categories}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onReset={handleReset}
        />
      </div>

      {/* Graph area — fills remaining viewport */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        {/* Web-like radial background — client-only to avoid hydration mismatch */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg
              viewBox="0 0 1000 1000"
              className="absolute inset-0 w-full h-full opacity-[0.06]"
              preserveAspectRatio="xMidYMid slice"
            >
              <circle cx={500} cy={500} r={100} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <circle cx={500} cy={500} r={200} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <circle cx={500} cy={500} r={300} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <circle cx={500} cy={500} r={400} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <circle cx={500} cy={500} r={500} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={1000} y2={500} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={933} y2={750} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={750} y2={933} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={500} y2={1000} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={250} y2={933} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={67} y2={750} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={0} y2={500} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={67} y2={250} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={250} y2={67} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={500} y2={0} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={750} y2={67} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              <line x1={500} y1={500} x2={933} y2={250} stroke="currentColor" strokeWidth={0.5} className="text-accent" />
            </svg>
          </div>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={{ nodes: filteredNodes, links: filteredEdges }}
          nodeId="id"
          nodeCanvasObject={nodeCanvasObject as never}
          linkColor={linkColor as never}
          linkWidth={linkWidth as never}
          linkDirectionalParticles={0}
          backgroundColor={themeColors.bg}
          onNodeClick={handleNodeClick as never}
          onNodeHover={handleNodeHover as never}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        {/* Hover tooltip */}
        {hoveredNode && (
          <div
            className="absolute z-20 pointer-events-none px-3 py-2 rounded-lg bg-card/95 backdrop-blur-sm border border-border shadow-xl max-w-[220px] transition-opacity"
            style={{
              left: tooltipPos.x + 14,
              top: tooltipPos.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: typeColors[hoveredNode.type] || "#666" }}
              />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {typeLabels[hoveredNode.type] || hoveredNode.type}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground leading-tight truncate">
              {hoveredNode.label}
            </p>
            {hoveredNode.category && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{hoveredNode.category}</p>
            )}
            {(hoveredNode.type === "article" || hoveredNode.type === "collection") && (
              <p className="text-[10px] text-accent mt-1">Click to visit &rarr;</p>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-muted-foreground bg-card/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          {Object.entries(typeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 capitalize">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {typeLabels[type] || type}
            </div>
          ))}
        </div>

        {/* Node count */}
        <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground bg-card/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/50">
          {filteredNodes.length} nodes &middot; {filteredEdges.length} connections
        </div>
      </div>
    </div>
  );
}
