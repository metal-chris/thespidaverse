import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COMING_SOON_PATH = "/coming-soon";
const COOKIE_NAME = "spidaverse-access";
const COOKIE_VALUE = "granted";

// Paths that should never be redirected
const BYPASS_PREFIXES = [
  COMING_SOON_PATH,
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip bypass paths
  if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Skip static file extensions
  if (BYPASS_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // Check for access cookie
  const accessCookie = request.cookies.get(COOKIE_NAME);
  if (accessCookie?.value === COOKIE_VALUE) {
    return NextResponse.next();
  }

  // Redirect to coming soon
  const url = request.nextUrl.clone();
  url.pathname = COMING_SOON_PATH;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    "/((?!_next/static|_next/image).*)",
  ],
};
