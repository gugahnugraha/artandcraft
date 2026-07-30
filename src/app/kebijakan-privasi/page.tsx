import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | ArtAndCraft.id",
  description: "Kebijakan privasi dan perlindungan data pribadi pengguna ArtAndCraft.id sesuai UU PDP.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="bg-card border border-border/60 p-8 rounded-3xl shadow-sm space-y-4">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Kebijakan Privasi & Data Pribadi
          </h1>
          <p className="text-sm text-muted-foreground">
            Sesuai UU Perlindungan Data Pribadi (UU PDP) Republik Indonesia · Berlaku sejak 30 Juli 2026
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-card border border-border/60 p-8 sm:p-10 rounded-3xl shadow-sm space-y-8 text-foreground/90 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Komitmen Privasi Kami</h2>
            <p>
              ArtAndCraft.id berkomitmen untuk melindungi data pribadi seluruh pengguna, baik pembeli maupun penjual kerajinan. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Data yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li><strong>Informasi Pendaftaran:</strong> Nama, alamat email, nomor telepon, dan kata sandi yang dienkripsi.</li>
              <li><strong>Informasi Pengiriman:</strong> Alamat tujuan, nama penerima, kota, provinsi, dan kode pos.</li>
              <li><strong>Informasi Verifikasi Penjual (KYC):</strong> Foto Identitas (KTP) dan nomor rekening bank untuk pemrosesan pencairan saldo toko secara sah.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Penggunaan Informasi</h2>
            <p>
              Data pribadi Anda hanya digunakan untuk memproses transaksi pesanan, pengiriman barang via ekspedisi, notifikasi email transaksional, verifikasi keamanan akun, dan peningkatan kualitas layanan platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Keamanan & Enkripsi Data</h2>
            <p>
              Seluruh kata sandi dienkripsi menggunakan algoritma Hash `bcrypt`. Transaksi keuangan diproses langsung oleh mitra payment gateway berlisensi Bank Indonesia (Midtrans) dengan standar enkripsi SSL 256-bit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Hak Pemilik Data</h2>
            <p>
              Anda berhak mengakses, memperbarui, atau mengajukan penutupan akun dan penghapusan data pribadi Anda kapan saja melalui Pengaturan Profil atau dengan menghubungi tim dukungan kami di <code>support@artandcraft.id</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
