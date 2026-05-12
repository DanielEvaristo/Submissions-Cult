import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const curators = await prisma.user.findMany({
    where: { isCurator: true },
    select: { id: true, email: true, isMasterCurator: true, assignedGenres: true }
  });

  const submissions = await prisma.submission.findMany({
    take: 10,
    orderBy: { submittedAt: 'desc' },
    select: { id: true, trackTitle: true, status: true, curatorId: true, genres: true, isFree: true, totalCostUsd: true }
  });

  return NextResponse.json({ curators, submissions });
}
