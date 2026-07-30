/**
 * Script untuk menguji koneksi SMTP dan pengiriman email
 * Jalankan: npx tsx scripts/test-smtp.ts
 */
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env manually
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ .env loaded from:", envPath);
} else {
  console.warn("⚠️  .env not found at:", envPath);
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_KEY;
const smtpFrom = process.env.SMTP_FROM || "no-reply@artandcraft.id";
const testTo   = process.env.SMTP_USER || "test@example.com"; // kirim ke diri sendiri

console.log("\n─────────────────────────────────────────");
console.log("       SMTP CONNECTION TEST");
console.log("─────────────────────────────────────────");
console.log("SMTP_HOST    :", smtpHost || "❌ MISSING");
console.log("SMTP_PORT    :", smtpPort);
console.log("SMTP_USER    :", smtpUser || "❌ MISSING");
console.log("SMTP_PASSWORD:", smtpPass ? "✅ SET (" + smtpPass.length + " chars)" : "❌ MISSING");
console.log("SMTP_FROM    :", smtpFrom);
console.log("─────────────────────────────────────────\n");

if (!smtpHost || !smtpUser || !smtpPass) {
  console.error("❌ SMTP tidak dikonfigurasi dengan benar! Cek variabel di atas.");
  process.exit(1);
}

async function testSmtp() {
  console.log("📡 Membuat transporter SMTP...");
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  console.log("🔍 Memverifikasi koneksi ke server SMTP...");
  try {
    await transporter.verify();
    console.log("✅ Koneksi SMTP berhasil!\n");
  } catch (err: any) {
    console.error("❌ Gagal terhubung ke SMTP server!");
    console.error("   Error:", err.message);
    console.error("\n💡 Kemungkinan penyebab:");
    if (err.message?.includes("ECONNREFUSED")) {
      console.error("   → Host atau port salah, atau firewall memblokir koneksi");
    } else if (err.message?.includes("535") || err.message?.includes("auth")) {
      console.error("   → Username/password salah, atau akun tidak diizinkan relay email");
    } else if (err.message?.includes("timeout")) {
      console.error("   → Koneksi timeout, cek jaringan atau firewall ISP");
    }
    process.exit(1);
  }

  console.log(`📧 Mengirim email test ke: ${testTo}`);
  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: testTo,
      subject: "[TEST] ArtAndCraft SMTP Test - " + new Date().toISOString(),
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">✅ SMTP Test Berhasil!</h2>
          <p>Email ini dikirim pada: <strong>${new Date().toLocaleString("id-ID")}</strong></p>
          <p>Konfigurasi SMTP Anda berfungsi dengan baik.</p>
          <hr/>
          <small style="color: #6b7280;">
            Host: ${smtpHost} | Port: ${smtpPort} | User: ${smtpUser}
          </small>
        </div>
      `,
    });
    console.log("✅ Email berhasil dikirim!");
    console.log("   Message ID:", info.messageId);
    if (info.response) {
      console.log("   Response  :", info.response);
    }
  } catch (err: any) {
    console.error("❌ Gagal mengirim email!");
    console.error("   Error:", err.message);
  }
}

testSmtp();
