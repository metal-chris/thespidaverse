"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { GraphControls } from "./GraphControls";

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

interface WebGraphRadialProps {
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

/** Theme-aware colors */
function getThemeColors() {
  const themeAttr = document.documentElement.getAttribute("data-theme");
  const isVenom = themeAttr === "venom";
  const isPeter = themeAttr === "peter";
  // All three themes are dark
  return {
    isDark: true,
    bg: isVenom ? "#0A0A0A" : isPeter ? "#4A0A0A" : "#0D0D0D",
    labelColor: isVenom ? "#ffffffcc" : isPeter ? "#F5F5F5cc" : "#F0F0F0cc",
    linkBase: isVenom ? "rgba(255,255,255,0.1)" : isPeter ? "rgba(255,200,200,0.1)" : "rgba(255,255,255,0.08)",
    linkHighlight: "rgba(232,35,52,0.6)",
    searchHighlight: "#fff",
    hoverStroke: "#fff",
  };
}

/** Compute radial layout positions */
function computeRadialLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const centerX = width / 2;
  const centerY = height / 2;

  // Group nodes by type
  const categories = nodes.filter((n) => n.type === "category");
  const articles = nodes.filter((n) => n.type === "article");
  const tags = nodes.filter((n) => n.type === "tag");
  const media = nodes.filter((n) => n.type === "media");
  const collections = nodes.filter((n) => n.type === "collection");

  // Radii for each ring - tags inner, articles outer
  const categoryRadius = 0;
  const tagRadius = Math.min(width, height) * 0.25;
  const articleRadius = Math.min(width, height) * 0.42;
  const mediaRadius = Math.min(width, height) * 0.42;
  const collectionRadius = Math.min(width, height) * 0.42;

  // Position categories at center in a small circle
  categories.forEach((node, i) => {
    const angle = (i / categories.length) * 2 * Math.PI;
    const r = categoryRadius + (categories.length > 1 ? 80 : 0);
    positions.set(node.id, {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    });
  });

  // Position tags in inner ring
  tags.forEach((tag, i) => {
    const angle = (i / tags.length) * 2 * Math.PI;
    positions.set(tag.id, {
      x: centerX + tagRadius * Math.cos(angle),
      y: centerY + tagRadius * Math.sin(angle),
    });
  });

