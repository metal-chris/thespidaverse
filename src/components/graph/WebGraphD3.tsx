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
  type: "root" | "category" | "tag" | "article" | "nav";
  category?: string;
  slug?: string;
  navAction?: "next" | "prev";
  children?: TreeDatum[];
  _allArticles?: TreeDatum[];
  _page?: number;
}

interface ThemeColors {
  bg: string;
  text: string;
  muted: string;
  link: string;
  isDark: boolean;
  badgeBg: string;
  badgeSolid: string;
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
  nav: 3,
};

const FONT_SIZE: Record<string, number> = {
  root: 14,
  category: 12,
  tag: 11,
  article: 11,
  nav: 10,
};

const FONT_WEIGHT: Record<string, number> = {
  root: 700,
  category: 600,
  tag: 400,
  article: 400,
  nav: 500,
};

const BADGE_PAD_X = 8;
const BADGE_PAD_Y = 4;
const BADGE_CHAMFER = 3;

const DURATION = 400;
const HORIZONTAL_SPACING = 220;
const VERTICAL_SPACING = 28;
const PAGE_SIZE = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getThemeColors(): ThemeColors {
  if (typeof document === "undefined") {
    // SSR fallback — Miles (dark)
    return {
      bg: "#0D0D0D", text: "#F0F0F0", muted: "#8A8A8A",
      link: "#3D1520", isDark: true,
      badgeBg: "rgba(255,255,255,0.10)", badgeSolid: "rgba(22,22,22,0.92)", badgeBorder: "rgba(255,255,255,0.18)",
    };
  }
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "venom") {
    return {
      bg: "#0A0A0A", text: "#F5F5F5", muted: "#999",
      link: "#4B5563", isDark: true,
      badgeBg: "rgba(255,255,255,0.14)", badgeSolid: "rgba(20,20,20,0.92)", badgeBorder: "rgba(255,255,255,0.25)",
    };
  }
  if (theme === "peter") {
    return {
      bg: "#3A0808", text: "#F5F5F5", muted: "#CC9999",
      link: "#6B2020", isDark: true,
      badgeBg: "rgba(255,255,255,0.14)", badgeSolid: "rgba(74,10,10,0.92)", badgeBorder: "rgba(255,255,255,0.25)",
    };
  }
  // Miles (default) — dark with red tint
  return {
    bg: "#0D0D0D", text: "#F0F0F0", muted: "#8A8A8A",
    link: "#3D1520", isDark: true,
    badgeBg: "rgba(255,255,255,0.10)", badgeSolid: "rgba(22,22,22,0.92)", badgeBorder: "rgba(255,255,255,0.18)",
  };
}

function nodeColor(d: TreeDatum): string {
  if (d.type === "root") return ROOT_COLOR;
  if (d.type === "nav") return "#6B7280";
  return CATEGORY_COLORS[d.category || ""] || ROOT_COLOR;
}

