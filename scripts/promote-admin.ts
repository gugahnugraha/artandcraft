// Production-safe script to promote a user to admin
// Usage: ADMIN_EMAIL=admin@artandcraft.id npx tsx scripts/promote-admin.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;

  if (!email) {
    console.error("❌ Usage: ADMIN_EMAIL=your@email.com npx tsx scripts/promote-admin.ts");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`ℹ️  User ${user.email} is already an ADMIN.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
  });

  console.log(`✅ User "${user.name || user.email}" has been promoted to ADMIN.`);
  console.log(`   Please re-login to refresh the session.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
