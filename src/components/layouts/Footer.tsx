import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-card py-12 md:py-16 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-foreground">
              ArtAndCraft<span className="text-primary font-sans">.id</span>
            </Link>
            <p className="mt-4 text-sm max-w-sm">
              Wadah penghubung karya pengrajin lokal dan produk handmade terbaik dari berbagai penjuru Indonesia. Menghadirkan keindahan budaya nusantara ke tangan Anda.
            </p>
            <div className="mt-6 text-xs text-primary font-semibold tracking-wider uppercase">
              🇮🇩 #BanggaBuatanIndonesia
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div>
            <h3 className="font-serif font-semibold text-foreground text-sm tracking-wider uppercase mb-4">
              Kategori Terpopuler
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Batik Tradisional</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Kerajinan Kayu</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Seni Tanah Liat & Pot</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Macrame & Anyaman</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Kulit Asli</Link></li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div>
            <h3 className="font-serif font-semibold text-foreground text-sm tracking-wider uppercase mb-4">
              Untuk Pengrajin
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Mulai Jualan</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Dashboard UMKM</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Komunitas Penjual</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Kebijakan Toko</Link></li>
            </ul>
          </div>

          {/* Quick Links Column 3 */}
          <div>
            <h3 className="font-serif font-semibold text-foreground text-sm tracking-wider uppercase mb-4">
              Tentang Kami
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-foreground transition-colors">Cerita Kami</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Karir</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Kontak</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div>
            &copy; {new Date().getFullYear()} ArtAndCraft.id. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Ketentuan Penggunaan</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Peta Situs</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