/** Build page slice with nav nodes for a given category's articles */
function buildPageChildren(allArticles: TreeDatum[], page: number, category: string): TreeDatum[] {
  const total = allArticles.length;
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, total);
  const slice = allArticles.slice(start, end);

  const children: TreeDatum[] = [];

  if (start > 0) {
    children.push({
      name: `\u25C2 Newer`,
      type: "nav",
      category,
      navAction: "prev",
    });
  }

  children.push(...slice);

  if (end < total) {
    const remaining = total - end;
    children.push({
      name: `${remaining} more \u25B8`,
      type: "nav",
      category,
      navAction: "next",
    });
  }

  return children;
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
  const articles = nodes.filter((n) => n.type === "article");

  const categoryChildren: TreeDatum[] = categories.map((cat) => {
    const catAdj = adjacency.get(cat.id) || new Set();

    // Store ALL articles on the category (already sorted by most recent from query)
    const allArticles: TreeDatum[] = articles
      .filter((a) => catAdj.has(a.id))
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
      _allArticles: allArticles,
      _page: 0,
      children: buildPageChildren(allArticles, 0, cat.label),
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

  // Refs for D3 internals so handleNavClick can access them without re-render
  const rootRef = useRef<HierarchyNode | null>(null);
  const updateFnRef = useRef<((source: HierarchyNode) => void) | null>(null);

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

    // Zoom behavior — supports mouse wheel, trackpad scroll/pinch, and mobile touch
    const zoomBehavior = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .filter((event) => {
        // Allow all zoom/pan events except double-click (we'll use it for reset)
        if (event.type === "dblclick") return true;
        // Allow wheel (mouse + trackpad), touch, and mouse drag
        return !event.ctrlKey || event.type === "wheel";
      })
      .touchable(true)
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg
      .call(zoomBehavior)
      // Prevent trackpad scroll from scrolling the page
      .on("wheel.zoom", function (event) {
        event.preventDefault();
        const currentTransform = d3Zoom.zoomTransform(this);
        
        // Trackpad pinch sends ctrlKey + wheel; regular scroll sends just wheel
        if (event.ctrlKey) {
          // Pinch-to-zoom (trackpad)
          const scale = currentTransform.k * Math.pow(2, -event.deltaY * 0.01);
          const clampedScale = Math.max(0.3, Math.min(3, scale));
          const point = d3Selection.pointer(event, this);
          svg.call(
            zoomBehavior.transform,
            currentTransform
              .translate(point[0], point[1])
              .scale(clampedScale / currentTransform.k)
              .translate(-point[0], -point[1])
          );
        } else {
          // Two-finger scroll (trackpad) or mouse wheel
          svg.call(
            zoomBehavior.transform,
            currentTransform.translate(-event.deltaX, -event.deltaY)
          );
        }
      })
      // Double-click to reset view
      .on("dblclick.zoom", () => {
        svg
          .transition()
          .duration(500)
          .call(
            zoomBehavior.transform,
            d3Zoom.zoomIdentity.translate(width * 0.12, height / 2)
          );
      });

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
        .attr("stroke", themeColors!.link)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", themeColors!.isDark ? 0.7 : 0.4)
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
        .attr("stroke", themeColors!.link)
        .attr("stroke-opacity", themeColors!.isDark ? 0.7 : 0.4);

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
        .attr("cursor", (d) => (d.data.type === "article" ? "default" : "pointer"))
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.data.type === "nav") {
            handleNavClick(d.data);
          } else if (d.data.type !== "article") {
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
          if (d.data.type === "article" || d.data.type === "nav") return "pointer";
          if (d.children || (d as HierarchyNode)._children) return "pointer";
          return "default";
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          if (d.data.type === "nav") {
            handleNavClick(d.data);
          } else if (d.data.type === "article" && d.data.slug) {
            router.push(`/articles/${d.data.slug}`);
          } else if (d.data.type !== "article") {
            toggle(d as HierarchyNode);
            update(d as HierarchyNode);
          }
        })
        .on("mouseenter", function (event, d) {
          if (d.data.type === "article" || d.data.type === "nav") {
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
          .attr("fill", themeColors!.text)
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

          // Category/root badges are opaque so branches appear behind them
          const isImportant = type === "category" || type === "root";
          const fill = isImportant ? themeColors!.badgeSolid : themeColors!.badgeBg;

          badgeEl
            .attr("d", badgePath(bx, by, bw, bh, BADGE_CHAMFER))
            .attr("fill", fill)
            .attr("stroke", themeColors!.badgeBorder)
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

    function handleNavClick(navDatum: TreeDatum) {
      if (!navDatum.category || !navDatum.navAction) return;

      // Find the parent category node in the live D3 hierarchy
      const categoryNode = root.descendants().find(
        (n) => n.data.type === "category" && n.data.category === navDatum.category
      ) as HierarchyNode | undefined;
      if (!categoryNode || !categoryNode.data._allArticles) return;

      // Update page
      const currentPage = categoryNode.data._page || 0;
      const newPage = navDatum.navAction === "next" ? currentPage + 1 : Math.max(0, currentPage - 1);
      categoryNode.data._page = newPage;

      // Build new children data
      const newChildrenData = buildPageChildren(
        categoryNode.data._allArticles,
        newPage,
        navDatum.category
      );
      categoryNode.data.children = newChildrenData;

      // Create new HierarchyNode children from the data
      categoryNode.children = newChildrenData.map((childData) => {
        const child = {
          data: childData,
          parent: categoryNode,
          depth: categoryNode.depth + 1,
          height: 0,
          children: undefined,
          _children: undefined,
          // Start from parent position for smooth animation
          x: categoryNode.x,
          y: categoryNode.y,
          x0: categoryNode.x,
          y0: categoryNode.y,
        } as unknown as HierarchyNode;
        return child;
      });

      // Animate the update from the category node
      update(categoryNode);
    }

    // Store refs for external access
    rootRef.current = root;
    updateFnRef.current = update;

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
