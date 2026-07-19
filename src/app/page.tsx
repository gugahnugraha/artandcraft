import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";

const BASE_URL = process.env.NEXTAUTH_URL || "https://artandcraft.id";

export const metadata: Metadata = {
  title: "ArtAndCraft.id — Marketplace Kerajinan Tangan & Produk Seni Indonesia",
  description:
    "Temukan kerajinan tangan otentik, batik, kayu, keramik, perhiasan, dan karya pengrajin UMKM lokal terbaik Indonesia. Belanja langsung dari pengrajinnya di ArtAndCraft.id.",
  keywords: [
    "kerajinan tangan", "marketplace UMKM", "batik", "wayang", "gerabah",
    "perhiasan handmade", "kayu jati", "macrame", "resin art", "souvenir pernikahan",
  ],
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "ArtAndCraft.id — Marketplace Kerajinan Tangan Indonesia",
    description:
      "Temukan kerajinan tangan otentik dan produk seni dari pengrajin UMKM lokal terbaik Indonesia.",
    siteName: "ArtAndCraft.id",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArtAndCraft.id — Marketplace Kerajinan Tangan Indonesia",
    description:
      "Belanja produk seni dan kerajinan tangan UMKM lokal pilihan dari seluruh Indonesia.",
  },
  alternates: { canonical: BASE_URL },
  robots: { index: true, follow: true },
};

// ─── Categories ──────────────────────────────────────────────────────────────
const categories = [
  { name: "Batik",         slug: "batik" },
  { name: "Kayu",          slug: "wood-craft" },
  { name: "Keramik",       slug: "pottery" },
  { name: "Macrame",       slug: "macrame" },
  { name: "Perhiasan",     slug: "jewelry" },
  { name: "Kulit",         slug: "leather-craft" },
  { name: "Sulam",         slug: "embroidery" },
  { name: "Resin",         slug: "resin-art" },
  { name: "Dekorasi",      slug: "home-decor" },
  { name: "Kain Tenun",    slug: "textile" },
];

// ─── Fallback mock data ───────────────────────────────────────────────────────
const mockProducts = [
  { id: "p1", title: "Kendi Keramik Kasongan",       sellerName: "Lempuyang Clay",  location: "Bantul, DIY",    price: 185000, discount: 15, slug: "kendi-keramik",        photos: [] as string[], categoryName: "Keramik" },
  { id: "p2", title: "Kemeja Batik Tulis Sutera",    sellerName: "Batik Ndalem",    location: "Surakarta",      price: 1250000, discount: 5, slug: "kemeja-batik-solo",   photos: [], categoryName: "Batik" },
  { id: "p3", title: "Mangkuk Kayu Jati 20cm",       sellerName: "JavArtisan",      location: "Jepara",         price: 95000,  discount: 0, slug: "mangkuk-kayu-jati-solid-20cm", photos: [], categoryName: "Kayu" },
  { id: "p4", title: "Anyaman Tas Rotan Bali",       sellerName: "Ubud Bali Art",   location: "Gianyar, Bali",  price: 325000, discount: 20, slug: "tas-rotan-bali",      photos: [], categoryName: "Macrame" },
  { id: "p5", title: "Cincin Perak Ukir Kawung",     sellerName: "Bali Silver",     location: "Gianyar, Bali",  price: 285000, discount: 0, slug: "cincin-perak-kawung",  photos: [], categoryName: "Perhiasan" },
  { id: "p6", title: "Hiasan Dinding Macrame",       sellerName: "Studio Simpul",   location: "Bandung",        price: 175000, discount: 10, slug: "macrame-bohemian",    photos: [], categoryName: "Macrame" },
  { id: "p7", title: "Taplak Sulam Tradisional",     sellerName: "Rumah Tenun",     location: "Surakarta",      price: 225000, discount: 0, slug: "taplak-sulam",         photos: [], categoryName: "Sulam" },
  { id: "p8", title: "Dompet Kulit Full-Grain",      sellerName: "Leather Craft ID",location: "Garut, Jabar",   price: 450000, discount: 0, slug: "dompet-kulit",          photos: [], categoryName: "Kulit" },
  { id: "p9", title: "Miniatur Rumah Adat",          sellerName: "Kriya Kayu",      location: "Yogyakarta",     price: 350000, discount: 0, slug: "miniatur-rumah-adat",   photos: [], categoryName: "Miniatur" },
  { id: "p10", title: "Kalung Etnik Dayak",          sellerName: "Borneo Art",      location: "Samarinda",      price: 150000, discount: 5, slug: "kalung-etnik-dayak",    photos: [], categoryName: "Perhiasan" },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredProducts = mockProducts;
  let newArrivals = mockProducts.slice(4, 10);
  let slides: any[] = [];

  try {
    // Fetch active hero slides
    slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { category: true, seller: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    if (products.length > 0) {
      const mappedProducts = products.map((p) => ({
        id: p.id, title: p.title,
        sellerName: p.seller.storeName, location: "Indonesia",
        price: Number(p.price), discount: Number(p.discount),
        slug: p.slug, photos: p.photos, categoryName: p.category.name,
      }));
      
      featuredProducts = mappedProducts.slice(0, 6);
      if (mappedProducts.length > 6) {
        newArrivals = mappedProducts.slice(6, 12);
      } else {
        newArrivals = mappedProducts; // fallback if fewer items exist
      }
    }
  } catch { /* DB offline, use mock */ }

  return (
    <HomeClient 
      categories={categories} 
      featuredProducts={featuredProducts} 
      newArrivals={newArrivals} 
      slides={slides}
    />
  );
}
