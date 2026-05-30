import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findLeastLoadedCuratorId } from "@/lib/curator-assignment";
import { sendSubmissionConfirmationEmail } from "@/lib/emails";
import { ALL_CHANNELS, calculateCredits } from "@/lib/pricing";
import { assertVerifiedIndustry } from "@/lib/industry-access";
import { revalidateSubmissionViews } from "@/lib/revalidate-dashboards";
import { devLog } from "@/lib/dev-log";

function normalizeArtistValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(feat|featuring|ft|with)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function registeredArtistMatchesMetadata(registeredArtist: string, metadataArtist: string) {
  const registered = normalizeArtistValue(registeredArtist);
  const metadata = normalizeArtistValue(metadataArtist);

  if (!registered || !metadata) return true;
  if (registered === metadata) return true;
  if (metadata.includes(registered)) return true;

  const collaborators = metadata
    .split(/\s*(?:,|&| x | and )\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return collaborators.some((name) => name === registered || name.includes(registered) || registered.includes(name));
}

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
    devLog("[POST /api/submissions] new submission for user:", session.user.id);

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
      submissionId, // For explicit updates
    } = body;

    // Validate required fields
    if (!streamingUrl || !trackTitle || !artistName || !releaseType || !genre) {
      return NextResponse.json(
        { error: "Missing required fields: streamingUrl, trackTitle, artistName, releaseType, genre" },
        { status: 400 }
      );
    }

    // ── GUARD 1: Band/Artist name already claimed by another account ──────────
    const artistNameNormalized = artistName.trim().toLowerCase();
    const bandConflict = await prisma.user.findFirst({
      where: {
        id: { not: session.user.id },
        OR: [
          { artistName: { equals: artistName.trim(), mode: "insensitive" } },
          { name: { equals: artistName.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (bandConflict) {
      return NextResponse.json(
        { error: "BAND_ALREADY_REGISTERED", details: `The artist/band \"${artistName}\" is already registered to another account. If you believe this is a mistake, please contact support.` },
        { status: 409 }
      );
    }

    // ── GUARD 2: Authenticated artist submitting under a different band name ──
    if (session.user.accountType === "ARTIST") {
      const registeredNameRaw = (session.user.artistName || session.user.name || "").trim();
      const registeredName = registeredNameRaw.toLowerCase();
      const metadataArtist = typeof autoFilledArtist === "string" ? autoFilledArtist.trim() : "";
      const artistMatchesAccount = metadataArtist
        ? registeredArtistMatchesMetadata(registeredNameRaw, metadataArtist)
        : artistNameNormalized === registeredName;

      if (registeredName && !artistMatchesAccount) {
        return NextResponse.json(
          { error: "ARTIST_NAME_MISMATCH", details: `Your account is registered as "${session.user.artistName || session.user.name}". The submitted streaming link appears to belong to a different artist. Collaborations are allowed only when your registered artist name is part of the credited artists.` },
          { status: 403 }
        );
      }
    }

    // ── GUARD 3: Previously rejected track (same streaming URL) ──────────────
    const forceResubmit = body.forceResubmit === true;
    if (!forceResubmit) {
      const rejectedSubmission = await prisma.submission.findFirst({
        where: {
          userId: session.user.id,
          streamingUrl: streamingUrl.trim(),
          status: { in: ["REJECTED", "CURATOR_REJECTED"] },
        },
      });
      if (rejectedSubmission) {
        return NextResponse.json(
          { error: "TRACK_PREVIOUSLY_REJECTED", details: "This track has been previously rejected. Are you sure you want to submit it again?" },
          { status: 409 }
        );
      }
    }

    // ── GUARD 4: Track already has an active submission ─────────────────────
    const activeStatuses = ["PENDING", "IN_REVIEW", "CURATOR_APPROVED", "MASTER_REVIEW"] as any[];
    const activeSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.id,
        streamingUrl: streamingUrl.trim(),
        status: { in: activeStatuses },
      },
    });
    if (activeSubmission) {
      return NextResponse.json(
        { error: "TRACK_ALREADY_ACTIVE", details: "This track already has an active submission in progress. Please wait for the current review to be completed before resubmitting." },
        { status: 409 }
      );
    }
    
    // ── GUARD 5: Track already has an AWAITING_PAYMENT submission ───────────
    // If they already clicked "Pay & Submit" but didn't pay, we should update
    // the existing submission rather than creating a duplicate.
    // If a specific submissionId is provided, look for that exact one.
    const existingAwaitingPayment = submissionId
      ? await prisma.submission.findUnique({
          where: { id: submissionId, userId: session.user.id, status: "AWAITING_PAYMENT" },
        })
      : await prisma.submission.findFirst({
          where: {
            userId: session.user.id,
            streamingUrl: streamingUrl.trim(),
            status: "AWAITING_PAYMENT",
          },
        });

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accountType: true,
        isVerifiedLabel: true,
        credits: true,
        monthlyListeners: true,
        instagramFollowers: true,
      },
    });

    const isIndustry = dbUser?.accountType === "INDUSTRY";
    if (isIndustry) {
      const industryBlock = assertVerifiedIndustry(dbUser);
      if (industryBlock) {
        return NextResponse.json({ error: industryBlock }, { status: 403 });
      }
    }
    const unqualifiedRanges = ["UNDER_1K", "FROM_1K_TO_10K"];
    const qualifiesForPremium = isIndustry || (
      dbUser && 
      dbUser.monthlyListeners && !unqualifiedRanges.includes(dbUser.monthlyListeners) &&
      dbUser.instagramFollowers && !unqualifiedRanges.includes(dbUser.instagramFollowers)
    );

    let finalPremiumServices = premiumServices || [];
    let premiumPrStatus = "NONE";
    if (finalPremiumServices.length > 0) {
      if (qualifiesForPremium) {
        premiumPrStatus = "REQUESTED";
      } else {
        finalPremiumServices = [];
      }
    }

    const assignedCuratorId = await findLeastLoadedCuratorId(prisma, [genre]);

    const channelList = Array.isArray(channels) ? channels : [];
    const applyAllChannels =
      channelList.length >= ALL_CHANNELS.length ||
      ALL_CHANNELS.every((channel) => channelList.includes(channel));

    const expectedCredits = calculateCredits(
      releaseType as "SINGLE" | "EP" | "ALBUM",
      applyAllChannels,
      !!fastTrack,
      !!reviewRequested
    ).total;

    if (useCredits && expectedCredits <= 0) {
      return NextResponse.json(
        { error: "This submission cannot be paid with credits." },
        { status: 400 }
      );
    }

    const creditsToDeduct = useCredits ? expectedCredits : 0;

    let resolvedManagedArtistId: string | null = null;
    if (session.user.accountType === "INDUSTRY" && managedArtistId) {
      const ownedArtist = await prisma.managedArtist.findFirst({
        where: {
          id: managedArtistId,
          industryUserId: session.user.id,
        },
        select: { id: true },
      });
      if (!ownedArtist) {
        return NextResponse.json({ error: "Invalid managed artist" }, { status: 403 });
      }
      resolvedManagedArtistId = ownedArtist.id;
    }

    // Determine if payment is needed via Stripe
    // When useCredits=false but credits are needed, submission is held as AWAITING_PAYMENT
    // until the Stripe webhook confirms payment.
    const needsStripePayment = !useCredits && expectedCredits > 0;

    // Use a transaction for credit deduction and submission creation
    const submission = await prisma.$transaction(async (tx) => {
      if (useCredits && creditsToDeduct > 0) {
        if (!dbUser || dbUser.credits < creditsToDeduct) {
          throw new Error("Insufficient credits in wallet");
        }

        await tx.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: creditsToDeduct } },
        });

        await tx.creditTransaction.create({
          data: {
            userId: session.user.id,
            amount: -creditsToDeduct,
            type: "USAGE",
            credits: creditsToDeduct,
          },
        });
      }

      const submissionData = {
        userId: session.user.id,
        channels: channels || [],
        fastTrack: !!fastTrack,
        fastTrackDeadline: fastTrack ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
        reviewRequested: !!reviewRequested,
        premiumServices: finalPremiumServices,
        premiumPrStatus: premiumPrStatus as any,
        streamingUrl: streamingUrl.trim(),
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
        managedArtistId: resolvedManagedArtistId,
        isFree: !useCredits && !needsStripePayment, // only truly free if expectedCredits === 0
        creditsUsed: useCredits ? creditsToDeduct : 0,
        curatorId: needsStripePayment ? null : assignedCuratorId, // don't assign curator until paid
        // AWAITING_PAYMENT: submission needs Stripe; curator can't see it yet
        // IN_REVIEW: assigned to curator immediately (credit-paid or free)
        status: needsStripePayment
          ? "AWAITING_PAYMENT"
          : assignedCuratorId
            ? "IN_REVIEW"
            : "PENDING",
      } as any;

      if (existingAwaitingPayment) {
        return await tx.submission.update({
          where: { id: existingAwaitingPayment.id },
          data: submissionData,
        });
      } else {
        return await tx.submission.create({
          data: submissionData,
        });
      }
    });

    // Send confirmation email (non-blocking) - only if actually submitted
    if (session.user.email && submission.status !== "AWAITING_PAYMENT") {
      sendSubmissionConfirmationEmail(session.user.email, submission.trackTitle, submission.artistName);
    }

    revalidateSubmissionViews();
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
    const idFilter = searchParams.get("id");

    const where: any = { userId: session.user.id };

    if (idFilter) {
      where.id = idFilter;
    } else if (statusFilter) {
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
        subgenres: true,
        streamingPlatform: true,
        channels: true,
        fastTrack: true,
        reviewRequested: true,
        premiumServices: true,
        autoFilledCover: true,
        autoFilledTitle: true,
        autoFilledArtist: true,
        autoFillSource: true,
        pitch: true,
        pressKitUrl: true,
        streamingUrl: true,
        submittedAt: true,
        placement: true,
        publicationUrl: true,
        interviewUrl: true,
        articleUrl: true,
        publishedAt: true,
        masterNotes: true,
        masterRating: true,
        curatorNotes: true,
        curatorRating: true,
        assignedPremiumServices: true,
        premiumServicesPaid: true,
        premiumPrStatus: true,
        managedArtist: {
          select: {
            artistName: true,
          },
        },
      },
    });

    return NextResponse.json(submissions);
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}
