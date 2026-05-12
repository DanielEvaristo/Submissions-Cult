import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
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

    console.log("[DEBUG] Checking if user exists:", email);
    const existing = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase().trim() } 
    });
    
    if (existing) {
      return NextResponse.json({ error: "Email already registered. Please login first." }, { status: 400 });
    }

    // 2. Find curators and manually count their active workload
    const curators = await prisma.user.findMany({
      where: { isCurator: true, isMasterCurator: false },
      select: { id: true, assignedGenres: true }
    });

    let assignedCuratorId = null;
    if (curators.length > 0) {
      // Find the workload for each curator
      const workloads = await prisma.submission.groupBy({
        by: ["curatorId"],
        where: { status: { in: ["PENDING", "IN_REVIEW"] }, curatorId: { not: null } },
        _count: { curatorId: true }
      });

      const workloadMap: Record<string, number> = {};
      workloads.forEach(w => { if (w.curatorId) workloadMap[w.curatorId] = w._count.curatorId; });

      let eligible = curators.filter(c => 
        !c.assignedGenres || c.assignedGenres.length === 0 || c.assignedGenres.includes(genre)
      );
      if (eligible.length === 0) eligible = curators;

      // Pick the one with the lowest workload
      eligible.sort((a, b) => (workloadMap[a.id] || 0) - (workloadMap[b.id] || 0));
      assignedCuratorId = eligible[0].id;
    }

    // 3. Create user and submission in a transaction
    const hashedPassword = await bcrypt.hash(password, 10);
    
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
        }
      });

      const platform = streamingPlatform?.toUpperCase();
      const validPlatforms = ["SPOTIFY", "SOUNDCLOUD", "DEEZER", "OTHER"];
      const finalPlatform = validPlatforms.includes(platform) ? platform : "OTHER";

      const submission = await tx.submission.create({
        data: {
          userId: user.id,
          channels: channels || [],
          fastTrack: !!fastTrack,
          reviewRequested: !!reviewRequested,
          premiumServices: premiumServices || [],
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
        }
      });

      return { user, submission };
    });

    return NextResponse.json({ id: result.submission.id }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/submissions/anonymous] ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
