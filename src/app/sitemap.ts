import type { MetadataRoute } from "next";
import { getProvider } from "@/lib/providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const provider = getProvider();

  // Fetch all content
  const [articles, categories, collections] = await Promise.all([
    provider.getArticles(),
    provider.getCategories(),
    provider.getCollections(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/journal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/collections`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/the-web`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/mood`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Article pages
  const articlePages: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${siteUrl}/articles/${article.slug.current}`,
    lastModified: new Date(article._createdAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${siteUrl}/category/${cat.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Collection pages
  const collectionPages: MetadataRoute.Sitemap = (collections || []).map((col) => ({
    url: `${siteUrl}/collections/${col.slug.current}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...categoryPages, ...collectionPages];
}
