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
      where: {
        OR: [
          // Accepted but not yet published at all
          { status: "ACCEPTED" },
          // Published regular but still needs interview URL
          {
            status: "PUBLISHED",
            assignedPremiumServices: { hasSome: ["INTERVIEW", "ARTICLE"] },
            OR: [
              { interviewUrl: null, assignedPremiumServices: { has: "INTERVIEW" } },
              { articleUrl: null, assignedPremiumServices: { has: "ARTICLE" } },
            ],
          },
        ],
      },
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
        publicationUrl: true,
        interviewUrl: true,
        articleUrl: true,
        masterReviewedAt: true,
        assignedPremiumServices: true,
        premiumServicesPaid: true,
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
