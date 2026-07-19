import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import SearchFilterSidebar from "./SearchFilterSidebar";
import { Search, PackageX } from "lucide-react";
import type { Metadata } from "next";

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

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q, category, subcategory } = await searchParams;
  const title = q
    ? `Hasil Pencarian untuk "${q}" | ArtAndCraft.id`
    : subcategory
    ? `Subkategori: ${subcategory} | ArtAndCraft.id`
    : category
    ? `Kategori: ${category} | ArtAndCraft.id`
    : "Cari Produk Kerajinan & Artisan | ArtAndCraft.id";

  return {
    title,
    description: "Jelajahi ribuan produk handmade, batik, kayu, gerabah, dan perhiasan buatan pengrajin terbaik Indonesia.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, category, subcategory, min, max, sort } = await searchParams;

  // 1. Fetch categories for filter sidebar
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

  // 2. Build Prisma Filter Clause
  const whereClause: any = {
    status: "ACTIVE",
  };

  // Text search in title or description
  if (q && q.trim() !== "") {
    whereClause.OR = [
      { title: { contains: q.trim(), mode: "insensitive" } },
      { description: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  // Category Filter
  if (category && category.trim() !== "") {
    whereClause.category = {
      slug: category.trim(),
    };
  }

  // Subcategory Filter
  if (subcategory && subcategory.trim() !== "") {
    whereClause.subcategory = {
      slug: subcategory.trim(),
    };
  }

  // Price Filter
  const minPriceNum = min ? Number(min) : null;
  const maxPriceNum = max ? Number(max) : null;

  if (minPriceNum !== null || maxPriceNum !== null) {
    whereClause.price = {};
    if (minPriceNum !== null && !isNaN(minPriceNum)) {
      whereClause.price.gte = minPriceNum;
    }
    if (maxPriceNum !== null && !isNaN(maxPriceNum)) {
      whereClause.price.lte = maxPriceNum;
    }
  }

  // 3. Build Prisma Sort Clause
  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price_low") {
    orderByClause = { price: "asc" };
  } else if (sort === "price_high") {
    orderByClause = { price: "desc" };
  }

  // 4. Fetch Products
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      category: { select: { name: true } },
      seller: { select: { storeName: true, storeRating: true } },
    },
  });

  return (
    <div className="flex-1 bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Page Header */}
        <div className="mb-8 border-b border-border/50 pb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
            <Search className="h-7 w-7 text-primary shrink-0" />
            {q ? (
              <span>
                Hasil Pencarian: &ldquo;<span className="text-primary italic">{q}</span>&rdquo;
              </span>
            ) : (
              <span>Pencarian Produk Kerajinan</span>
            )}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Menampilkan {products.length} produk kerajinan tangan otentik dari pengrajin terverifikasi.
          </p>
        </div>

        {/* Content Layout (Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar Filter */}
          <div className="lg:col-span-1 sticky top-24">
            <SearchFilterSidebar categories={categories} />
          </div>

          {/* Right Product Results Grid */}
          <div className="lg:col-span-3">
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
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card rounded-2xl border border-border/60">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <PackageX className="h-8 w-8" />
                </div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">
                  Tidak ada produk yang ditemukan
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                  Coba gunakan kata kunci lain, sesuaikan rentang harga, atau hapus filter kategori yang sedang aktif.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
