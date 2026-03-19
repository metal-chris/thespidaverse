"use client";

import { useEffect, useRef, useState } from "react";
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

interface WebGraphMarkmapProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

function getThemeColors() {
  // Guard against SSR
  if (typeof document === "undefined") {
    return {
      isDark: false,
      isPeter: false,
      bg: "#FAFAFA",
      text: "#1A1A1A",
      linkColor: "#999",
    };
  }

  const themeAttr = document.documentElement.getAttribute("data-theme");
  const isDark = themeAttr === "venom";
  const isPeter = themeAttr === "peter";
  
  return {
    isDark,
    isPeter,
    bg: isDark ? "#0A0A0A" : isPeter ? "#4A0A0A" : "#FAFAFA",
    text: isDark ? "#E5E5E5" : isPeter ? "#F5F5F5" : "#1A1A1A",
    linkColor: isDark ? "#666" : isPeter ? "#8B3A3A" : "#999",
  };
}

// Category colors matching landing page
const CATEGORY_COLORS: Record<string, string> = {
  "Movies & TV": "#E82334",        // Red
  "Video Games": "#1E50DC",        // Blue
  "Anime & Manga": "#9333EA",      // Purple
  "Music": "#10B981",              // Green
};

function buildMarkmapMarkdown(nodes: GraphNode[], edges: GraphEdge[]): string {
  // Group nodes by category
  const categories = nodes.filter((n) => n.type === "category");
  const articles = nodes.filter((n) => n.type === "article");
  const tags = nodes.filter((n) => n.type === "tag");

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

  let markdown = "# The Web\n\n";

  categories.forEach((category) => {
    markdown += `## ${category.label}\n\n`;

    // Find tags connected to this category
    const categoryTags = tags.filter((tag) =>
      adjacency.get(category.id)?.has(tag.id)
    );

    categoryTags.forEach((tag) => {
      markdown += `### ${tag.label}\n\n`;

      // Find articles connected to this tag
      const tagArticles = articles.filter((article) =>
        adjacency.get(tag.id)?.has(article.id)
      );

      tagArticles.forEach((article) => {
        markdown += `- [${article.label}](/articles/${article.slug})\n`;
      });

      markdown += "\n";
    });

    // Find articles directly connected to category (no tag)
    const directArticles = articles.filter(
      (article) =>
        adjacency.get(category.id)?.has(article.id) &&
        !categoryTags.some((tag) => adjacency.get(tag.id)?.has(article.id))
    );

    if (directArticles.length > 0) {
      directArticles.forEach((article) => {
        markdown += `### [${article.label}](/articles/${article.slug})\n\n`;
      });
    }
  });

  return markdown;
}

export function WebGraphMarkmap({ nodes, edges }: WebGraphMarkmapProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const markmapRef = useRef<Markmap | null>(null);
  const [mounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState<ReturnType<typeof getThemeColors> | null>(null);

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

  useEffect(() => {
    if (!mounted || !svgRef.current) return;

    let cleanup: (() => void) | undefined;

    // Dynamic import to avoid SSR issues
    Promise.all([
      import("markmap-lib").then((mod) => mod.Transformer),
      import("markmap-view").then((mod) => mod.Markmap),
    ]).then(([Transformer, Markmap]) => {
      if (!svgRef.current) return;

      const markdown = buildMarkmapMarkdown(nodes, edges);
      const transformer = new Transformer();
      const { root } = transformer.transform(markdown);

      // Destroy existing instance if it exists
      if (markmapRef.current) {
        markmapRef.current.destroy();
      }

      // Recursively set fold state on all nodes except root
      const setFoldState = (node: any, depth: number = 0) => {
        if (depth > 0) {
          // Initialize payload if it doesn't exist
          if (!node.payload) {
            node.payload = {};
          }
          // Set fold to 1 (collapsed)
          node.payload.fold = 1;
        }
        
        if (node.children) {
          node.children.forEach((child: any) => setFoldState(child, depth + 1));
        }
      };
      
      setFoldState(root);

      // Create instance
      markmapRef.current = Markmap.create(svgRef.current, {
        color: (node: any) => {
          const depth = node.depth || 0;
          
          // Root node - neutral gray
          if (depth === 0) return "#6B7280";
          
          // Categories get their specific colors
          if (depth === 1) {
            const content = node.content || node.v || '';
            const categoryName = content.replace(/<[^>]*>/g, '').trim();
            return CATEGORY_COLORS[categoryName] || "#6B7280";
          }
          
          // Find parent category for tags and articles
          let parent = node.parent || node.p;
          while (parent && (parent.depth || parent.d || 0) > 1) {
            parent = parent.parent || parent.p;
          }
          
          if (parent && (parent.depth || parent.d) === 1) {
            const content = parent.content || parent.v || '';
            const categoryName = content.replace(/<[^>]*>/g, '').trim();
            return CATEGORY_COLORS[categoryName] || "#6B7280";
          }
          
          return "#6B7280";
        },
        duration: 300,
        maxWidth: 300,
        paddingX: 8,
        spacingVertical: 8,
        spacingHorizontal: 80,
        autoFit: true,
        fitRatio: 0.95,
      });

      markmapRef.current.setData(root);
      markmapRef.current.fit();

      // Handle clicks
      const svg = svgRef.current;
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest("a");
        if (link) {
          e.preventDefault();
          const href = link.getAttribute("href");
          if (href && href.startsWith("/")) {
            router.push(href);
          }
        }
      };

      svg.addEventListener("click", handleClick);
      cleanup = () => svg.removeEventListener("click", handleClick);
    });

    return () => cleanup?.();
  }, [mounted, nodes, edges, router]);

  // Update colors when theme changes
  useEffect(() => {
    if (!svgRef.current || !themeColors) return;

    const svg = svgRef.current;
    svg.style.backgroundColor = themeColors.bg;

    // Update text colors
    const textElements = svg.querySelectorAll("text");
    textElements.forEach((text) => {
      text.style.fill = themeColors.text;
    });

    // Update link colors
    const pathElements = svg.querySelectorAll("path");
    pathElements.forEach((path) => {
      path.style.stroke = themeColors.linkColor;
    });
  }, [themeColors]);

  return (
    <div className="w-full h-full bg-background">
      <div className="text-center pt-4 pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
          <span className="text-accent">///</span> The Web
        </h1>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          Click nodes to expand/collapse. Click article names to visit.
        </p>
      </div>

      <div className="w-full" style={{ height: "calc(100vh - 140px)" }}>
        <svg
          ref={svgRef}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
