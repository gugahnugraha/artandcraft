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

// ─── Shared Layout Template ────────────────────────────────────────────────────
function wrapTemplate(content: string, accentColor = "#7c3aed"): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; font-weight: 800; color: #1f2937; margin: 0;">
          🎨 ArtAndCraft<span style="color: ${accentColor};">.id</span>
        </h1>
      </div>
      ${content}
      <p style="font-size: 11px; color: #d1d5db; text-align: center; margin-top: 24px;">
        © ${new Date().getFullYear()} ArtAndCraft.id · Platform Kerajinan Indonesia
      </p>
    </div>
  `;
}

// ─── Public Functions ──────────────────────────────────────────────────────────

/** 1. Verifikasi email saat mendaftar */
export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${appUrl}/api/auth/verify-email?token=${token}`;
  console.log(`[MAIL] Verification link for ${email}: ${confirmLink}`);

  await sendEmail({
    to: email,
    subject: "Verifikasi Email Anda - ArtAndCraft.id",
    html: wrapTemplate(`
      <div style="background: #f9fafb; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px;">Verifikasi Email Anda</h2>
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 28px;">
          Terima kasih telah mendaftar di <strong>ArtAndCraft.id</strong>. 
          Klik tombol di bawah untuk mengaktifkan akun Anda.
        </p>
        <div style="text-align: center;">
          <a href="${confirmLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px;">
            ✅ Verifikasi Sekarang
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin: 28px 0 0; text-align: center; line-height: 1.5;">
          Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.<br/>
          Jika Anda tidak mendaftar, abaikan email ini.
        </p>
      </div>
    `),
  });
}

/** 2. Reset password */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${appUrl}/reset-password?token=${token}`;
  console.log(`[MAIL] Password reset link for ${email}: ${resetLink}`);

  await sendEmail({
    to: email,
    subject: "Reset Password Anda - ArtAndCraft.id",
    html: wrapTemplate(`
      <div style="background: #fff1f2; border-radius: 16px; padding: 32px; border: 1px solid #fecdd3;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px;">Reset Password Anda</h2>
        <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 28px;">
          Kami menerima permintaan reset password untuk akun Anda. 
          Klik tombol di bawah untuk melanjutkan.
        </p>
        <div style="text-align: center;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #e11d48, #be123c); color: #ffffff; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px;">
            🔐 Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin: 28px 0 0; text-align: center; line-height: 1.5;">
          Link ini akan kedaluwarsa dalam <strong>1 jam</strong>.<br/>
          Jika Anda tidak meminta reset password, abaikan email ini.
        </p>
      </div>
    `, "#e11d48"),
  });
}

/** 3. Konfirmasi pembayaran berhasil → Pembeli */
export async function sendOrderConfirmationEmail(options: {
  to: string;
  buyerName: string;
  orderId: string;
  grandTotal: number;
  items: Array<{ title: string; quantity: number; price: number }>;
}) {
  const { to, buyerName, orderId, grandTotal, items } = options;
  const orderLink = `${appUrl}/dashboard/orders/${orderId}`;
  const shortId = orderId.slice(-8).toUpperCase();

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; font-size: 14px; color: #374151; border-bottom: 1px solid #f3f4f6;">${item.title}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #6b7280; text-align: center; border-bottom: 1px solid #f3f4f6;">×${item.quantity}</td>
        <td style="padding: 10px 0; font-size: 14px; color: #111827; text-align: right; border-bottom: 1px solid #f3f4f6; font-weight: 600;">
          Rp ${(item.price * item.quantity).toLocaleString("id-ID")}
        </td>
      </tr>
    `
    )
    .join("");

  await sendEmail({
    to,
    subject: `✅ Pembayaran Berhasil - Pesanan #${shortId}`,
    html: wrapTemplate(`
      <div style="background: #f0fdf4; border-radius: 16px; padding: 32px; border: 1px solid #bbf7d0;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Pembayaran Berhasil! 🎉</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Hei ${buyerName}, pembayaran untuk pesanan Anda telah dikonfirmasi.</p>
        
        <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">Nomor Pesanan</p>
          <p style="font-size: 18px; font-weight: 800; color: #7c3aed; margin: 0 0 16px;">#${shortId}</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 12px 0 0; font-size: 14px; font-weight: 700; color: #111827;">Total Pembayaran</td>
              <td style="padding: 12px 0 0; font-size: 16px; font-weight: 800; color: #7c3aed; text-align: right;">
                Rp ${grandTotal.toLocaleString("id-ID")}
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px; line-height: 1.6;">
          Pengrajin kami sedang menyiapkan pesanan Anda. Kami akan mengirimkan notifikasi saat barang dikirim.
        </p>
        <div style="text-align: center;">
          <a href="${orderLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px;">
            Lacak Pesanan →
          </a>
        </div>
      </div>
    `, "#16a34a"),
  });
}

