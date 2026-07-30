/**
 * Script untuk menguji pengiriman email via Brevo HTTP API
 * Tidak perlu IP whitelist — cocok untuk simulasi kondisi Vercel
 * Jalankan: npx tsx scripts/test-brevo-api.ts
 */
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ .env loaded\n");
}

const apiKey   = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || "ArtAndCraft.id <no-reply@artandcraft.id>";
const testTo   = process.env.SMTP_USER || "test@example.com";

console.log("─────────────────────────────────────────");
console.log("       BREVO API EMAIL TEST");
console.log("─────────────────────────────────────────");
console.log("API Key :", apiKey ? `✅ SET (${apiKey.length} chars)` : "❌ MISSING");
console.log("From    :", smtpFrom);
console.log("To      :", testTo);
console.log("─────────────────────────────────────────\n");

if (!apiKey) {
  console.error("❌ BREVO_API_KEY atau SMTP_PASSWORD tidak ada di .env");
  process.exit(1);
}

async function testBrevoApi() {
  const fromMatch = smtpFrom.match(/^(.+?)\s*<(.+?)>$/);
  const senderName  = fromMatch?.[1]?.trim() || "ArtAndCraft.id";
  const senderEmail = fromMatch?.[2]?.trim() || "no-reply@artandcraft.id";

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: testTo }],
    subject: `[TEST API] ArtAndCraft Email - ${new Date().toISOString()}`,
    htmlContent: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #7c3aed;">✅ Brevo API Test Berhasil!</h2>
        <p>Email ini dikirim via <strong>Brevo HTTP API</strong> (bukan SMTP).</p>
        <p>Ini simulasi kondisi deployment <strong>Vercel</strong> — tidak butuh IP whitelist.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;"/>
        <small style="color: #9ca3af;">
          Waktu: ${new Date().toLocaleString("id-ID")} | 
          Sender: ${senderEmail}
        </small>
      </div>
    `,
  };

  console.log("📡 Mengirim email via Brevo API...");

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error(`❌ Brevo API Error ${res.status}:`);
      console.error("  ", responseText);
      console.error("\n💡 Kemungkinan penyebab:");
      if (res.status === 401) console.error("   → API Key salah atau expired");
      if (res.status === 400) console.error("   → Format payload salah, cek sender email");
      if (res.status === 403) console.error("   → Sender belum diverifikasi di Brevo");
      process.exit(1);
    }

    const data = JSON.parse(responseText);
    console.log("✅ Email berhasil dikirim via Brevo API!");
    console.log("   Message ID:", data.messageId);
    console.log(`\n📬 Cek inbox: ${testTo}`);
  } catch (err: any) {
    console.error("❌ Network error:", err.message);
    process.exit(1);
  }
}

testBrevoApi();
