import { getProvider } from "@/lib/providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const provider = getProvider();
  const articles = await provider.getArticles();
  const recent = (articles || []).slice(0, 20);

  const items = recent
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${siteUrl}/articles/${article.slug.current}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${article.slug.current}</guid>
      <pubDate>${new Date(article._createdAt).toUTCString()}</pubDate>
      ${article.excerpt ? `<description>${escapeXml(article.excerpt)}</description>` : ""}
      ${article.category ? `<category>${escapeXml(article.category.title)}</category>` : ""}
    </item>`
    )
    .join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Spidaverse</title>
    <link>${siteUrl}</link>
    <description>Movies. TV. Games. Anime. Manga. Music. One web connects them all.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
