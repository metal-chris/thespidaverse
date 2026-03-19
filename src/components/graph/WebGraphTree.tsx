"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Tree from "react-d3-tree";
import type { RawNodeDatum, TreeNodeDatum } from "react-d3-tree";

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

// Category colors matching landing page
const CATEGORY_COLORS: Record<string, string> = {
  "Movies & TV": "#E82334",        // Red
  "Video Games": "#1E50DC",        // Blue
  "Anime & Manga": "#9333EA",      // Purple
  "Music": "#10B981",              // Green
};

function getThemeColors() {
  if (typeof document === "undefined") {
    return {
      bg: "#FAFAFA",
      text: "#1A1A1A",
      linkColor: "#999",
    };
  }

  const themeAttr = document.documentElement.getAttribute("data-theme");
  const isDark = themeAttr === "venom";
  const isPeter = themeAttr === "peter";
  
  return {
    bg: isDark ? "#0A0A0A" : isPeter ? "#4A0A0A" : "#FAFAFA",
    text: isDark ? "#E5E5E5" : isPeter ? "#F5F5F5" : "#1A1A1A",
    linkColor: isDark ? "#666" : isPeter ? "#8B3A3A" : "#999",
  };
}

function buildTreeData(nodes: GraphNode[], edges: GraphEdge[]): RawNodeDatum {
  const categories = nodes.filter((n) => n.type === "category");
  const articles = nodes.filter((n) => n.type === "article");
  const tags = nodes.filter((n) => n.type === "tag");

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, new Set());
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, new Set());
    }
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  });

  // Build tree structure
  const children: RawNodeDatum[] = [];

  categories.forEach((category) => {
    const categoryTags = tags.filter((tag) =>
      adjacency.get(category.id)?.has(tag.id)
    );

    const tagChildren: RawNodeDatum[] = [];

    categoryTags.forEach((tag) => {
      const tagArticles = articles.filter((article) =>
        adjacency.get(tag.id)?.has(article.id)
      );

      const articleChildren: RawNodeDatum[] = tagArticles.map((article) => ({
        name: article.label,
        attributes: {
          type: "article",
          slug: article.slug || "",
          category: category.label,
        },
      }));

      tagChildren.push({
        name: tag.label,
        attributes: {
          type: "tag",
          category: category.label,
        },
        children: articleChildren.length > 0 ? articleChildren : undefined,
      });
    });

    // Add articles directly connected to category
    const directArticles = articles.filter(
      (article) =>
        adjacency.get(category.id)?.has(article.id) &&
        !categoryTags.some((tag) => adjacency.get(tag.id)?.has(article.id))
    );

    directArticles.forEach((article) => {
      tagChildren.push({
        name: article.label,
        attributes: {
          type: "article",
          slug: article.slug || "",
          category: category.label,
        },
      });
    });

    children.push({
      name: category.label,
      attributes: {
        type: "category",
        category: category.label,
      },
      children: tagChildren.length > 0 ? tagChildren : undefined,
    });
  });

  return {
    name: "The Web",
    attributes: {
      type: "root",
    },
    children,
  };
}

export function WebGraphTree({ nodes, edges }: WebGraphTreeProps) {
  const router = useRouter();
  const [treeData, setTreeData] = useState<RawNodeDatum | null>(null);
  const [themeColors, setThemeColors] = useState<ReturnType<typeof getThemeColors> | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  useEffect(() => {
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
    const data = buildTreeData(nodes, edges);
    setTreeData(data);
  }, [nodes, edges]);

  useEffect(() => {
    // Center the tree
    const container = document.getElementById("tree-container");
    if (container) {
      setTranslate({
        x: container.offsetWidth / 2,
        y: 100,
      });
    }
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    const nodeDatum = node.data as TreeNodeDatum;
    const attrs = nodeDatum.attributes as any;
    if (attrs?.type === "article" && attrs?.slug) {
      router.push(`/articles/${attrs.slug}`);
    }
  }, [router]);

  const renderCustomNode = useCallback(({ nodeDatum }: any) => {
    const attrs = nodeDatum.attributes as any;
    const nodeType = attrs?.type || "root";
    const categoryName = attrs?.category || "";
    
    // Determine color based on category
    let fillColor = "#6B7280"; // Default gray
    if (nodeType === "root") {
      fillColor = "#6B7280";
    } else if (categoryName) {
      fillColor = CATEGORY_COLORS[categoryName] || "#6B7280";
    }

    // Node size based on type
    const radius = nodeType === "root" ? 8 : nodeType === "category" ? 6 : 4;

    return (
      <g>
        <circle
          r={radius}
          fill={fillColor}
          stroke={fillColor}
          strokeWidth={2}
          style={{ cursor: nodeType === "article" ? "pointer" : "default" }}
        />
        <text
          fill={themeColors?.text || "#1A1A1A"}
          strokeWidth="0"
          x={radius + 10}
          y={5}
          style={{
            fontSize: nodeType === "root" ? "16px" : nodeType === "category" ? "14px" : "12px",
            fontWeight: nodeType === "root" || nodeType === "category" ? "600" : "400",
          }}
        >
          {nodeDatum.name}
        </text>
      </g>
    );
  }, [themeColors, router]);

  if (!treeData || !themeColors) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      <style>{`
        .tree-link {
          stroke: ${themeColors.linkColor};
          stroke-width: 2px;
          fill: none;
        }
      `}</style>
      
      <div className="text-center pt-4 pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground/90 tracking-tight">
          <span className="text-accent">///</span> The Web
        </h1>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">
          Click nodes to expand/collapse. Click article names to visit.
        </p>
      </div>

      <div
        id="tree-container"
        className="w-full"
        style={{
          height: "calc(100vh - 140px)",
          backgroundColor: themeColors.bg,
        }}
      >
        <Tree
          data={treeData}
          translate={translate}
          orientation="horizontal"
          pathFunc="step"
          collapsible={true}
          initialDepth={1}
          onNodeClick={handleNodeClick}
          renderCustomNodeElement={renderCustomNode}
          separation={{ siblings: 1, nonSiblings: 1.5 }}
          nodeSize={{ x: 200, y: 80 }}
          pathClassFunc={() => "tree-link"}
          enableLegacyTransitions
        />
      </div>
    </div>
  );
}
