import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASSWORD;
const smtpFrom = process.env.SMTP_FROM || "no-reply@artandcraft.id";
const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const transporter = (smtpHost && smtpUser && smtpPass) 
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${appUrl}/api/auth/verify-email?token=${token}`;

  console.log(`[MAIL] Verification Link for ${email}: ${confirmLink}`);

  if (!transporter) {
    console.log("[MAIL] SMTP is not configured. Email logged to console.");
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Verifikasi Email Anda - ArtAndCraft.id",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">Verifikasi Email Anda</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
          Terima kasih telah mendaftar di ArtAndCraft.id. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda.
        </p>
        <a href="${confirmLink}" style="display: inline-block; background-color: #1f2937; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px;">
          Verifikasi Email
        </a>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
          Jika Anda tidak meminta email ini, silakan abaikan. Link ini akan kedaluwarsa dalam 1 jam.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  console.log(`[MAIL] Password Reset Link for ${email}: ${resetLink}`);

  if (!transporter) {
    console.log("[MAIL] SMTP is not configured. Email logged to console.");
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to: email,
    subject: "Reset Password Anda - ArtAndCraft.id",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">Reset Password Anda</h2>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
          Anda menerima email ini karena kami menerima permintaan untuk mereset kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan.
        </p>
        <a href="${resetLink}" style="display: inline-block; background-color: #e11d48; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
          Jika Anda tidak meminta pengaturan ulang kata sandi, silakan abaikan email ini. Link ini akan kedaluwarsa dalam 1 jam.
        </p>
      </div>
    `,
  });
}
