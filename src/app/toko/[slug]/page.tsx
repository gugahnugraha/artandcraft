import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Star, MapPin, Heart, ShoppingBag, ShieldCheck, Mail, Database } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const BASE_URL = process.env.NEXTAUTH_URL || "https://artandcraft.id";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const seller = await prisma.sellerProfile.findUnique({
      where: { storeSlug: slug.toLowerCase() },
    });
    if (!seller) return { title: "Toko Tidak Ditemukan | ArtAndCraft.id" };
    return {
      title: `${seller.storeName} | Toko Kerajinan di ArtAndCraft.id`,
      description: seller.storeDescription?.slice(0, 160) || `Temukan produk kerajinan tangan otentik dari ${seller.storeName} di ArtAndCraft.id.`,
      openGraph: {
        title: `${seller.storeName} | ArtAndCraft.id`,
        description: seller.storeDescription?.slice(0, 160) || `Pengrajin UMKM lokal: ${seller.storeName}`,
        images: seller.storeBanner ? [{ url: seller.storeBanner }] : [],
        type: "website",
        url: `${BASE_URL}/toko/${seller.storeSlug}`,
      },
      alternates: { canonical: `${BASE_URL}/toko/${seller.storeSlug}` },
    };
  } catch {
    return { title: "Toko | ArtAndCraft.id" };
  }
}

export const dynamic = "force-dynamic";

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  let seller = null;
  let products: any[] = [];
  let databaseOffline = false;

  try {
    // 1. Fetch the seller profile by storeSlug
    seller = await prisma.sellerProfile.findUnique({
      where: { storeSlug: slug.toLowerCase() },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (seller) {
      // 2. Fetch all active products for this seller
      products = await prisma.product.findMany({
        where: {
          sellerId: seller.id,
          status: "ACTIVE",
        },
        include: {
          category: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (error: any) {
    const isConnRefused = error?.message?.includes("ECONNREFUSED") || error?.code === "ECONNREFUSED";
    if (isConnRefused) {
      console.warn(`⚠️ Database offline. Menggunakan mode fallback untuk toko: /toko/${slug}`);
    } else {
      console.error("Gagal memuat profil toko:", error.message || error);
    }
    databaseOffline = true;
  }

  // If the database is online but the seller profile was not found, return 404
  if (!databaseOffline && !seller) {
    notFound();
  }

  // Render a friendly error screen if the database connection failed
  if (databaseOffline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Database className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Database Sedang Offline</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Koneksi ke server database kami sedang terputus. Silakan hubungkan database Anda di file <code className="font-semibold text-primary">.env</code> dan jalankan migrasi untuk melanjutkan.
        </p>
        <Link href="/" className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      
      {/* Hero Store Banner */}
      <div className="w-full h-48 md:h-64 bg-gradient-to-r from-primary/30 to-secondary/20 relative flex items-end">
        {seller!.storeBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller!.storeBanner!}
            alt={seller!.storeName}
            className="object-cover w-full h-full absolute inset-0 -z-10"
          />
        )}
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

        {/* Floating Identity card */}
        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pb-6 relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end">
          
          {/* Logo */}
          <div className="h-24 w-24 rounded-full border-4 border-background bg-card text-primary font-serif font-bold text-4xl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
            {seller!.storeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={seller!.storeLogo} alt={seller!.storeName} className="object-cover w-full h-full" />
            ) : (
              seller!.storeName.charAt(0)
            )}
          </div>

          {/* Details */}
          <div className="text-center sm:text-left flex-1 space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {seller!.storeName}
            </h1>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Indonesia
              </span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {seller!.storeRating.toFixed(1)} Rating
              </span>
              <span>
                <strong>{seller!.followersCount}</strong> Pengikut
              </span>
            </div>
          </div>

          {/* Contact / Action buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors">
              <Heart className="h-3.5 w-3.5 text-primary" />
              <span>Ikuti Toko</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
              <Mail className="h-3.5 w-3.5" />
              <span>Hubungi</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Grid content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left profile info */}
          <div className="lg:col-span-4 bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground mb-3">Tentang Toko</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {seller!.storeDescription || "Pengrajin ini belum mengunggah deskripsi atau cerita tokonya."}
              </p>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Pengrajin UMKM Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="shrink-0 font-bold text-foreground">Pemilik:</span>
                <span className="truncate">{seller!.user.name}</span>
              </div>
            </div>
          </div>

          {/* Right products grid */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-1">
                Koleksi Kerajinan Toko ({products.length})
              </h2>
              <p className="text-xs text-muted-foreground">Karya orisinil langsung dari bengkel kerja pengrajin.</p>
            </div>

            {products.length === 0 ? (
              <div className="text-center border border-dashed border-border rounded-2xl py-16 bg-card">
                <ShoppingBag className="h-12 w-12 text-primary/30 mx-auto mb-4" />
                <h4 className="font-serif text-lg font-bold text-foreground mb-1">Koleksi Masih Kosong</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Pengrajin ini sedang mempersiapkan karya-karya baru untuk diluncurkan.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const hasDiscount = Number(prod.discount) > 0;
                  const priceNum = Number(prod.price);
                  const discountNum = Number(prod.discount);
                  const discountedPrice = priceNum * (1 - discountNum / 100);

                  return (
                    <div
                      key={prod.id}
                      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Image placeholder */}
                      <div className="aspect-square w-full bg-primary/5 relative flex items-center justify-center overflow-hidden">
                        {prod.photos && prod.photos[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={prod.photos[0]}
                            alt={prod.title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-2xl font-serif text-foreground/10 group-hover:scale-105 transition-transform duration-300">
                            {prod.title.split(" ").slice(-1)[0]}
                          </span>
                        )}

                        {hasDiscount && (
                          <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            -{discountNum}%
                          </span>
                        )}
                      </div>

                      {/* Info Details */}
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-[9px] font-bold text-primary tracking-wider uppercase mb-1">
                          {prod.category.name}
                        </span>
                        
                        <h3 className="font-semibold text-foreground text-xs line-clamp-2 min-h-[36px] mb-2 group-hover:text-primary transition-colors">
                          <Link href={`/produk/${prod.slug}`}>{prod.title}</Link>
                        </h3>

                        <div className="mt-auto pt-3 border-t border-border/40 flex justify-between items-end">
                          <div>
                            {hasDiscount && (
                              <span className="block text-[10px] text-muted-foreground line-through">
                                Rp {priceNum.toLocaleString("id-ID")}
                              </span>
                            )}
                            <span className="text-sm font-bold text-foreground">
                              Rp {(hasDiscount ? discountedPrice : priceNum).toLocaleString("id-ID")}
                            </span>
                          </div>
                          
                          <span className="text-[10px] text-muted-foreground">
                            Stok: {prod.stock}
                          </span>
                        </div>
                      </div>

                    </div>
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
