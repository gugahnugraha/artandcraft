import Link from "next/link";
import { Star, MapPin, ArrowRight, Heart, ShoppingBag, ShieldCheck, Sparkles, Award, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

// Static categories list
const categories = [
  { name: "Batik", count: "420+ Produk", color: "from-amber-700/20 to-amber-900/20", slug: "batik", icon: "🎨" },
  { name: "Kerajinan Kayu", count: "310+ Produk", color: "from-orange-700/20 to-orange-900/20", slug: "wood-craft", icon: "🪵" },
  { name: "Keramik", count: "180+ Produk", color: "from-amber-600/20 to-orange-800/20", slug: "pottery", icon: "🏺" },
  { name: "Macrame", count: "250+ Produk", color: "from-yellow-700/20 to-yellow-900/20", slug: "macrame", icon: "🧵" },
  { name: "Kulit", count: "190+ Produk", color: "from-amber-800/20 to-yellow-900/20", slug: "leather-craft", icon: "👜" },
  { name: "Perhiasan", count: "140+ Produk", color: "from-yellow-600/20 to-amber-800/20", slug: "jewelry", icon: "💍" },
  { name: "Sulam", count: "95+ Produk", color: "from-orange-600/20 to-amber-700/20", slug: "embroidery", icon: "🪡" },
  { name: "Kaligrafi", count: "70+ Produk", color: "from-amber-900/20 to-orange-950/20", slug: "calligraphy", icon: "✍️" },
];

// Fallback mock data used when DB is offline
const mockProducts = [
  { id: "p1", title: "Kendi Keramik Kasongan Klasik", sellerName: "Lempuyang Clay", location: "Bantul, DIY", price: 185000, discount: 10, slug: "kendi-keramik-kasongan-klasik", photos: [], categoryName: "Keramik" },
  { id: "p2", title: "Kemeja Batik Tulis Sutera Solo", sellerName: "Batik Ndalem", location: "Surakarta, Jateng", price: 1250000, discount: 5, slug: "selendang-sutera-batik-tulis-solo", photos: [], categoryName: "Batik" },
  { id: "p3", title: "Mangkuk Kayu Jati Solid 20cm", sellerName: "JavArtisan Studio", location: "Jepara, Jateng", price: 95000, discount: 0, slug: "mangkuk-kayu-jati-solid-20cm", photos: [], categoryName: "Kerajinan Kayu" },
  { id: "p4", title: "Selendang Sutera Batik Premium", sellerName: "Oma Batik Tulis", location: "Yogyakarta, DIY", price: 750000, discount: 0, slug: "selendang-sutera-batik", photos: [], categoryName: "Batik" },
];

const mockArtisans = [
  { name: "JavArtisan Studio", city: "Jepara, Jawa Tengah", rating: 4.9, productsCount: 12, storeSlug: "javartisan" },
  { name: "Oma Batik Tulis", city: "Yogyakarta, DIY", rating: 5.0, productsCount: 8, storeSlug: "omabatik" },
  { name: "Kasongan Tembikar", city: "Bantul, DIY", rating: 4.8, productsCount: 24, storeSlug: "kasongantembikar" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  let dbProducts: any[] = [];
  let dbArtisans: any[] = [];
  let dbOnline = false;

  try {
    // Fetch featured products
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        seller: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // Fetch featured sellers
    const sellers = await prisma.sellerProfile.findMany({
      orderBy: { storeRating: "desc" },
      take: 3,
      include: { _count: { select: { products: true } } },
    });

    dbProducts = products.map((p) => ({
      id: p.id,
      title: p.title,
      sellerName: p.seller.storeName,
      location: "Indonesia",
      price: Number(p.price),
      discount: Number(p.discount),
      slug: p.slug,
      photos: p.photos,
      categoryName: p.category.name,
    }));

    dbArtisans = sellers.map((s) => ({
      name: s.storeName,
      city: "Indonesia",
      rating: Number(s.storeRating),
      productsCount: s._count.products,
      storeSlug: s.storeSlug,
    }));

    dbOnline = true;
  } catch {
    // Database offline — use fallback mock data
  }

  const featuredProducts = dbOnline ? dbProducts : mockProducts;
  const popularArtisans = dbOnline ? dbArtisans : mockArtisans;

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
              
              {/* Search Bar Hero */}
              <form action="/search" method="GET" className="flex w-full max-w-lg mx-auto lg:mx-0 mb-8">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    name="q"
                    placeholder="Cari batik, kerajinan kayu, keramik..."
                    className="w-full rounded-l-full border border-border bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-r-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md"
                >
                  Cari
                </button>
              </form>

              <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs font-medium text-muted-foreground mb-8">
                <span>Populer:</span>
                {["Batik Tulis", "Keramik Kasongan", "Ukiran Jepara", "Anyaman Rotan"].map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="rounded-full border border-border bg-card px-3 py-1 hover:border-primary hover:text-primary transition-colors">
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 border-t border-border/40 mt-4 pt-8 text-left max-w-md mx-auto lg:mx-0">
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

            {/* Right Hero Card */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl -z-10 rounded-full h-80 w-80 max-w-full"></div>
              <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-xl backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
                <div className="aspect-square w-full rounded-xl bg-gradient-to-tr from-amber-700/10 to-orange-800/20 flex items-center justify-center mb-4 relative overflow-hidden">
                  <div className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-md">
                    Karya Pilihan
                  </div>
                  {featuredProducts[0]?.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featuredProducts[0].photos[0]} alt={featuredProducts[0].title} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-5xl font-serif text-amber-800/40">Tembikar</span>
                  )}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-foreground">{featuredProducts[0]?.title || "Vas Keramik Kasongan"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-primary" /> {featuredProducts[0]?.location || "Bantul, Yogyakarta"}
                    </p>
                  </div>
                  <span className="text-primary font-bold text-sm">
                    Rp {(featuredProducts[0]?.price || 245000).toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4 text-sm">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-4 w-4 fill-amber-500" /> 4.9 <span className="text-xs font-normal text-muted-foreground">(32 ulasan)</span>
                  </div>
                  <Link href="/search" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                    Jelajahi <ArrowRight className="h-3 w-3" />
                  </Link>
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

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/search?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 text-center"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
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
                Karya-karya seni terbaik yang paling dicari dari seluruh nusantara.
              </p>
            </div>
            <Link href="/search" className="mt-4 sm:mt-0 flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Semua Produk <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.slice(0, 8).map((prod) => {
              const hasDiscount = prod.discount > 0;
              const discountedPrice = prod.price * (1 - prod.discount / 100);
              return (
                <div key={prod.id} className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
                  {/* Image */}
                  <div className="aspect-square w-full bg-primary/5 relative flex items-center justify-center overflow-hidden">
                    {prod.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.photos[0]} alt={prod.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <span className="text-3xl font-serif text-foreground/20 group-hover:scale-105 transition-transform duration-300">
                        {prod.title.split(" ").slice(-1)[0]}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">
                        -{prod.discount}%
                      </span>
                    )}
                    <button className="absolute top-3 right-3 rounded-full bg-card/80 p-1.5 text-muted-foreground backdrop-blur-sm hover:text-red-500 hover:bg-card shadow-sm transition-colors">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <span className="font-semibold text-foreground/80">{prod.sellerName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3 text-primary" /> {prod.location}</span>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[40px] mb-3 group-hover:text-primary transition-colors">
                      <Link href={`/produk/${prod.slug}`}>{prod.title}</Link>
                    </h3>
                    <div className="mt-auto pt-4 border-t border-border/40 flex items-end justify-between">
                      <div>
                        {hasDiscount && (
                          <span className="block text-xs text-muted-foreground line-through">
                            Rp {prod.price.toLocaleString("id-ID")}
                          </span>
                        )}
                        <span className="text-base font-bold text-foreground">
                          Rp {(hasDiscount ? discountedPrice : prod.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                <Link key={idx} href={`/toko/${artisan.storeSlug}`} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-serif font-bold text-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    {artisan.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-tight mb-1 group-hover:text-primary transition-colors">{artisan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{artisan.city}</p>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mb-2">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{artisan.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground border border-border px-3 py-1 rounded-full bg-background mt-auto">
                    {artisan.productsCount} Produk
                  </span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <ShoppingBag className="h-12 w-12 text-primary mx-auto mb-6 opacity-80" />
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Siap Menjual Karya Tangan Anda?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Bergabunglah dengan ribuan pengrajin yang sudah memasarkan produk mereka ke seluruh Indonesia melalui platform kami.
          </p>
          <Link href="/seller/setup" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/95 transition-all">
            <Sparkles className="h-4 w-4" />
            Mulai Berjualan Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
