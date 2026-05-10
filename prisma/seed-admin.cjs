/**
 * seed-admin.cjs
 * Promotes an existing user to admin by email.
 *
 * Usage:
 *   node prisma/seed-admin.cjs <email>
 *
 * Example:
 *   node prisma/seed-admin.cjs admin@cultmachine.com
 */

require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌  Please provide an email address.");
    console.error("   Usage: node prisma/seed-admin.cjs <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }

  if (user.isAdmin) {
    console.log(`ℹ️   ${email} is already an admin. Nothing changed.`);
    process.exit(0);
  }

  await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
  });

  console.log(`✅  ${email} is now an admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
