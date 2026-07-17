import Link from "next/link";
import { Search, ShoppingBag, Heart, User, Menu } from "lucide-react";

export default function Header() {
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
            <Link href="#" className="hover:text-foreground transition-colors">Galeri</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Kategori</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Pengrajin</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Tentang Kami</Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden sm:flex max-w-md flex-1 items-center relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Cari kain batik, anyaman macrame, keramik..."
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-200"
            />
          </div>

          {/* Actions: Wishlist, Cart, Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="#" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" title="Wishlist">
              <Heart className="h-5 w-5" />
            </Link>
            <Link href="#" className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative" title="Keranjang">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                0
              </span>
            </Link>
            
            <div className="h-6 w-px bg-border hidden sm:block" />

            <Link href="#" className="flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/85 transition-colors">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Masuk</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
