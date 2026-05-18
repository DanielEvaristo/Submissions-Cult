import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

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

async function fetchOpenGraphTags(url: string, platform: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    
    const html = await res.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr("content") || "";
    const ogImage = $('meta[property="og:image"]').attr("content") || null;
    const ogDescription = $('meta[property="og:description"]').attr("content") || "";

    if (!ogTitle) return null;

    let title = ogTitle;
    let artist = "";

    // Parse the Title based on platform
    if (platform === "spotify") {
      // Spotify format variations: 
      // "Track Name - song and lyrics by Artist | Spotify"
      // "Album Name by Artist | Spotify"
      let cleanTitle = ogTitle.split(" | Spotify")[0] || ogTitle;
      
      if (cleanTitle.includes(" - song and lyrics by ")) {
        const parts = cleanTitle.split(" - song and lyrics by ");
        title = parts[0];
        artist = parts[1];
      } else if (cleanTitle.includes(" - song by ")) {
        const parts = cleanTitle.split(" - song by ");
        title = parts[0];
        artist = parts[1];
      } else if (cleanTitle.includes(" by ")) {
        const parts = cleanTitle.split(" by ");
        artist = parts.pop() || "";
        title = parts.join(" by ");
      } else {
        title = cleanTitle;
        // If not in title, Spotify puts it in description: "Artist, Featured · Album · Canción · Year"
        artist = ogDescription.split(" · ")[0] || ogDescription.split(".")[0] || "";
      }
    } else if (platform === "soundcloud") {
      // SoundCloud format: "Track Name by Artist"
      if (ogTitle.includes(" by ")) {
        const parts = ogTitle.split(" by ");
        artist = parts.pop() || "";
        title = parts.join(" by ");
      } else {
        title = ogTitle;
      }
    } else {
      title = ogTitle;
      artist = ogDescription.split(".")[0] || ""; // Fallback to grab something from description
    }

    return {
      title: title.trim(),
      artist: artist.trim() || "Unknown Artist",
      cover: ogImage,
      platform: platform as any,
      source: "opengraph",
      type: url.includes("/album/") || url.includes("/ep/") ? "ALBUM" : "SINGLE", // Simplified detection
    };
  } catch (err) {
    console.error("OG fetch error:", err);
    return null;
  }
}

async function fetchFromSpotifyUrl(url: string) {
  // Validate Spotify URL format (tracks, albums, EPs, artists)
  if (!url.match(/spotify\.com\/(?:intl-[a-z]+\/)?(track|album|ep|artist)\/([a-zA-Z0-9]+)/i)) return null;
  return fetchOpenGraphTags(url, "spotify");
}

async function fetchFromSoundcloudUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    // Ignore landing pages or special pages
    if (parts.length >= 1 && parts[0] !== "discover" && parts[0] !== "search" && parts[0] !== "pages") {
      const artistSlug = parts[0];
      const trackSlug = parts[1]; // May be undefined if it's an artist profile link

      const formatSlug = (str: string) => {
        if (!str) return "";
        return str
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      const artist = formatSlug(artistSlug);
      const title = formatSlug(trackSlug);

      if (!trackSlug) {
        // It's an artist profile URL!
        // We can just return the artist name, and empty title.
        return {
          title: "",
          artist,
          cover: null,
          platform: "soundcloud" as const,
          source: "url-parsing-artist",
        };
      }

      // Try searching Deezer using "Artist Name Track Name" to fetch accurate metadata and cover art
      const query = `${artist} ${title}`;
      const deezerTrack = await fetchDeezerTrack(query);
      if (deezerTrack) {
        return {
          ...deezerTrack,
          platform: "soundcloud" as const,
          source: "soundcloud-deezer-search",
        };
      }

      // Return URL-parsed values if Deezer search doesn't find it
      return {
        title,
        artist,
        cover: null,
        platform: "soundcloud" as const,
        source: "url-parsing",
      };
    }
  } catch (err) {
    console.error("SoundCloud URL parsing failed:", err);
  }

  // Fallback to og:tags if parsing fails for some reason
  return fetchOpenGraphTags(url, "soundcloud");
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    return res.url || url;
  } catch (e) {
    return url;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let url = searchParams.get("url")?.trim();

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Resolve redirect URLs first (like on.soundcloud.com or spotify.link)
  url = await resolveUrl(url);

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
