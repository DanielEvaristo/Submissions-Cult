const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Admins / Curators ===");
  const master = await prisma.admin.findFirst({ where: { role: 'MASTER_CURATOR' } });
  console.log("Master Curator:", master?.email);

  const curator = await prisma.admin.findFirst({ where: { role: 'CURATOR' } });
  console.log("Basic Curator:", curator?.email);

  console.log("\n=== Users ===");
  const artist = await prisma.user.findFirst({ where: { accountType: 'ARTIST' } });
  console.log("Artist:", artist?.email);

  const industry = await prisma.user.findFirst({ where: { accountType: 'INDUSTRY' } });
  console.log("Industry:", industry?.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
