import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian & Garansi | ArtAndCraft.id",
  description: "Panduan retur barang, komplain, dan garansi pengembalian dana di ArtAndCraft.id.",
};

export default function ReturnPolicyPage() {
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
          <div className="inline-flex p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
            <RefreshCw className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            Kebijakan Pengembalian Barang & Komplain
          </h1>
          <p className="text-sm text-muted-foreground">
            Perlindungan Pembeli ArtAndCraft.id · Rekening Bersama Escrow Safe System
          </p>
        </div>

        {/* Main Process Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-card border border-emerald-500/30 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="h-5 w-5" /> Syarat Retur Disetujui
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>Barang pecah/rusak saat pengiriman via kurir.</li>
              <li>Produk yang diterima salah/berbeda dari spesifikasi.</li>
              <li>Terdapat cacat produksi utama pada produk buatan tangan.</li>
              <li>Mengunggah bukti foto/video unboxing yang jelas saat komplain.</li>
            </ul>
          </div>

          <div className="bg-card border border-amber-500/30 p-6 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle className="h-5 w-5" /> Retur Tidak Berlaku Jika
            </div>
            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
              <li>Komplain diajukan setelah mengonfirmasi pesanan diterima.</li>
              <li>Kerusakan terjadi akibat kelalaian atau pemakaian pembeli.</li>
              <li>Produk pesanan khusus (Custom Order) yang sudah sesuai spesifikasi kesepakatan.</li>
              <li>Tidak ada bukti foto/video unboxing pendukung.</li>
            </ul>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="bg-card border border-border/60 p-8 sm:p-10 rounded-3xl shadow-sm space-y-6 text-foreground/90 text-sm leading-relaxed">
          <h2 className="text-xl font-serif font-bold text-foreground">Alur Pengajuan Komplain (Dispute)</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <span className="flex shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold items-center justify-center text-xs">1</span>
              <div>
                <h3 className="font-bold text-foreground">Jangan Klik &quot;Konfirmasi Diterima&quot;</h3>
                <p className="text-xs text-muted-foreground mt-1">Jika barang yang Anda terima bermasalah, jangan konfirmasi selesai agar dana Anda tetap aman ditahan di Rekening Bersama Platform.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold items-center justify-center text-xs">2</span>
              <div>
                <h3 className="font-bold text-foreground">Klik &quot;Ajukan Komplain&quot; di Detail Pesanan</h3>
                <p className="text-xs text-muted-foreground mt-1">Buka halaman Pesanan Saya → klik tombol <strong>Ajukan Komplain</strong>. Isi alasan komplain dan unggah foto bukti kerusakan/kesalahan.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <span className="flex shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground font-bold items-center justify-center text-xs">3</span>
              <div>
                <h3 className="font-bold text-foreground">Mediasi & Penyelesaian</h3>
                <p className="text-xs text-muted-foreground mt-1">Penjual dan Admin akan meninjau komplain Anda. Jika komplain disetujui, dana akan dikembalikan penuh (Refund) ke saldo Anda atau dilakukan pengiriman produk pengganti.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
