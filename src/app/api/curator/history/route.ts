import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isCurator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const history = await prisma.submission.findMany({
      where: {
        curatorId: session.user.id,
        status: { in: ["CURATOR_APPROVED", "CURATOR_REJECTED"] },
      },
      orderBy: { curatorReviewedAt: "desc" },
      select: {
        id: true,
        trackTitle: true,
        artistName: true,
        opportunity: true,
        status: true,
        genres: true,
        subgenres: true,
        autoFilledCover: true,
        streamingUrl: true,
        submittedAt: true,
        curatorNotes: true,
        curatorRating: true,
        curatorReviewedAt: true,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("[GET /api/curator/history]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
