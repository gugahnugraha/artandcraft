import nodemailer from "nodemailer";

const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const smtpFrom = process.env.SMTP_FROM || "ArtAndCraft.id <no-reply@artandcraft.id>";

// ─── Brevo API Helper ──────────────────────────────────────────────────────────
// Menggunakan Brevo Transactional Email API (tidak butuh IP whitelist).
// Ini adalah solusi yang tepat untuk deployment Vercel/serverless.
// Docs: https://developers.brevo.com/reference/sendtransacemail

async function sendViaBrevoApi(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASSWORD;

  if (!apiKey) {
    return { ok: false, error: "BREVO_API_KEY tidak dikonfigurasi" };
  }

  // Parse "From" header: "Name <email>" → { name, email }
  const fromMatch = smtpFrom.match(/^(.+?)\s*<(.+?)>$/);
  const senderName  = fromMatch?.[1]?.trim() || "ArtAndCraft.id";
  const senderEmail = fromMatch?.[2]?.trim() || "no-reply@artandcraft.id";

  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.html,
  };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Brevo API ${res.status}: ${body}` };
    }

    const data = await res.json();
    return { ok: true, messageId: data.messageId };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ─── SMTP Fallback (untuk local dev tanpa API key) ─────────────────────────────
/** Buat transporter SMTP baru setiap panggilan agar env vars selalu fresh. */
function createSmtpTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_KEY;

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });
}

// ─── Unified Send ──────────────────────────────────────────────────────────────
/**
 * Kirim email lewat Brevo API (utama, cocok untuk Vercel & serverless).
 * Fallback ke SMTP jika API gagal dan SMTP tersedia.
 */
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  // 1️⃣ Coba via Brevo API terlebih dahulu
  const apiResult = await sendViaBrevoApi(options);

  if (apiResult.ok) {
    console.log("[MAIL] ✅ Email terkirim via Brevo API. MessageId:", apiResult.messageId);
    return;
  }

  console.warn("[MAIL] ⚠️ Brevo API gagal:", apiResult.error, "— Mencoba SMTP fallback...");

  // 2️⃣ Fallback ke SMTP
  const transporter = createSmtpTransporter();
  if (!transporter) {
    console.error("[MAIL] ❌ SMTP tidak dikonfigurasi. Email tidak terkirim ke:", options.to);
    throw new Error(`Gagal kirim email: Brevo API (${apiResult.error}) dan SMTP tidak tersedia`);
  }

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
  console.log("[MAIL] ✅ Email terkirim via SMTP fallback. MessageId:", info.messageId);
}

// ─── Public Functions ──────────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${appUrl}/api/auth/verify-email?token=${token}`;
  console.log(`[MAIL] Verification link for ${email}: ${confirmLink}`);

  await sendEmail({
    to: email,
    subject: "Verifikasi Email Anda - ArtAndCraft.id",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #1f2937; margin: 0;">
            🎨 ArtAndCraft<span style="color: #7c3aed;">.id</span>
          </h1>
        </div>
        <div style="background: #f9fafb; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px;">
            Verifikasi Email Anda
          </h2>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 28px;">
            Terima kasih telah mendaftar di <strong>ArtAndCraft.id</strong>. 
            Klik tombol di bawah untuk mengaktifkan akun Anda.
          </p>
          <div style="text-align: center;">
            <a href="${confirmLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px;">
              ✅ Verifikasi Sekarang
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin: 28px 0 0; text-align: center; line-height: 1.5;">
            Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.<br/>
            Jika Anda tidak mendaftar, abaikan email ini.
          </p>
        </div>
        <p style="font-size: 11px; color: #d1d5db; text-align: center; margin-top: 24px;">
          © ${new Date().getFullYear()} ArtAndCraft.id · Platform Kerajinan Indonesia
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  console.log(`[MAIL] Password reset link for ${email}: ${resetLink}`);

  await sendEmail({
    to: email,
    subject: "Reset Password Anda - ArtAndCraft.id",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; color: #1f2937; margin: 0;">
            🎨 ArtAndCraft<span style="color: #7c3aed;">.id</span>
          </h1>
        </div>
        <div style="background: #fff1f2; border-radius: 16px; padding: 32px; border: 1px solid #fecdd3;">
          <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px;">
            Reset Password Anda
          </h2>
          <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 28px;">
            Kami menerima permintaan reset password untuk akun Anda. 
            Klik tombol di bawah untuk melanjutkan.
          </p>
          <div style="text-align: center;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; letter-spacing: 0.3px;">
              🔐 Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin: 28px 0 0; text-align: center; line-height: 1.5;">
            Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.<br/>
            Jika Anda tidak meminta reset password, abaikan email ini.
          </p>
        </div>
        <p style="font-size: 11px; color: #d1d5db; text-align: center; margin-top: 24px;">
          © ${new Date().getFullYear()} ArtAndCraft.id · Platform Kerajinan Indonesia
        </p>
      </div>
    `,
  });
}
