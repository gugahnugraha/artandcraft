import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductGallery from "./ProductGallery";
import { ShieldCheck, MapPin, Star, Package, Scale, Maximize, Tag, Store, ArrowLeft, Share2 } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { seller: true, category: true },
    });
    if (!product) return { title: "Produk Tidak Ditemukan | ArtAndCraft.id" };
    const price = Number(product.price);
    const discount = Number(product.discount);
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    return {
      title: `${product.title} | ArtAndCraft.id`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: product.title,
        description: product.description.slice(0, 160),
        images: product.photos[0] ? [{ url: product.photos[0] }] : [],
        type: "website",
      },
      other: {
        "product:price:amount": String(finalPrice),
        "product:price:currency": "IDR",
      },
    };
  } catch {
    return { title: "Produk | ArtAndCraft.id" };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let product: any = null;
  let dbOnline = false;

  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subcategory: true,
        seller: {
          include: {
            user: { select: { name: true } },
            _count: { select: { products: true } },
          },
        },
      },
    });
    dbOnline = true;
  } catch {
    // DB offline
  }

  if (dbOnline && !product) notFound();

  // Offline mock fallback
  if (!dbOnline) {
    product = {
      id: "mock",
      title: "Mangkuk Kayu Jati Solid 20cm",
      description: "Mangkuk saji premium yang dipahat utuh dari balok kayu jati tua pilihan asal Jepara. Dilapisi dengan finishing food-grade beewax alami, sangat aman untuk menyajikan makanan hangat maupun dingin.",
      price: 95000,
      discount: 0,
      stock: 45,
      weight: 450,
      dimensions: "W:20cm H:8cm L:20cm",
      sku: "JEP-MNG-JTI",
      photos: [],
      slug,
      category: { name: "Kerajinan Kayu" },
      subcategory: { name: "Wadah Saji Jati" },
      seller: {
        storeName: "JavArtisan Studio",
        storeSlug: "javartisan",
        storeRating: 4.9,
        followersCount: 142,
        storeDescription: "Peralatan makan kayu jati solid dan gerabah tradisional.",
        _count: { products: 12 },
        user: { name: "Budi Kusuma" },
      },
    };
  }

  const price = Number(product.price);
  const discount = Number(product.discount);
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  // JSON-LD Schema.org Product
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.sku || undefined,
    image: product.photos,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      price: finalPrice.toFixed(0),
      priceCurrency: "IDR",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: product.seller.storeName,
      },
    },
  };

  return (
    <>
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex-1 bg-background py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-primary transition-colors">Produk</Link>
            <span>/</span>
            <Link href={`/search?category=${product.category?.slug || ""}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left — Gallery */}
            <div className="lg:col-span-5">
              <ProductGallery photos={product.photos} title={product.title} />
            </div>

            {/* Right — Details */}
            <div className="lg:col-span-7 space-y-6">

              {/* Header details */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary/10 px-2 py-0.5 rounded">
                    {product.category.name}
                  </span>
                  {product.subcategory && (
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                      {product.subcategory.name}
                    </span>
                  )}
                  {!dbOnline && (
                    <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">Mode Demo</span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                  {product.title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <span>{product.seller.storeRating.toFixed(1)}</span>
                    <span className="text-muted-foreground font-normal">(ulasan toko)</span>
                  </div>
                  <span className="text-border">|</span>
                  <span>Stok: <strong className="text-foreground">{product.stock} unit</strong></span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-accent/30 rounded-xl p-5 border border-border/40">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-foreground">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </span>
                  {hasDiscount && (
                    <div className="flex items-center gap-2">
                      <span className="text-base text-muted-foreground line-through">Rp {price.toLocaleString("id-ID")}</span>
                      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-0.5 rounded">
                        -{discount}%
                      </span>
                    </div>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                    Hemat Rp {(price - finalPrice).toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="font-semibold text-sm text-foreground mb-2">Deskripsi Produk</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-3">
                {product.weight && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <Scale className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Berat</p>
                      <p className="text-xs font-semibold text-foreground">{product.weight}g</p>
                    </div>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <Maximize className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dimensi</p>
                      <p className="text-xs font-semibold text-foreground">{product.dimensions}</p>
                    </div>
                  </div>
                )}
                {product.sku && (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <Tag className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SKU</p>
                      <p className="text-xs font-semibold text-foreground font-mono">{product.sku}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <Package className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stok</p>
                    <p className="text-xs font-semibold text-foreground">{product.stock} unit</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  disabled
                  className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  title="Fitur keranjang akan tersedia di Milestone 5"
                >
                  Tambah ke Keranjang
                </button>
                <button
                  disabled
                  className="rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-60"
                  title="Fitur beli langsung akan tersedia di Milestone 5"
                >
                  Beli Sekarang
                </button>
                <button className="rounded-xl border border-border bg-card px-4 py-3.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                🛡️ Pembayaran aman & terlindungi. Pengiriman ke seluruh Indonesia.
              </p>
            </div>
          </div>

          {/* Artisan / Seller Card */}
          <div className="mt-12 bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Tentang Pengrajin
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* Seller Logo */}
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-serif font-bold text-2xl flex items-center justify-center shrink-0">
                {product.seller.storeName.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-bold text-foreground text-base">{product.seller.storeName}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {product.seller.storeRating.toFixed(1)} Rating
                      </span>
                      <span>{product.seller._count.products} Produk</span>
                      <span>{product.seller.followersCount} Pengikut</span>
                    </div>
                  </div>
                  <Link
                    href={`/toko/${product.seller.storeSlug}`}
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <Store className="h-3 w-3" />
                    Kunjungi Toko
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {product.seller.storeDescription || "Pengrajin UMKM lokal terverifikasi di ArtAndCraft.id."}
                </p>
                <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pengrajin UMKM Terverifikasi
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
