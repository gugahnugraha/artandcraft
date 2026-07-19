// Script to list users and promote to admin
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  console.log("\n=== All Registered Users ===\n");
  if (users.length === 0) {
    console.log("No users found. You need to register an account first at http://localhost:3000/register");
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email} | Role: ${u.role} | Name: ${u.name || "N/A"}`);
    });
  }
  console.log(`\nTotal: ${users.length} users`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
