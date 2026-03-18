import { NextResponse } from "next/server";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "movie"; // "movie" or "tv"

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 503 });
  }

  try {
    // Fetch main details + credits in parallel
    const [detailsRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE}/${type}/${id}?api_key=${apiKey}&language=en-US`),
      fetch(`${TMDB_BASE}/${type}/${id}/credits?api_key=${apiKey}&language=en-US`),
    ]);

    if (!detailsRes.ok) {
      return NextResponse.json(
        { error: `TMDB returned ${detailsRes.status}` },
        { status: detailsRes.status }
      );
    }

    const details = await detailsRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };

    const cast = (credits.cast || []).slice(0, 5).map((c: Record<string, string>) => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : null,
    }));

    // Director (movie) or Creator (TV)
    let director: string | null = null;
    if (type === "movie") {
      const d = (credits.crew || []).find(
        (c: Record<string, string>) => c.job === "Director"
      );
      director = d?.name || null;
    } else {
      director = details.created_by?.[0]?.name || null;
    }

    const result = {
      id: details.id,
      title: type === "movie" ? details.title : details.name,
      posterUrl: details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : null,
      backdropUrl: details.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}`
        : null,
      releaseYear: type === "movie"
        ? details.release_date?.substring(0, 4)
        : details.first_air_date?.substring(0, 4),
      genres: (details.genres || []).map((g: { name: string }) => g.name),
      runtime: type === "movie"
        ? details.runtime ? `${details.runtime}m` : null
        : details.number_of_seasons
          ? `${details.number_of_seasons} season${details.number_of_seasons > 1 ? "s" : ""}, ${details.number_of_episodes} episodes`
          : null,
      synopsis: details.overview || null,
      director,
      cast,
      voteAverage: details.vote_average,
      mediaType: type,
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (err) {
    console.error("[TMDB] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch TMDB data" }, { status: 500 });
  }
}
