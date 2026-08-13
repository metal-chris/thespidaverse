import { NextRequest, NextResponse } from "next/server";

/**
 * oEmbed provider for tier-list pages: /api/oembed?url=<article or /r/ URL>.
 *
 * Consumers that speak oEmbed (Notion, Ghost, WordPress, Iframely-backed
 * apps) discover this via the `application/json+oembed` alternate link on the
 * /r/ pages and get back a rich embed pointing at /embed/<slug> — the
 * interactive chart with attribution, not a static card. Twitter/Facebook/
 * Discord do NOT consume oEmbed from arbitrary sites; for them the OG image
 * (/api/og/tierlist) is the share experience. Both exist on purpose.
 *
 * Only URLs on this site are accepted, and only their path is trusted — the
 * response iframe src is rebuilt from parsed parts, never echoed input.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

// /articles/<slug>, /<locale>/articles/<slug>, optionally /r/<tl>
const PATH_RE =
  /^(?:\/(?:en|es|ja|pt|ko|fr|zh-CN|zh-TW))?\/articles\/([a-z0-9-]+)(?:\/r\/([A-Za-z0-9|%_-]+))?\/?$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("url");
  const format = searchParams.get("format") ?? "json";

  if (format !== "json") {
    // Per the oEmbed spec: 501 for unimplemented formats (we don't do XML).
    return NextResponse.json({ error: "Only json is supported" }, { status: 501 });
  }
  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const site = new URL(siteUrl);
  if (target.hostname !== site.hostname) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }

  const m = target.pathname.match(PATH_RE);
  if (!m) {
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
  const [, slug, tl] = m;
  const qs = new URLSearchParams();
  if (tl) qs.set("tl", decodeURIComponent(tl));
  const embedSrc = `${siteUrl}/embed/${slug}${qs.size ? `?${qs}` : ""}`;

  const width = 720;
  const height = 640;

  return NextResponse.json(
    {
      version: "1.0",
      type: "rich",
      provider_name: "The Spidaverse",
      provider_url: siteUrl,
      title: tl ? "A reader's tier list" : "Tier list",
      width,
      height,
      html: `<iframe src="${embedSrc}" width="${width}" height="${height}" style="border:0;border-radius:12px;max-width:100%" loading="lazy" title="The Spidaverse tier list"></iframe>`,
    },
    {
      headers: {
        // Embeds are public and cacheable; consumers hammer oEmbed endpoints.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
