import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Database,
  Users,
  Package,
  Heart,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import StoreFollowButton from "./StoreFollowButton";
import StoreTabs from "./StoreTabs";
import AskSellerButton from "@/components/ui/AskSellerButton";
import CustomRequestButton from "./CustomRequestButton";
import ProductCard from "@/components/ui/ProductCard";

const BASE_URL = process.env.NEXTAUTH_URL || "https://artandcraft.id";

interface PageProps {
  params: Promise<{ slug: string }>;
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
      description:
        seller.storeDescription?.slice(0, 160) ||
        `Temukan produk kerajinan tangan otentik dari ${seller.storeName} di ArtAndCraft.id.`,
      openGraph: {
        title: `${seller.storeName} | ArtAndCraft.id`,
        description:
          seller.storeDescription?.slice(0, 160) ||
          `Pengrajin UMKM lokal: ${seller.storeName}`,
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
  const session = await auth();

  let seller: any = null;
  let products: any[] = [];
  let reviews: any[] = [];
  let isFollowing = false;
  let databaseOffline = false;

  try {
    seller = await prisma.sellerProfile.findUnique({
      where: { storeSlug: slug.toLowerCase() },
      include: {
        user: { select: { name: true, email: true } },
        followers: session?.user?.id
          ? { where: { userId: session.user.id } }
          : false,
      },
    });

    if (!seller) notFound();

    // Fetch active products with avg rating
    const rawProducts = await prisma.product.findMany({
      where: { sellerId: seller.id, status: "ACTIVE" },
      include: {
        category: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    products = rawProducts.map((p: any) => {
      const ratingSum = p.reviews.reduce((s: number, r: any) => s + r.rating, 0);
      return {
        id: p.id,
        title: p.title,
        sellerName: seller.storeName,
        price: Number(p.price),
        discount: Number(p.discount),
        slug: p.slug,
        photos: p.photos,
        categoryName: p.category.name,
        rating: p.reviews.length > 0 ? ratingSum / p.reviews.length : 0,
        reviewsCount: p.reviews.length,
      };
    });

    // Fetch latest store reviews (from product reviews belonging to this seller's products)
    reviews = await prisma.review.findMany({
      where: {
        product: { sellerId: seller.id },
      },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    // Recalculate store rating from all reviews for display (DO NOT mutate DB in render phase)
    if (reviews.length > 0) {
      const avgRating =
        reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      seller.storeRating = avgRating;
    }

    // Check if current user follows this store
    if (session?.user?.id && seller.followers) {
      isFollowing = (seller.followers as any[]).length > 0;
    }
  } catch (error: any) {
    const isConnRefused =
      error?.message?.includes("ECONNREFUSED") || error?.code === "ECONNREFUSED";
    if (isConnRefused) {
      console.warn(`⚠️ Database offline: /toko/${slug}`);
    } else if (error.message !== "NEXT_NOT_FOUND") {
      console.error("Gagal memuat profil toko:", error.message || error);
    }
    if (error.message !== "NEXT_NOT_FOUND") databaseOffline = true;
  }

  if (databaseOffline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Database className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
          Database Sedang Offline
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Koneksi ke server database kami sedang terputus.
        </p>
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const avgRating = seller.storeRating ?? 0;

  return (
    <div className="flex-1 bg-background">
      {/* ── Store Hero Banner ── */}
      <div className="w-full h-52 md:h-72 bg-gradient-to-r from-primary/40 via-primary/20 to-secondary/30 relative">
        {seller.storeBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller.storeBanner}
            alt={seller.storeName}
            className="object-cover w-full h-full absolute inset-0"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* ── Store Identity ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-14 flex flex-col sm:flex-row sm:items-end gap-5 pb-6 border-b border-border">
          {/* Logo */}
          <div className="h-28 w-28 rounded-2xl border-4 border-background bg-card text-primary font-serif font-bold text-5xl flex items-center justify-center shadow-xl shrink-0 overflow-hidden">
            {seller.storeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={seller.storeLogo}
                alt={seller.storeName}
                className="object-cover w-full h-full"
              />
            ) : (
              seller.storeName.charAt(0)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                {seller.storeName}
              </h1>
              {seller.isVerified && (
                <span className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Indonesia
              </span>
              {avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  {avgRating.toFixed(1)} Rating
                  <span className="text-muted-foreground">({reviews.length} ulasan)</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                <strong>{seller.followersCount}</strong> Pengikut
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5 text-primary" />
                <strong>{products.length}</strong> Produk
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 shrink-0 items-center">
            <CustomRequestButton sellerProfileId={seller.id} storeName={seller.storeName} />
            <AskSellerButton sellerProfileId={seller.id} storeName={seller.storeName} variant="outline" />
            <StoreFollowButton
              storeId={seller.id}
              storeSlug={seller.storeSlug}
              initialFollowing={isFollowing}
              isLoggedIn={!!session?.user}
            />
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
          {/* Left sidebar */}
          <aside className="lg:col-span-3 space-y-5">
            {/* About */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Tentang Toko
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {seller.storeDescription ||
                  "Pengrajin ini belum mengunggah deskripsi atau cerita tokonya."}
              </p>
            </div>

            {/* Store Policy */}
            {seller.storePolicy && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Kebijakan Toko
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {seller.storePolicy}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Statistik</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Produk</span>
                  <span className="font-bold">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Ulasan</span>
                  <span className="font-bold">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pengikut</span>
                  <span className="font-bold">{seller.followersCount}</span>
                </div>
                {avgRating > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-bold flex items-center gap-1 text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right tabs */}
          <div className="lg:col-span-9">
            <StoreTabs products={products} reviews={reviews} storeName={seller.storeName} />
          </div>
        </div>
      </div>
    </div>
  );
}
