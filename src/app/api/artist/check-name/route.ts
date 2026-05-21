import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`check-name:${ip}`, 60, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();

  if (!name || name.length > 100) {
    return NextResponse.json({ exists: false });
  }

  try {
    const existingArtist = await prisma.user.findFirst({
      where: {
        artistName: {
          equals: name,
          mode: "insensitive",
        },
        accountType: "ARTIST",
      },
    });

    return NextResponse.json({ exists: !!existingArtist });
  } catch (error) {
    console.error("[check-name] Error:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
