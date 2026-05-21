import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const USERNAME_REGEX = /^[a-zA-Z0-9._]{1,30}$/;

function parseFollowers(text: string): number {
  let val = text.replace(/,/g, "").trim();
  let multiplier = 1;

  if (val.toLowerCase().endsWith("k")) {
    multiplier = 1000;
    val = val.slice(0, -1);
  } else if (val.toLowerCase().endsWith("m") || val.toLowerCase().endsWith(" mill.")) {
    multiplier = 1000000;
    val = val.replace(/m| mill\./i, "");
  }

  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed * multiplier;
}

function getFollowersRange(count: number): string {
  if (count < 1000) return "UNDER_1K";
  if (count <= 10000) return "FROM_1K_TO_10K";
  if (count <= 50000) return "FROM_10K_TO_50K";
  if (count <= 100000) return "FROM_50K_TO_100K";
  if (count <= 500000) return "FROM_100K_TO_500K";
  return "OVER_500K";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const limited = rateLimit(`instagram-stats:${session.user.id}:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const usernameParam = searchParams.get("username");

  if (!usernameParam) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  let username = usernameParam.trim();
  if (username.startsWith("@")) username = username.substring(1);
  if (username.includes("instagram.com/")) {
    const parts = username.split("instagram.com/");
    const afterSlash = parts[1]?.split(/[/?#]/)[0] ?? "";
    username = afterSlash;
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json({ error: "Invalid Instagram username" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://www.instagram.com/${encodeURIComponent(username)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram profile: ${response.status}`);
    }

    const html = await response.text();
    const match =
      html.match(/content="([^"]+)\s+Followers/i) ||
      html.match(/content="([^"]+)\s+seguidores/i);

    if (!match || !match[1]) {
      return NextResponse.json(
        {
          error:
            "Could not find follower count. Profile might be private or request was blocked.",
        },
        { status: 404 }
      );
    }

    const rawFollowers = match[1];
    const followerCount = parseFollowers(rawFollowers);
    const range = getFollowersRange(followerCount);

    return NextResponse.json({
      username,
      rawFollowers,
      followerCount,
      range,
    });
  } catch (error) {
    console.error("[GET /api/instagram/stats]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
