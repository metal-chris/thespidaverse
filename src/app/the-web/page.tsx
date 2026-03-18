import { getProvider } from "@/lib/providers";
import type { GraphArticle } from "@/lib/providers";
import { WebGraphMarkmap } from "@/components/graph/WebGraphMarkmap";
import { GraphEmptyState } from "@/components/graph/GraphEmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Web",
  description:
    "Explore the connections between movies, TV, games, anime, manga, and music across the Spidaverse.",
};

export const revalidate = 300;

function buildGraph(articles: GraphArticle[]) {
  const nodeMap = new Map<string, { id: string; label: string; type: string; category?: string; slug?: string; posterUrl?: string; connections?: number }>();
  const edges: { source: string; target: string; weight: number }[] = [];

  for (const article of articles) {
    nodeMap.set(article._id, {
      id: article._id,
      label: article.title,
      type: "article",
      category: article.category?.title,
      slug: article.slug.current,
      connections: 0,
    });

    if (article.tags) {
      for (const tag of article.tags) {
        if (!nodeMap.has(tag._id)) {
          nodeMap.set(tag._id, { id: tag._id, label: tag.title, type: "tag", slug: tag.slug?.current });
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
        nodeMap.set(catId, { id: catId, label: article.category.title, type: "category", slug: article.category.slug?.current });
      }
      edges.push({ source: article._id, target: catId, weight: 1.5 });
    }
  }

  // Count connections per node for sizing
  for (const edge of edges) {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (src) src.connections = (src.connections || 0) + 1;
    if (tgt) tgt.connections = (tgt.connections || 0) + 1;
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

  return <WebGraphMarkmap nodes={nodes as never[]} edges={edges} />;
}
