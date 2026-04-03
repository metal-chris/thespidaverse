import { NextResponse } from "next/server";

const ANILIST_QUERY = `
query ($id: Int, $type: MediaType) {
  Media(id: $id, type: $type) {
    id
    title { romaji english native }
    coverImage { extraLarge large }
    bannerImage
    episodes
    chapters
    volumes
    studios(isMain: true) { nodes { name } }
    status
    genres
    averageScore
    description(asHtml: false)
    season
    seasonYear
    format
    startDate { year month day }
  }
}`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") || "ANIME").toUpperCase();

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { id: parseInt(id, 10), type },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `AniList returned ${res.status}` }, { status: res.status });
    }

    const { data } = await res.json();
    const media = data?.Media;

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const result = {
      id: media.id,
      title: media.title.english || media.title.romaji,
      titleRomaji: media.title.romaji,
      titleNative: media.title.native,
      coverUrl: media.coverImage?.extraLarge || media.coverImage?.large || null,
      bannerUrl: media.bannerImage || null,
      episodes: media.episodes,
      chapters: media.chapters,
      volumes: media.volumes,
      studio: media.studios?.nodes?.[0]?.name || null,
      status: media.status,
      genres: media.genres || [],
      averageScore: media.averageScore,
      description: media.description || null,
      season: media.season,
      seasonYear: media.seasonYear,
      format: media.format,
      releaseDate: media.startDate?.year
        ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, "0")}-${String(media.startDate.day || 1).padStart(2, "0")}`
        : null,
      mediaType: type === "MANGA" ? "books" : "anime",
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (err) {
    console.error("[AniList] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch AniList data" }, { status: 500 });
  }
}
