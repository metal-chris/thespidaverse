import { NextResponse } from "next/server";
import { getSpotifyClientToken } from "@/lib/spotify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getSpotifyClientToken();

    const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Spotify returned ${res.status}` }, { status: res.status });
    }

    const track = await res.json();

    const result = {
      id: track.id,
      title: track.name,
      artists: track.artists.map((a: { name: string }) => a.name),
      albumName: track.album?.name,
      albumArtUrl: track.album?.images?.[0]?.url || null,
      releaseDate: track.album?.release_date,
      durationMs: track.duration_ms,
      spotifyUrl: track.external_urls?.spotify || null,
      mediaType: "music",
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (err) {
    console.error("[Spotify Track] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch Spotify data" }, { status: 500 });
  }
}
