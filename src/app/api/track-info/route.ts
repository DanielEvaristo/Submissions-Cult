import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { resolveAllowedUrl, safeExternalFetch } from "@/lib/url-fetch-guard";

function detectPlatform(url: string): "spotify" | "soundcloud" | "deezer" | "other" {
  if (url.includes("spotify.com") || url.includes("spotify.link")) return "spotify";
  if (url.includes("soundcloud.com")) return "soundcloud";
  if (url.includes("deezer.com")) return "deezer";
  return "other";
}

function getPathParts(url: string) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return [];
  }
}

function isSupportedSpotifyReleaseUrl(url: string) {
  return /spotify\.com\/(?:intl-[a-z]+\/)?(track|album)\/([a-zA-Z0-9]+)/i.test(url);
}

function isSupportedDeezerReleaseUrl(url: string) {
  return /deezer\.com\/(?:[a-z]{2}\/)?(track|album)\/(\d+)/i.test(url);
}

function isSupportedSoundcloudReleaseUrl(url: string) {
  const parts = getPathParts(url);
  if (parts.length < 2) return false;

  const [artistSlug, secondPart] = parts;
  const reserved = new Set(["discover", "search", "pages", "charts", "stations", "stream", "you", "upload", "terms-of-use"]);

  if (reserved.has(artistSlug)) return false;
  if (secondPart === "sets") return parts.length >= 3;

  return true;
}

function getInvalidReleaseMessage(platform: "spotify" | "soundcloud" | "deezer") {
  if (platform === "spotify") {
    return "Use a Spotify track or album link. Artist profile links are not accepted.";
  }
  if (platform === "soundcloud") {
    return "Use a SoundCloud track or release link. Artist profile links are not accepted.";
  }
  return "Use a Deezer track or album link. Artist or profile links are not accepted.";
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
    type: "SINGLE" as const,
  };
}

async function fetchFromDeezerUrl(url: string) {
  const trackMatch = url.match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i);
  if (trackMatch) {
    const trackId = trackMatch[1];
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
      type: "SINGLE" as const,
    };
  }

  const albumMatch = url.match(/deezer\.com\/(?:[a-z]{2}\/)?album\/(\d+)/i);
  if (!albumMatch) return null;

  const albumId = albumMatch[1];
  const res = await fetch(`https://api.deezer.com/album/${albumId}`, {
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;
  const album = await res.json();
  if (album.error) return null;

  return {
    title: album.title,
    artist: album.artist?.name ?? "",
    cover: album.cover_medium ?? album.cover ?? null,
    platform: "deezer" as const,
    source: "deezer",
    type: "ALBUM" as const,
  };
}

async function fetchOpenGraphTags(url: string, platform: string) {
  try {
    const res = await safeExternalFetch(url, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeoutMs: 8000,
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

    if (platform === "spotify") {
      const cleanTitle = ogTitle.split(" | Spotify")[0] || ogTitle;

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
        artist = ogDescription.split(" · ")[0] || ogDescription.split(".")[0] || "";
      }
    } else if (platform === "soundcloud") {
      if (ogTitle.includes(" by ")) {
        const parts = ogTitle.split(" by ");
        artist = parts.pop() || "";
        title = parts.join(" by ");
      } else {
        title = ogTitle;
      }
    } else {
      title = ogTitle;
      artist = ogDescription.split(".")[0] || "";
    }

    return {
      title: title.trim(),
      artist: artist.trim() || "Unknown Artist",
      cover: ogImage,
      platform: platform as "spotify" | "soundcloud" | "deezer",
      source: "opengraph",
      type: url.includes("/album/") || url.includes("/sets/") ? "ALBUM" : "SINGLE",
    };
  } catch (err) {
    console.error("OG fetch error:", err);
    return null;
  }
}

async function fetchFromSpotifyUrl(url: string) {
  if (!isSupportedSpotifyReleaseUrl(url)) {
    return null;
  }
  return fetchOpenGraphTags(url, "spotify");
}

async function fetchFromSoundcloudUrl(url: string) {
  if (!isSupportedSoundcloudReleaseUrl(url)) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    const artistSlug = parts[0];
    const isSet = parts[1] === "sets";
    const releaseSlug = isSet ? parts[2] : parts[1];

    const formatSlug = (str: string) => {
      if (!str) return "";
      return str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const artist = formatSlug(artistSlug);
    const title = formatSlug(releaseSlug);

    if (!releaseSlug) {
      return null;
    }

    if (!isSet) {
      const query = `${artist} ${title}`;
      const deezerTrack = await fetchDeezerTrack(query);
      if (deezerTrack) {
        return {
          ...deezerTrack,
          platform: "soundcloud" as const,
          source: "soundcloud-deezer-search",
          type: "SINGLE" as const,
        };
      }
    }

    const ogData = await fetchOpenGraphTags(url, "soundcloud");
    if (ogData) {
      return {
        ...ogData,
        type: isSet ? "ALBUM" : ogData.type,
      };
    }

    return {
      title,
      artist,
      cover: null,
      platform: "soundcloud" as const,
      source: isSet ? "url-parsing-set" : "url-parsing",
      type: isSet ? "ALBUM" as const : "SINGLE" as const,
    };
  } catch (err) {
    console.error("SoundCloud URL parsing failed:", err);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`track-info:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url")?.trim();

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(rawUrl)) {
    return NextResponse.json({ error: "URL must start with http:// or https://" }, { status: 400 });
  }

  try {
    const url = await resolveAllowedUrl(rawUrl);
    const platform = detectPlatform(url);

    if (platform === "other") {
      return NextResponse.json(
        { error: "Unsupported platform. Use Spotify, SoundCloud, or Deezer links." },
        { status: 400 }
      );
    }

    if (platform === "spotify" && !isSupportedSpotifyReleaseUrl(url)) {
      return NextResponse.json({ error: getInvalidReleaseMessage(platform) }, { status: 422 });
    }

    if (platform === "soundcloud" && !isSupportedSoundcloudReleaseUrl(url)) {
      return NextResponse.json({ error: getInvalidReleaseMessage(platform) }, { status: 422 });
    }

    if (platform === "deezer" && !isSupportedDeezerReleaseUrl(url)) {
      return NextResponse.json({ error: getInvalidReleaseMessage(platform) }, { status: 422 });
    }

    let result = null;

    if (platform === "deezer") {
      result = await fetchFromDeezerUrl(url);
    } else if (platform === "spotify") {
      result = await fetchFromSpotifyUrl(url);
    } else if (platform === "soundcloud") {
      result = await fetchFromSoundcloudUrl(url);
    }

    if (!result && platform === "soundcloud") {
      return NextResponse.json({ error: getInvalidReleaseMessage(platform) }, { status: 422 });
    }

    if (!result && platform !== "deezer") {
      const slug = url.split("/").pop()?.replace(/-/g, " ") ?? "";
      if (slug && slug.length > 3) {
        result = await fetchDeezerTrack(slug);
        if (result) result.source = "deezer-search-fallback";
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Could not fetch track info. Use a direct song or album link and fill the rest manually if needed." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch track info";
    const clientError =
      message === "Invalid URL" ||
      message === "Invalid protocol" ||
      message === "Host not allowed" ||
      message === "Blocked host";

    if (clientError) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[track-info]", err);
    return NextResponse.json({ error: "Failed to fetch track info" }, { status: 500 });
  }
}
