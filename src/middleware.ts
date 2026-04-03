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

  if (!isComingSoon) {
    const accessCookie = request.cookies.get(COOKIE_NAME);
    if (accessCookie?.value !== COOKIE_VALUE) {
      const url = request.nextUrl.clone();
      url.pathname = COMING_SOON_PATH;
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