  // Position articles, media, collections in outer ring
  const outerNodes = [...articles, ...media, ...collections];
  outerNodes.forEach((node, i) => {
    const angle = (i / outerNodes.length) * 2 * Math.PI;
    const radius =
      node.type === "article"
        ? articleRadius
        : node.type === "media"
        ? mediaRadius
        : collectionRadius;
    positions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  return positions;
}

export function WebGraphRadial({ nodes, edges }: WebGraphRadialProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [focusedNode, setFocusedNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [themeColors, setThemeColors] = useState(() => getThemeColors());
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const [lastTouchCenter, setLastTouchCenter] = useState<{ x: number; y: number } | null>(null);

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

  const categories = useMemo(() => {
    const cats = new Set<string>();
    nodes.forEach((n) => {
      if (n.type) cats.add(n.type);
    });
    return Array.from(cats);
  }, [nodes]);

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

  // Get children of a node
  const getChildren = useCallback((nodeId: string) => {
    const children = new Set<string>();
    edges.forEach((e) => {
      if (e.source === nodeId) children.add(e.target as string);
      if (e.target === nodeId) children.add(e.source as string);
    });
    return children;
  }, [edges]);

  // Get all descendants recursively
  const getAllDescendants = useCallback((nodeId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(nodeId)) return visited;
    visited.add(nodeId);
    
    const children = getChildren(nodeId);
    children.forEach(childId => {
      if (!visited.has(childId)) {
        getAllDescendants(childId, visited);
      }
    });
    
    return visited;
  }, [getChildren]);

  const filteredNodes = useMemo(() => {
    let filtered = nodes;
    if (activeFilter) {
      filtered = filtered.filter((n) => n.type === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((n) => n.label.toLowerCase().includes(q));
    }

    // Filter out nodes that are children of collapsed nodes
    const hiddenNodes = new Set<string>();
    collapsedNodes.forEach(collapsedId => {
      const children = getChildren(collapsedId);
      children.forEach(childId => {
        // Only hide if the child is not a category (categories always visible)
        const childNode = nodes.find(n => n.id === childId);
        if (childNode && childNode.type !== "category") {
          hiddenNodes.add(childId);
        }
      });
    });

    return filtered.filter(n => !hiddenNodes.has(n.id));
  }, [nodes, activeFilter, searchQuery, collapsedNodes, getChildren]);

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

  const positions = useMemo(
    () => computeRadialLayout(filteredNodes, filteredEdges, dimensions.width, dimensions.height),
    [filteredNodes, filteredEdges, dimensions]
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

    // Draw edges
    filteredEdges.forEach((edge) => {
      const sourcePos = positions.get(edge.source as string);
      const targetPos = positions.get(edge.target as string);
      if (!sourcePos || !targetPos) return;

      const isActive =
        activeNode &&
        (edge.source === activeNode.id || edge.target === activeNode.id);
      const isDimmed = activeNode && !isActive;

      // Curved path
      const dx = targetPos.x - sourcePos.x;
      const dy = targetPos.y - sourcePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(dist * 0.15, 30);
      const mx = (sourcePos.x + targetPos.x) / 2;
      const my = (sourcePos.y + targetPos.y) / 2;
      const nx = -dy / (dist || 1);
      const ny = dx / (dist || 1);
      const cpx = mx + nx * curvature;
      const cpy = my + ny * curvature;

      ctx.beginPath();
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.quadraticCurveTo(cpx, cpy, targetPos.x, targetPos.y);

      if (isActive) {
        ctx.strokeStyle = themeColors.linkHighlight;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.9;
      } else if (isDimmed) {
        ctx.strokeStyle = themeColors.linkBase;
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.15;
      } else {
        ctx.strokeStyle = themeColors.linkBase;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.3;
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    filteredNodes.forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;

      const color = typeColors[node.type] || "#666";
      const isHighlighted =
        searchQuery && node.label.toLowerCase().includes(searchQuery.toLowerCase());
      const isHovered = hoveredNode?.id === node.id;
      const isFocused = focusedNode?.id === node.id;
      const isNeighbor = activeNode && neighborSet.has(node.id);
      const isDimmed = activeNode && !isNeighbor;

      // Node size based on type and connections - much larger for better visibility
      const baseR =
        node.type === "category"
          ? 20
          : node.type === "article"
          ? 10
          : node.type === "collection"
          ? 7
          : 6;
      const connectionBonus = Math.min((node.connections || 0) * 0.3, 6);
      const r = baseR + connectionBonus;

      // Glow for active nodes
      if (isHovered || isFocused || isNeighbor) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 8, 0, 2 * Math.PI);
        const grad = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r + 12);
        grad.addColorStop(0, color + (isFocused ? "80" : "50"));
        grad.addColorStop(1, color + "00");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw node
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDimmed ? color + "20" : color;
      ctx.fill();

      // Ring for categories - double ring for prominence
      if (node.type === "category" && !isDimmed) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "80";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 8, 0, 2 * Math.PI);
        ctx.strokeStyle = color + "40";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      if (isHighlighted) {
        ctx.strokeStyle = themeColors.searchHighlight;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (isHovered || isFocused) {
        ctx.strokeStyle = themeColors.hoverStroke;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Collapse/expand indicator for categories and articles
      if ((node.type === "category" || node.type === "article") && !isDimmed) {
        const isCollapsed = collapsedNodes.has(node.id);
        const hasChildren = getChildren(node.id).size > 0;
        
        if (hasChildren) {
          const indicatorSize = 8;
          const indicatorX = pos.x + r - 2;
          const indicatorY = pos.y - r + 2;
          
          // Circle background
          ctx.beginPath();
          ctx.arc(indicatorX, indicatorY, indicatorSize, 0, 2 * Math.PI);
          ctx.fillStyle = themeColors.bg;
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // +/- symbol
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          
          // Horizontal line
          ctx.beginPath();
          ctx.moveTo(indicatorX - 4, indicatorY);
          ctx.lineTo(indicatorX + 4, indicatorY);
          ctx.stroke();
          
          // Vertical line (only if collapsed)
          if (isCollapsed) {
            ctx.beginPath();
            ctx.moveTo(indicatorX, indicatorY - 4);
            ctx.lineTo(indicatorX, indicatorY + 4);
            ctx.stroke();
          }
        }
      }

      // Labels - always show for categories and articles
      const showLabel =
        isFocused ||
        isHovered ||
        node.type === "article" ||
        node.type === "category" ||
        scale > 1.2;
      if (showLabel && !isDimmed) {
        const fontSize = node.type === "category" ? 16 : node.type === "article" ? 13 : 11;
        ctx.font = `${node.type === "category" || isFocused ? "bold " : ""}${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = themeColors.labelColor;
        
        // Better label positioning for categories (above node)
        const labelY = node.type === "category" ? pos.y - r - 6 : pos.y + r + 5;
        ctx.textBaseline = node.type === "category" ? "bottom" : "top";
        
        const truncated = node.label.length > 30 ? node.label.slice(0, 28) + "…" : node.label;
        ctx.fillText(truncated, pos.x, labelY);
      }
    });

    ctx.restore();
  }, [
    mounted,
    dimensions,
    filteredNodes,
    filteredEdges,
    positions,
    themeColors,
    hoveredNode,
    focusedNode,
    activeNode,
    neighborSet,
    searchQuery,
    scale,
    offset,
    collapsedNodes,
    getChildren,
  ]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      // Find clicked node
      let clickedNode: GraphNode | null = null;
      for (const node of filteredNodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const baseR =
          node.type === "category"
            ? 20
            : node.type === "article"
            ? 10
            : node.type === "collection"
            ? 7
            : 6;
        const connectionBonus = Math.min((node.connections || 0) * 0.3, 6);
        const r = baseR + connectionBonus + 8; // Click tolerance

        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= r) {
          clickedNode = node;
          break;
        }
      }

      if (clickedNode) {
        // Right-click or Ctrl+click to toggle collapse
        if (e.button === 2 || e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (clickedNode.type === "category" || clickedNode.type === "article") {
            toggleCollapse(clickedNode.id);
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
        const pos = positions.get(clickedNode.id);
        if (pos) {
          setScale(2);
          setOffset({
            x: dimensions.width / 2 - pos.x * 2,
            y: dimensions.height / 2 - pos.y * 2,
          });
        }
      } else {
        // Clicked empty space - reset
        setFocusedNode(null);
        setScale(1);
        setOffset({ x: 0, y: 0 });
      }
    },
    [filteredNodes, positions, focusedNode, router, scale, offset, dimensions, toggleCollapse]
  );

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        setOffset({
          x: offset.x + e.movementX,
          y: offset.y + e.movementY,
        });
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      let hoveredNode: GraphNode | null = null;
      for (const node of filteredNodes) {
        const pos = positions.get(node.id);
        if (!pos) continue;

        const baseR =
          node.type === "category"
            ? 20
            : node.type === "article"
            ? 10
            : node.type === "collection"
            ? 7
            : 6;
        const connectionBonus = Math.min((node.connections || 0) * 0.3, 6);
        const r = baseR + connectionBonus + 8;

        const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        if (dist <= r) {
          hoveredNode = node;
          setTooltipPos({ x: e.clientX, y: e.clientY });
          break;
        }
      }

      setHoveredNode(hoveredNode);
    },
    [filteredNodes, positions, isPanning, offset, scale]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      
      // Detect trackpad pinch (ctrlKey) vs scroll
      if (e.ctrlKey) {
        // Trackpad pinch-zoom
        const delta = e.deltaY > 0 ? 0.99 : 1.01;
        const newScale = Math.max(0.5, Math.min(4, scale * delta));

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setOffset({
          x: mouseX - ((mouseX - offset.x) / scale) * newScale,
          y: mouseY - ((mouseY - offset.y) / scale) * newScale,
        });
        setScale(newScale);
      } else {
        // Regular scroll or trackpad pan
        setOffset({
          x: offset.x - e.deltaX,
          y: offset.y - e.deltaY,
        });
      }
    },
    [scale, offset]
  );

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(4, scale * 1.5);
    setScale(newScale);
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(0.5, scale * 0.67);
    setScale(newScale);
  }, [scale]);

  const handleReset = useCallback(() => {
    setFocusedNode(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const handleClearFocus = useCallback(() => {
    setFocusedNode(null);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 2) {
      // Two-finger pinch
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      setLastTouchDistance(distance);
      setLastTouchCenter({
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      });
    } else if (e.touches.length === 1) {
      // Single touch for panning
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - offset.x, y: e.touches[0].clientY - offset.y });
    }
  }, [offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && lastTouchDistance !== null && lastTouchCenter) {
      // Two-finger pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };

      const scaleDelta = distance / lastTouchDistance;
      const newScale = Math.max(0.5, Math.min(4, scale * scaleDelta));

      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = center.x - rect.left;
        const canvasY = center.y - rect.top;

        setOffset({
          x: canvasX - ((canvasX - offset.x) / scale) * newScale,
          y: canvasY - ((canvasY - offset.y) / scale) * newScale,
        });
        setScale(newScale);
      }

      setLastTouchDistance(distance);
      setLastTouchCenter(center);
    } else if (e.touches.length === 1 && isPanning) {
      // Single touch pan
      setOffset({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y,
      });
    }
  }, [lastTouchDistance, lastTouchCenter, scale, offset, isPanning, panStart]);

  const handleTouchEnd = useCallback(() => {
    setLastTouchDistance(null);
    setLastTouchCenter(null);
    setIsPanning(false);
  }, []);

  return (
    <div className="w-full bg-background">
      {/* Header + Controls */}
      <div ref={overlayRef} className="relative z-10 bg-background pb-3">
        <div className="text-center pt-4 pb-2">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Click to focus, click again to visit. Right-click categories/articles to collapse/expand branches.
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

      {/* Canvas area */}
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
                <circle
                  key={r}
                  cx={500}
                  cy={500}
                  r={r}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={0.5}
                  className="text-accent"
                />
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

        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={(e) => {
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
              setIsPanning(true);
              setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => {
            setIsPanning(false);
            setHoveredNode(null);
          }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="cursor-pointer touch-none"
          style={{ cursor: isPanning ? "grabbing" : "pointer" }}
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
