// Steam Web API client — fetches currently playing / recently played

const STEAM_API = "https://api.steampowered.com";

interface SteamPlaying {
  title: string;
  coverUrl?: string;
  platform: string;
  progress?: string;
  isLive: boolean;
}

function steamCoverUrl(appId: string | number): string {
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`;
}

export async function fetchSteamPlaying(): Promise<SteamPlaying | null> {
  const apiKey = process.env.STEAM_API_KEY;
  const steamId = process.env.STEAM_ID;
  if (!apiKey || !steamId) return null;

  try {
    // 1. Check player summary for currently playing game
    const summaryRes = await fetch(
      `${STEAM_API}/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
    );

    if (summaryRes.ok) {
      const data = await summaryRes.json();
      const player = data?.response?.players?.[0];

      if (player?.gameextrainfo && player?.gameid) {
        return {
          title: player.gameextrainfo,
          coverUrl: steamCoverUrl(player.gameid),
          platform: "Steam",
          isLive: true,
        };
      }
    }

    // 2. Fallback: most recently played game
    const recentRes = await fetch(
      `${STEAM_API}/IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${steamId}&count=1`
    );

    if (recentRes.ok) {
      const data = await recentRes.json();
      const game = data?.response?.games?.[0];

      if (game) {
        const hours = Math.round((game.playtime_2weeks ?? 0) / 60);
        return {
          title: game.name,
          coverUrl: steamCoverUrl(game.appid),
          platform: "Steam",
          progress: hours > 0 ? `${hours}h recently` : undefined,
          isLive: false,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("[Steam] Error:", err);
    return null;
  }
}
