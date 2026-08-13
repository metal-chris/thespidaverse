import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const COMING_SOON_PATH = "/coming-soon";
const COOKIE_NAME = "spidaverse-access";
const COOKIE_VALUE = "granted";

// Paths that skip BOTH locale routing and access gate
const BYPASS_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
  "/manifest",
  "/spider-cursor",
  "/pagefind",
  "/studio",
  "/admin",
];

const BYPASS_EXTENSIONS = [".svg", ".png", ".jpg", ".ico", ".json", ".xml", ".js", ".css", ".woff", ".woff2"];

/**
 * Link-preview crawlers skip the splash and read the real page.
 *
 * These bots fetch a URL once, read its meta tags, and render a static card —
 * they never execute JS, never carry cookies, and never click Connect. Gated,
 * every share on every platform unfurled as the same imageless coming-soon
 * stub (and `twitter:card` promised a large image that never came, the
 * ugliest render Twitter has). The splash is a threshold, not access
 * control — the Connect ritual grants a cookie to anyone who clicks — so
 * letting preview bots through leaks nothing the first click wouldn't.
 *
 * Search crawlers (Googlebot etc.) are deliberately NOT listed: whether the
 * pre-launch site should be indexed is an SEO decision to make explicitly,
 * not a side effect of fixing link unfurls.
 */
const PREVIEW_BOT_RE =
  /twitterbot|facebookexternalhit|facebookcatalog|discordbot|slackbot|linkedinbot|whatsapp|telegrambot|pinterestbot|redditbot|embedly|bluesky|mastodon|iframely/i;

const intlMiddleware = createMiddleware(routing);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip bypass paths entirely (no locale routing, no access gate)
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Skip static file extensions
  if (BYPASS_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // Check for access cookie — if not granted, redirect to coming-soon
  // (coming-soon itself is handled by locale routing, so allow it through)
  const isComingSoon = pathname === COMING_SOON_PATH ||
    routing.locales.some((l) => pathname === `/${l}${COMING_SOON_PATH}` || pathname === `/${l}/coming-soon`);

  const isPreviewBot = PREVIEW_BOT_RE.test(request.headers.get("user-agent") ?? "");

  if (!isComingSoon && !isPreviewBot) {
    const accessCookie = request.cookies.get(COOKIE_NAME);
    if (accessCookie?.value !== COOKIE_VALUE) {
      const url = request.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
      // Carry the destination through the splash. Without this, someone
      // following a shared deep link lands on the splash, clicks Connect, and
      // is dumped at the homepage — the link they followed is simply lost.
      // Path + query only (never a full URL), so it cannot become an open
      // redirect; the client validates the same way before navigating.
      const dest = request.nextUrl.pathname + request.nextUrl.search;
      url.search = "";
      if (dest !== "/") url.searchParams.set("next", dest);
      return NextResponse.redirect(url);
    }
  }

  // Apply locale routing (adds/strips locale prefix)
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api|studio|admin).*)",
  ],
};
