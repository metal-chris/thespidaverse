// Trakt.tv API client — fetches currently watching / recently watched

const TRAKT_API = "https://api.trakt.tv";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w300";

interface TraktWatching {
  title: string;
  mediaType: string;
  posterUrl?: string;
  progress?: string;
  isLive: boolean;
}

/** Fetch TMDB poster for a Trakt item */
async function getTmdbPoster(tmdbId: number | undefined, type: "movie" | "tv"): Promise<string | undefined> {
  if (!tmdbId) return undefined;
  const key = process.env.TMDB_API_KEY;
  if (!key) return undefined;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${key}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.poster_path ? `${TMDB_IMAGE}${data.poster_path}` : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchTraktWatching(): Promise<TraktWatching | null> {
  const clientId = process.env.TRAKT_CLIENT_ID;
  const username = process.env.TRAKT_USERNAME;
  if (!clientId || !username) return null;

  const headers = {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": clientId,
  };

  try {
    // 1. Check if actively watching something right now
    const watchingRes = await fetch(`${TRAKT_API}/users/${username}/watching`, { headers });

    if (watchingRes.status === 200) {
      const data = await watchingRes.json();

      if (data.type === "episode") {
        const show = data.show;
        const ep = data.episode;
        const poster = await getTmdbPoster(show?.ids?.tmdb, "tv");
        return {
          title: show?.title ?? "Unknown Show",
          mediaType: "tv",
          posterUrl: poster,
          progress: `S${ep?.season ?? "?"} E${ep?.number ?? "?"}`,
          isLive: true,
        };
      }

      if (data.type === "movie") {
        const movie = data.movie;
        const poster = await getTmdbPoster(movie?.ids?.tmdb, "movie");
        return {
          title: movie?.title ?? "Unknown Movie",
          mediaType: "movie",
          posterUrl: poster,
          isLive: true,
        };
      }
    }

    // 2. Fallback: most recently watched (episodes first, then movies)
    const [epRes, movieRes] = await Promise.all([
      fetch(`${TRAKT_API}/users/${username}/history/episodes?limit=1`, { headers }),
      fetch(`${TRAKT_API}/users/${username}/history/movies?limit=1`, { headers }),
    ]);

    const episodes = epRes.ok ? await epRes.json() : [];
    const movies = movieRes.ok ? await movieRes.json() : [];

    // Pick whichever was watched more recently
    const lastEp = episodes[0];
    const lastMovie = movies[0];

    const epTime = lastEp?.watched_at ? new Date(lastEp.watched_at).getTime() : 0;
    const movieTime = lastMovie?.watched_at ? new Date(lastMovie.watched_at).getTime() : 0;

    if (epTime > movieTime && lastEp) {
      const show = lastEp.show;
      const ep = lastEp.episode;
      const poster = await getTmdbPoster(show?.ids?.tmdb, "tv");
      return {
        title: show?.title ?? "Unknown Show",
        mediaType: "tv",
        posterUrl: poster,
        progress: `S${ep?.season ?? "?"} E${ep?.number ?? "?"}`,
        isLive: false,
      };
    }

    if (lastMovie) {
      const movie = lastMovie.movie;
      const poster = await getTmdbPoster(movie?.ids?.tmdb, "movie");
      return {
        title: movie?.title ?? "Unknown Movie",
        mediaType: "movie",
        posterUrl: poster,
        isLive: false,
      };
    }

    return null;
  } catch (err) {
    console.error("[Trakt] Error:", err);
    return null;
  }
}
