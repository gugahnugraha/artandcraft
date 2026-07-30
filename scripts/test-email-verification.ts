/**
 * Test end-to-end: kirim email verifikasi seperti yang dikirim saat user register
 * Jalankan: npx tsx scripts/test-email-verification.ts your@email.com
 */
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

// Target email dari argumen CLI, atau default ke email nyata
const targetEmail = process.argv[2] || process.env.SMTP_FROM?.match(/<(.+?)>/)?.[1] || "";

if (!targetEmail) {
  console.error("❌ Sediakan email tujuan: npx tsx scripts/test-email-verification.ts your@email.com");
  process.exit(1);
}

console.log(`\n📧 Mengirim email verifikasi test ke: ${targetEmail}\n`);

// Import fungsi yang sama dipakai di production
async function run() {
  // Dynamic import agar bisa resolve path alias @/
  const { sendVerificationEmail } = await import("../src/lib/mail");
  const fakeToken = "test-token-" + Date.now();

  try {
    await sendVerificationEmail(targetEmail, fakeToken);
    console.log("✅ Email verifikasi berhasil dikirim!");
    console.log(`   Cek inbox: ${targetEmail}`);
    console.log(`   (Link verifikasi dalam email adalah link test, tidak akan berfungsi)`);
  } catch (err: any) {
    console.error("❌ Gagal:", err.message);
    process.exit(1);
  }
}

run();
