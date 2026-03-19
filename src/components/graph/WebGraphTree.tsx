"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Tree from "react-d3-tree";
import type { RawNodeDatum, CustomNodeElementProps } from "react-d3-tree";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
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

interface WebGraphTreeProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface ThemeColors {
  bg: string;
  text: string;
  mutedText: string;
  linkDefault: string;
  isDark: boolean;
  articleText: string;
  categoryText: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORY_COLORS: Record<string, string> = {
  "Movies & TV": "#E82334",
  "Video Games": "#1E50DC",
  "Anime & Manga": "#9333EA",
  Music: "#10B981",
};

const ROOT_COLOR = "#6B7280";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getThemeColors(): ThemeColors {
  if (typeof document === "undefined") {
    return {
      bg: "#FAFAFA", text: "#1A1A1A", mutedText: "#6B6B6B",
      linkDefault: "#D1D5DB", isDark: false,
      articleText: "inherit", categoryText: "inherit",
    };
  }

  const theme = document.documentElement.getAttribute("data-theme");

  if (theme === "venom") {
    return {
      bg: "#0A0A0A", text: "#F5F5F5", mutedText: "#999999",
      linkDefault: "#4B5563", isDark: true,
      articleText: "#E5E5E5", categoryText: "#F5F5F5",
    };
  }
  if (theme === "peter") {
    return {
      bg: "#4A0A0A", text: "#F5F5F5", mutedText: "#CC9999",
      linkDefault: "#6B2020", isDark: true,
      articleText: "#F0D0D0", categoryText: "#F5F5F5",
    };
  }
  // miles (default) — category colors are readable on white bg
  return {
    bg: "#FAFAFA", text: "#1A1A1A", mutedText: "#6B6B6B",
    linkDefault: "#D1D5DB", isDark: false,
    articleText: "inherit", categoryText: "inherit",
  };
}

/**
 * Transform flat graph nodes + edges into a hierarchical tree for react-d3-tree.
 *
 * Structure: Root → Categories → Tags → Articles
 * Articles without tags sit directly under their category.
 * All non-root nodes start collapsed.
 */
function buildTreeData(nodes: GraphNode[], edges: GraphEdge[]): RawNodeDatum {
  // Build adjacency
  const adjacency = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const categories = nodes.filter((n) => n.type === "category");
  const tags = nodes.filter((n) => n.type === "tag");
  const articles = nodes.filter((n) => n.type === "article");

  const categoryChildren: RawNodeDatum[] = categories.map((cat) => {
    // Tags connected to this category
    const catTags = tags.filter((t) => adjacency.get(cat.id)?.has(t.id));

    // Track which articles are placed under a tag
    const placedArticleIds = new Set<string>();

    const tagChildren: RawNodeDatum[] = catTags.map((tag) => {
      const tagArticles = articles.filter((a) => adjacency.get(tag.id)?.has(a.id));
      tagArticles.forEach((a) => placedArticleIds.add(a.id));

      return {
        name: tag.label,
        attributes: { type: "tag", category: cat.label },
        children: tagArticles.map((a) => ({
          name: a.label,
          attributes: { type: "article", slug: a.slug || "", category: cat.label },
        })),
        __rd3t: { collapsed: true },
      } as RawNodeDatum;
    });

    // Articles directly connected to category but not placed under any tag
    const directArticles = articles
      .filter((a) => adjacency.get(cat.id)?.has(a.id) && !placedArticleIds.has(a.id))
      .map((a) => ({
        name: a.label,
        attributes: { type: "article", slug: a.slug || "", category: cat.label },
      }));

    return {
      name: cat.label,
      attributes: { type: "category", category: cat.label },
      children: [...tagChildren, ...directArticles],
      __rd3t: { collapsed: true },
    } as RawNodeDatum;
  });

  return {
    name: "The Web",
    attributes: { type: "root" },
    children: categoryChildren,
  };
}

// ---------------------------------------------------------------------------
// Custom Node Renderer
// ---------------------------------------------------------------------------
function getNodeColor(nodeDatum: RawNodeDatum): string {
  const type = (nodeDatum.attributes?.type as string) || "";
  if (type === "root") return ROOT_COLOR;

  const category = (nodeDatum.attributes?.category as string) || "";
  return CATEGORY_COLORS[category] || ROOT_COLOR;
}

function getNodeRadius(type: string): number {
  switch (type) {
    case "root":
      return 18;
    case "category":
      return 12;
    case "tag":
      return 7;
    default:
      return 5;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function WebGraphTree({ nodes, edges }: WebGraphTreeProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Mount + theme observer
  useEffect(() => {
    setMounted(true);
    setThemeColors(getThemeColors());

    const observer = new MutationObserver(() => {
      setThemeColors(getThemeColors());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mounted]);

  // Build tree data
  const treeData = useMemo(() => buildTreeData(nodes, edges), [nodes, edges]);

  // Node click handler
  const handleNodeClick = useCallback(
    (nodeDatum: RawNodeDatum) => {
      if (nodeDatum.attributes?.type === "article" && nodeDatum.attributes?.slug) {
        router.push(`/articles/${nodeDatum.attributes.slug}`);
      }
    },
    [router]
  );

  // Custom node renderer
  const renderCustomNode = useCallback(
    ({ nodeDatum, toggleNode }: CustomNodeElementProps) => {
      const type = (nodeDatum.attributes?.type as string) || "article";
      const circleColor = getNodeColor(nodeDatum);
      const radius = getNodeRadius(type);
      const isArticle = type === "article";
      const isRoot = type === "root";
      const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
      const isDark = themeColors?.isDark ?? false;
      const textColor = themeColors?.text || "#1A1A1A";

      // On dark themes, use light readable text; on light theme, use category colors
      const labelColor = isRoot
        ? textColor
        : isArticle
          ? (isDark ? (themeColors?.articleText || "#E5E5E5") : circleColor)
          : (isDark ? (themeColors?.categoryText || "#F5F5F5") : circleColor);

      // Text offset based on node size
      const textX = radius + 10;
      const fontSize = isRoot ? 16 : type === "category" ? 14 : 12;
      const fontWeight = isRoot ? 700 : type === "category" ? 600 : 400;

      // Larger invisible hit area for touch devices
      const hitRadius = Math.max(radius, 22);

      return (
        <g>
          {/* Invisible hit area for easier touch targeting */}
          {hasChildren && (
            <circle
              r={hitRadius}
              fill="transparent"
              style={{ cursor: "pointer", touchAction: "manipulation" }}
              onClick={(e) => {
                e.stopPropagation();
                toggleNode();
              }}
            />
          )}

          {/* Node circle */}
          <circle
            r={radius}
            fill={circleColor}
            stroke={isRoot ? textColor : circleColor}
            strokeWidth={isRoot ? 2.5 : 1.5}
            style={{ cursor: hasChildren ? "pointer" : "default" }}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleNode();
            }}
          />

          {/* Collapse indicator: inner dot for collapsed nodes with children */}
          {hasChildren && (nodeDatum as any).__rd3t?.collapsed && (
            <circle r={radius * 0.4} fill="#fff" opacity={0.9} pointerEvents="none" />
          )}

          {/* Label */}
          {isArticle ? (
            <text
              x={textX}
              dy="0.35em"
              fontSize={fontSize}
              fontWeight={fontWeight}
              fill={labelColor}
              style={{
                cursor: "pointer",
                textDecoration: "none",
                touchAction: "manipulation",
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeClick(nodeDatum);
              }}
              onMouseEnter={(e) => {
                (e.target as SVGTextElement).style.textDecoration = "underline";
                if (!isDark) (e.target as SVGTextElement).style.fill = circleColor;
              }}
              onMouseLeave={(e) => {
                (e.target as SVGTextElement).style.textDecoration = "none";
                (e.target as SVGTextElement).style.fill = labelColor;
              }}
            >
              {nodeDatum.name}
            </text>
          ) : (
            <text
              x={textX}
              dy="0.35em"
              fontSize={fontSize}
              fontWeight={fontWeight}
              fill={labelColor}
              style={{
                cursor: hasChildren ? "pointer" : "default",
                touchAction: hasChildren ? "manipulation" : "auto",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleNode();
              }}
            >
              {nodeDatum.name}
            </text>
          )}
        </g>
      );
    },
    [themeColors, handleNodeClick]
  );

  // Don't render tree until mounted (prevents hydration mismatch)
  if (!mounted || !themeColors) {
    return (
      <div className="w-full h-full bg-background">
        <div className="text-center pt-4 pb-3">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Click to expand. Click articles to visit.
          </p>
        </div>
        <div className="w-full flex items-center justify-center" style={{ height: "calc(100vh - 140px)" }}>
          <div className="text-muted-foreground text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: themeColors.bg }}>
      <div className="text-center pt-4 pb-3">
        <h1
          className="text-xl md:text-2xl font-bold tracking-tight"
          style={{ color: themeColors.text }}
        >
          <span className="text-accent">///</span> The Web
        </h1>
        <p className="text-[11px] md:text-xs mt-0.5" style={{ color: themeColors.mutedText }}>
          Click to expand. Click articles to visit.
        </p>
      </div>

      <div
        ref={containerRef}
        className="w-full"
        style={{ height: "calc(100vh - 140px)", backgroundColor: themeColors.bg }}
      >
        {/* Dynamic link color + touch styles */}
        <style>{`
          .rd3t-link {
            stroke: ${themeColors.linkDefault} !important;
            stroke-width: 1.5px;
            stroke-opacity: ${themeColors.isDark ? 0.8 : 0.5};
          }
          .rd3t-tree-container {
            touch-action: pan-x pan-y pinch-zoom;
            -webkit-overflow-scrolling: touch;
          }
          .rd3t-tree-container svg {
            touch-action: none;
          }
          .rd3t-node text {
            user-select: none;
            -webkit-user-select: none;
          }
        `}</style>
        <Tree
          data={treeData}
          orientation="horizontal"
          pathFunc="diagonal"
          translate={{ x: dimensions.width * 0.15, y: dimensions.height / 2 }}
          nodeSize={{ x: 200, y: 40 }}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
          collapsible={true}
          initialDepth={0}
          transitionDuration={300}
          renderCustomNodeElement={renderCustomNode}
          pathClassFunc={() => "tree-link"}
          rootNodeClassName="tree-root"
          branchNodeClassName="tree-branch"
          leafNodeClassName="tree-leaf"
          enableLegacyTransitions={false}
          zoomable={true}
          draggable={true}
          scaleExtent={{ min: 0.3, max: 2 }}
        />
      </div>
    </div>
  );
}
