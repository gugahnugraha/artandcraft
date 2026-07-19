# 🎨 ArtAndCraft.id — Marketplace Kerajinan & Karya Seni Anak Bangsa

ArtAndCraft.id adalah platform marketplace e-commerce modern yang dirancang khusus untuk menghubungkan para pengrajin seni lokal Indonesia dengan pembeli di seluruh dunia. Aplikasi ini dibangun dengan teknologi **Next.js 16 (App Router)**, **React 19**, **Prisma 7**, dan **Tailwind CSS**, serta dilengkapi dengan sistem pembayaran otomatis, perhitungan ongkos kirim ekspedisi, obrolan langsung (*live chat*), dan kontrol kustomisasi visual platform yang dapat diatur secara real-time oleh Administrator.

---

## 🚀 Fitur Utama Platform

### 🛒 1. Pembeli (Buyer Experience)
- **Eksplorasi Produk & Kategori**: Pencarian cerdas, filter kategori kerajinan (Batik, Keramik, Kayu, Tenun, Macrame, Perhiasan, Kulit, dll.).
- **Keranjang & Wishlist**: Sinkronisasi keranjang belanja instan dan fitur simpan produk favorit.
- **Buku Alamat Pengiriman**: Manajemen banyak alamat pengiriman dengan penandaan alamat utama (*default*).
- **Checkout & Hitung Ongkir**: Kalkulasi tarif pengiriman otomatis berbasis kurir ekspedisi (RajaOngkir).
- **Payment Gateway**: Integrasi pembayaran otomatis dengan Midtrans (Virtual Account BCA/BRI/BNI/Mandiri, QRIS/E-Wallet, Kartu Kredit).
- **Pelacakan Pesanan & Ulasan**: Tracking status pesanan *real-time* dan sistem ulasan bintang serta ulasan foto dari pembeli.
- **Pesan Kustom (*Custom Request*)**: Pembeli dapat mengajukan permintaan karya kerajinan kustom langsung ke toko pengrajin.
- **Multibahasa (Bilingual)**: Pengalihan bahasa instan antara 🇮🇩 Bahasa Indonesia dan 🇬🇧 English.

### 🏪 2. Penjual (Seller Dashboard)
- **Setup & Branding Toko**: Pembuatan profil toko, logo, banner, deskripsi, dan kebijakan pengembalian.
- **Manajemen Produk & Varian**: Tambah, edit, dan kelola produk kerajinan lengkap dengan varian (ukuran, warna), stok, dan foto.
- **Kupon Promosi**: Buat dan kelola kode diskon khusus toko dengan batasan minimal belanja dan kuota penggunaan.
- **Manajemen Pesanan**: Pemrosesan pesanan, update nomor resi pengiriman, dan lacak pendapatan.
- **Dompet Toko & Penarikan Saldo (*Withdrawal*)**: Pemantauan histori transaksi dompet dan pengajuan penarikan dana ke rekening bank toko.
- **Live Chat & Pesanan Kustom**: Berkomunikasi langsung dengan pembeli dan memberikan penawaran harga untuk pesanan kustom.

### 🛡️ 3. Administrator (Admin Control Panel)
- **Dashboard Ringkasan & Analitik**: Pemantauan total pengguna, toko aktif, total transaksi, dan volume penjualan platform.
- **Manajemen Pengguna & Penjual**: Pengelolaan hak akses pengguna dan verifikasi profil toko penjual.
- **Manajemen Transaksi**: Pemantauan status transaksi seluruh marketplace.
- **Persetujuan Penarikan Dana**: Verifikasi dan persetujuan pengajuan penarikan saldo (*withdrawal*) dari toko penjual.
- **Kustomisasi Visual & Branding UI Platform (`/admin/settings`)**:
  - **Warna Tema Utama Dinamis**: Pengubah warna tema utama platform (HEX picker) secara *real-time* tanpa *page reload*.
  - **Banner Pengumuman Teratas**: Switcher & pengatur teks pengumuman puncak multibahasa (ID/EN).
  - **Hero Slide Manager**: Pengelola banner slider beranda dengan urutan tampil (*sorting*), status aktif, serta:
    - ☁️ **Image Dropzone R2 Upload**: Unggah foto background langsung ke Cloudflare R2 ke direktori khusus (`hero-slides/`).
    - 🌐 **One-Click Auto-Translate**: Penerjemah otomatis sekali klik dari Bahasa Indonesia ke Bahasa Inggris menggunakan API penerjemah publik.

