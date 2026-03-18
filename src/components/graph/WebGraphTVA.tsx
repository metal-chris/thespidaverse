"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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

interface WebGraphTVAProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Theme-aware color palettes from landing page
const PALETTES = {
  miles: {
    web: {
      base: "232, 35, 52",        // #E82334 — red
      glow: "255, 60, 80",        // hot red glow
      dim: "140, 20, 30",         // dark red
    },
    strike: "255, 220, 40",       // yellow lightning
    strikeGlow: "255, 240, 100",  // bright yellow
  },
  peter: {
    web: {
      base: "30, 80, 220",         // classic Spidey blue
      glow: "60, 120, 255",        // bright blue glow
      dim: "20, 50, 140",          // dark blue
    },
    strike: "220, 220, 240",      // silver-white web fluid
    strikeGlow: "255, 255, 255",  // bright white
  },
  venom: {
    web: {
      base: "220, 220, 220",      // white-ish
      glow: "255, 255, 255",      // pure white glow
      dim: "100, 100, 100",       // grey
    },
    strike: "60, 140, 255",       // blue lightning
    strikeGlow: "100, 180, 255",  // bright blue
  },
};

function getThemeColors() {
  // Guard against SSR
  if (typeof document === "undefined") {
    return {
      isDark: false,
      bg: "#FAFAFA",
      labelColor: "#1A1A1Acc",
      category: `rgb(${PALETTES.miles.web.base})`,
      categoryGlow: `rgb(${PALETTES.miles.web.glow})`,
      tag: `rgb(${PALETTES.miles.strike})`,
      tagGlow: `rgb(${PALETTES.miles.strikeGlow})`,
      article: `rgb(${PALETTES.miles.strikeGlow})`,
      articleGlow: `rgb(${PALETTES.miles.web.glow})`,
      linkBase: `rgba(${PALETTES.miles.web.base}, 0.3)`,
      linkGlow: `rgba(${PALETTES.miles.web.glow}, 0.8)`,
      dimmed: `rgba(${PALETTES.miles.web.dim}, 0.2)`,
    };
  }

  const themeAttr = document.documentElement.getAttribute("data-theme");
  const isDark = themeAttr === "venom";
  const isPeter = themeAttr === "peter";
  const palette = themeAttr === "venom" ? PALETTES.venom : themeAttr === "peter" ? PALETTES.peter : PALETTES.miles;
  
  return {
    isDark,
    bg: isDark ? "#0A0A0A" : isPeter ? "#DC1E28" : "#FAFAFA",
    labelColor: isDark ? "#ffffffcc" : isPeter ? "#ffffffcc" : "#1A1A1Acc",
    // Categories: main timeline trunk (web base)
    category: `rgb(${palette.web.base})`,
    categoryGlow: `rgb(${palette.web.glow})`,
    // Tags: branch points (strike color)
    tag: `rgb(${palette.strike})`,
    tagGlow: `rgb(${palette.strikeGlow})`,
    // Articles: variant branches (strike glow)
    article: `rgb(${palette.strikeGlow})`,
    articleGlow: `rgb(${palette.web.glow})`,
    // Connections
    linkBase: `rgba(${palette.web.base}, 0.3)`,
    linkGlow: `rgba(${palette.web.glow}, 0.8)`,
    dimmed: `rgba(${palette.web.dim}, 0.2)`,
  };
}

