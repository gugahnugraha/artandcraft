const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ where: { email: 'buyer@artcraft.com' } });
  console.log(user);
}

checkUser()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
