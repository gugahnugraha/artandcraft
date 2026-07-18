import { prisma } from './src/lib/prisma';

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log("All users in DB:", users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