/** Compute horizontal timeline layout (TVA-style) */
function computeTVALayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const centerY = height / 2;

  // Group nodes by type
  const categories = nodes.filter((n) => n.type === "category");
  const tags = nodes.filter((n) => n.type === "tag");
  const articles = nodes.filter((n) => n.type === "article");

  // Horizontal spacing
  const categoryX = width * 0.15;
  const tagX = width * 0.45;
  const articleX = width * 0.75;

  // Position categories (main timeline trunk)
  const categorySpacing = Math.min(120, height / (categories.length + 1));
  categories.forEach((node, i) => {
    const y = centerY - ((categories.length - 1) * categorySpacing) / 2 + i * categorySpacing;
    positions.set(node.id, { x: categoryX, y });
  });

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source as string)) {
      adjacency.set(edge.source as string, new Set());
    }
    if (!adjacency.has(edge.target as string)) {
      adjacency.set(edge.target as string, new Set());
    }
    adjacency.get(edge.source as string)!.add(edge.target as string);
    adjacency.get(edge.target as string)!.add(edge.source as string);
  });

  // Position tags (branch points from categories)
  const tagsByCategory = new Map<string, GraphNode[]>();
  tags.forEach((tag) => {
    const connectedCategory = categories.find((cat) =>
      adjacency.get(cat.id)?.has(tag.id)
    );
    const catId = connectedCategory?.id || "uncategorized";
    if (!tagsByCategory.has(catId)) {
      tagsByCategory.set(catId, []);
    }
    tagsByCategory.get(catId)!.push(tag);
  });

  let tagIndex = 0;
  tagsByCategory.forEach((categoryTags, catId) => {
    const categoryPos = positions.get(catId);
    const baseY = categoryPos?.y || centerY;

    categoryTags.forEach((tag, i) => {
      const offset = (i - (categoryTags.length - 1) / 2) * 60;
      positions.set(tag.id, {
        x: tagX,
        y: baseY + offset,
      });
      tagIndex++;
    });
  });

  // Position articles (variant branches from tags)
  const articlesByTag = new Map<string, GraphNode[]>();
  articles.forEach((article) => {
    const connectedTag = tags.find((tag) =>
      adjacency.get(tag.id)?.has(article.id)
    );
    const tagId = connectedTag?.id || "untagged";
    if (!articlesByTag.has(tagId)) {
      articlesByTag.set(tagId, []);
    }
    articlesByTag.get(tagId)!.push(article);
  });

  articlesByTag.forEach((tagArticles, tagId) => {
    const tagPos = positions.get(tagId);
    const baseY = tagPos?.y || centerY;

    tagArticles.forEach((article, i) => {
      const offset = (i - (tagArticles.length - 1) / 2) * 40;
      positions.set(article.id, {
        x: articleX,
        y: baseY + offset,
      });
    });
  });

  return positions;
}

