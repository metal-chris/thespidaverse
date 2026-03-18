import { NextResponse } from "next/server";

// Twitch OAuth token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getTwitchToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Twitch credentials not configured");
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error(`Twitch OAuth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "IGDB credentials not configured" }, { status: 503 });
  }

  try {
    const token = await getTwitchToken();

    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `fields name, cover.image_id, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, platforms.name, first_release_date, genres.name, summary; where id = ${id};`,
    });

    if (!res.ok) {
      return NextResponse.json({ error: `IGDB returned ${res.status}` }, { status: res.status });
    }

    const games = await res.json();
    if (!games.length) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = games[0];

    const developers = (game.involved_companies || [])
      .filter((ic: { developer: boolean }) => ic.developer)
      .map((ic: { company: { name: string } }) => ic.company.name);

    const publishers = (game.involved_companies || [])
      .filter((ic: { publisher: boolean }) => ic.publisher)
      .map((ic: { company: { name: string } }) => ic.company.name);

    const result = {
      id: game.id,
      title: game.name,
      coverUrl: game.cover?.image_id
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      developers,
      publishers,
      platforms: (game.platforms || []).map((p: { name: string }) => p.name),
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000).toISOString().split("T")[0]
        : null,
      genres: (game.genres || []).map((g: { name: string }) => g.name),
      summary: game.summary || null,
      mediaType: "game",
    };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (err) {
    console.error("[IGDB] Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch IGDB data" }, { status: 500 });
  }
}
