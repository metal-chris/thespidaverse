import { NextResponse } from "next/server";

/**
 * TMDB search, proxied so the API key stays server-side.
 *
 * Studio (A7, docs/TIER_LIST_SPEC.md) calls this to offer poster candidates
 * for a tier entry. It returns only the four fields the picker renders, not
 * TMDB's full payload.
 *
 * Poster BYTES are not proxied: image.tmdb.org sends
 * `access-control-allow-origin: *`, so the browser fetches the blob itself
 * and uploads it with Studio's own authenticated Sanity client. That keeps
 * this route free of any caller-supplied URL, so there is no SSRF surface
 * here at all.
 *
 * NOT authenticated. `/api/` bypasses the splash gate, so anyone who finds
 * this can spend the site's TMDB quota — the same posture as
 * /api/admin/analytics today. It reads nothing and writes nothing, and the
 * inputs are clamped below. If that stops being acceptable, the fix is a
 * signed request from Studio, not a secret in the bundle (the Studio bundle
 * is public JS).
 */

const TMDB = "https://api.themoviedb.org/3";
/** TMDB's `w342` is the smallest poster that still reads at chip size. */
export const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

type Kind = "movie" | "tv";

interface Candidate {
  id: number;
  title: string;
  year: string | null;
  posterUrl: string | null;
}

export async function GET(request: Request) {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "TMDB_API_KEY is not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 120);
  const kindParam = url.searchParams.get("type");
  const kind: Kind = kindParam === "tv" ? "tv" : "movie";
  const yearRaw = (url.searchParams.get("year") ?? "").trim();
  const year = /^\d{4}$/.test(yearRaw) ? yearRaw : "";

  if (!q) {
    return NextResponse.json({ error: "q is required." }, { status: 400 });
  }

  const params = new URLSearchParams({ api_key: key, query: q, include_adult: "false" });
  if (year) params.set(kind === "tv" ? "first_air_date_year" : "year", year);

  try {
    const res = await fetch(`${TMDB}/search/${kind}?${params}`, {
      headers: { accept: "application/json" },
      // Same query from the same author repeats while they tune a title.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `TMDB responded ${res.status}.` }, { status: 502 });
    }
    const data = (await res.json()) as {
      results?: Array<{
        id: number;
        title?: string;
        name?: string;
        release_date?: string;
        first_air_date?: string;
        poster_path?: string | null;
      }>;
    };

    const results: Candidate[] = (data.results ?? []).slice(0, 8).map((r) => ({
      id: r.id,
      title: r.title ?? r.name ?? "Untitled",
      year: (r.release_date || r.first_air_date || "").slice(0, 4) || null,
      posterUrl: r.poster_path ? `${POSTER_BASE}${r.poster_path}` : null,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Could not reach TMDB." }, { status: 502 });
  }
}
