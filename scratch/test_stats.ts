import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Starting...");
  const [
    totalArtists,
    newArtists,
    totalIndustry,
    pendingVerification,
    retainedArtistsGroups,
    artistsWithCredits,
    artistsWithGenre,
    roleDistribution,
    ghostArtists,
    duplicateSubmissions,
    queueByCurator
  ] = await Promise.all([
    prisma.user.count({ where: { accountType: "ARTIST" } }),
    prisma.user.count({ where: { accountType: "ARTIST" } }),
    prisma.user.count({ where: { accountType: "INDUSTRY" } }),
    prisma.user.count({ where: { accountType: "INDUSTRY", labelStatus: "PENDING_VERIFICATION" } }),
    prisma.submission.groupBy({ by: ["userId"], _count: { id: true }, having: { id: { _count: { gt: 1 } } } }),
    prisma.user.count({ where: { accountType: "ARTIST", credits: { gt: 0 } } }),
    prisma.user.count({ where: { accountType: "ARTIST", genre: { not: null } } }),
    prisma.user.groupBy({ by: ["roleType"], where: { accountType: "ARTIST" }, _count: { roleType: true } }),
    prisma.user.count({ where: { accountType: "ARTIST", submissions: { none: {} } } }),
    prisma.submission.groupBy({ by: ["userId", "trackTitle"], _count: { id: true }, having: { id: { _count: { gt: 1 } } } }),
    prisma.submission.groupBy({ by: ["curatorId"], where: { status: "IN_REVIEW" }, _count: { id: true } })
  ]);
  console.log("Success");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
