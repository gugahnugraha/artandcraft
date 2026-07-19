// Script to create a dedicated admin account
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";
import { randomBytes, scryptSync } from "crypto";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Hash password using scrypt (same as bcrypt-like approach, but built-in)
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const ADMIN_EMAIL = "admin@artandcraft.id";
  const ADMIN_PASSWORD = "Admin@123";
  const ADMIN_NAME = "Super Admin";

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    // Update role to ADMIN if not already
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: "ADMIN" },
      });
      console.log(`✅ User ${ADMIN_EMAIL} telah dipromosikan menjadi ADMIN.`);
    } else {
      console.log(`ℹ️ User ${ADMIN_EMAIL} sudah berstatus ADMIN.`);
    }
  } else {
    // Need to hash with bcrypt to match auth.ts
    // Let's use bcrypt for consistency
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await prisma.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`\n✅ Akun Admin berhasil dibuat!`);
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`  🛡️  ADMIN LOGIN CREDENTIALS`);
  console.log(`══════════════════════════════════════`);
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  URL      : http://localhost:3000/login`);
  console.log(`══════════════════════════════════════\n`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
