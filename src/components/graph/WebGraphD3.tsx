"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3Hierarchy from "d3-hierarchy";
import * as d3Selection from "d3-selection";
import * as d3Zoom from "d3-zoom";
import * as d3Shape from "d3-shape";
import "d3-transition";

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

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface TreeDatum {
  name: string;
  type: "root" | "category" | "tag" | "article";
  category?: string;
  slug?: string;
  children?: TreeDatum[];
}

interface ThemeColors {
  bg: string;
  text: string;
  muted: string;
  link: string;
  isDark: boolean;
  badgeBg: string;
  badgeBorder: string;
}

type HierarchyNode = d3Hierarchy.HierarchyPointNode<TreeDatum> & {
  _children?: HierarchyNode[];
  x0?: number;
  y0?: number;
};

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

const NODE_RADIUS: Record<string, number> = {
  root: 16,
  category: 10,
  tag: 5,
  article: 4,
};

const FONT_SIZE: Record<string, number> = {
  root: 14,
  category: 12,
  tag: 11,
  article: 11,
};

const FONT_WEIGHT: Record<string, number> = {
  root: 700,
  category: 600,
  tag: 400,
  article: 400,
};

const BADGE_PAD_X = 8;
const BADGE_PAD_Y = 4;
const BADGE_CHAMFER = 3;

const DURATION = 400;
const HORIZONTAL_SPACING = 220;
const VERTICAL_SPACING = 28;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getThemeColors(): ThemeColors {
  if (typeof document === "undefined") {
    return {
      bg: "#FAFAFA", text: "#1A1A1A", muted: "#6B6B6B",
      link: "#D1D5DB", isDark: false,
      badgeBg: "rgba(0,0,0,0.06)", badgeBorder: "rgba(0,0,0,0.12)",
    };
  }
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "venom") {
    return {
      bg: "#0A0A0A", text: "#F5F5F5", muted: "#999",
      link: "#4B5563", isDark: true,
      badgeBg: "rgba(255,255,255,0.14)", badgeBorder: "rgba(255,255,255,0.25)",
    };
  }
  if (theme === "peter") {
    return {
      bg: "#4A0A0A", text: "#F5F5F5", muted: "#CC9999",
      link: "#6B2020", isDark: true,
      badgeBg: "rgba(255,255,255,0.14)", badgeBorder: "rgba(255,255,255,0.25)",
    };
  }
  return {
    bg: "#FAFAFA", text: "#1A1A1A", muted: "#6B6B6B",
    link: "#D1D5DB", isDark: false,
    badgeBg: "rgba(0,0,0,0.06)", badgeBorder: "rgba(0,0,0,0.12)",
  };
}

function nodeColor(d: TreeDatum): string {
  if (d.type === "root") return ROOT_COLOR;
  return CATEGORY_COLORS[d.category || ""] || ROOT_COLOR;
}

function buildTreeData(nodes: GraphNode[], edges: GraphEdge[]): TreeDatum {
  const adjacency = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adjacency.has(e.source)) adjacency.set(e.source, new Set());
    if (!adjacency.has(e.target)) adjacency.set(e.target, new Set());
    adjacency.get(e.source)!.add(e.target);
    adjacency.get(e.target)!.add(e.source);
  }

  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const categories = nodes.filter((n) => n.type === "category");
  const tags = nodes.filter((n) => n.type === "tag");
  const articles = nodes.filter((n) => n.type === "article");

  const categoryChildren: TreeDatum[] = categories.map((cat) => {
    const catAdj = adjacency.get(cat.id) || new Set();
    const catTags = tags.filter((t) => catAdj.has(t.id));
    const placedIds = new Set<string>();

    const tagChildren: TreeDatum[] = catTags.map((tag) => {
      const tagAdj = adjacency.get(tag.id) || new Set();
      const tagArticles = articles.filter((a) => tagAdj.has(a.id));
      tagArticles.forEach((a) => placedIds.add(a.id));
      return {
        name: tag.label,
        type: "tag" as const,
        category: cat.label,
        children: tagArticles.map((a) => ({
          name: a.label,
          type: "article" as const,
          category: cat.label,
          slug: a.slug,
        })),
      };
    });

    const directArticles = articles
      .filter((a) => catAdj.has(a.id) && !placedIds.has(a.id))
      .map((a) => ({
        name: a.label,
        type: "article" as const,
        category: cat.label,
        slug: a.slug,
      }));

    return {
      name: cat.label,
      type: "category" as const,
      category: cat.label,
      children: [...tagChildren, ...directArticles],
    };
  });

  return {
    name: "The Web",
    type: "root",
    children: categoryChildren,
  };
}

