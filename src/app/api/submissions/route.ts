import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST /api/submissions — create a new submission ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Guard: artist must have completed onboarding (genre set)
    const isStaff = session.user.isAdmin || session.user.isCurator || session.user.isMasterCurator;
    if (session.user.accountType === "ARTIST" && !session.user.genre && !isStaff) {
      return NextResponse.json(
        { error: "Complete your artist profile before submitting." },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("[POST /api/submissions] PAYLOAD:", JSON.stringify(body, null, 2));

    const { 
      streamingUrl, 
      streamingPlatform,
      trackTitle, 
      artistName, 
      releaseType, 
      genre, 
      subgenre,
      channels,
      fastTrack,
      reviewRequested,
      premiumServices,
      instagram,
      spotifyUrl,
      pitch,
      pressKitUrl,
      releaseDate,
      autoFilledTitle,
      autoFilledArtist,
      autoFilledCover,
      autoFillSource,
      managedArtistId,
      useCredits,
      creditsToDeduct
    } = body;

    // Validate required fields
    if (!streamingUrl || !trackTitle || !artistName || !releaseType || !genre) {
      return NextResponse.json(
        { error: "Missing required fields: streamingUrl, trackTitle, artistName, releaseType, genre" },
        { status: 400 }
      );
    }

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

    if (eligible.length === 0 && curators.length > 0) {
      eligible = curators;
    }

    let assignedCuratorId = null;
    if (eligible.length > 0) {
      eligible.sort((a, b) => a.curatedSubmissions.length - b.curatedSubmissions.length);
      assignedCuratorId = eligible[0].id;
    }

    // Use a transaction for credit deduction and submission creation
    const submission = await prisma.$transaction(async (tx) => {
      if (useCredits && creditsToDeduct > 0) {
        const user = await tx.user.findUnique({ where: { id: session.user.id } });
        if (!user || user.credits < creditsToDeduct) {
          throw new Error("Insufficient credits in wallet");
        }

        // Deduct credits
        await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: creditsToDeduct } }
        });

        // Log transaction
        await tx.creditTransaction.create({
          data: {
            userId: session.user.id,
            amount: -creditsToDeduct,
            type: "USAGE",
            credits: creditsToDeduct,
          }
        });
      }

      return await tx.submission.create({
        data: {
          userId: session.user.id,
          channels: channels || [],
          fastTrack: !!fastTrack,
          reviewRequested: !!reviewRequested,
          premiumServices: premiumServices || [],
          streamingUrl,
          streamingPlatform: streamingPlatform ? (streamingPlatform.toUpperCase() as any) : null,
          artistName,
          trackTitle,
          instagram: instagram ?? null,
          spotifyUrl: spotifyUrl ?? null,
          releaseType: releaseType as any,
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
          isFree: !useCredits,
          creditsUsed: useCredits ? creditsToDeduct : 0,
          curatorId: assignedCuratorId,
          status: assignedCuratorId ? "IN_REVIEW" : "PENDING",
        },
      });
    });

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/submissions] ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to create submission" }, { status: 500 });
  }
}

// ─── GET /api/submissions — list current user's submissions ──────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    const where: any = { userId: session.user.id };
    
    if (statusFilter) {
      if (statusFilter === "UNDER_REVIEW") {
        where.status = { in: ["PENDING", "IN_REVIEW", "MASTER_REVIEW", "CURATOR_APPROVED"] };
      } else if (statusFilter === "SELECTED") {
        where.status = { in: ["ACCEPTED", "PUBLISHED"] };
      } else if (statusFilter === "NOT_SELECTED") {
        where.status = { in: ["REJECTED", "CURATOR_REJECTED"] };
      } else {
        where.status = statusFilter;
      }
    }

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
        placement: true,
        publicationUrl: true,
        publishedAt: true,
        masterNotes: true,
        curatorNotes: true,
        curatorRating: true,
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
