"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, ShieldCheck, Heart, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground transition-colors">
      
      {/* Newsletter Section */}
      <div className="border-b border-border/60 bg-muted/20 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              Dapatkan Promo & Karya Terbaru
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Berlangganan buletin mingguan untuk mendapatkan diskon eksklusif dan cerita dari pengrajin lokal.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full sm:w-auto flex items-center gap-2 max-w-md">
            {subscribed ? (
              <div className="px-4 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                ✓ Terima kasih telah berlangganan!
              </div>
            ) : (
              <div className="relative w-full flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan alamat email Anda..."
                  required
                  className="w-full rounded-full border border-border bg-background py-2.5 pl-4 pr-12 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Daftar</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">
                Art <span className="italic font-normal">and</span> Craft
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Pasar seni & kerajinan tangan otentik terbesar di Indonesia. Menghubungkan pengrajin lokal berbakat dengan pembeli yang menghargai keindahan karya manual (*handmade*).
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="text-xs font-semibold text-foreground">Ikuti Kami:</span>
              <div className="flex gap-2 text-muted-foreground">
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Kategori */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Kategori Kriya
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              {["Tekstil & Batik", "Kerajinan Kayu", "Keramik & Gerabah", "Macrame & Anyaman", "Perhiasan Artisan", "Dekorasi Rumah"].map((item) => (
                <li key={item}>
                  <Link href="/search" className="hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Pengrajin */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Untuk Pengrajin
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="/seller/setup" className="hover:text-primary transition-colors">
                  Buka Toko Gratis
                </Link>
              </li>
              <li>
                <Link href="/seller" className="hover:text-primary transition-colors">
                  Dashboard Penjual
                </Link>
              </li>
              <li>
                <Link href="/seller/wallet" className="hover:text-primary transition-colors">
                  Dompet & Saldo Toko
                </Link>
              </li>
              <li>
                <Link href="/seller/custom-requests" className="hover:text-primary transition-colors">
                  Pesanan Custom
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Bantuan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Bantuan & Panduan
            </h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Cara Membeli
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Lacak Pengiriman
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Kebijakan Pengembalian
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Payment & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
            <span>© {new Date().getFullYear()} <strong>ArtAndCraft.id</strong> — Handmade & Authentic Nusantara.</span>
          </div>

          {/* Payment Badges */}
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-muted-foreground/70">
            <span className="px-2 py-0.5 rounded border border-border bg-background">BCA</span>
            <span className="px-2 py-0.5 rounded border border-border bg-background">MANDIRI</span>
            <span className="px-2 py-0.5 rounded border border-border bg-background">BNI</span>
            <span className="px-2 py-0.5 rounded border border-border bg-background">BRI</span>
            <span className="px-2 py-0.5 rounded border border-border bg-background">QRIS</span>
            <span className="px-2 py-0.5 rounded border border-border bg-background">GOPAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
