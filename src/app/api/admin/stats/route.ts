import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Never cache this route — stats must always be fresh
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const slaThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    // ── Run all queries in parallel ──────────────────────────────────────────
    const [
      totalArtists,
      newArtistsWeek,
      newArtistsMonth,
      totalIndustry,
      pendingVerification,
      artistsWithCredits,
      totalSubmissions,
      submissionsWeek,
      submissionsMonth,
      slaBreaches,
      reviewedSubs,
      profileComplete,
      allGenres,
      ghostArtistsCount,
      submissionsByOpportunity,
      submissionsByStatus,
      usersByRole,
      usersByCountry,
      curatorQueue,
    ] = await Promise.all([
      // Business
      prisma.user.count({ where: { accountType: "ARTIST" } }),
      prisma.user.count({ where: { accountType: "ARTIST", createdAt: { gte: startOfWeek } } }),
      prisma.user.count({ where: { accountType: "ARTIST", createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { accountType: "INDUSTRY" } }),
      prisma.user.count({ where: { accountType: "INDUSTRY", labelStatus: "PENDING_VERIFICATION" } }),
      prisma.user.count({ where: { accountType: "ARTIST", credits: { gt: 0 } } }),

      // Editorial
      prisma.submission.count(),
      prisma.submission.count({ where: { submittedAt: { gte: startOfWeek } } }),
      prisma.submission.count({ where: { submittedAt: { gte: startOfMonth } } }),
      prisma.submission.count({ where: { status: "PENDING", submittedAt: { lte: slaThreshold } } }),
      prisma.submission.findMany({
        where: { curatorReviewedAt: { not: null } },
        select: { submittedAt: true, curatorReviewedAt: true },
        take: 500,
      }),

      // Product
      prisma.user.count({ where: { accountType: "ARTIST", genre: { not: null } } }),
      prisma.submission.findMany({ select: { genres: true }, take: 2000 }),

      // Ghost artists (no submissions)
      prisma.user.count({
        where: { accountType: "ARTIST", submissions: { none: {} } },
      }),

      // GroupBy: submissions by opportunity
      prisma.submission.groupBy({
        by: ["opportunity"],
        _count: { opportunity: true },
      }),

      // GroupBy: submissions by status
      prisma.submission.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // GroupBy: users by role
      prisma.user.groupBy({
        by: ["roleType"],
        where: { accountType: "ARTIST" },
        _count: { roleType: true },
      }),

      // GroupBy: users by country (top 10)
      prisma.user.groupBy({
        by: ["country"],
        where: { accountType: "ARTIST", country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),

      // Curator queue: IN_REVIEW submissions grouped by curatorId
      prisma.submission.groupBy({
        by: ["curatorId"],
        where: { status: "IN_REVIEW", curatorId: { not: null } },
        _count: { curatorId: true },
        orderBy: { _count: { curatorId: "desc" } },
      }),
    ]);

    // ── Funnel events (queried separately to handle stale client gracefully) ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const funnelEvents: { sessionId: string; step: number; completed: boolean }[] =
      await (prisma as any).funnelEvent
        .findMany({ select: { sessionId: true, step: true, completed: true }, take: 10000 })
        .catch(() => []);

    // ── Retention: artists with 2+ submissions ────────────────────────────
    // Raw SQL to avoid groupBy having issues
    const retentionResult = await prisma.$queryRaw<{ cnt: bigint }[]>`
      SELECT COUNT(*) as cnt FROM (
        SELECT "userId" FROM "Submission" GROUP BY "userId" HAVING COUNT(*) >= 2
      ) sub
    `;
    const retentionArtists = Number(retentionResult[0]?.cnt ?? 0);

    // ── Duplicate submissions: same userId + trackTitle with count > 1 ────
    const dupResult = await prisma.$queryRaw<{ cnt: bigint }[]>`
      SELECT COUNT(*) as cnt FROM (
        SELECT "userId", "trackTitle" FROM "Submission" GROUP BY "userId", "trackTitle" HAVING COUNT(*) > 1
      ) dup
    `;
    const duplicateSubmissions = Number(dupResult[0]?.cnt ?? 0);

    // ── Average response time ─────────────────────────────────────────────
    const avgResponseHours =
      reviewedSubs.length === 0
        ? null
        : Math.round(
            reviewedSubs.reduce((acc, s) => {
              return acc + (new Date(s.curatorReviewedAt!).getTime() - new Date(s.submittedAt).getTime());
            }, 0) /
              reviewedSubs.length /
              (1000 * 60 * 60)
          );

    // ── Genre frequency ───────────────────────────────────────────────────
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

    // ── Funnel: unique sessions per step ─────────────────────────────────
    const funnelStep1 = new Set(funnelEvents.filter((e) => e.step >= 1).map((e) => e.sessionId)).size;
    const funnelStep2 = new Set(funnelEvents.filter((e) => e.step >= 2).map((e) => e.sessionId)).size;
    const funnelStep3 = new Set(funnelEvents.filter((e) => e.step >= 3).map((e) => e.sessionId)).size;
    const funnelCompleted = new Set(funnelEvents.filter((e) => e.completed).map((e) => e.sessionId)).size;

    return NextResponse.json({
      business: {
        totalArtists,
        newArtistsWeek,
        newArtistsMonth,
        totalIndustry,
        pendingVerification,
        retentionArtists,
        artistsWithCredits,
      },
      editorial: {
        totalSubmissions,
        submissionsWeek,
        submissionsMonth,
        byOpportunity: submissionsByOpportunity.map((r) => ({
          name: r.opportunity,
          count: r._count.opportunity,
        })),
        byStatus: submissionsByStatus.map((r) => ({
          name: r.status,
          count: r._count.status,
        })),
        slaBreaches,
        avgResponseHours,
      },
      product: {
        byRole: usersByRole.map((r) => ({ role: r.roleType, count: r._count.roleType })),
        byCountry: usersByCountry.map((r) => ({ country: r.country ?? "Unknown", count: r._count.country })),
        profileCompletePct: totalArtists === 0 ? 0 : Math.round((profileComplete / totalArtists) * 100),
        topGenres,
      },
      alerts: {
        queueByCurator: curatorQueue.map((r) => ({
          curatorId: r.curatorId,
          count: r._count.curatorId,
        })),
        ghostArtists: ghostArtistsCount,
        duplicateSubmissions,
        slaBreaches,
      },
      funnel: {
        step1: funnelStep1,
        step2: funnelStep2,
        step3: funnelStep3,
        completed: funnelCompleted,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Internal Server Error", detail: String(err) }, { status: 500 });
  }
}