/** 4. Notifikasi pesanan baru → Penjual */
export async function sendNewOrderNotificationEmail(options: {
  to: string;
  storeName: string;
  orderId: string;
  totalAmount: number;
  items: Array<{ title: string; quantity: number }>;
}) {
  const { to, storeName, orderId, totalAmount, items } = options;
  const sellerOrderLink = `${appUrl}/seller/orders`;
  const shortId = orderId.slice(-8).toUpperCase();

  const itemsHtml = items
    .map(
      (item) => `
      <li style="font-size: 14px; color: #374151; padding: 6px 0; border-bottom: 1px solid #f3f4f6;">
        ${item.title} <span style="color: #7c3aed; font-weight: 600;">×${item.quantity}</span>
      </li>
    `
    )
    .join("");

  await sendEmail({
    to,
    subject: `📦 Pesanan Baru #${shortId} - ArtAndCraft.id`,
    html: wrapTemplate(`
      <div style="background: #faf5ff; border-radius: 16px; padding: 32px; border: 1px solid #e9d5ff;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Pesanan Baru Masuk! 📦</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Hei <strong>${storeName}</strong>, Anda mendapatkan pesanan baru!</p>

        <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px; text-transform: uppercase;">Nomor Pesanan</p>
          <p style="font-size: 18px; font-weight: 800; color: #7c3aed; margin: 0 0 16px;">#${shortId}</p>
          
          <ul style="list-style: none; margin: 0; padding: 0;">${itemsHtml}</ul>
          
          <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #7c3aed;">
            <span style="font-size: 13px; color: #6b7280;">Nilai Pesanan:</span>
            <span style="font-size: 18px; font-weight: 800; color: #7c3aed; float: right;">
              Rp ${totalAmount.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px; line-height: 1.6;">
          Segera proses dan kirimkan pesanan ini. Pembeli menunggu konfirmasi dari Anda!
        </p>
        <div style="text-align: center;">
          <a href="${sellerOrderLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px;">
            Proses Pesanan →
          </a>
        </div>
      </div>
    `),
  });
}

/** 5. Notifikasi pesanan dikirim + nomor resi → Pembeli */
export async function sendShippingNotificationEmail(options: {
  to: string;
  buyerName: string;
  orderId: string;
  courier: string;
  trackingNumber?: string;
}) {
  const { to, buyerName, orderId, courier, trackingNumber } = options;
  const orderLink = `${appUrl}/dashboard/orders/${orderId}`;
  const shortId = orderId.slice(-8).toUpperCase();

  await sendEmail({
    to,
    subject: `🚚 Pesanan #${shortId} Sedang Dikirim`,
    html: wrapTemplate(`
      <div style="background: #eff6ff; border-radius: 16px; padding: 32px; border: 1px solid #bfdbfe;">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">Pesanan Anda Sedang Dikirim! 🚚</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Hei ${buyerName}, kabar baik!</p>

        <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px; text-transform: uppercase;">Nomor Pesanan</p>
          <p style="font-size: 18px; font-weight: 800; color: #2563eb; margin: 0 0 16px;">#${shortId}</p>
          
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px; text-transform: uppercase;">Kurir</p>
              <p style="font-size: 15px; font-weight: 700; color: #111827; margin: 0;">${courier.toUpperCase()}</p>
            </div>
            ${trackingNumber ? `
            <div style="flex: 1;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 4px; text-transform: uppercase;">Nomor Resi</p>
              <p style="font-size: 15px; font-weight: 700; color: #2563eb; margin: 0;">${trackingNumber}</p>
            </div>` : ""}
          </div>
        </div>
        
        <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px; line-height: 1.6;">
          Setelah menerima barang, jangan lupa konfirmasi penerimaan di aplikasi dan berikan ulasan Anda!
        </p>
        <div style="text-align: center;">
          <a href="${orderLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px;">
            Lihat Detail Pesanan →
          </a>
        </div>
      </div>
    `, "#2563eb"),
  });
}

/** 6. Notifikasi penarikan dana disetujui/ditolak → Seller */
export async function sendWithdrawalStatusEmail(options: {
  to: string;
  sellerName: string;
  amount: number;
  status: "APPROVED" | "REJECTED";
  bankName: string;
  accountNumber: string;
  notes?: string;
}) {
  const { to, sellerName, amount, status, bankName, accountNumber, notes } = options;
  const isApproved = status === "APPROVED";

  await sendEmail({
    to,
    subject: `${isApproved ? "✅ Penarikan Dana Disetujui" : "⚠️ Penarikan Dana Ditolak"} - ArtAndCraft.id`,
    html: wrapTemplate(`
      <div style="background: ${isApproved ? "#f0fdf4" : "#fff7ed"}; border-radius: 16px; padding: 32px; border: 1px solid ${isApproved ? "#bbf7d0" : "#fed7aa"};">
        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px;">
          ${isApproved ? "Penarikan Dana Disetujui! ✅" : "Penarikan Dana Ditolak ⚠️"}
        </h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Hei ${sellerName},</p>
        
        <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-size: 13px; color: #9ca3af; padding: 8px 0;">Jumlah</td>
              <td style="font-size: 15px; font-weight: 700; color: #111827; text-align: right; padding: 8px 0;">Rp ${amount.toLocaleString("id-ID")}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #9ca3af; padding: 8px 0;">Bank</td>
              <td style="font-size: 14px; color: #374151; text-align: right; padding: 8px 0;">${bankName}</td>
            </tr>
            <tr>
              <td style="font-size: 13px; color: #9ca3af; padding: 8px 0;">Rekening</td>
              <td style="font-size: 14px; color: #374151; text-align: right; padding: 8px 0;">${accountNumber}</td>
            </tr>
          </table>
          ${notes ? `<p style="font-size: 13px; color: #6b7280; margin: 16px 0 0; padding-top: 12px; border-top: 1px solid #f3f4f6;"><strong>Catatan admin:</strong> ${notes}</p>` : ""}
        </div>
        
        <p style="font-size: 13px; color: #6b7280; margin: 0; line-height: 1.6;">
          ${isApproved
            ? "Dana akan segera muncul di rekening Anda dalam 1-3 hari kerja."
            : "Dana telah dikembalikan ke saldo toko Anda. Hubungi support jika ada pertanyaan."}
        </p>
      </div>
    `, isApproved ? "#16a34a" : "#ea580c"),
  });
}
