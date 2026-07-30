import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import SearchFilterSidebar from "./SearchFilterSidebar";
import { Search, PackageX, Sparkles, ArrowRight, Layers, Tag } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { id } from "@/locales/id";
import { en } from "@/locales/en";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subcategory?: string;
    min?: string;
    max?: string;
    sort?: string;
  }>;
}

function formatCapitalize(str: string) {
  if (!str) return "";
  return str
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q, category, subcategory } = await searchParams;
  const subLabel = subcategory ? formatCapitalize(subcategory) : "";
  const catLabel = category ? formatCapitalize(category) : "";

  const title = q
    ? `Hasil Pencarian untuk "${q}" | ArtAndCraft.id`
    : subLabel
    ? `Koleksi ${subLabel} | ArtAndCraft.id`
    : catLabel
    ? `Koleksi ${catLabel} | ArtAndCraft.id`
    : "Katalog Kerajinan Tangan Nusantara | ArtAndCraft.id";

  return {
    title,
    description: "Jelajahi ribuan produk handmade, batik, kayu, gerabah, dan perhiasan buatan pengrajin terbaik Indonesia.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, subcategory, min, max, sort } = await searchParams;
  
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : id;

  // 1. Fetch active categories for sidebar
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      subcategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  // Find active category / subcategory objects by slug matching or fuzzy name matching
  const categoryClean = category?.trim().toLowerCase() || "";
  const subcategoryClean = subcategory?.trim().toLowerCase() || "";
  const qClean = q?.trim().toLowerCase() || "";

  const activeCategoryObj = categoryClean
    ? categories.find(
        (c) =>
          c.slug.toLowerCase() === categoryClean ||
          categoryClean.includes(c.slug.toLowerCase()) ||
          (categoryClean.length > 2 && c.slug.toLowerCase().includes(categoryClean.replace(/kerajinan-?/g, "")))
      )
    : undefined;

  const activeSubcategoryObj = (activeCategoryObj && subcategoryClean)
    ? activeCategoryObj.subcategories?.find(
        (s) =>
          s.slug.toLowerCase() === subcategoryClean ||
          subcategoryClean.includes(s.slug.toLowerCase()) ||
          (subcategoryClean.length > 2 && s.slug.toLowerCase().includes(subcategoryClean.replace(/kerajinan-?/g, "")))
      )
    : undefined;

  const displayCatLabel = categoryClean ? (activeCategoryObj?.name || formatCapitalize(categoryClean)) : "";
  const displaySubLabel = subcategoryClean ? (activeSubcategoryObj?.name || formatCapitalize(subcategoryClean)) : "";

  // 2. Build Intelligent Multi-Layer Search Clause
  const baseWhere: any = {
    status: "ACTIVE",
  };

  // Price Range
  const minPriceNum = min ? Number(min) : null;
  const maxPriceNum = max ? Number(max) : null;

  if (minPriceNum !== null || maxPriceNum !== null) {
    baseWhere.price = {};
    if (minPriceNum !== null && !isNaN(minPriceNum)) {
      baseWhere.price.gte = minPriceNum;
    }
    if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
      baseWhere.price.lte = maxPriceNum;
    }
  }

  // Build OR search conditions for Keywords (q)
  const searchOrConditions: any[] = [];

  if (qClean) {
    // 1. Full phrase match across fields
    searchOrConditions.push(
      { title: { contains: qClean, mode: "insensitive" } },
      { description: { contains: qClean, mode: "insensitive" } },
      { metaTitle: { contains: qClean, mode: "insensitive" } },
      { metaDescription: { contains: qClean, mode: "insensitive" } },
      { category: { name: { contains: qClean, mode: "insensitive" } } },
      { subcategory: { name: { contains: qClean, mode: "insensitive" } } },
      { seller: { storeName: { contains: qClean, mode: "insensitive" } } }
    );

    // 2. Individual words match if multi-word query
    const words = qClean.split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 1) {
      words.forEach((word) => {
        searchOrConditions.push(
          { title: { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } },
          { category: { name: { contains: word, mode: "insensitive" } } },
          { subcategory: { name: { contains: word, mode: "insensitive" } } }
        );
      });
    }
  }

  // Build Category / Subcategory Conditions
  const catOrConditions: any[] = [];
  if (categoryClean) {
    const rawCatWords = categoryClean.replace(/-/g, " ").split(" ");
    catOrConditions.push(
      { category: { slug: { equals: categoryClean, mode: "insensitive" } } },
      { category: { name: { contains: categoryClean.replace(/-/g, " "), mode: "insensitive" } } }
    );
    rawCatWords.forEach((word) => {
      if (word.length > 2 && word !== "kerajinan") {
        catOrConditions.push(
          { category: { name: { contains: word, mode: "insensitive" } } },
          { title: { contains: word, mode: "insensitive" } }
        );
      }
    });
  }

  const subcatOrConditions: any[] = [];
  if (subcategoryClean) {
    const rawSubWords = subcategoryClean.replace(/-/g, " ").split(" ");
    subcatOrConditions.push(
      { subcategory: { slug: { equals: subcategoryClean, mode: "insensitive" } } },
      { subcategory: { name: { contains: subcategoryClean.replace(/-/g, " "), mode: "insensitive" } } }
    );
    rawSubWords.forEach((word) => {
      if (word.length > 2 && word !== "kerajinan") {
        subcatOrConditions.push(
          { title: { contains: word, mode: "insensitive" } },
          { description: { contains: word, mode: "insensitive" } }
        );
      }
    });
  }

  // Combine clauses into final where clause
  const finalWhere: any = { ...baseWhere };

  const andClauses: any[] = [];
  if (searchOrConditions.length > 0) {
    andClauses.push({ OR: searchOrConditions });
  }
  if (catOrConditions.length > 0) {
    andClauses.push({ OR: catOrConditions });
  }
  if (subcatOrConditions.length > 0) {
    andClauses.push({ OR: subcatOrConditions });
  }

  if (andClauses.length > 0) {
    finalWhere.AND = andClauses;
  }

  // 3. Build Prisma Sort Clause
  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price_low") {
    orderByClause = { price: "asc" };
  } else if (sort === "price_high") {
    orderByClause = { price: "desc" };
  }

  // 4. Primary Query Execution
  let products = await prisma.product.findMany({
    where: finalWhere,
    orderBy: orderByClause,
    take: 60,
    include: {
      category: { select: { name: true } },
      seller: { select: { storeName: true, storeRating: true } },
    },
  });

  // 5. Intelligent Fallback Tier 1: If 0 products and subcategory was set, try main category or keyword match
  if (products.length === 0 && (subcategoryClean || categoryClean)) {
    const fallbackWhere: any = { status: "ACTIVE" };
    const fallbackOr: any[] = [];

    if (categoryClean) {
      const mainKeyword = categoryClean.replace(/kerajinan-?/g, "").replace(/-/g, " ");
      fallbackOr.push(
        { category: { name: { contains: mainKeyword, mode: "insensitive" } } },
        { title: { contains: mainKeyword, mode: "insensitive" } }
      );
    }
    if (subcategoryClean) {
      const subKeyword = subcategoryClean.replace(/kerajinan-?/g, "").replace(/-/g, " ");
      fallbackOr.push(
        { title: { contains: subKeyword, mode: "insensitive" } }
      );
    }

    if (fallbackOr.length > 0) {
      fallbackWhere.OR = fallbackOr;
      products = await prisma.product.findMany({
        where: fallbackWhere,
        orderBy: orderByClause,
        take: 60,
        include: {
          category: { select: { name: true } },
          seller: { select: { storeName: true, storeRating: true } },
        },
      });
    }
  }

  // 6. Smart Fallback Tier 2: Fetch Recommended Products if results are still 0
  let recommendedProducts: any[] = [];
  if (products.length === 0) {
    recommendedProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        category: { select: { name: true } },
        seller: { select: { storeName: true, storeRating: true } },
      },
    });
  }

  // Popular keywords for quick exploration
  const popularKeywords = [
    { label: "Batik Tulis", href: "/search?category=batik" },
    { label: "Ukiran Kayu Jati", href: "/search?category=wood-craft" },
    { label: "Gerabah Kasongan", href: "/search?category=pottery" },
    { label: "Macrame Hanging", href: "/search?category=macrame" },
    { label: "Perhiasan Perak", href: "/search?category=jewelry" },
  ];

  return (
    <div className="flex-1 bg-background py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Artistic Search Header Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 p-6 sm:p-10 border border-primary/20 shadow-sm">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            {/* Active Filter Badges Breadcrumb */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" /> Eksplorasi Kerajinan
              </span>
              {displayCatLabel && (
                <span className="inline-flex items-center gap-1 text-foreground bg-card/80 px-2.5 py-1 rounded-full border border-border font-medium">
                  <Layers className="h-3 w-3 text-primary" /> {displayCatLabel}
                </span>
              )}
              {displaySubLabel && (
                <span className="inline-flex items-center gap-1 text-foreground bg-card/80 px-2.5 py-1 rounded-full border border-border font-medium">
                  <Tag className="h-3 w-3 text-amber-600" /> {displaySubLabel}
                </span>
              )}
            </div>

            {/* Dynamic Header Title */}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              {q ? (
                <>
                  Hasil Pencarian: <span className="text-primary">&ldquo;{q}&rdquo;</span>
                </>
              ) : displaySubLabel ? (
                <>
                  Koleksi Kerajinan <span className="text-primary">{displaySubLabel}</span>
                </>
              ) : displayCatLabel ? (
                <>
                  Koleksi Kerajinan <span className="text-primary">{displayCatLabel}</span>
                </>
              ) : (
                "Katalog Kerajinan Tangan Nusantara"
              )}
            </h1>

            {/* Dynamic Subtitle */}
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
              {products.length > 0 ? (
                <>Menampilkan {products.length} karya seni kerajinan tangan otentik hasil buatan pengrajin terverifikasi Nusantara.</>
              ) : (
                <>Jelajahi ragam karya seni handmade otentik dan rekomendasi kerajinan buatan tangan pilihan dari pengrajin terverifikasi Nusantara di bawah ini.</>
              )}
            </p>
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar Filter */}
          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <SearchFilterSidebar categories={categories} />
          </div>

          {/* Right Product Results Area */}
          <div className="lg:col-span-3 space-y-8">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    slug={product.slug}
                    price={Number(product.price)}
                    discount={Number(product.discount)}
                    photos={product.photos}
                    categoryName={product.category.name}
                    sellerName={product.seller.storeName}
                    rating={product.seller.storeRating}
                  />
                ))}
              </div>
            ) : (
              /* Smart Empty State + Recommendations */
              <div className="space-y-10">
                <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-card rounded-3xl border border-border shadow-sm space-y-4">
                  <div className="p-4 bg-muted/40 text-muted-foreground rounded-2xl">
                    <PackageX className="h-10 w-10 text-primary/80" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-foreground">
                      {q ? (
                        <>Belum Ada Produk untuk Kata Kunci &ldquo;{q}&rdquo;</>
                      ) : displaySubLabel ? (
                        <>Belum Ada Produk di Subkategori &ldquo;{displaySubLabel}&rdquo;</>
                      ) : displayCatLabel ? (
                        <>Belum Ada Produk di Kategori &ldquo;{displayCatLabel}&rdquo;</>
                      ) : (
                        <>Produk Kerajinan Belum Tersedia</>
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1.5 leading-relaxed">
                      {q
                        ? `Pengrajin kami sedang mempersiapkan karya terbaru untuk kata kunci "${q}". Anda dapat mencoba kata kunci lain atau melihat koleksi rekomendasi kerajinan pilihan di bawah.`
                        : "Pengrajin kami sedang mempersiapkan karya terbaru untuk kategori ini. Anda dapat mencoba kata kunci lain atau melihat koleksi rekomendasi kerajinan pilihan di bawah."}
                    </p>
                  </div>

                  {/* Quick Keyword Pills */}
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    {popularKeywords.map((kw, i) => (
                      <Link
                        key={i}
                        href={kw.href}
                        className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground px-3.5 py-1.5 rounded-full border border-primary/20 transition-all"
                      >
                        {kw.label}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline pt-2"
                  >
                    Lihat Semua Produk Kerajinan <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Fallback Recommendation Section */}
                {recommendedProducts.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border/60">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Rekomendasi Produk Kerajinan Lainnya
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Karya tangan populer favorit pembeli yang mungkin Anda sukai
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {recommendedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          id={product.id}
                          title={product.title}
                          slug={product.slug}
                          price={Number(product.price)}
                          discount={Number(product.discount)}
                          photos={product.photos}
                          categoryName={product.category.name}
                          sellerName={product.seller.storeName}
                          rating={product.seller.storeRating}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
