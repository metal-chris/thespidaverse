// AniList GraphQL client — fetches currently reading manga + watching anime

const ANILIST_API = "https://graphql.anilist.co";

interface AniListCurrent {
  manga: {
    title: string;
    coverUrl?: string;
    progress?: string;
  } | null;
  anime: {
    title: string;
    coverUrl?: string;
    progress?: string;
  } | null;
}

const CURRENT_LIST_QUERY = `
  query ($username: String!, $type: MediaType!) {
    MediaListCollection(userName: $username, type: $type, status: CURRENT) {
      lists {
        entries {
          progress
          progressVolumes
          updatedAt
          media {
            title { english romaji }
            coverImage { large }
            chapters
            episodes
            format
          }
        }
      }
    }
  }
`;

interface AniListEntry {
  progress: number;
  progressVolumes?: number;
  updatedAt: number;
  media: {
    title: { english?: string; romaji?: string };
    coverImage: { large?: string };
    chapters?: number;
    episodes?: number;
    format?: string;
  };
}

function pickTitle(title: { english?: string; romaji?: string }): string {
  return title.english || title.romaji || "Unknown";
}

async function fetchCurrentList(username: string, type: "MANGA" | "ANIME"): Promise<AniListEntry | null> {
  try {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: CURRENT_LIST_QUERY,
        variables: { username, type },
      }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const lists = json?.data?.MediaListCollection?.lists ?? [];

    // Flatten all entries and pick the most recently updated
    const entries: AniListEntry[] = lists.flatMap((l: { entries: AniListEntry[] }) => l.entries);
    if (entries.length === 0) return null;

    entries.sort((a, b) => b.updatedAt - a.updatedAt);
    return entries[0];
  } catch (err) {
    console.error(`[AniList] Error fetching ${type}:`, err);
    return null;
  }
}

export async function fetchAniListCurrent(): Promise<AniListCurrent> {
  const username = process.env.ANILIST_USERNAME;
  if (!username) return { manga: null, anime: null };

  const [mangaEntry, animeEntry] = await Promise.all([
    fetchCurrentList(username, "MANGA"),
    fetchCurrentList(username, "ANIME"),
  ]);

  const manga = mangaEntry
    ? {
        title: pickTitle(mangaEntry.media.title),
        coverUrl: mangaEntry.media.coverImage?.large ?? undefined,
        progress: mangaEntry.progress
          ? `Ch. ${mangaEntry.progress}${mangaEntry.media.chapters ? ` / ${mangaEntry.media.chapters}` : ""}`
          : undefined,
      }
    : null;

  const anime = animeEntry
    ? {
        title: pickTitle(animeEntry.media.title),
        coverUrl: animeEntry.media.coverImage?.large ?? undefined,
        progress: animeEntry.progress
          ? `Ep. ${animeEntry.progress}${animeEntry.media.episodes ? ` / ${animeEntry.media.episodes}` : ""}`
          : undefined,
      }
    : null;

  return { manga, anime };
}
