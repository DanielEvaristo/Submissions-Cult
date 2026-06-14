import type { Prisma, PrismaClient } from "@prisma/client";

const ACTIVE_QUEUE_STATUSES = ["PENDING", "IN_REVIEW"] as const;

// Using any to bypass TS inference issues with TransactionClient after schema updates
type PrismaExecutor = any;

type CuratorCandidate = {
  id: string;
  assignedGenres: string[];
  createdAt: Date;
};

type ActiveSubmission = {
  id: string;
  genres: string[];
  curatorId: string | null;
  status: string;
};

function eligibleCuratorsForGenres(curators: CuratorCandidate[], genres: string[]) {
  const normalizedGenres = genres.filter(Boolean);
  const eligible = curators.filter((curator) => {
    if (!curator.assignedGenres || curator.assignedGenres.length === 0) {
      return true;
    }

    return normalizedGenres.some((genre) => curator.assignedGenres.includes(genre));
  });

  return eligible.length > 0 ? eligible : curators;
}

function sortCuratorsByLoadThenAge(
  curators: CuratorCandidate[],
  workloadMap: Map<string, number>
) {
  return [...curators].sort((a, b) => {
    const loadDiff = (workloadMap.get(a.id) ?? 0) - (workloadMap.get(b.id) ?? 0);
    if (loadDiff !== 0) return loadDiff;

    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export async function findLeastLoadedCuratorId(
  prisma: PrismaExecutor,
  genres: string[]
) {
  const curators = await prisma.admin.findMany({
    where: {
      role: "CURATOR",
    },
    select: {
      id: true,
      assignedGenres: true,
      createdAt: true,
    },
  });

  if (curators.length === 0) {
    return null;
  }

  const workloads = await prisma.submission.groupBy({
    by: ["curatorId"],
    where: {
      status: { in: [...ACTIVE_QUEUE_STATUSES] },
      curatorId: { not: null },
    },
    _count: { curatorId: true },
  });

  const workloadMap = new Map<string, number>();
  workloads.forEach((workload: { curatorId: string | null; _count: { curatorId: number } }) => {
    if (workload.curatorId) {
      workloadMap.set(workload.curatorId, workload._count.curatorId);
    }
  });

  const eligible = eligibleCuratorsForGenres(curators, genres);
  return sortCuratorsByLoadThenAge(eligible, workloadMap)[0]?.id ?? null;
}

export async function rebalanceActiveCuratorAssignments(prisma: PrismaExecutor) {
  const curators = await prisma.admin.findMany({
    where: { role: "CURATOR" },
    select: { id: true, assignedGenres: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // ── No curators left: park all active submissions as PENDING ──────────────
  if (curators.length === 0) {
    const activeSubmissions = await prisma.submission.count({
      where: { status: { in: [...ACTIVE_QUEUE_STATUSES] } },
    });

    await prisma.submission.updateMany({
      where: { status: { in: [...ACTIVE_QUEUE_STATUSES] } },
      data: { curatorId: null, status: "PENDING" },
    });

    return { reassigned: 0, activeSubmissions, curatorCount: 0 };
  }

  // ── Fetch all active submissions ordered by submission date ───────────────
  const submissions = await prisma.submission.findMany({
    where: { status: { in: [...ACTIVE_QUEUE_STATUSES] } },
    select: { id: true, genres: true, curatorId: true, status: true },
    orderBy: { submittedAt: "asc" },
  });

  // ── Compute assignments purely in memory (zero DB queries in this phase) ──
  // workloadMap tracks how many we've *assigned* so far in this rebalance run
  const workloadMap = new Map<string, number>();
  curators.forEach((c: { id: string }) => workloadMap.set(c.id, 0));

  // Groups: curatorId → array of submission IDs that need to be moved to them
  const groups = new Map<string, string[]>();

  let reassigned = 0;

  for (const submission of submissions as ActiveSubmission[]) {
    const eligible = eligibleCuratorsForGenres(curators, submission.genres);
    const targetCuratorId = sortCuratorsByLoadThenAge(eligible, workloadMap)[0]?.id ?? null;

    if (!targetCuratorId) continue;

    // Increment the in-memory workload counter immediately so the next
    // submission sees the updated load — this keeps distribution even.
    workloadMap.set(targetCuratorId, (workloadMap.get(targetCuratorId) ?? 0) + 1);

    // Only queue an update if something actually changes
    if (submission.curatorId !== targetCuratorId || submission.status !== "IN_REVIEW") {
      const ids = groups.get(targetCuratorId) ?? [];
      ids.push(submission.id);
      groups.set(targetCuratorId, ids);
      reassigned += 1;
    }
  }

  // ── Flush all changes in a single atomic transaction ─────────────────────
  // One updateMany per curator group instead of one UPDATE per submission.
  // e.g. 80 submissions across 4 curators → 4 queries instead of 80.
  if (groups.size > 0) {
    await prisma.$transaction(
      [...groups.entries()].map(([curatorId, ids]) =>
        prisma.submission.updateMany({
          where: { id: { in: ids } },
          data: { curatorId, status: "IN_REVIEW" },
        })
      )
    );
  }

  return {
    reassigned,
    activeSubmissions: submissions.length,
    curatorCount: curators.length,
  };
}
