import Link from "next/link";
import { Star, MapPin, ArrowRight, Heart, ShoppingBag, ShieldCheck, Sparkles, Award } from "lucide-react";

// Mock categories for visual representation
const categories = [
  { name: "Batik Tradisional", count: "420+ Produk", color: "from-amber-700/20 to-amber-900/20", slug: "batik" },
  { name: "Kerajinan Kayu", count: "310+ Produk", color: "from-orange-700/20 to-orange-900/20", slug: "wood-craft" },
  { name: "Keramik Kasongan", count: "180+ Produk", color: "from-amber-600/20 to-orange-800/20", slug: "pottery" },
  { name: "Tenun & Macrame", count: "250+ Produk", color: "from-yellow-700/20 to-yellow-900/20", slug: "macrame" },
  { name: "Kulit Handmade", count: "190+ Produk", color: "from-amber-800/20 to-yellow-900/20", slug: "leather-craft" },
  { name: "Aksesoris Kuningan", count: "140+ Produk", color: "from-yellow-600/20 to-amber-800/20", slug: "jewelry" },
];

// Mock products
const featuredProducts = [
  {
    id: "p1",
    title: "Kendi Keramik Kasongan Klasik",
    artisan: "Lempuyang Clay",
    location: "Bantul, DIY",
    price: 185000,
    originalPrice: 220000,
    rating: 4.9,
    reviews: 48,
    imageBg: "bg-amber-900/10",
    tag: "Terlaris",
  },
  {
    id: "p2",
    title: "Kemeja Batik Tulis Sutera Solo",
    artisan: "Batik Ndalem",
    location: "Surakarta, Jateng",
    price: 850000,
    originalPrice: 850000,
    rating: 5.0,
    reviews: 12,
    imageBg: "bg-amber-800/10",
    tag: "Koleksi Premium",
  },
  {
    id: "p3",
    title: "Mangkuk Kayu Jati Solid 20cm",
    artisan: "Wana Craft",
    location: "Jepara, Jateng",
    price: 95000,
    originalPrice: 120000,
    rating: 4.8,
    reviews: 86,
    imageBg: "bg-orange-950/10",
    tag: "Promo 20%",
  },
  {
    id: "p4",
    title: "Anyaman Tas Rotan Bali Bulat",
    artisan: "Ubud Bali Art",
    location: "Gianyar, Bali",
    price: 145000,
    originalPrice: 175000,
    rating: 4.7,
    reviews: 114,
    imageBg: "bg-yellow-900/10",
    tag: "Terlaris",
  },
];

