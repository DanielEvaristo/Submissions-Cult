const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const HASH = await bcrypt.hash('123', 10);
  console.log('🌱 Seeding test data...');
  
  const artist1 = await prisma.user.upsert({
    where: { email: 'artist1@test.com' },
    update: {},
    create: {
      email: 'artist1@test.com',
      name: 'Midnight Echo',
      artistName: 'Midnight Echo',
      password: HASH,
      accountType: 'ARTIST',
      roleType: 'ARTIST',
      emailVerified: new Date(),
      genre: 'Electronic',
      subgenre: 'Synthwave',
      country: 'US',
      instagram: '@midnightecho',
      monthlyListeners: 5000,
    },
  });
  console.log('✅ Artist 1:', artist1.email);
}

main()
  .catch(e => {
    console.error('❌ Seed error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
