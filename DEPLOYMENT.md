# 🚀 ArtAndCraft.id — Panduan Deployment Production

Dokumen ini adalah panduan lengkap untuk men-deploy ArtAndCraft.id ke platform Vercel dengan database Neon PostgreSQL, storage Cloudflare R2, payment Midtrans, dan shipping RajaOngkir.

---

## Prasyarat

- Akun [Vercel](https://vercel.com) (gratis/pro)
- Akun [Neon](https://neon.tech) (PostgreSQL serverless)
- Akun [Cloudflare R2](https://cloudflare.com/products/r2/) (object storage)
- Akun [Midtrans](https://midtrans.com) (payment gateway)
- Akun [Google Cloud Console](https://console.cloud.google.com) (untuk Google OAuth)
- Akun SMTP / Gmail App Password (untuk email transaksional)

---

## Langkah 1 — Setup Neon PostgreSQL

1. Buat project baru di [console.neon.tech](https://console.neon.tech)
2. Pilih region **Asia Pacific (Singapore)** untuk performa terbaik di Indonesia
3. Copy **Connection String** dari tab *Connect* → pilih format `psql`
4. Pastikan format URL seperti ini:
   ```
   postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
   ```
5. Jalankan migrasi schema:
   ```bash
   npx prisma db push
   ```

---

## Langkah 2 — Setup Cloudflare R2

1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com) → **R2 Object Storage**
2. Buat bucket baru dengan nama `artandcraft`
3. Di tab **Settings** bucket → aktifkan **Public Access**
4. Copy **Public Bucket URL** (format: `https://pub-xxxx.r2.dev`)
5. Buat API Token: **Manage R2 API Tokens** → Create Token (Object Read & Write)
6. Simpan: Account ID, Access Key ID, Secret Access Key

---

## Langkah 3 — Setup Google OAuth

1. Buka [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Buat **OAuth 2.0 Client ID** (tipe: Web application)
3. Tambahkan Authorized Redirect URIs:
   ```
   https://artandcraft.id/api/auth/callback/google
   https://www.artandcraft.id/api/auth/callback/google
   ```
4. Simpan Client ID dan Client Secret

---

## Langkah 4 — Setup Midtrans

1. Login ke [dashboard.midtrans.com](https://dashboard.midtrans.com)
2. Untuk testing: pilih **Sandbox** environment
3. Untuk production: pilih **Production** environment
4. Ambil dari **Settings → Access Keys**:
   - `Server Key` (diawali `SB-Mid-server-` untuk sandbox, `Mid-server-` untuk production)
   - `Client Key` (diawali `SB-Mid-client-` untuk sandbox)
5. Setup **Notification URL** (webhook): `https://artandcraft.id/api/webhook/midtrans`

---

## Langkah 5 — Deploy ke Vercel

### Opsi A: Melalui Vercel Dashboard (Rekomendasi)

1. Push repository ke GitHub
2. Buka [vercel.com/new](https://vercel.com/new) → Import repository
3. Vercel akan otomatis mendeteksi Next.js framework
4. Klik **Environment Variables** → tambahkan semua variabel di bawah ini

### Opsi B: Melalui Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Environment Variables (Wajib Diisi di Vercel)

Salin tabel ini ke **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Keterangan | Contoh |
|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host/neondb?sslmode=require` |
| `AUTH_SECRET` | Secret random 32 karakter (generate: `openssl rand -base64 32`) | `abc123...` |
| `NEXTAUTH_SECRET` | Sama dengan `AUTH_SECRET` | `abc123...` |
| `NEXTAUTH_URL` | URL production Anda | `https://artandcraft.id` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxxxx` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `xxxxxxxx` |
| `R2_ACCESS_KEY_ID` | R2 API Access Key | `xxxxxxxx` |
| `R2_SECRET_ACCESS_KEY` | R2 API Secret | `xxxxxxxx` |
| `R2_BUCKET_NAME` | Nama bucket R2 | `artandcraft` |
| `R2_PUBLIC_URL` | URL publik bucket | `https://pub-xxxx.r2.dev` |
| `MIDTRANS_SERVER_KEY` | Midtrans Server Key | `Mid-server-xxxx` |
| `MIDTRANS_CLIENT_KEY` | Midtrans Client Key | `Mid-client-xxxx` |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Same as above (public) | `Mid-client-xxxx` |
| `MIDTRANS_IS_PRODUCTION` | `"true"` untuk live | `"true"` |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | Same (public) | `"true"` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email pengirim | `noreply@artandcraft.id` |
| `SMTP_PASSWORD` | Gmail App Password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Nama & email pengirim | `ArtAndCraft.id <noreply@artandcraft.id>` |

### Opsional

| Variable | Keterangan |
|---|---|
| `RAJAONGKIR_API_KEY` | API key RajaOngkir Starter (jika tanpa ini, kalkulasi ongkir menggunakan mock fallback) |
| `GEMINI_API_KEY` | Google Gemini AI (untuk fitur AI di masa depan) |

---

## Langkah 6 — Post-Deployment

Setelah deployment selesai:

1. **Jalankan Prisma migration** via Vercel Build Command:
   - Build command di `vercel.json` sudah dikonfigurasi: `prisma generate && next build`

2. **Verifikasi Webhook Midtrans**:
   - Buka Midtrans Dashboard → Settings → Configuration
   - Isi Payment Notification URL: `https://artandcraft.id/api/webhook/midtrans`
   - Finish Redirect URL: `https://artandcraft.id/dashboard/orders`

3. **Test alur lengkap**:
   - Register akun baru → Verifikasi email ✓
   - Tambah produk ke cart → Checkout → Bayar (Midtrans Sandbox) ✓
   - Cek order di `/dashboard/orders` ✓

4. **Aktifkan Custom Domain** di Vercel:
   - Project → Settings → Domains → Add `artandcraft.id`
   - Tambahkan DNS records di registrar domain Anda

---

## Checklist Pre-Launch

- [ ] `DATABASE_URL` terhubung ke Neon production DB
- [ ] `MIDTRANS_IS_PRODUCTION` diset `"true"` untuk pembayaran nyata
- [ ] `NEXTAUTH_URL` diisi URL domain production
- [ ] Webhook Midtrans sudah dikonfigurasi
- [ ] Google OAuth redirect URI sudah ditambahkan
- [ ] R2 bucket sudah public dan URL valid
- [ ] Test email transaksional terkirim
- [ ] Lakukan test transaksi end-to-end

---

## Troubleshooting

### Build gagal: Prisma Client not found
```bash
# Pastikan postinstall script ada di package.json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database connection timeout
- Pastikan IP Vercel di-whitelist di Neon (default: sudah diizinkan semua IP)
- Cek format sslmode di DATABASE_URL: `?sslmode=require`

### Gambar tidak tampil
- Pastikan `R2_PUBLIC_URL` benar dan bucket berstatus public
- Tambahkan domain R2 ke `next.config.ts` → `images.remotePatterns`

---

*Dibuat otomatis oleh tim engineering ArtAndCraft.id*
