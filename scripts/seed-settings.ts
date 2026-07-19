import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const slidesData = [
  {
    tagId: "Otentik & Handmade",
    tagEn: "Authentic & Handmade",
    titleId: "Temukan Keunikan Karya Anak Bangsa",
    titleEn: "Discover Unique Creations by Local Artisans",
    subtitleId: "Dukung pengrajin lokal dan temukan karya seni otentik dari seluruh pelosok Nusantara.",
    subtitleEn: "Support local artisans and find authentic artworks from all corners of the Archipelago.",
    imageUrl: "/hero_banner.png",
    btnTextId: "Jelajahi Sekarang",
    btnTextEn: "Explore Now",
    btnLink: "/search",
    order: 0,
    isActive: true,
  },
  {
    tagId: "Batik & Tenun",
    tagEn: "Batik & Weaving",
    titleId: "Keindahan Warisan Wastra Nusantara",
    titleEn: "The Elegance of Archipelago Textile Heritage",
    subtitleId: "Jelajahi koleksi batik tulis premium dan kain tenun ikat hasil karya maestro pengrajin daerah.",
    subtitleEn: "Explore premium hand-painted batik and ikat woven fabrics crafted by master regional artisans.",
    imageUrl: "/hero_banner_batik.png",
    btnTextId: "Lihat Koleksi Batik",
    btnTextEn: "Explore Batik Collection",
    btnLink: "/search?category=batik",
    order: 1,
    isActive: true,
  },
  {
    tagId: "Ukiran Kayu Jati",
    tagEn: "Teak Wood Crafts",
    titleId: "Sentuhan Seni Kayu Alami & Abadi",
    titleEn: "Natural & Timeless Teak Wood Artistry",
    subtitleId: "Ubah sudut ruangan Anda dengan ukiran jati solid, nampan estetik, dan dekorasi kayu ramah lingkungan.",
    subtitleEn: "Transform your spaces with solid teak carvings, aesthetic trays, and eco-friendly wooden decor.",
    imageUrl: "/hero_banner_woodcraft.png",
    btnTextId: "Lihat Kerajinan Kayu",
    btnTextEn: "View Woodcrafts",
    btnLink: "/search?category=wood-craft",
    order: 2,
    isActive: true,
  },
  {
    tagId: "Keramik Kasongan",
    tagEn: "Kasongan Pottery",
    titleId: "Sentuhan Kehangatan Gerabah Kasongan",
    titleEn: "Warm Touch of Kasongan Clay Pottery",
    subtitleId: "Miliki cangkir, vas, dan kendi keramik buatan tangan dengan tekstur tanah liat alami yang menenangkan.",
    subtitleEn: "Own handmade ceramic mugs, vases, and pottery with calming natural clay textures.",
    imageUrl: "/hero_banner_pottery.png",
    btnTextId: "Lihat Koleksi Keramik",
    btnTextEn: "View Pottery Collection",
    btnLink: "/search?category=pottery",
    order: 3,
    isActive: true,
  },
];

const configData = [
  { key: "site_name", value: "ArtAndCraft.id" },
  { key: "primary_color", value: "#0DA9BA" },
  { key: "announcement_enabled", value: "true" },
  { key: "announcement_text_id", value: "Dapatkan promo gratis ongkir ke seluruh Indonesia hingga akhir bulan!" },
  { key: "announcement_text_en", value: "Get free shipping promotion across Indonesia until the end of the month!" },
];

async function main() {
  console.log("Seeding HeroSlides...");
  
  // Clear old slides first
  await prisma.heroSlide.deleteMany();
  
  for (const slide of slidesData) {
    await prisma.heroSlide.create({
      data: slide
    });
  }
  
  console.log("Seeding PlatformConfigs...");
  for (const config of configData) {
    await prisma.platformConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  
  console.log("Settings seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
