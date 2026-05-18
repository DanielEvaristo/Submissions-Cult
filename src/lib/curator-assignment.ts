import type { Prisma, PrismaClient } from "@prisma/client";

const ACTIVE_QUEUE_STATUSES = ["PENDING", "IN_REVIEW"] as const;

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

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
  const curators = await prisma.user.findMany({
    where: {
      isCurator: true,
      isMasterCurator: false,
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
  workloads.forEach((workload) => {
    if (workload.curatorId) {
      workloadMap.set(workload.curatorId, workload._count.curatorId);
    }
  });

  const eligible = eligibleCuratorsForGenres(curators, genres);
  return sortCuratorsByLoadThenAge(eligible, workloadMap)[0]?.id ?? null;
}

export async function rebalanceActiveCuratorAssignments(prisma: PrismaExecutor) {
  const curators = await prisma.user.findMany({
    where: {
      isCurator: true,
      isMasterCurator: false,
    },
    select: {
      id: true,
      assignedGenres: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

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

  const submissions = await prisma.submission.findMany({
    where: { status: { in: [...ACTIVE_QUEUE_STATUSES] } },
    select: {
      id: true,
      genres: true,
      curatorId: true,
      status: true,
    },
    orderBy: { submittedAt: "asc" },
  });

  const workloadMap = new Map<string, number>();
  curators.forEach((curator) => workloadMap.set(curator.id, 0));

  let reassigned = 0;

  for (const submission of submissions as ActiveSubmission[]) {
    const eligible = eligibleCuratorsForGenres(curators, submission.genres);
    const assignedCuratorId = sortCuratorsByLoadThenAge(eligible, workloadMap)[0]?.id ?? null;

    if (!assignedCuratorId) {
      continue;
    }

    workloadMap.set(assignedCuratorId, (workloadMap.get(assignedCuratorId) ?? 0) + 1);

    if (submission.curatorId !== assignedCuratorId || submission.status !== "IN_REVIEW") {
      await prisma.submission.update({
        where: { id: submission.id },
        data: {
          curatorId: assignedCuratorId,
          status: "IN_REVIEW",
        },
      });
      reassigned += 1;
    }
  }

  return {
    reassigned,
    activeSubmissions: submissions.length,
    curatorCount: curators.length,
  };
}
