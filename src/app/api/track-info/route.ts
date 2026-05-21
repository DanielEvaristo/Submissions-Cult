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
      type: url.includes("/album/") || url.includes("/ep/") ? "ALBUM" : "SINGLE",
    };
  } catch (err) {
    console.error("OG fetch error:", err);
    return null;
  }
}

async function fetchFromSpotifyUrl(url: string) {
  if (!url.match(/spotify\.com\/(?:intl-[a-z]+\/)?(track|album|ep|artist)\/([a-zA-Z0-9]+)/i)) {
    return null;
  }
  return fetchOpenGraphTags(url, "spotify");
}

async function fetchFromSoundcloudUrl(url: string) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/").filter(Boolean);
    if (parts.length >= 1 && parts[0] !== "discover" && parts[0] !== "search" && parts[0] !== "pages") {
      const artistSlug = parts[0];
      const trackSlug = parts[1];

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
        return {
          title: "",
          artist,
          cover: null,
          platform: "soundcloud" as const,
          source: "url-parsing-artist",
        };
      }

      const query = `${artist} ${title}`;
      const deezerTrack = await fetchDeezerTrack(query);
      if (deezerTrack) {
        return {
          ...deezerTrack,
          platform: "soundcloud" as const,
          source: "soundcloud-deezer-search",
        };
      }

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

  return fetchOpenGraphTags(url, "soundcloud");
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
    let url = await resolveAllowedUrl(rawUrl);
    const platform = detectPlatform(url);

    if (platform === "other") {
      return NextResponse.json(
        { error: "Unsupported platform. Use Spotify, SoundCloud, or Deezer links." },
        { status: 400 }
      );
    }

    let result = null;

    if (platform === "deezer") {
      result = await fetchFromDeezerUrl(url);
    } else if (platform === "spotify") {
      result = await fetchFromSpotifyUrl(url);
    } else if (platform === "soundcloud") {
      result = await fetchFromSoundcloudUrl(url);
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
        { error: "Could not fetch track info. Please fill manually." },
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
