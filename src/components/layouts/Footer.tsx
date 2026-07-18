"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Hide Footer on Auth Pages
  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname.startsWith("/reset-password");

  if (isAuthPage) return null;

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
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
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
