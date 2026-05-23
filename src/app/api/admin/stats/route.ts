import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week"; // week, month, year
    
    const now = new Date();
    let startDate: Date;
    let prevStartDate: Date;
    let prevEndDate: Date;
    let funnelStartDate: Date;

    if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
      funnelStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === "year") {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
      funnelStartDate = new Date(now.getFullYear(), 0, 1);
    } else {
      // Default to 7 days
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEndDate = startDate;
      funnelStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const slaThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    // ── Run current period queries ──
    const [
      totalArtists,
      newArtists,
      prevNewArtists,
      totalIndustry,
      pendingVerification,
      totalSubmissions,
      submissionsPeriod,
      prevSubmissionsPeriod,
      slaBreaches,
      reviewedSubs,
      allGenres,
      submissionsByOpportunity,
      submissionsByStatus,
      usersByCountry,
      curatorQueue,
      artistsWithCredits,
      artistsWithGenre,
      roleDistribution,
      ghostArtists,
      dupSubmissions,
      retainedSubmissions,
      funnelEvents,
      allSubmissionsFinance,
      admins,
    ] = await Promise.all([
      prisma.user.count({ where: { accountType: "ARTIST" } }),
      prisma.user.count({ where: { accountType: "ARTIST", createdAt: { gte: startDate } } }),
      prisma.user.count({ where: { accountType: "ARTIST", createdAt: { gte: prevStartDate, lte: prevEndDate } } }),
      prisma.user.count({ where: { accountType: "INDUSTRY" } }),
      prisma.user.count({ where: { accountType: "INDUSTRY", labelStatus: "PENDING_VERIFICATION" } }),
      prisma.submission.count(),
      prisma.submission.count({ where: { submittedAt: { gte: startDate } } }),
      prisma.submission.count({ where: { submittedAt: { gte: prevStartDate, lte: prevEndDate } } }),
      prisma.submission.count({ where: { status: "PENDING", submittedAt: { lte: slaThreshold } } }),
      prisma.submission.findMany({

        where: { curatorReviewedAt: { not: null } },
        select: { submittedAt: true, curatorReviewedAt: true },
        take: 500,
      }),
      prisma.submission.findMany({ select: { genres: true }, take: 2000 }),
      prisma.submission.groupBy({ by: ["opportunity"], _count: { opportunity: true } }),
      prisma.submission.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.user.groupBy({
        by: ["country"],
        where: { accountType: "ARTIST", country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
      prisma.submission.groupBy({
        by: ["curatorId"],
        where: { status: "IN_REVIEW", curatorId: { not: null } },
        _count: { curatorId: true },
        orderBy: { _count: { curatorId: "desc" } },
      }),
      prisma.user.count({ where: { accountType: "ARTIST", credits: { gt: 0 } } }),
      prisma.user.count({ where: { accountType: "ARTIST", genre: { not: null } } }),
      prisma.user.groupBy({ by: ["roleType"], where: { accountType: "ARTIST" }, _count: { roleType: true } }),
      prisma.user.count({ where: { accountType: "ARTIST", submissions: { none: {} } } }),
      prisma.submission.groupBy({ by: ["userId", "trackTitle"], _count: { id: true }, having: { id: { _count: { gt: 1 } } } }),
      prisma.submission.groupBy({ by: ["userId"], _count: { id: true }, having: { id: { _count: { gt: 1 } } } }),
      prisma.funnelEvent.findMany({ where: { createdAt: { gte: funnelStartDate } } }),
      prisma.submission.findMany({ select: { premiumServices: true, totalCostUsd: true, premiumPrStatus: true } }),
      prisma.admin.findMany({ select: { id: true, name: true, email: true } }),
    ]);

    // Average response time
    const avgResponseHours = reviewedSubs.length === 0 ? null : Math.round(
      reviewedSubs.reduce((acc, s) => acc + (new Date(s.curatorReviewedAt!).getTime() - new Date(s.submittedAt).getTime()), 0) /
      reviewedSubs.length / (1000 * 60 * 60)
    );

    // Genre frequency
    const genreMap: Record<string, number> = {};
    for (const sub of allGenres) {
      for (const g of sub.genres) {
        genreMap[g] = (genreMap[g] ?? 0) + 1;
      }
    }
    const topGenres = Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([genre, count]) => ({ genre, count }));

    const duplicatePairs = dupSubmissions.length;
    const retainedArtists = retainedSubmissions.length;

    // Funnel calculations
    let step1 = 0; let step2 = 0; let step3 = 0; let completed = 0;
    const sessions = new Map<string, { maxStep: number, done: boolean }>();
    funnelEvents.forEach(evt => {
      const current = sessions.get(evt.sessionId) || { maxStep: 0, done: false };
      sessions.set(evt.sessionId, {
        maxStep: Math.max(current.maxStep, evt.step),
        done: current.done || evt.completed
      });
    });
    
    sessions.forEach(s => {
      if (s.maxStep >= 1) step1++;
      if (s.maxStep >= 2) step2++;
      if (s.maxStep >= 3) step3++;
      if (s.done) completed++;
    });

    // Finance calculations
    let normalSubmissionsCount = 0;
    let premiumSubmissionsCount = 0;
    let premiumRevenueCents = 0;
    let pendingPremiumRevenueCents = 0;
    
    // Normal submission estimate = $5 (500 cents)
    const NORMAL_SUBMISSION_CENTS = 500;

    for (const sub of allSubmissionsFinance) {
      if (!sub.premiumServices || sub.premiumServices.length === 0) {
        normalSubmissionsCount++;
      } else {
        premiumSubmissionsCount++;
        if (sub.premiumPrStatus === "PAID") {
          premiumRevenueCents += sub.totalCostUsd || 0;
        } else if (sub.premiumPrStatus === "REQUESTED" || sub.premiumPrStatus === "APPROVED") {
          pendingPremiumRevenueCents += sub.totalCostUsd || 0;
        }
      }
    }

    const normalRevenueCents = normalSubmissionsCount * NORMAL_SUBMISSION_CENTS;
    const totalRevenueCents = normalRevenueCents + premiumRevenueCents;

    return NextResponse.json({
      period,
      business: {
        totalArtists,
        newArtists,
        prevNewArtists,
        growthArtists: prevNewArtists === 0 ? 100 : Math.round(((newArtists - prevNewArtists) / prevNewArtists) * 100),
        totalIndustry,
        pendingVerification,
        retainedArtists,
        artistsWithCredits,
      },
      editorial: {
        totalSubmissions,
        submissionsPeriod,
        prevSubmissionsPeriod,
        growthSubmissions: prevSubmissionsPeriod === 0 ? 100 : Math.round(((submissionsPeriod - prevSubmissionsPeriod) / prevSubmissionsPeriod) * 100),
        byOpportunity: submissionsByOpportunity.map(r => ({ name: r.opportunity, count: r._count.opportunity })),
        byStatus: submissionsByStatus.map(r => ({ name: r.status, count: r._count.status })),
        slaBreaches,
        avgResponseHours,
      },
      product: {
        byCountry: usersByCountry.map(r => ({ country: r.country ?? "Unknown", count: r._count.country })),
        topGenres,
        profileCompletion: totalArtists === 0 ? 0 : Math.round((artistsWithGenre / totalArtists) * 100),
        roleDistribution: roleDistribution.map(r => ({ name: r.roleType, count: r._count.roleType })),
        funnel: {
          step1, step2, step3, completed,
        }
      },
      finance: {
        totalRevenueCents,
        normalSubmissionsCount,
        premiumSubmissionsCount,
        normalRevenueCents,
        premiumRevenueCents,
        pendingPremiumRevenueCents,
      },
      alerts: {
        queueByCurator: curatorQueue.map(r => {
          const admin = admins.find(a => a.id === r.curatorId);
          return {
            curatorId: admin?.name || admin?.email || r.curatorId || "Unassigned",
            count: r._count.curatorId
          };
        }),
        slaBreaches,
        ghostArtists,
        duplicateSubmissions: duplicatePairs,
      }
    });
  } catch (err: any) {
    console.error("[GET /api/admin/stats] ERROR:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
