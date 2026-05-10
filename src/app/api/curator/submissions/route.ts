import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || !session.user.isCurator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: {
        status: "IN_REVIEW",
        curatorId: session.user.id
      },
      orderBy: { submittedAt: "asc" }, // Oldest first
      include: {
        user: {
          select: {
            country: true,
            city: true,
            bio: true,
            roleType: true,
            ageRange: true,
            musicLanguages: true,
            careerStartYear: true,
            monthlyListeners: true,
            distributionMethod: true,
            hasManager: true,
            spotifyUrl: true,
            instagram: true,
            tiktok: true,
            youtube: true,
            soundcloudUrl: true,
            website: true,
          }
        }
      }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("[GET /api/curator/submissions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
