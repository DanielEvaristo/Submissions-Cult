import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertVerifiedIndustry } from "@/lib/industry-access";

// ─── GET /api/industry/artists ───
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType !== "INDUSTRY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const industryBlock = assertVerifiedIndustry(session.user);
  if (industryBlock) {
    return NextResponse.json({ error: industryBlock }, { status: 403 });
  }

  try {
    const artists = await prisma.managedArtist.findMany({
      where: { industryUserId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ artists });
  } catch (error) {
    console.error("[GET /api/industry/artists]", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

// ─── POST /api/industry/artists ───
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType !== "INDUSTRY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const industryBlock = assertVerifiedIndustry(session.user);
  if (industryBlock) {
    return NextResponse.json({ error: industryBlock }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { artistName, genre, subgenre, spotifyUrl, instagram, notes } = body;

    if (!artistName) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    const artist = await prisma.managedArtist.create({
      data: {
        industryUserId: session.user.id,
        artistName: artistName.trim(),
        genre: genre?.trim() || null,
        subgenre: subgenre?.trim() || null,
        spotifyUrl: spotifyUrl?.trim() || null,
        instagram: instagram?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, artist }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/industry/artists]", error);
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
  }
}
