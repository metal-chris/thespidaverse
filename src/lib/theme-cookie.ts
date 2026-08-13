/**
 * Theme persistence that can cross between The Spidaverse and Kumo Club.
 *
 * The two sites are separate Next apps in separate repos, but they share a
 * registrable domain — thespidaverse.com and club.thespidaverse.com. That is
 * the whole trick: `localStorage` is scoped to an ORIGIN, so a theme chosen on
 * one could never be seen by the other, while a cookie scoped to
 * `.thespidaverse.com` is sent to every subdomain under it. One cookie, both
 * sites, no shared database and no cross-origin messaging.
 *
 * Two caveats worth knowing before relying on this:
 *
 *  1. It reaches subdomains of thespidaverse.com ONLY. Kumo Club also answers
 *     on mdnght.world, and that is a different registrable domain — nothing
 *     here can travel to it. Sharing requires the club be reached at its
 *     club.thespidaverse.com address.
 *  2. The two sites do not yet mean the same thing by "theme". This site has
 *     one axis conflating accent and lightness (three palettes, one of which
 *     is the light one); the club has its own pair plus a separate light mode.
 *     This module moves the VALUE across; making both read it the same way is
 *     a modelling decision, not a transport one.
 *
 * Deliberately dependency-free and client-only in use, but with no `window`
 * assumptions at module scope, so it is safe to import anywhere.
 */

/** Palette (accent family) and mode (surface lightness) — two axes, two
 *  cookies, so either can change without rewriting the other. The names double
 *  as the localStorage keys, which keeps the migration path trivial: same key,
 *  new transport. */
export const PALETTE_KEY = "spidaverse-theme";
export const MODE_KEY = "spidaverse-mode";

/** @deprecated use PALETTE_KEY */
export const THEME_COOKIE = PALETTE_KEY;

/** One year. A visual preference should outlive a session comfortably. */
const MAX_AGE = 60 * 60 * 24 * 365;

/**
 * The widest domain we may legitimately claim.
 *
 * On `*.thespidaverse.com` we scope to `.thespidaverse.com` so siblings share
 * it. Anywhere else — localhost, Netlify previews, mdnght.world — we set a
 * host-only cookie, because naming a domain the browser considers a public
 * suffix (or simply not ours) gets the cookie silently rejected, and a
 * silently-rejected cookie is worse than an honestly local one.
 */
function cookieDomain(): string | null {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "thespidaverse.com" || host.endsWith(".thespidaverse.com")) {
    return ".thespidaverse.com";
  }
  return null;
}

export function readPref(key: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** @deprecated use readPref(PALETTE_KEY) */
export const readThemeCookie = () => readPref(PALETTE_KEY);

export function writePref(key: string, value: string): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomain();
  // Not HttpOnly on purpose: the theme is applied by client script before
  // paint, so the document has to be able to read it. It carries no secret.
  // SameSite=Lax is enough — this is never needed on a cross-site POST.
  document.cookie =
    `${key}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax` +
    (domain ? `; Domain=${domain}` : "") +
    (window.location.protocol === "https:" ? "; Secure" : "");
}

/** @deprecated use writePref(PALETTE_KEY, value) */
export const setThemeCookie = (value: string) => writePref(PALETTE_KEY, value);
