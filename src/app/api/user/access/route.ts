import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const retentionThreshold = new Date(Date.now() - THIRTY_DAYS_MS);

  const [purchaseCount, paidSubmissionCount, retentionOfferCount] = await Promise.all([
    prisma.creditTransaction.count({
      where: {
        userId: session.user.id,
        type: "PURCHASE",
      },
    }),
    prisma.submission.count({
      where: {
        userId: session.user.id,
        totalCostUsd: { gt: 0 },
      },
    }),
    prisma.creditTransaction.count({
      where: {
        userId: session.user.id,
        type: "RETENTION_OFFER",
        createdAt: { gte: retentionThreshold },
      },
    }),
  ]);

  return NextResponse.json({
    hasPaidActivity: purchaseCount > 0 || paidSubmissionCount > 0,
    retentionOfferEligible: retentionOfferCount === 0,
  });
}
