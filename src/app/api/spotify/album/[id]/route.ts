import { NextResponse } from "next/server";
import { getSpotifyClientToken } from "@/lib/spotify";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = await getSpotifyClientToken();

    const res = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Spotify returned ${res.status}` }, { status: res.status });
    }

    const album = await res.json();

    const result = {
      id: album.id,
      title: album.name,
      artists: album.artists.map((a: { name: string }) => a.name),
      albumArtUrl: album.images?.[0]?.url || null,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      tracks: album.tracks.items.map(
        (t: { name: string; duration_ms: number; track_number: number }) => ({
          name: t.name,
          durationMs: t.duration_ms,
          trackNumber: t.track_number,
        })
      ),
      durationMs: album.tracks.items.reduce(
        (sum: number, t: { duration_ms: number }) => sum + t.duration_ms,
        0
      ),
      spotifyUrl: album.external_urls?.spotify || null,
      mediaType: "music",
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (err) {
    console.error("[Spotify Album] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch Spotify data" }, { status: 500 });
  }
}
