import { NextResponse } from "next/server";
import { getSpotifyUserToken } from "@/lib/spotify";
import { fetchTraktWatching } from "@/lib/trakt";
import { fetchSteamPlaying } from "@/lib/steam";
import { fetchAniListCurrent } from "@/lib/anilist";

export const revalidate = 0;

async function fetchSpotifyListening() {
  if (!process.env.SPOTIFY_REFRESH_TOKEN) return null;

  try {
    const token = await getSpotifyUserToken();

    // Currently playing
    const nowRes = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (nowRes.status === 200) {
      const data = await nowRes.json();
      if (data.is_playing && data.item) {
        return {
          title: data.item.name,
          artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
          coverUrl: data.item.album?.images?.[0]?.url || undefined,
          spotifyUrl: data.item.external_urls?.spotify || undefined,
          isPlaying: true,
        };
      }
    }

    // Recently played fallback
    const recentRes = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (recentRes.ok) {
      const data = await recentRes.json();
      const track = data.items?.[0]?.track;
      if (track) {
        return {
          title: track.name,
          artist: track.artists.map((a: { name: string }) => a.name).join(", "),
          coverUrl: track.album?.images?.[0]?.url || undefined,
          spotifyUrl: track.external_urls?.spotify || undefined,
          isPlaying: false,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("[Currently Consuming] Spotify error:", err);
    return null;
  }
}

export async function GET() {
  // Fetch all 4 services in parallel
  const [trakt, steam, anilist, spotify] = await Promise.all([
    fetchTraktWatching().catch(() => null),
    fetchSteamPlaying().catch(() => null),
    fetchAniListCurrent().catch(() => ({ manga: null, anime: null })),
    fetchSpotifyListening().catch(() => null),
  ]);

  // Watching: Trakt takes priority, AniList anime as fallback
  const watching = trakt
    ? {
        title: trakt.title,
        mediaType: trakt.mediaType,
        posterUrl: trakt.posterUrl,
        progress: trakt.progress,
        isLive: trakt.isLive,
      }
    : anilist.anime
      ? {
          title: anilist.anime.title,
          mediaType: "anime",
          posterUrl: anilist.anime.coverUrl,
          progress: anilist.anime.progress,
          isLive: false,
        }
      : undefined;

  // Playing: Steam
  const playing = steam
    ? {
        title: steam.title,
        coverUrl: steam.coverUrl,
        platform: steam.platform,
        progress: steam.progress,
        isLive: steam.isLive,
      }
    : undefined;

  // Reading: AniList manga
  const reading = anilist.manga
    ? {
        title: anilist.manga.title,
        mediaType: "manga",
        coverUrl: anilist.manga.coverUrl,
        progress: anilist.manga.progress,
        isLive: false,
      }
    : undefined;

  // Listening: Spotify
  const listening = spotify
    ? {
        title: spotify.title,
        artist: spotify.artist,
        coverUrl: spotify.coverUrl,
        spotifyUrl: spotify.spotifyUrl,
        isPlaying: spotify.isPlaying,
      }
    : undefined;

  return NextResponse.json(
    { watching, playing, reading, listening },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    }
  );
}
