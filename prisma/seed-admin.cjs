/**
 * seed-admin.cjs
 * Promotes an existing user to admin by email.
 *
 * Usage:
 *   node prisma/seed-admin.cjs <email> <password>
 *
 * Example:
 *   node prisma/seed-admin.cjs admin@cultmachine.com MyPassword123
 */

require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("❌  Please provide an email address and a password.");
    console.error("   Usage: node prisma/seed-admin.cjs <email> <password>");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { 
      password: hashed,
      role: "SUPER_ADMIN"
    },
    create: {
      email,
      password: hashed,
      name: email.split("@")[0],
      role: "SUPER_ADMIN"
    }
  });

  console.log(`✅  Admin account created/updated for ${email}. You can now log in at /en/login.`);
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
