"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, ShoppingBag, Heart, User, Menu, Store, LogOut, LayoutDashboard, Shield, X, Globe, ChevronDown, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/store/cart";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const totalCartItems = useCart((state) => state.getTotalItems());

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    slug: string;
    description?: string;
    subcategories: Array<{ id: string; name: string; slug: string }>;
  }>>([]);
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok && data.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error("Failed to fetch categories in Header:", err);
      }
    };
    fetchCategories();
  }, []);

  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.config) {
          const config = data.config;
          if (config.announcement_enabled === "true") {
            const text = language === "en" ? config.announcement_text_en : config.announcement_text_id;
            setAnnouncement(text || null);
          } else {
            setAnnouncement(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings in Header:", err);
      }
    };
    fetchSettings();
  }, [language]);

  // Hide Header on Auth Pages (Login, Register, Reset Password)
  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname.startsWith("/reset-password");

  if (isAuthPage) return null;

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      {announcement && (
        <div style={{ backgroundColor: "var(--primary)" }} className="text-white py-2.5 px-4 text-center text-xs font-semibold tracking-wide animate-fade-in shadow-inner relative z-50">
          {announcement}
        </div>
      )}
      {session && !session.user.emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-xs text-amber-800 dark:text-amber-300 font-medium">
          Email Anda ({session.user.email}) belum diverifikasi. Silakan cek kotak masuk Anda untuk melakukan verifikasi.
        </div>
      )}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        
        {/* TOP ROW: Logo, Search, Actions */}
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted md:hidden transition-colors" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl md:text-3xl text-primary tracking-tight">
                Art <span className="italic font-normal">and</span> Craft
              </span>
            </Link>
          </div>

          {/* Search (Desktop) - Centered & Prominent with Smooth Expand/Contract Animation */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 items-center justify-center mx-4">
            <div className="relative w-full max-w-md focus-within:max-w-2xl transition-all duration-500 ease-in-out group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.header.search_placeholder}
                className="w-full rounded-full border-2 border-border bg-background py-2.5 pl-5 pr-12 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none transition-all duration-300 shadow-sm hover:border-primary/50"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 w-11 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile search toggle */}
            <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} className="sm:hidden rounded-full p-2 text-foreground hover:bg-muted transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Language Switcher */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 rounded-full p-2 text-foreground hover:bg-muted transition-colors"
                title="Change Language"
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs uppercase font-medium">{language}</span>
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-24 rounded-xl border border-border bg-card p-1 shadow-lg z-20">
                    <button
                      onClick={() => { setLanguage("id"); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${language === "id" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
                    >
                      ID
                    </button>
                    <button
                      onClick={() => { setLanguage("en"); setLangDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${language === "en" ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"}`}
                    >
                      EN
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sign In / User Auth */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse mx-2" />
            ) : session ? (
              <div className="flex items-center gap-1 mx-1">
                <NotificationDropdown />
                <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-2 text-foreground hover:bg-muted transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-serif text-sm font-medium flex items-center justify-center">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-20">
                      <div className="px-3 py-3 mb-1 border-b border-border/50">
                        <p className="text-sm font-medium text-foreground truncate">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{session.user.email}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {session.user.role}
                        </span>
                      </div>

                      <div className="pt-1 space-y-0.5">
                        {session.user.role === "BUYER" && (
                          <Link href="/seller/setup" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span>{t.header.open_store}</span>
                          </Link>
                        )}
                        {session.user.role === "SELLER" && (
                          <Link href="/seller" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span>{t.header.store_dashboard}</span>
                          </Link>
                        )}
                        {session.user.role === "ADMIN" && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>{t.header.admin_panel}</span>
                          </Link>
                        )}
                        <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{t.header.my_profile}</span>
                        </Link>
                        {(session.user.role === "BUYER" || session.user.role === "SELLER") && (
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                            <span>{t.header.buyer_dashboard}</span>
                          </Link>
                        )}
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                          <LogOut className="h-4 w-4 text-destructive" />
                          <span>{t.header.logout}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            ) : (
              <Link href="/login" className="hidden md:flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition-all mx-1">
                {t.header.login}
              </Link>
            )}

            {/* Wishlist */}
            <Link href="/dashboard/wishlist" className="rounded-full p-2 text-foreground hover:bg-muted transition-colors" title="Wishlist Saya">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="rounded-full p-2 text-foreground hover:bg-muted transition-colors relative">
              <ShoppingBag className="h-5 w-5" />
              {isMounted && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground border-2 border-background">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>
        
        {/* BOTTOM ROW: Secondary Navigation (Aesthetic Main Product Types) */}
        <nav 
          className="hidden md:flex items-center justify-center gap-6 lg:gap-8 h-10 pb-2 relative border-t border-border/40 pt-1"
          onMouseLeave={() => setActiveCategoryHover(null)}
        >
          {/* All Categories Dropdown Trigger */}
          <div 
            className="relative group py-1"
            onMouseEnter={() => setActiveCategoryHover("all-categories-trigger")}
          >
            <button 
              className="text-[13px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 shadow-xs cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Semua Kategori</span>
              <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
            </button>

            {/* Mega Menu Dropdown for ALL Categories */}
            {activeCategoryHover === "all-categories-trigger" && (
              <div className="absolute left-0 top-full mt-1 w-[680px] rounded-3xl border border-border bg-card p-5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-3 gap-4">
                {categories.slice(0, 9).map((cat) => (
                  <div key={cat.id} className="space-y-1.5 p-2 rounded-xl hover:bg-muted/30 transition-colors">
                    <Link
                      href={`/search?category=${cat.slug}`}
                      className="font-bold text-xs text-foreground hover:text-primary flex items-center justify-between"
                      onClick={() => setActiveCategoryHover(null)}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">&rarr;</span>
                    </Link>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="space-y-1 pl-1">
                        {cat.subcategories.slice(0, 3).map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/search?category=${cat.slug}&subcategory=${sub.slug}`}
                            className="block text-[11px] text-muted-foreground hover:text-primary truncate"
                            onClick={() => setActiveCategoryHover(null)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="col-span-3 pt-2 border-t border-border/40 text-center">
                  <Link
                    href="/search"
                    className="text-xs font-bold text-primary hover:underline"
                    onClick={() => setActiveCategoryHover(null)}
                  >
                    Jelajahi Seluruh Katalog Kategori &amp; Kerajinan Nusantara &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Aesthetic Key Product Type Links */}
          {[
            { label: "Batik", href: "/search?category=batik-wastra" },
            { label: "Kerajinan Kayu", href: "/search?category=kerajinan-kayu" },
            { label: "Resin Art", href: "/search?category=seni-rupa-lukisan" },
            { label: "Keramik", href: "/search?category=keramik-gerabah" },
            { label: "Perhiasan", href: "/search?category=perhiasan-aksesori" },
            { label: "Anyaman", href: "/search?category=anyaman-rotan" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[13px] font-medium text-foreground/80 hover:text-primary hover:underline underline-offset-4 transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Search Expandable */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 shadow-inner">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.header.search_placeholder}
                autoFocus
                className="w-full rounded-full border-2 border-foreground bg-background py-2.5 pl-9 pr-4 text-sm text-foreground focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <button type="button" onClick={() => setMobileSearchOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
