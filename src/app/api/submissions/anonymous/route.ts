import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findLeastLoadedCuratorId } from "@/lib/curator-assignment";
import bcrypt from "bcryptjs";
import { sendVerificationEmail, sendSubmissionConfirmationEmail } from "@/lib/emails";
import { generateOTP } from "@/lib/otp";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limited = rateLimit(`anonymous-submit:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many submissions from this network. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const body = await req.json();
    const {
      email,
      password,
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
      channels,
      fastTrack,
      reviewRequested,
      premiumServices,
      instagram,
      spotifyUrl,
    } = body;

    if (!email || !password || !streamingUrl || !trackTitle || !artistName || !releaseType || !genre) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. Check if user exists
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    console.log("[DEBUG] Checking if user exists:", email);
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered. Please login first." }, { status: 400 });
    }

    // ── GUARD 1: Band/Artist name already claimed by another account ──────────
    const bandConflict = await prisma.user.findFirst({
      where: {
        OR: [
          { artistName: { equals: artistName.trim(), mode: "insensitive" } },
          { name: { equals: artistName.trim(), mode: "insensitive" } },
        ],
      },
    });
    if (bandConflict) {
      return NextResponse.json(
        { error: "BAND_ALREADY_REGISTERED", details: `The artist/band "${artistName}" is already registered to another account. If you believe this is a mistake, please contact support at support@cultmachine.com` },
        { status: 409 }
      );
    }

    const assignedCuratorId = await findLeastLoadedCuratorId(prisma, [genre]);

    // 3. Create user and submission in a transaction
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: artistName,
          artistName: artistName,
          accountType: "ARTIST",
          emailVerified: null,
          genre: genre,
          subgenre: subgenre || null,
          instagram: instagram || null,
          spotifyUrl: spotifyUrl || null,
        },
      });

      const platform = streamingPlatform?.toUpperCase();
      const validPlatforms = ["SPOTIFY", "SOUNDCLOUD", "DEEZER", "OTHER"];
      const finalPlatform = validPlatforms.includes(platform) ? platform : "OTHER";

      const submission = await tx.submission.create({
        data: {
          userId: user.id,
          channels: channels || [],
          fastTrack: !!fastTrack,
          fastTrackDeadline: fastTrack ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null,
          reviewRequested: !!reviewRequested,
          premiumServices: [], // Stripped for anonymous submissions
          premiumPrStatus: "NONE",
          streamingUrl,
          streamingPlatform: streamingPlatform ? (finalPlatform as any) : null,
          artistName,
          trackTitle,
          instagram: instagram ?? null,
          spotifyUrl: spotifyUrl ?? null,
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
          curatorId: assignedCuratorId,
          status: assignedCuratorId ? "IN_REVIEW" : "PENDING",
          opportunity: null,
        },
      });

      return { user, submission };
    });

    // Generate verification token for the new user
    const otp = generateOTP();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: result.user.email, token: otp, expires },
    });

    sendVerificationEmail(result.user.email, otp);
    sendSubmissionConfirmationEmail(result.user.email, result.submission.trackTitle, result.submission.artistName);

    return NextResponse.json({ id: result.submission.id }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/submissions/anonymous] ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
