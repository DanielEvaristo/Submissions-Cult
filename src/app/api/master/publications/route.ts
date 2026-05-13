import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: fetch publication queue (ACCEPTED submissions)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isMasterCurator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const queue = await prisma.submission.findMany({
      where: { status: "ACCEPTED" },
      orderBy: { masterReviewedAt: "asc" },
      select: {
        id: true,
        trackTitle: true,
        artistName: true,
        opportunity: true,
        status: true,
        genres: true,
        autoFilledCover: true,
        streamingUrl: true,
        submittedAt: true,
        placement: true,
        masterReviewedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(queue);
  } catch (error) {
    console.error("[GET /api/master/publications]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
