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
    managedArtistId,
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
    // ── Least-Loaded Auto-Assignment Logic ──
    const curators = await prisma.user.findMany({
      where: {
        isCurator: true,
        isMasterCurator: false,
      },
      include: {
        curatedSubmissions: {
          where: {
            status: { in: ["PENDING", "IN_REVIEW"] }
          },
          select: { id: true }
        }
      }
    });

    let eligible = curators.filter(c => 
      !c.assignedGenres || c.assignedGenres.length === 0 || c.assignedGenres.includes(genre)
    );

    // Fallback: if no specialist/generalist exists, use any L1 curator
    if (eligible.length === 0 && curators.length > 0) {
      eligible = curators;
    }

    let assignedCuratorId = null;
    if (eligible.length > 0) {
      // Find the one with the lowest active queue
      eligible.sort((a, b) => a.curatedSubmissions.length - b.curatedSubmissions.length);
      assignedCuratorId = eligible[0].id;
    }

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
        managedArtistId: session.user.accountType === "INDUSTRY" ? (managedArtistId || null) : null,
        isFree: true,
        creditsUsed: 0,
        curatorId: assignedCuratorId,
        status: assignedCuratorId ? "IN_REVIEW" : "PENDING",
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

  const where: any = { userId: session.user.id };
  
  if (statusFilter) {
    if (statusFilter === "UNDER_REVIEW") {
      where.status = { in: ["PENDING", "IN_REVIEW", "MASTER_REVIEW", "CURATOR_APPROVED"] };
    } else if (statusFilter === "SELECTED") {
      where.status = "ACCEPTED";
    } else if (statusFilter === "NOT_SELECTED") {
      where.status = { in: ["REJECTED", "CURATOR_REJECTED"] };
    } else {
      where.status = statusFilter;
    }
  }

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
        managedArtist: {
          select: {
            artistName: true,
          }
        }
      },
    });

    return NextResponse.json(submissions);
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
