import { getProvider } from "@/lib/providers";
import type { GraphArticle } from "@/lib/providers";
import { WebGraph } from "@/components/graph/WebGraph";
import { GraphEmptyState } from "@/components/graph/GraphEmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Web",
  description:
    "Explore the connections between movies, TV, games, anime, manga, and music across the Spidaverse.",
};

export const revalidate = 300;

function buildGraph(articles: GraphArticle[]) {
  const nodeMap = new Map<string, { id: string; label: string; type: string; category?: string; slug?: string; posterUrl?: string }>();
  const edges: { source: string; target: string; weight: number }[] = [];

  for (const article of articles) {
    nodeMap.set(article._id, {
      id: article._id,
      label: article.title,
      type: "article",
      category: article.category?.title,
      slug: article.slug.current,
    });

    if (article.tags) {
      for (const tag of article.tags) {
        if (!nodeMap.has(tag._id)) {
          nodeMap.set(tag._id, { id: tag._id, label: tag.title, type: "tag" });
        }
        edges.push({ source: article._id, target: tag._id, weight: 1 });
      }
    }

    if (article.relatedMedia) {
      for (const media of article.relatedMedia) {
        if (!nodeMap.has(media._id)) {
          nodeMap.set(media._id, {
            id: media._id,
            label: media.title,
            type: "media",
            posterUrl: media.posterUrl,
          });
        }
        edges.push({ source: article._id, target: media._id, weight: 2 });
      }
    }

    if (article.category) {
      const catId = `cat-${article.category._id}`;
      if (!nodeMap.has(catId)) {
        nodeMap.set(catId, { id: catId, label: article.category.title, type: "category" });
      }
      edges.push({ source: article._id, target: catId, weight: 1.5 });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}

export default async function TheWebPage() {
  const provider = getProvider();
  const articles = await provider.getArticlesForGraph();

  if (!articles || articles.length === 0) {
    return <GraphEmptyState />;
  }

  const { nodes, edges } = buildGraph(articles);

  const cappedNodes = nodes.slice(0, 200);
  const nodeIds = new Set(cappedNodes.map((n) => n.id));
  const cappedEdges = edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return <WebGraph nodes={cappedNodes as never[]} edges={cappedEdges} />;
}
