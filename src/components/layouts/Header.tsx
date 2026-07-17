"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, Heart, User, Menu, Store, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground transition-colors hover:opacity-90">
              ArtAndCraft<span className="text-primary font-sans">.id</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/search" className="hover:text-foreground transition-colors">Galeri</Link>
            <Link href="/search?category=batik" className="hover:text-foreground transition-colors">Kategori</Link>
            <Link href="/search" className="hover:text-foreground transition-colors">Pengrajin</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden sm:flex max-w-sm flex-1 items-center relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kain batik, macrame, kerajinan kayu..."
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist Link */}
            <Link href="#" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            
            {/* Cart Icon */}
            <Link href="#" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative" title="Keranjang">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </Link>
            
            <div className="h-6 w-px bg-border hidden sm:block" />

            {/* Authentication States */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
            ) : session ? (
              <div className="relative">
                {/* User Dropdown Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full bg-accent/80 p-1.5 pr-3 text-sm font-semibold text-accent-foreground hover:bg-accent transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate">{session.user.name?.split(" ")[0]}</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg z-20">
                      
                      {/* User Identity Info */}
                      <div className="px-3 py-2 border-b border-border/40 mb-1.5 text-left">
                        <p className="text-sm font-bold text-foreground truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mb-1">{session.user.email}</p>
                        <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {session.user.role}
                        </span>
                      </div>

                      {/* Upgrade/Dashboard dynamic link based on role */}
                      {session.user.role === "BUYER" && (
                        <Link
                          href="/seller/setup"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Store className="h-4 w-4 text-primary" />
                          <span>Mulai Jualan (Buka Toko)</span>
                        </Link>
                      )}

                      {session.user.role === "SELLER" && (
                        <Link
                          href="#"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                          <span>Dashboard Penjual</span>
                        </Link>
                      )}

                      {session.user.role === "ADMIN" && (
                        <Link
                          href="#"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                        >
                          <Shield className="h-4 w-4 text-primary" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <Link
                        href="#"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>Profil Saya</span>
                      </Link>

                      {/* Sign Out Button */}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>

                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/85 transition-colors">
                <User className="h-4 w-4" />
                <span>Masuk</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
