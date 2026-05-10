import { NextRequest, NextResponse } from "next/server";

// Deezer public API — no auth required
// Docs: https://developers.deezer.com/api/search

function detectPlatform(url: string): "spotify" | "soundcloud" | "deezer" | "other" {
  if (url.includes("spotify.com")) return "spotify";
  if (url.includes("soundcloud.com")) return "soundcloud";
  if (url.includes("deezer.com")) return "deezer";
  return "other";
}

async function fetchDeezerTrack(query: string) {
  const res = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const track = data?.data?.[0];
  if (!track) return null;
  return {
    title: track.title,
    artist: track.artist?.name ?? "",
    cover: track.album?.cover_medium ?? track.album?.cover ?? null,
    platform: "deezer" as const,
    source: "deezer",
  };
}

async function fetchFromDeezerUrl(url: string) {
  // Extract track ID from Deezer URL: https://www.deezer.com/track/12345
  const match = url.match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i);
  if (!match) return null;
  const trackId = match[1];
  const res = await fetch(`https://api.deezer.com/track/${trackId}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const track = await res.json();
  if (track.error) return null;
  return {
    title: track.title,
    artist: track.artist?.name ?? "",
    cover: track.album?.cover_medium ?? track.album?.cover ?? null,
    platform: "deezer" as const,
    source: "deezer",
  };
}

async function fetchFromSpotifyUrl(url: string) {
  // Extract track ID from Spotify URL: https://open.spotify.com/track/abc123
  const match = url.match(/spotify\.com\/(?:intl-[a-z]+\/)?track\/([a-zA-Z0-9]+)/i);
  if (!match) return null;
  // We have no Spotify credentials, so search Deezer by the URL path as a proxy
  // Extract track name from URL path if possible; fall back gracefully
  return null; // Will trigger manual fill fallback on client
}

async function fetchFromSoundcloudUrl(url: string) {
  // SoundCloud requires OAuth — fall back to manual fill
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const platform = detectPlatform(url);

  try {
    let result = null;

    if (platform === "deezer") {
      result = await fetchFromDeezerUrl(url);
    } else if (platform === "spotify") {
      result = await fetchFromSpotifyUrl(url);
    } else if (platform === "soundcloud") {
      result = await fetchFromSoundcloudUrl(url);
    }

    // If platform-specific fetch failed/unsupported, try a Deezer search as fallback
    if (!result && platform !== "deezer") {
      // Try to guess artist/title from URL slug
      const slug = url.split("/").pop()?.replace(/-/g, " ") ?? "";
      if (slug && slug.length > 3) {
        result = await fetchDeezerTrack(slug);
        if (result) result.source = "deezer-search-fallback";
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Could not fetch track info. Please fill manually." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[track-info]", err);
    return NextResponse.json(
      { error: "Failed to fetch track info" },
      { status: 500 }
    );
  }
}
