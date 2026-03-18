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
  connections?: number;
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
    linkBase: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    linkDimmed: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    linkHighlight: "rgba(232,35,52,0.6)",
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
  const [focusedNode, setFocusedNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [settled, setSettled] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [overlayHeight, setOverlayHeight] = useState(120);
  const [themeColors, setThemeColors] = useState(() => ({
    isDark: true,
    bg: "#0A0A0A",
    labelColor: "#ffffffcc",
    labelDimmed: "#ffffff20",
    linkBase: "rgba(255,255,255,0.08)",
    linkDimmed: "rgba(255,255,255,0.02)",
    linkHighlight: "rgba(232,35,52,0.6)",
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
        height: window.innerHeight - 64 - headerH,
      });
    }
    function updateTheme() {
      setThemeColors(getThemeColors());
    }
    requestAnimationFrame(() => {
      measure();
      setMounted(true);
    });
    updateTheme();
    window.addEventListener("resize", measure);

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

  // Freeze all nodes once physics settles
  const handleEngineStop = useCallback(() => {
    if (!settled) {
      setSettled(true);
      graphRef.current?.zoomToFit(400, 60);
    }
  }, [settled]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    nodes.forEach((n) => {
      if (n.type) cats.add(n.type);
    });
    return Array.from(cats);
  }, [nodes]);

  // Active node = hovered or focused
  const activeNode = hoveredNode || focusedNode;

  // Connection neighbors for highlight effect
  const neighborSet = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const set = new Set<string>();
    set.add(activeNode.id);
    edges.forEach((e) => {
      const src = typeof e.source === "string" ? e.source : (e.source as GraphNode).id;
      const tgt = typeof e.target === "string" ? e.target : (e.target as GraphNode).id;
      if (src === activeNode.id) set.add(tgt);
      if (tgt === activeNode.id) set.add(src);
    });
    return set;
  }, [activeNode, edges]);

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
      // If already focused on this node, navigate
      if (focusedNode?.id === node.id) {
        if (node.type === "article" && node.slug) {
          router.push(`/articles/${node.slug}`);
        } else if (node.type === "tag" && node.slug) {
          router.push(`/tags/${node.slug}`);
        } else if (node.type === "collection" && node.slug) {
          router.push(`/collections/${node.slug}`);
        } else if (node.type === "category" && node.slug) {
          router.push(`/category/${node.slug}`);
        }
        return;
      }

      // First click: focus mode — zoom into node and highlight connections
      setFocusedNode(node);
      const graphEl = graphRef.current;
      if (graphEl) {
        graphEl.centerAt(node.x, node.y, 600);
        graphEl.zoom(3, 600);
      }
    },
    [router, focusedNode]
  );

  const handleClearFocus = useCallback(() => {
    setFocusedNode(null);
    graphRef.current?.zoomToFit(400, 60);
  }, []);

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

  // Click on empty canvas clears focus
  const handleBackgroundClick = useCallback(() => {
    if (focusedNode) {
      setFocusedNode(null);
      graphRef.current?.zoomToFit(400, 60);
    }
  }, [focusedNode]);

  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoom(1.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoom(0.67, 300);
  }, []);

  const handleReset = useCallback(() => {
    setFocusedNode(null);
    graphRef.current?.zoomToFit(400, 60);
  }, []);

  // Node radius based on connection count
  const getNodeRadius = useCallback((node: GraphNode) => {
    const base = node.type === "article" ? 6 : node.type === "category" ? 8 : node.type === "collection" ? 5 : 4;
    const connectionBonus = Math.min((node.connections || 0) * 0.3, 6);
    return base + connectionBonus;
  }, []);

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = getNodeRadius(node);
      const color = typeColors[node.type] || "#666";
      const isHighlighted =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const isHovered = hoveredNode?.id === node.id;
      const isFocused = focusedNode?.id === node.id;
      const isNeighbor = activeNode && neighborSet.has(node.id);
      const isDimmed = activeNode && !isNeighbor;

      // Outer glow for hovered/focused/neighbor nodes
      if (isHovered || isFocused || isNeighbor) {
        ctx.beginPath();
        ctx.arc(x, y, r + 6, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(x, y, r, x, y, r + 12);
        grad.addColorStop(0, color + (isFocused ? "80" : "50"));
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw node circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDimmed ? color + "20" : color;
      ctx.fill();

      // Ring for categories (to distinguish them as hub nodes)
      if (node.type === "category" && !isDimmed) {
        ctx.beginPath();
        ctx.arc(x, y, r + 2, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "60";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (isHighlighted) {
        ctx.strokeStyle = themeColors.searchHighlight;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isHovered || isFocused) {
        ctx.strokeStyle = themeColors.hoverStroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Labels
      const showLabel =
        isFocused ||
        isHovered ||
        node.type === "article" ||
        node.type === "category" ||
        globalScale > 1.5;
      if (showLabel && !isDimmed) {
        const fontSize = Math.min(Math.max(12 / globalScale, 2.5), 5);
        ctx.font = `${isFocused || node.type === "category" ? "bold " : ""}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = isDimmed ? themeColors.labelDimmed : themeColors.labelColor;
        const truncated = node.label.length > 28 ? node.label.slice(0, 26) + "…" : node.label;
        ctx.fillText(truncated, x, y + r + 3);
      }
    },
    [searchQuery, hoveredNode, focusedNode, activeNode, neighborSet, themeColors, getNodeRadius]
  );

  // Invisible larger area for easier clicking
  const nodePointerAreaPaint = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const r = getNodeRadius(node) + 6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [getNodeRadius]
  );

  const linkCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any, ctx: CanvasRenderingContext2D) => {
      const src = link.source;
      const tgt = link.target;
      if (!src || !tgt || src.x == null || tgt.x == null) return;

      const srcId = typeof src === "string" ? src : src.id;
      const tgtId = typeof tgt === "string" ? tgt : tgt.id;
      const isActive = activeNode && (srcId === activeNode.id || tgtId === activeNode.id);
      const isDimmed = activeNode && !isActive;

      // Curved links for web-like appearance
      const dx = tgt.x - src.x;
      const dy = tgt.y - src.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(dist * 0.15, 30);
      // Perpendicular offset for curve
      const mx = (src.x + tgt.x) / 2;
      const my = (src.y + tgt.y) / 2;
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      const cpx = mx + nx * curvature;
      const cpy = my + ny * curvature;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cpx, cpy, tgt.x, tgt.y);

      const weight = link.weight || 1;
      if (isActive) {
        ctx.strokeStyle = themeColors.linkHighlight;
        ctx.lineWidth = weight * 1.8;
        ctx.globalAlpha = 0.8;
      } else if (isDimmed) {
        ctx.strokeStyle = themeColors.linkDimmed;
        ctx.lineWidth = weight * 0.4;
        ctx.globalAlpha = 0.3;
      } else {
        ctx.strokeStyle = themeColors.linkBase;
        ctx.lineWidth = weight * 0.6;
        ctx.globalAlpha = 0.6;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    },
    [activeNode, themeColors]
  );

  // Particle count — show on active connections only
  const linkDirectionalParticles = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (link: any) => {
      if (!activeNode) return 0;
      const srcId = typeof link.source === "string" ? link.source : link.source?.id;
      const tgtId = typeof link.target === "string" ? link.target : link.target?.id;
      if (srcId === activeNode.id || tgtId === activeNode.id) return 3;
      return 0;
    },
    [activeNode]
  );

  return (
    <div className="w-full bg-background">
      {/* Header + Controls */}
      <div ref={overlayRef} className="relative z-10 bg-background pb-3">
        <div className="text-center pt-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Click a node to focus. Click again to visit. Click empty space to reset.
          </p>
        </div>

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

      {/* Graph area */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        {/* Web-like radial background */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg
              viewBox="0 0 1000 1000"
              className="absolute inset-0 w-full h-full opacity-[0.04]"
              preserveAspectRatio="xMidYMid slice"
            >
              {[100, 200, 300, 400, 500].map((r) => (
                <circle key={r} cx={500} cy={500} r={r} fill="none" stroke="currentColor" strokeWidth={0.5} className="text-accent" />
              ))}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                return (
                  <line
                    key={i}
                    x1={500}
                    y1={500}
                    x2={Math.round(500 + 500 * Math.cos(angle))}
                    y2={Math.round(500 + 500 * Math.sin(angle))}
                    stroke="currentColor"
                    strokeWidth={0.5}
                    className="text-accent"
                  />
                );
              })}
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
          nodePointerAreaPaint={nodePointerAreaPaint as never}
          linkCanvasObject={linkCanvasObject as never}
          linkDirectionalParticles={linkDirectionalParticles as never}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => themeColors.linkHighlight}
          linkCurvature={0.2}
          backgroundColor={themeColors.bg}
          onNodeClick={handleNodeClick as never}
          onNodeHover={handleNodeHover as never}
          onBackgroundClick={handleBackgroundClick}
          onEngineStop={handleEngineStop}
          enableNodeDrag={false}
          cooldownTicks={150}
          d3AlphaDecay={0.03}
          d3VelocityDecay={0.4}
          d3AlphaMin={0.001}
          warmupTicks={50}
        />

        {/* Focus mode banner */}
        {focusedNode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-card/95 backdrop-blur-sm border border-border shadow-lg">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: typeColors[focusedNode.type] || "#666" }}
            />
            <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {focusedNode.label}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {neighborSet.size - 1} connections
            </span>
            {focusedNode.slug && (
              <span className="text-[10px] text-accent">Click again to visit</span>
            )}
            <button
              onClick={handleClearFocus}
              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label="Clear focus"
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
                <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </div>
        )}

        {/* Hover tooltip */}
        {hoveredNode && !focusedNode && (
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
            {hoveredNode.connections && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hoveredNode.connections} connection{hoveredNode.connections !== 1 ? "s" : ""}
              </p>
            )}
            <p className="text-[10px] text-accent mt-1">Click to focus &rarr;</p>
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