// Mock featured sellers
const popularArtisans = [
  { name: "Sukur Jepara Ukir", city: "Jepara, Jawa Tengah", rating: 4.9, products: 87, initial: "S" },
  { name: "Oma Batik Tulis", city: "Yogyakarta, DIY", rating: 5.0, products: 43, initial: "O" },
  { name: "Kasongan Tembikar", city: "Bantul, DIY", rating: 4.8, products: 124, initial: "K" },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 to-background dark:from-neutral-950/20 dark:to-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 self-center lg:self-start rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Pusat Kerajinan Nusantara Terbaik</span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                Menghubungkan Karya <br />
                <span className="text-primary italic">Artisan Lokal</span> Nusantara
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Temukan ribuan karya buatan tangan berkualitas tinggi langsung dari UMKM pilihan di seluruh Indonesia. Mulai dari batik tulis, ukiran kayu premium, hingga keramik tradisional.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="#"
                  className="w-full sm:w-auto rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all text-center"
                >
                  Jelajahi Produk
                </Link>
                <Link
                  href="#"
                  className="w-full sm:w-auto rounded-full border border-border bg-card px-8 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-all text-center"
                >
                  Daftar Pengrajin
                </Link>
              </div>

              {/* Badges / Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/40 mt-12 pt-8 text-left max-w-md mx-auto lg:mx-0">
                <div>
                  <h4 className="text-2xl font-bold text-foreground">100%</h4>
                  <p className="text-xs text-muted-foreground">Handmade Lokal</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">500+</h4>
                  <p className="text-xs text-muted-foreground">Artisan UMKM</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-foreground">15k+</h4>
                  <p className="text-xs text-muted-foreground">Pengiriman Sukses</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Mock Cards / Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl -z-10 rounded-full h-80 w-80 max-w-full"></div>
              
              <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
                <div className="aspect-square w-full rounded-xl bg-gradient-to-tr from-amber-700/10 to-orange-800/20 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md">
                    Karya Pilihan
                  </div>
                  <span className="text-5xl font-serif text-amber-800/40">Tembikar</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground">Vas Keramik Kasongan</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary" /> Bantul, Yogyakarta
                    </p>
                  </div>
                  <span className="text-primary font-bold">Rp 245.000</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-4 w-4 fill-amber-500" /> 4.9 <span className="text-xs font-normal text-muted-foreground">(32 ulasan)</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    Lihat Pengrajin <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 md:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Kategori Kerajinan Populer
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pilih dari beragam kategori keahlian tangan unik yang diwariskan dari generasi ke generasi.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/kategori/${cat.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-border bg-background p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 text-left"
              >
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl font-bold text-amber-800 dark:text-amber-200 mb-6 group-hover:scale-110 transition-transform`}>
                  {cat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Karya Pilihan Terpopuler
              </h2>
              <p className="mt-4 text-muted-foreground">
                Karya-karya seni terbaik yang paling dicari dan mendapatkan ulasan bintang lima dari pembeli.
              </p>
            </div>
            <Link href="#" className="mt-4 sm:mt-0 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Semua Produk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                {/* Image Placeholder */}
                <div className={`aspect-square w-full ${prod.imageBg} relative flex items-center justify-center overflow-hidden`}>
                  <span className="text-3xl font-serif text-foreground/20 group-hover:scale-105 transition-transform duration-300">
                    {prod.title.split(" ").slice(-1)[0]}
                  </span>
                  
                  {/* Tag */}
                  {prod.tag && (
                    <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                      {prod.tag}
                    </span>
                  )}
                  
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 rounded-full bg-card/80 p-1.5 text-muted-foreground backdrop-blur-sm hover:text-red-500 hover:bg-card shadow-sm transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground/80">{prod.artisan}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-primary" /> {prod.location}</span>
                  </div>

                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[40px] mb-3 group-hover:text-primary transition-colors">
                    <Link href={`/produk/${prod.id}`}>{prod.title}</Link>
                  </h3>

                  <div className="mt-auto pt-4 border-t border-border/40 flex items-end justify-between">
                    <div>
                      {prod.originalPrice > prod.price && (
                        <span className="block text-xs text-muted-foreground line-through">
                          Rp {prod.originalPrice.toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-base font-bold text-foreground">
                        Rp {prod.price.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{prod.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground font-normal">({prod.reviews})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Featured Artisans Banner */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-amber-800/10 to-orange-900/10 border-y border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-amber-800 dark:text-amber-300 mb-6">
                <Award className="h-4 w-4" />
                <span>Pahlawan UMKM Lokal</span>
              </div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
                Mengenal Pengrajin Pilihan Kami
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Setiap pembelian di ArtAndCraft.id berkontribusi langsung pada perekonomian pengrajin lokal Indonesia. Kami memverifikasi langsung setiap UMKM untuk menjamin keaslian teknik pembuatan tradisional.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-sm block">100% Produk Terverifikasi</strong>
                    <span className="text-xs text-muted-foreground">Bahan baku bersumber secara berkelanjutan dan ramah lingkungan.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground text-sm block">Dukungan Pemberdayaan Ekonomi</strong>
                    <span className="text-xs text-muted-foreground">Lebih dari 80% hasil penjualan kembali langsung ke tangan pengrajin.</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {popularArtisans.map((artisan, idx) => (
                <div key={idx} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-serif font-bold text-2xl flex items-center justify-center mb-4">
                    {artisan.initial}
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-1">{artisan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{artisan.city}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-2">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{artisan.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground border border-border px-3 py-1 rounded-full bg-background mt-auto">
                    {artisan.products} Produk
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
