import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, MapPin, Heart, ChevronDown } from "lucide-react";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Hasil Pencarian "${q}" | ArtAndCraft.id` : "Jelajahi Kerajinan | ArtAndCraft.id",
    description: q
      ? `Temukan produk kerajinan tangan "${q}" dari pengrajin UMKM pilihan Indonesia.`
      : "Jelajahi ribuan kerajinan tangan handmade asli Indonesia dari batik tulis, keramik, ukiran kayu, hingga perhiasan etnik.",
  };
}

// Fallback mock products
const mockProducts = [
  { id: "p1", title: "Kendi Keramik Kasongan Klasik", sellerName: "Lempuyang Clay", price: 185000, discount: 10, slug: "kendi-keramik-kasongan-klasik", photos: [], categoryName: "Keramik" },
  { id: "p2", title: "Selendang Sutera Batik Tulis Solo", sellerName: "Batik Ndalem", price: 1250000, discount: 5, slug: "selendang-sutera-batik-tulis-solo", photos: [], categoryName: "Batik" },
  { id: "p3", title: "Mangkuk Kayu Jati Solid 20cm", sellerName: "JavArtisan Studio", price: 95000, discount: 0, slug: "mangkuk-kayu-jati-solid-20cm", photos: [], categoryName: "Kerajinan Kayu" },
  { id: "p4", title: "Cincin Perak Bali Ukir Motif Naga", sellerName: "Bali Silver Art", price: 325000, discount: 15, slug: "cincin-perak-bali", photos: [], categoryName: "Perhiasan" },
  { id: "p5", title: "Tas Rajut Boho Anyaman Bambu Alami", sellerName: "Crochet Nusantara", price: 175000, discount: 0, slug: "tas-rajut-boho", photos: [], categoryName: "Crochet" },
  { id: "p6", title: "Hiasan Dinding Macrame Premium", sellerName: "Studio Simpul", price: 250000, discount: 10, slug: "hiasan-dinding-macrame", photos: [], categoryName: "Macrame" },
];

const categories = [
  { name: "Semua Kategori", slug: "" },
  { name: "Batik", slug: "batik" },
  { name: "Kerajinan Kayu", slug: "wood-craft" },
  { name: "Keramik", slug: "pottery" },
  { name: "Macrame", slug: "macrame" },
  { name: "Kulit", slug: "leather-craft" },
  { name: "Perhiasan", slug: "jewelry" },
  { name: "Sulam", slug: "embroidery" },
  { name: "Crochet", slug: "crochet" },
  { name: "Resin Art", slug: "resin-art" },
];

const sortOptions = [
  { label: "Terbaru", value: "latest" },
  { label: "Harga Terendah", value: "price_asc" },
  { label: "Harga Tertinggi", value: "price_desc" },
  { label: "Rating Terbaik", value: "rating" },
];

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, minPrice, maxPrice, sort } = await searchParams;

  let products: any[] = [];
  let dbOnline = false;
  let totalCount = 0;

  try {
    // Build Prisma where clause
    const where: any = { status: "ACTIVE" };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    else if (sort === "price_desc") orderBy = { price: "desc" };

    const [results, count] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: true,
          seller: true,
        },
        take: 48,
      }),
      prisma.product.count({ where }),
    ]);

    products = results.map((p) => ({
      id: p.id,
      title: p.title,
      sellerName: p.seller.storeName,
      price: Number(p.price),
      discount: Number(p.discount),
      slug: p.slug,
      photos: p.photos,
      categoryName: p.category.name,
    }));

    totalCount = count;
    dbOnline = true;
  } catch {
    // Database offline — use mock data filtered by query
    products = mockProducts.filter((p) => {
      if (q) return p.title.toLowerCase().includes(q.toLowerCase());
      return true;
    });
    totalCount = products.length;
  }

  const buildUrl = (params: Record<string, string>) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (category) urlParams.set("category", category);
    if (minPrice) urlParams.set("minPrice", minPrice);
    if (maxPrice) urlParams.set("maxPrice", maxPrice);
    if (sort) urlParams.set("sort", sort);
    Object.entries(params).forEach(([k, v]) => {
      if (v) urlParams.set(k, v);
      else urlParams.delete(k);
    });
    return `/search?${urlParams.toString()}`;
  };

  return (
    <div className="flex-1 bg-accent/5">
      {/* Search Header Bar */}
      <div className="bg-card border-b border-border/40 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form action="/search" method="GET" className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={q || ""}
                placeholder="Cari kerajinan tangan, batik, keramik..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <button type="submit" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm">
              Cari
            </button>
          </form>

          {/* Result summary */}
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            {q ? (
              <>
                <span>Menampilkan</span>
                <strong className="text-foreground">{totalCount}</strong>
                <span>hasil untuk</span>
                <strong className="text-primary">&ldquo;{q}&rdquo;</strong>
              </>
            ) : (
              <span>Jelajahi <strong className="text-foreground">{dbOnline ? totalCount : "ribuan"}</strong> karya kerajinan pilihan</span>
            )}
            {!dbOnline && <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full ml-2">Mode Demo</span>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-card rounded-xl border border-border/50 p-5 shadow-sm">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filter Pencarian
              </h3>

              {/* Category filter */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Kategori</h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={buildUrl({ category: cat.slug })}
                      className={`flex items-center justify-between text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        (category || "") === cat.slug
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range filter */}
              <div className="border-t border-border/40 pt-5">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Rentang Harga (Rp)</h4>
                <form action="/search" method="GET" className="space-y-2">
                  {q && <input type="hidden" name="q" value={q} />}
                  {category && <input type="hidden" name="category" value={category} />}
                  {sort && <input type="hidden" name="sort" value={sort} />}
                  <input
                    type="number"
                    name="minPrice"
                    defaultValue={minPrice || ""}
                    placeholder="Harga minimum"
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    defaultValue={maxPrice || ""}
                    placeholder="Harga maksimum"
                    className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button type="submit" className="w-full rounded-lg bg-primary/10 text-primary text-xs font-semibold py-2 hover:bg-primary/20 transition-colors">
                    Terapkan Filter
                  </button>
                </form>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 bg-card border border-border/50 rounded-xl px-4 py-3 shadow-sm">
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">{products.length}</strong> produk ditemukan
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Urutan:</span>
                <div className="flex gap-1.5">
                  {sortOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ sort: opt.value })}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        (sort || "latest") === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                <Search className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                  Coba gunakan kata kunci yang lebih umum atau hapus filter untuk melihat semua produk.
                </p>
                <Link href="/search" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
                  Lihat Semua Produk
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((prod) => {
                  const hasDiscount = prod.discount > 0;
                  const discountedPrice = prod.price * (1 - prod.discount / 100);
                  return (
                    <Link
                      key={prod.id}
                      href={`/produk/${prod.slug}`}
                      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="aspect-square w-full bg-primary/5 relative flex items-center justify-center overflow-hidden">
                        {prod.photos?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={prod.photos[0]} alt={prod.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <span className="text-2xl font-serif text-foreground/20 group-hover:scale-105 transition-transform duration-300">
                            {prod.title.split(" ").slice(-1)[0]}
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            -{prod.discount}%
                          </span>
                        )}
                        <button
                          className="absolute top-2 right-2 rounded-full bg-card/80 p-1.5 text-muted-foreground backdrop-blur-sm hover:text-red-500 hover:bg-card shadow-sm transition-colors"
                        >
                          <Heart className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-[9px] font-bold text-primary tracking-wider uppercase mb-1">{prod.categoryName}</span>
                        <h3 className="font-semibold text-foreground text-xs line-clamp-2 min-h-[32px] mb-1.5 group-hover:text-primary transition-colors">{prod.title}</h3>
                        <p className="text-[10px] text-muted-foreground mb-3">{prod.sellerName}</p>

                        <div className="mt-auto pt-3 border-t border-border/40 flex justify-between items-center">
                          <div>
                            {hasDiscount && (
                              <span className="block text-[10px] text-muted-foreground line-through">
                                Rp {prod.price.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span className="text-sm font-bold text-foreground">
                              Rp {(hasDiscount ? discountedPrice : prod.price).toLocaleString("id-ID")}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-semibold">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