// ---------------------------------------------------------------------------
// Measure text width using a hidden SVG text element
// ---------------------------------------------------------------------------
function measureText(
  svg: SVGSVGElement,
  text: string,
  fontSize: number,
  fontWeight: number
): number {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
  el.setAttribute("font-size", `${fontSize}px`);
  el.setAttribute("font-weight", `${fontWeight}`);
  el.setAttribute("font-family", "Inter, system-ui, -apple-system, sans-serif");
  el.setAttribute("visibility", "hidden");
  el.textContent = text;
  svg.appendChild(el);
  const width = el.getComputedTextLength();
  svg.removeChild(el);
  return width;
}

// ---------------------------------------------------------------------------
// Hexagonal badge path
// ---------------------------------------------------------------------------
function badgePath(x: number, y: number, w: number, h: number, c: number): string {
  return [
    `M ${x + c} ${y}`,
    `L ${x + w - c} ${y}`,
    `L ${x + w} ${y + c}`,
    `L ${x + w} ${y + h - c}`,
    `L ${x + w - c} ${y + h}`,
    `L ${x + c} ${y + h}`,
    `L ${x} ${y + h - c}`,
    `L ${x} ${y + c}`,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Curved link path
// ---------------------------------------------------------------------------
function linkPath(source: { x: number; y: number }, target: { x: number; y: number }): string {
  const midY = (source.y + target.y) / 2;
  return `M ${source.y} ${source.x} C ${midY} ${source.x}, ${midY} ${target.x}, ${target.y} ${target.x}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function WebGraphD3({ nodes, edges }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null);

  const treeData = useMemo(() => buildTreeData(nodes, edges), [nodes, edges]);

  // Mount + theme observer
  useEffect(() => {
    setMounted(true);
    setThemeColors(getThemeColors());
    const observer = new MutationObserver(() => setThemeColors(getThemeColors()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Main D3 render
  const renderTree = useCallback(() => {
    if (!svgRef.current || !containerRef.current || !themeColors) return;

    const svg = d3Selection.select(svgRef.current);
    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    svg.attr("width", width).attr("height", height);

    // Clear previous render
    svg.selectAll("*").remove();

    // Create main group for zoom/pan
    const g = svg.append("g");
    gRef.current = g.node();

    // Zoom behavior
    const zoomBehavior = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Initial transform
    const initialX = width * 0.12;
    const initialY = height / 2;
    svg.call(
      zoomBehavior.transform,
      d3Zoom.zoomIdentity.translate(initialX, initialY)
    );

    // Create hierarchy
    const root = d3Hierarchy.hierarchy<TreeDatum>(treeData) as HierarchyNode;

    // Collapse all children of root initially
    if (root.children) {
      root.children.forEach((child) => collapse(child as HierarchyNode));
    }

    root.x0 = 0;
    root.y0 = 0;

    // Tree layout
    const treeLayout = d3Hierarchy.tree<TreeDatum>().nodeSize([VERTICAL_SPACING, HORIZONTAL_SPACING]);

    // Link group (rendered first so lines appear behind nodes)
    const linkGroup = g.append("g").attr("class", "links");
    const nodeGroup = g.append("g").attr("class", "nodes");

    function collapse(d: HierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach((c) => collapse(c as HierarchyNode));
        d.children = undefined as any;
      }
    }

    function toggle(d: HierarchyNode) {
      if (d.children) {
        d._children = d.children;
        d.children = undefined as any;
      } else if (d._children) {
        d.children = d._children;
        d._children = undefined;
      }
    }

    function update(source: HierarchyNode) {
      const treeNodes = treeLayout(root);
      const allNodes = treeNodes.descendants() as HierarchyNode[];
      const allLinks = treeNodes.links();

      // -- LINKS --
      const link = linkGroup
        .selectAll<SVGPathElement, d3Hierarchy.HierarchyPointLink<TreeDatum>>("path.link")
        .data(allLinks, (d: any) => (d.target as HierarchyNode).data.name + (d.target as HierarchyNode).data.type);

      // Enter links
      const linkEnter = link
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", themeColors.link)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", themeColors.isDark ? 0.7 : 0.4)
        .attr("d", () => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return linkPath(o, o);
        });

      // Update + enter
      linkEnter
        .merge(link)
        .transition()
        .duration(DURATION)
        .attr("d", (d: any) => linkPath(d.source, d.target))
        .attr("stroke", themeColors.link)
        .attr("stroke-opacity", themeColors.isDark ? 0.7 : 0.4);

      // Exit links
      link
        .exit()
        .transition()
        .duration(DURATION)
        .attr("d", () => {
          const o = { x: source.x || 0, y: source.y || 0 };
          return linkPath(o, o);
        })
        .remove();

      // -- NODES --
      const node = nodeGroup
        .selectAll<SVGGElement, HierarchyNode>("g.node")
        .data(allNodes, (d: any) => d.data.name + d.data.type + d.depth);

      // Enter nodes
      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", `translate(${source.y0 || 0},${source.x0 || 0})`)
        .attr("opacity", 0);

      // Circle
      nodeEnter
        .append("circle")
        .attr("r", (d) => NODE_RADIUS[d.data.type] || 4)
        .attr("fill", (d) => nodeColor(d.data))
        .attr("cursor", (d) => (d.data.type !== "article" ? "pointer" : "default"))
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.data.type !== "article") {
            toggle(d as HierarchyNode);
            update(d as HierarchyNode);
          }
        });

      // Collapse indicator (white dot)
      nodeEnter
        .append("circle")
        .attr("class", "collapse-dot")
        .attr("r", (d) => (NODE_RADIUS[d.data.type] || 4) * 0.35)
        .attr("fill", "#fff")
        .attr("opacity", 0)
        .attr("pointer-events", "none");

      // Badge background (hexagonal)
      nodeEnter
        .append("path")
        .attr("class", "badge")
        .attr("pointer-events", "none");

      // Text label
      nodeEnter
        .append("text")
        .attr("class", "label")
        .attr("dy", "0.35em")
        .attr("font-family", "Inter, system-ui, -apple-system, sans-serif")
        .attr("cursor", (d) => {
          if (d.data.type === "article") return "pointer";
          if (d.data.type !== "article" && (d.children || (d as HierarchyNode)._children)) return "pointer";
          return "default";
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.data.type === "article" && d.data.slug) {
            router.push(`/articles/${d.data.slug}`);
          } else if (d.data.type !== "article") {
            toggle(d as HierarchyNode);
            update(d as HierarchyNode);
          }
        })
        .on("mouseenter", function (event, d) {
          if (d.data.type === "article") {
            d3Selection.select(this).attr("text-decoration", "underline");
          }
        })
        .on("mouseleave", function () {
          d3Selection.select(this).attr("text-decoration", "none");
        });

      // Update + enter: position and style
      const nodeUpdate = nodeEnter.merge(node);

      nodeUpdate
        .transition()
        .duration(DURATION)
        .attr("transform", (d) => `translate(${d.y},${d.x})`)
        .attr("opacity", 1);

      // Update circles
      nodeUpdate
        .select<SVGCircleElement>("circle:first-of-type")
        .attr("fill", (d) => nodeColor(d.data));

      // Update collapse dots
      nodeUpdate.select<SVGCircleElement>(".collapse-dot").attr("opacity", (d) => {
        const hn = d as HierarchyNode;
        return hn._children && !hn.children ? 0.9 : 0;
      });

      // Update text and badge
      nodeUpdate.each(function (d) {
        const g = d3Selection.select(this);
        const textEl = g.select<SVGTextElement>(".label");
        const badgeEl = g.select<SVGPathElement>(".badge");

        const type = d.data.type;
        const radius = NODE_RADIUS[type] || 4;
        const fs = FONT_SIZE[type] || 11;
        const fw = FONT_WEIGHT[type] || 400;
        const textX = radius + 10;

        textEl
          .attr("x", textX)
          .attr("font-size", `${fs}px`)
          .attr("font-weight", fw)
          .attr("fill", themeColors.text)
          .attr("paint-order", "stroke fill")
          .attr("stroke", "none")
          .text(d.data.name);

        // Measure actual text width
        const textNode = textEl.node();
        if (textNode) {
          const textWidth = textNode.getComputedTextLength();
          const bw = textWidth + BADGE_PAD_X * 2;
          const bh = fs + BADGE_PAD_Y * 2;
          const bx = textX - BADGE_PAD_X;
          const by = -bh / 2;

          badgeEl
            .attr("d", badgePath(bx, by, bw, bh, BADGE_CHAMFER))
            .attr("fill", themeColors.badgeBg)
            .attr("stroke", themeColors.badgeBorder)
            .attr("stroke-width", 0.5);
        }
      });

      // Exit nodes
      node
        .exit()
        .transition()
        .duration(DURATION)
        .attr("transform", `translate(${source.y || 0},${source.x || 0})`)
        .attr("opacity", 0)
        .remove();

      // Store positions for next transition
      allNodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Initial render
    update(root);
  }, [treeData, themeColors, router]);

  // Render when mounted and theme ready
  useEffect(() => {
    if (mounted && themeColors) {
      renderTree();
    }
  }, [mounted, themeColors, renderTree]);

  // Re-render on resize
  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => renderTree();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mounted, renderTree]);

  // Loading state
  if (!mounted || !themeColors) {
    return (
      <div className="w-full h-full bg-background">
        <div className="text-center pt-4 pb-3">
          <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
            <span className="text-accent">///</span> The Web
          </h1>
          <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
            Click nodes to expand. Click articles to visit.
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
        <h1 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: themeColors.text }}>
          <span className="text-accent">///</span> The Web
        </h1>
        <p className="text-[11px] md:text-xs mt-0.5" style={{ color: themeColors.muted }}>
          Click nodes to expand. Click articles to visit.
        </p>
      </div>
      <div
        ref={containerRef}
        className="w-full"
        style={{
          height: "calc(100vh - 140px)",
          backgroundColor: themeColors.bg,
          touchAction: "none",
        }}
      >
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        />
      </div>
    </div>
  );
}
