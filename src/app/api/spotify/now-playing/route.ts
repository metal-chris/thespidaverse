import { NextResponse } from "next/server";
import { getSpotifyUserToken } from "@/lib/spotify";

export const revalidate = 0; // Always fresh

export async function GET() {
  if (!process.env.SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ isPlaying: false, error: "Spotify not configured" }, { status: 200 });
  }

  try {
    const token = await getSpotifyUserToken();

    // Try currently playing first
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.is_playing && data.item) {
        return NextResponse.json({
          isPlaying: true,
          title: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          albumArtUrl: data.item.album?.images?.[0]?.url || null,
          spotifyUrl: data.item.external_urls?.spotify || null,
        }, {
          headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
        });
      }
    }

    // Fallback to recently played
    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (recentRes.ok) {
      const data = await recentRes.json();
      const track = data.items?.[0]?.track;
      if (track) {
        return NextResponse.json({
          isPlaying: false,
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(", "),
          albumArtUrl: track.album?.images?.[0]?.url || null,
          spotifyUrl: track.external_urls?.spotify || null,
          lastPlayed: true,
        }, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
        });
      }
    }

    return NextResponse.json({ isPlaying: false });
  } catch (err) {
    console.error("[Spotify Now Playing] Error:", err);
    return NextResponse.json({ isPlaying: false, error: "Failed to fetch" }, { status: 200 });
  }
}