export function WebGraphTVA({ nodes, edges }: WebGraphTVAProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [focusedNode, setFocusedNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [themeColors, setThemeColors] = useState(() => getThemeColors());
  const [prunedNodes, setPrunedNodes] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function measure() {
      const headerH = overlayRef.current?.getBoundingClientRect().height ?? 0;
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

  const activeNode = hoveredNode || focusedNode;

  const neighborSet = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const set = new Set<string>();
    set.add(activeNode.id);
    edges.forEach((e) => {
      if (e.source === activeNode.id) set.add(e.target as string);
      if (e.target === activeNode.id) set.add(e.source as string);
    });
    return set;
  }, [activeNode, edges]);

  const visibleNodes = useMemo(() => {
    const hiddenNodes = new Set<string>();
    prunedNodes.forEach((prunedId) => {
      edges.forEach((e) => {
        if (e.source === prunedId) hiddenNodes.add(e.target as string);
        if (e.target === prunedId) hiddenNodes.add(e.source as string);
      });
    });
    return nodes.filter((n) => !hiddenNodes.has(n.id) && !prunedNodes.has(n.id));
  }, [nodes, edges, prunedNodes]);

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes]
  );

  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.source as string) && visibleNodeIds.has(e.target as string)
      ),
    [edges, visibleNodeIds]
  );

  const positions = useMemo(
    () => computeTVALayout(visibleNodes, visibleEdges, dimensions.width, dimensions.height),
    [visibleNodes, visibleEdges, dimensions]
  );

  // Draw canvas
  useEffect(() => {
    if (!mounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = themeColors.bg;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Apply transform
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw connections with organic curves and glow
    visibleEdges.forEach((edge) => {
      const sourcePos = positions.get(edge.source as string);
      const targetPos = positions.get(edge.target as string);
      if (!sourcePos || !targetPos) return;

      const sourceNode = visibleNodes.find((n) => n.id === edge.source);
      const targetNode = visibleNodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const isActive =
        activeNode &&
        (edge.source === activeNode.id || edge.target === activeNode.id);
      const isDimmed = activeNode && !isActive;

      // Organic curve control points
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const cp1x = sourcePos.x + dx * 0.3;
      const cp1y = sourcePos.y;
      const cp2x = sourcePos.x + dx * 0.7;
      const cp2y = targetPos.y;

      // Branch thickness tapers: category (thick) → tag (medium) → article (thin)
      const sourceThickness =
        sourceNode.type === "category" ? 6 : sourceNode.type === "tag" ? 3 : 2;
      const targetThickness =
        targetNode.type === "category" ? 6 : targetNode.type === "tag" ? 3 : 2;

      // Draw glow for active branches
      if (isActive) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetPos.x, targetPos.y);
        ctx.strokeStyle = themeColors.linkGlow;
        ctx.lineWidth = sourceThickness + 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = themeColors.linkGlow;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw main branch
      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetPos.x, targetPos.y);

      if (isDimmed) {
        ctx.strokeStyle = themeColors.dimmed;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
      } else {
        ctx.strokeStyle = themeColors.linkBase;
        ctx.lineWidth = (sourceThickness + targetThickness) / 2;
        ctx.globalAlpha = 0.6;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes with glow effects
    visibleNodes.forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const isHovered = hoveredNode?.id === node.id;
      const isFocused = focusedNode?.id === node.id;
      const isNeighbor = activeNode && neighborSet.has(node.id);
      const isDimmed = activeNode && !isNeighbor;

      // Node size and color based on type
      const baseR =
        node.type === "category"
          ? 16
          : node.type === "tag"
          ? 10
          : 8;
      const r = baseR + Math.min((node.connections || 0) * 0.2, 4);

      const color =
        node.type === "category"
          ? themeColors.category
          : node.type === "tag"
          ? themeColors.tag
          : themeColors.article;

      const glowColor =
        node.type === "category"
          ? themeColors.categoryGlow
          : node.type === "tag"
          ? themeColors.tagGlow
          : themeColors.articleGlow;

      // Glow effect for active nodes
      if (isHovered || isFocused || isNeighbor) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 12, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r + 16);
        // Convert rgb() to rgba() with alpha
        const glowAlpha = isFocused ? 0.8 : 0.5;
        const glowWithAlpha = glowColor.replace('rgb(', 'rgba(').replace(')', `, ${glowAlpha})`);
        const glowTransparent = glowColor.replace('rgb(', 'rgba(').replace(')', ', 0)');
        grad.addColorStop(0, glowWithAlpha);
        grad.addColorStop(1, glowTransparent);
        ctx.fillStyle = grad;
        ctx.fill();

        // Pulsing outer glow
        ctx.shadowBlur = 30;
        ctx.shadowColor = glowColor;
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
      if (isDimmed) {
        ctx.fillStyle = color.replace('rgb(', 'rgba(').replace(')', ', 0.2)');
      } else {
        ctx.fillStyle = color;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ring outline for categories (main timeline)
      if (node.type === "category" && !isDimmed) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = glowColor.replace('rgb(', 'rgba(').replace(')', ', 0.67)');
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isHovered || isFocused) {
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Labels
      const showLabel =
        isFocused ||
        isHovered ||
        node.type === "category" ||
        node.type === "tag" ||
        scale > 1.2;
      if (showLabel && !isDimmed) {
        const fontSize = node.type === "category" ? 14 : node.type === "tag" ? 12 : 11;
        ctx.font = `${node.type === "category" || isFocused ? "bold " : ""}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = themeColors.labelColor;
        
        const truncated = node.label.length > 30 ? node.label.slice(0, 28) + "…" : node.label;
        ctx.fillText(truncated, pos.x + r + 8, pos.y);
      }
    });

    ctx.restore();
  }, [
    mounted,
    dimensions,
    visibleNodes,
    visibleEdges,
    positions,
    themeColors,
    hoveredNode,
    focusedNode,
    activeNode,
    neighborSet,
    scale,
    offset,
  ]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      let clickedNode: GraphNode | null = null;
      for (const node of visibleNodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const baseR = node.type === "category" ? 16 : node.type === "tag" ? 10 : 8;
        const r = baseR + Math.min((node.connections || 0) * 0.2, 4) + 8;

        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= r) {
          clickedNode = node;
          break;
        }
      }

      if (clickedNode) {
        // Right-click or Ctrl+click to prune/restore
        if (e.button === 2 || e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (clickedNode.type === "category" || clickedNode.type === "tag") {
            setPrunedNodes((prev) => {
              const next = new Set(prev);
              if (next.has(clickedNode!.id)) {
                next.delete(clickedNode!.id);
              } else {
                next.add(clickedNode!.id);
              }
              return next;
            });
          }
          return;
        }

        // If already focused, navigate
        if (focusedNode?.id === clickedNode.id) {
          if (clickedNode.type === "article" && clickedNode.slug) {
            router.push(`/articles/${clickedNode.slug}`);
          } else if (clickedNode.type === "tag" && clickedNode.slug) {
            router.push(`/tags/${clickedNode.slug}`);
          } else if (clickedNode.type === "collection" && clickedNode.slug) {
            router.push(`/collections/${clickedNode.slug}`);
          } else if (clickedNode.type === "category" && clickedNode.slug) {
            router.push(`/category/${clickedNode.slug}`);
          }
          return;
        }

        // Focus on node
        setFocusedNode(clickedNode);
      } else {
        // Clicked empty space - reset
        setFocusedNode(null);
      }
    },
    [visibleNodes, positions, focusedNode, router, scale, offset]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      let hoveredNode: GraphNode | null = null;
      for (const node of visibleNodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const baseR = node.type === "category" ? 16 : node.type === "tag" ? 10 : 8;
        const r = baseR + Math.min((node.connections || 0) * 0.2, 4) + 8;

        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= r) {
          hoveredNode = node;
          setTooltipPos({ x: e.clientX, y: e.clientY });
          break;
        }
      }

      setHoveredNode(hoveredNode);
    },
    [visibleNodes, positions, offset, scale]
  );

  const handleClearFocus = useCallback(() => {
    setFocusedNode(null);
  }, []);

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div ref={overlayRef} className="relative z-10 bg-background pb-3">
        <div className="text-center pt-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
            <span className="text-xs ml-2 text-muted-foreground font-normal">
              (Timeline View)
            </span>
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Click to focus, click again to visit. Right-click to prune/restore branches.
          </p>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative w-full" style={{ height: dimensions.height }}>
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
          onContextMenu={(e) => e.preventDefault()}
          className="cursor-pointer"
        />

        {/* Focus mode banner */}
        {focusedNode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-card/95 backdrop-blur-sm border border-border shadow-lg">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  focusedNode.type === "category"
                    ? themeColors.category
                    : focusedNode.type === "tag"
                    ? themeColors.tag
                    : themeColors.article,
              }}
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
            className="absolute z-20 pointer-events-none px-3 py-2 rounded-lg bg-card/95 backdrop-blur-sm border border-border shadow-xl max-w-[220px]"
            style={{
              left: tooltipPos.x + 14,
              top: tooltipPos.y - 10,
              transform: "translateY(-100%)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor:
                    hoveredNode.type === "category"
                      ? themeColors.category
                      : hoveredNode.type === "tag"
                      ? themeColors.tag
                      : themeColors.article,
                }}
              />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {hoveredNode.type}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground leading-tight truncate">
              {hoveredNode.label}
            </p>
            {hoveredNode.connections && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {hoveredNode.connections} connection{hoveredNode.connections !== 1 ? "s" : ""}
              </p>
            )}
            <p className="text-[10px] text-accent mt-1">Click to focus &rarr;</p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 text-xs text-muted-foreground bg-card/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColors.category }}
            />
            <span>Categories (Main Timeline)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColors.tag }}
            />
            <span>Tags (Branch Points)</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: themeColors.article }}
            />
            <span>Articles (Variants)</span>
          </div>
        </div>

        {/* Node count */}
        <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground bg-card/70 backdrop-blur-sm rounded-lg px-2 py-1 border border-border/50">
          {visibleNodes.length} nodes &middot; {visibleEdges.length} branches
          {prunedNodes.size > 0 && (
            <span className="ml-2 text-accent">({prunedNodes.size} pruned)</span>
          )}
        </div>
      </div>
    </div>
  );
}
