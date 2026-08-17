import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const SPLASH_PATH = "/splash";
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
  // The iframe embed surface. It renders on other people's pages, where
  // neither a locale-prefixed redirect nor the splash can ever make sense —
  // an embed that greets readers with a Connect ritual is just broken. It
  // handles its own locale via ?locale= and shows only public chart content.
  "/embed",
];

// `.txt` is here for /robots.txt, which the gate used to catch: crawlers got a
// 307 to the splash instead of the file, so the sitemap declaration inside it
// was unreachable. sitemap.xml and rss.xml were already fine via `.xml`.
const BYPASS_EXTENSIONS = [".svg", ".png", ".jpg", ".ico", ".json", ".xml", ".txt", ".js", ".css", ".woff", ".woff2"];

/**
 * Link-preview crawlers skip the splash and read the real page.
 *
 * These bots fetch a URL once, read its meta tags, and render a static card —
 * they never execute JS, never carry cookies, and never click Connect. Gated,
 * every share on every platform unfurled as the same imageless splash
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

  // Check for access cookie — if not granted, redirect to the splash
  // (the splash itself is handled by locale routing, so allow it through)
  const isSplash = pathname === SPLASH_PATH ||
    routing.locales.some((l) => pathname === `/${l}${SPLASH_PATH}` || pathname === `/${l}/splash`);

  const isPreviewBot = PREVIEW_BOT_RE.test(request.headers.get("user-agent") ?? "");

  if (!isSplash && !isPreviewBot) {
    const accessCookie = request.cookies.get(COOKIE_NAME);
    if (accessCookie?.value !== COOKIE_VALUE) {
      const url = request.nextUrl.clone();
      url.pathname = SPLASH_PATH;
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
