/**
 * set-password.cjs
 * Sets a bcrypt password for an existing user.
 *
 * Usage:
 *   node prisma/set-password.cjs <email> <newPassword>
 *
 * Example:
 *   node prisma/set-password.cjs danievaristoc@gmail.com MiPassword123
 */

require("dotenv").config({ path: ".env.local" });

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("❌  Usage: node prisma/set-password.cjs <email> <password>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log(`✅  Password set for ${email}. You can now log in.`);
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
