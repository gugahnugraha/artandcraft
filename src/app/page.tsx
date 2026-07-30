import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/home/HomeClient";
import { cookies } from "next/headers";
import { id } from "@/locales/id";
import { en } from "@/locales/en";

const BASE_URL = process.env.NEXTAUTH_URL || "https://artandcraft.id";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const t = lang === "en" ? en : id;

  return {
    title: t.metadata.title,
    description: t.metadata.description,
    keywords: [
      "kerajinan tangan", "marketplace UMKM", "batik", "wayang", "gerabah",
      "perhiasan handmade", "kayu jati", "macrame", "resin art", "souvenir pernikahan",
    ],
    metadataBase: new URL(BASE_URL),
    openGraph: {
      type: "website",
      url: BASE_URL,
      title: t.metadata.og_title,
      description: t.metadata.og_desc,
      siteName: "ArtAndCraft.id",
    },
    twitter: {
      card: "summary_large_image",
      title: t.metadata.tw_title,
      description: t.metadata.tw_desc,
    },
    alternates: { canonical: BASE_URL },
    robots: { index: true, follow: true },
  };
}

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

export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredProducts: any[] = [];
  let newArrivals: any[] = [];
  let slides: any[] = [];
  let categoriesList = categories;

  try {
    // Fetch categories from DB
    const dbCategories = await prisma.category.findMany({
      select: { name: true, slug: true, image: true },
    });
    if (dbCategories.length > 0) {
      categoriesList = dbCategories;
    }

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
  } catch (err) {
    console.error("Home page DB query error:", err);
  }

  return (
    <HomeClient 
      categories={categoriesList} 
      featuredProducts={featuredProducts} 
      newArrivals={newArrivals} 
      slides={slides}
    />
  );
}
