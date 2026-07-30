import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Shield, Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Layanan | ArtAndCraft.id",
  description: "Syarat dan ketentuan penggunaan platform marketplace kerajinan tangan Indonesia ArtAndCraft.id.",
};

export default function TermsPage() {
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
          <div className="inline-flex p-3 bg-primary/10 text-primary rounded-2xl">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Syarat & Ketentuan Layanan
          </h1>
          <p className="text-sm text-muted-foreground">
            Terakhir Diperbarui: 30 Juli 2026 · Berlaku untuk seluruh pengguna ArtAndCraft.id
          </p>
        </div>

        {/* Content Sections */}
        <div className="bg-card border border-border/60 p-8 sm:p-10 rounded-3xl shadow-sm space-y-8 text-foreground/90 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              1. Ketentuan Umum
            </h2>
            <p>
              Selamat datang di <strong>ArtAndCraft.id</strong>, marketplace pasar kreatif yang menghubungkan pengrajin, artisan lokal, dan pembeli kerajinan tangan di seluruh Indonesia. Dengan mendaftar, mengakses, atau menggunakan layanan kami, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              2. Akun & Keamanan
            </h2>
            <p>
              Pengguna wajib memberikan informasi yang akurat dan sah saat pendaftaran. Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akun Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              3. Hak & Kewajiban Penjual (Artisan/UMKM)
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>Penjual menjamin bahwa produk yang dijual merupakan karya asli buatan tangan atau hasil produksi UMKM sah.</li>
              <li>Penjual wajib melakukan Verifikasi Identitas (KYC KTP) sebelum menarik saldo hasil penjualan.</li>
              <li>Penjual bertanggung jawab mengemas pesanan dengan aman dan memproses pengiriman sesuai batas waktu yang ditentukan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              4. Transaksi & Pembayaran
            </h2>
            <p>
              Seluruh pembayaran diproses secara otomatis dan aman melalui gateway pembayaran terverifikasi Midtrans. Pembayaran yang telah berhasil akan ditahan oleh sistem Rekening Bersama (Escrow) ArtAndCraft.id sampai pembeli mengonfirmasi penerimaan barang atau batas waktu komplain terlampaui.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              5. Komisi Platform & Penarikan Dana
            </h2>
            <p>
              ArtAndCraft.id mengenakan biaya layanan/komisi platform sebesar <strong>5%</strong> dari total nilai penjualan produk yang berhasil diselesaikan. Komisi ini digunakan untuk pemeliharaan sistem, promosi pemasaran artisan, dan perlindungan pembeli.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              6. Pembatalan & Penyelesaian Sengketa
            </h2>
            <p>
              Pesanan yang belum dibayar dalam waktu 24 jam akan dibatalkan secara otomatis oleh sistem. Apabila terjadi kendala barang rusak atau tidak sesuai, pembeli berhak mengajukan komplain resmi sebelum melakukan konfirmasi selesai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
