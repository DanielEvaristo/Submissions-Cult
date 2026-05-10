import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/submissions — create a new submission ─────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Guard: artist must have completed onboarding (genre set)
  if (session.user.accountType === "ARTIST" && !session.user.genre) {
    return NextResponse.json(
      { error: "Complete your artist profile before submitting." },
      { status: 403 }
    );
  }

  const body = await req.json();

  const {
    opportunity,
    streamingUrl,
    streamingPlatform,
    trackTitle,
    artistName,
    releaseType,
    releaseDate,
    genre,
    subgenre,
    pitch,
    pressKitUrl,
    autoFilledTitle,
    autoFilledArtist,
    autoFilledCover,
    autoFillSource,
  } = body;

  // Validate required fields
  if (!opportunity || !streamingUrl || !trackTitle || !artistName || !releaseType || !genre) {
    return NextResponse.json(
      { error: "Missing required fields: opportunity, streamingUrl, trackTitle, artistName, releaseType, genre" },
      { status: 400 }
    );
  }

  // Validate opportunity
  const validOpportunities = ["WEEKLY", "SPOTIFY", "WEBRADIO", "ALBUM_STORY"];
  if (!validOpportunities.includes(opportunity)) {
    return NextResponse.json({ error: "Invalid opportunity" }, { status: 400 });
  }

  // ALBUM_STORY only for AGENCY accounts
  if (
    opportunity === "ALBUM_STORY" &&
    session.user.accountType !== "INDUSTRY"
  ) {
    return NextResponse.json(
      { error: "Album Story is only available for agency accounts." },
      { status: 403 }
    );
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        opportunity,
        streamingUrl,
        streamingPlatform: streamingPlatform ? (streamingPlatform.toUpperCase() as any) : null,
        artistName,
        trackTitle,
        releaseType,
        releaseDate: releaseDate ?? null,
        genres: [genre],
        subgenres: subgenre ? [subgenre] : [],
        pitch: pitch ?? null,
        pressKitUrl: pressKitUrl ?? null,
        autoFilledTitle: autoFilledTitle ?? null,
        autoFilledArtist: autoFilledArtist ?? null,
        autoFilledCover: autoFilledCover ?? null,
        autoFillSource: autoFillSource ?? null,
        isFree: true,
        creditsUsed: 0,
      },
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions]", err);
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
  }
}

// ─── GET /api/submissions — list current user's submissions ──────────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // optional

  const where: Record<string, unknown> = { userId: session.user.id };
  if (statusFilter) where.status = statusFilter;

  try {
    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        trackTitle: true,
        artistName: true,
        opportunity: true,
        status: true,
        releaseType: true,
        genres: true,
        autoFilledCover: true,
        streamingUrl: true,
        submittedAt: true,
      },
    });

    return NextResponse.json(submissions);
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