---

## 🛠️ Teknologi & Arsitektur (Tech Stack)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 16.2 (Turbopack) | React Server Components & App Router |
| **UI & Styling** | React 19, Tailwind CSS v4 | Class Variance Authority, Lucide Icons, Shadcn UI |
| **Database & ORM** | Neon PostgreSQL, Prisma 7 | Serverless PostgreSQL Database & Prisma Client |
| **Autentikasi** | NextAuth.js v5 (Beta) | Credentials Auth (Bcrypt) & Provider Session |
| **Object Storage** | Cloudflare R2 (AWS SDK S3) | Upload berkas gambar produk & banner hero |
| **Payment Gateway** | Midtrans | Payment Gateway (VA, QRIS, Credit Card) |
| **Pengiriman** | RajaOngkir API | Kalkulasi ongkos kirim ekspedisi Indonesia |
| **Email Service** | Nodemailer | Email transaksional & verifikasi |

---

## 📂 Struktur Direktori Proyek

```
artandcraft/
├── prisma/
│   ├── schema.prisma         # Skema Database PostgreSQL (24 Models)
│   └── seed.ts               # Data awal platform (Admin, Categories, Products, Hero Slides)
├── public/                   # Asset statis lokal (images, icons)
├── scripts/                  # Script utility mandiri (migration, seeding, helper)
├── src/
│   ├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (auth)/           # Halaman autentikasi (Login, Register, Reset Password)
│   │   ├── admin/            # Dashboard & Control Panel Administrator
│   │   ├── api/              # Endpoint REST API Serverless
│   │   ├── checkout/         # Alur transaksi checkout pembeli
│   │   ├── dashboard/        # Dashboard akun pembeli
│   │   ├── produk/           # Detail produk & ulasan
│   │   ├── seller/           # Dashboard & manajemen toko penjual
│   │   └── toko/             # Halaman storefront toko penjual
│   ├── components/           # Komponen UI Reusable
│   │   ├── home/             # Komponen khusus beranda
│   │   ├── layouts/          # Header, Footer, Navbar, Sidebar
│   │   ├── providers/        # Language, Session & Theme Providers
│   │   └── ui/               # Base UI components (Dropzone, ProductCard, Modal)
│   ├── contexts/             # React Context (LanguageContext & Theme)
│   ├── lib/                  # Inisialisasi Prisma Client & Utilities
│   ├── locales/              # Berkas translasi multibahasa (id.ts & en.ts)
│   ├── proxy.ts              # Custom Edge Proxy / Route Guard Middleware
│   └── services/             # Abstraksi Layanan Eksternal
│       ├── payment/          # Integrasi SDK Midtrans
│       ├── shipping/         # Integrasi API RajaOngkir
│       └── storage/          # Abstraksi Storage (S3/R2 & Local Storage)
├── .env.example              # Template variabel lingkungan
├── next.config.ts            # Konfigurasi Next.js
└── package.json              # Spesifikasi dependensi & script
```

---

## ⚙️ Panduan Instalasi & Pengaturan Lokal

### 1. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/gugahnugraha/artandcraft.git
cd artandcraft
npm install
```

### 2. Pengaturan Variabel Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env.local` atau `.env` dan lengkapi konfigurasi berikut:

```env
# Database PostgreSQL (Neon/Local)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/artandcraft?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2 / S3 Object Storage
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="artandcraft-bucket"
R2_PUBLIC_URL="https://cdn.artandcraft.id"

# Midtrans Payment Gateway (Sandbox)
MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"
MIDTRANS_IS_PRODUCTION=false

# RajaOngkir Shipping API
RAJAONGKIR_API_KEY="your-rajaongkir-api-key"
```

### 3. Migrasi & Seed Database
Jalankan migrasi Prisma dan seed data awal:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses `http://localhost:3000`.

---

## 🔑 Akun Uji Coba Default (Seed Credentials)

| Peran (Role) | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@artandcraft.id` | `Admin@123` | Akses penuh Admin Panel & UI Customizer |
| **Penjual (Seller)** | `seller@artandcraft.id` | `Seller@123` | Akses Dashboard Toko JavArtisan |
| **Pembeli (Buyer)** | `buyer@artandcraft.id` | `Buyer@123` | Akun pembeli publik |

---

## 📄 Lisensi

Proyek ini dikembangkan secara penuh untuk marketplace **ArtAndCraft.id**. Hak cipta dilindungi undang-undang.
