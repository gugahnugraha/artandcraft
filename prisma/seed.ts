import { PrismaClient, Role, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Etsy-Inspired Rich Artisan Category & Subcategory Taxonomy
const categoriesData = [
  {
    name: "Batik & Wastra",
    slug: "batik-wastra",
    description: "Kain batik tulis, cap, tenun ikat NTT, songket, dan kain tradisional nusantara",
    icon: "Sparkles",
    subcategories: [
      { name: "Batik Tulis Solo & Jogja", slug: "batik-tulis" },
      { name: "Batik Cap & Pekalongan", slug: "batik-cap" },
      { name: "Tenun Ikat NTT & Toraja", slug: "tenun-ikat" },
      { name: "Kain Ulos & Songket", slug: "ulos-songket" },
      { name: "Selendang & Syal Etnik", slug: "selendang-etnik" },
    ],
  },
  {
    name: "Keramik & Gerabah",
    slug: "keramik-gerabah",
    description: "Tembikar tanah liat, gerabah Kasongan, vas bunga, dan peralatan saji keramik",
    icon: "Utensils",
    subcategories: [
      { name: "Gerabah Kasongan & Lombok", slug: "gerabah-kasongan" },
      { name: "Vas Bunga & Guci Keramik", slug: "vas-guci-keramik" },
      { name: "Mangkuk & Piring Lukis", slug: "mangkuk-piring-keramik" },
      { name: "Cangkir & Teaset Tanah Liat", slug: "cangkir-teaset-tanah-liat" },
      { name: "Patung & Pajangan Keramik", slug: "patung-keramik" },
    ],
  },
  {
    name: "Kerajinan Kayu & Ukiran",
    slug: "kerajinan-kayu",
    description: "Ukiran Jepara, mangkuk kayu jati solid, kotak perhiasan, dan hiasan kayu",
    icon: "Trees",
    subcategories: [
      { name: "Ukiran Jepara & Bali", slug: "ukiran-jepara-bali" },
      { name: "Peralatan Makan & Saji Jati", slug: "peralatan-makan-jati" },
      { name: "Kotak Perhiasan & Storage Kayu", slug: "kotak-perhiasan-kayu" },
      { name: "Hiasan Dinding & Frame Kayu", slug: "hiasan-dinding-kayu" },
      { name: "Jam & Miniatur Kayu", slug: "miniatur-kayu" },
    ],
  },
  {
    name: "Perhiasan & Aksesori",
    slug: "perhiasan-aksesori",
    description: "Cincin perak bakar Bali, kalung manik etnik, anting handmade, dan bros kuningan",
    icon: "Gem",
    subcategories: [
      { name: "Cincin Perak Ukir Bali", slug: "cincin-perak-bali" },
      { name: "Kalung & Liontin Etnik", slug: "kalung-etnik" },
      { name: "Anting & Gelang Handmade", slug: "anting-gelang-handmade" },
      { name: "Bros & Pin Etnik", slug: "bros-pin-etnik" },
      { name: "Aksesori Manik & Batu Alam", slug: "manik-manik-batu-alam" },
    ],
  },
  {
    name: "Kerajinan Kulit",
    slug: "kerajinan-kulit",
    description: "Dompet kulit full-grain, tas handcrafted, sabuk, dan tempat kunci kulit asli",
    icon: "Briefcase",
    subcategories: [
      { name: "Dompet Kulit Full-Grain", slug: "dompet-kulit" },
      { name: "Tas Kulit Handcrafted", slug: "tas-kulit" },
      { name: "Sabuk & Ikat Pinggang Kulit", slug: "sabuk-kulit" },
      { name: "Case & Sleeve Kulit", slug: "case-sleeve-kulit" },
      { name: "Gantungan Kunci Kulit", slug: "gantungan-kunci-kulit" },
    ],
  },
  {
    name: "Dekorasi Rumah & Living",
    slug: "dekorasi-rumah",
    description: "Hiasan macrame, cermin anyaman, sarung bantal etnik, dan lilin aromaterapi",
    icon: "Home",
    subcategories: [
      { name: "Hiasan Dinding Macrame", slug: "macrame-wall-decor" },
      { name: "Cermin Ukir & Anyaman", slug: "cermin-ukir-anyaman" },
      { name: "Sarung Bantal Sofa Etnik", slug: "bantal-sofa-etnik" },
      { name: "Lilin Aromaterapi & Diffuser", slug: "lilin-aromaterapi" },
      { name: "Lampu Hias Etnik & Bambu", slug: "lampu-hias-etnik" },
    ],
  },
  {
    name: "Anyaman & Rotan",
    slug: "anyaman-rotan",
    description: "Tas rotan Bali, keranjang enceng gondok, placemat bambu, dan tikar pandan",
    icon: "ShoppingBag",
    subcategories: [
      { name: "Tas Rotan Anyaman Bali", slug: "tas-rotan-bali" },
      { name: "Keranjang Enceng Gondok & Bambu", slug: "keranjang-anyaman" },
      { name: "Placemat & Coaster Anyaman", slug: "placemat-coaster-anyaman" },
      { name: "Tikar & Karpet Pandan", slug: "tikar-karpet-pandan" },
      { name: "Topi & Aksesori Anyaman", slug: "topi-aksesori-anyaman" },
    ],
  },
  {
    name: "Sulam, Renda & Rajut",
    slug: "sulam-rajut",
    description: "Sulam tangan hoop art, tas rajut wol, taplak meja linen, dan boneka amigurumi",
    icon: "Scissors",
    subcategories: [
      { name: "Sulam Tangan Hoop Art", slug: "sulam-hoop-art" },
      { name: "Tas & Dompet Rajut", slug: "tas-dompet-rajut" },
      { name: "Taplak Meja Sulam", slug: "taplak-meja-sulam" },
      { name: "Pakaian & Cardigan Rajut", slug: "pakaian-rajut" },
      { name: "Boneka Amigurumi", slug: "boneka-amigurumi" },
    ],
  },
  {
    name: "Seni Rupa & Lukisan",
    slug: "seni-rupa-lukisan",
    description: "Lukisan cat minyak kanvas, seni resin art, kaligrafi kayu, dan patung seni",
    icon: "Palette",
    subcategories: [
      { name: "Lukisan Minyak & Akrilik Kanvas", slug: "lukisan-kanvas" },
      { name: "Seni Resin Art & Flower", slug: "resin-art" },
      { name: "Kaligrafi Etnik & Aksara Jawa", slug: "kaligrafi-etnik" },
      { name: "Sketsa Wajah & Ilustrasi", slug: "sketsa-ilustrasi" },
      { name: "Patung Seni & Sculptures", slug: "patung-seni" },
    ],
  },
  {
    name: "Kado Kustom & Souvenir",
    slug: "kado-kustom",
    description: "Hantaran nikah kustom, souvenir kayu ukir nama, kado wisuda, dan miniatur",
    icon: "Gift",
    subcategories: [
      { name: "Hantaran & Mahar Pernikahan", slug: "hantaran-mahar" },
      { name: "Kado Wisuda Personalisasi", slug: "kado-wisuda" },
      { name: "Souvenir Kayu Ukir Nama", slug: "souvenir-kayu-nama" },
      { name: "Gift Box Etnik Kustom", slug: "gift-box-etnik" },
      { name: "Diorama & Miniatur Custom", slug: "diorama-miniatur" },
    ],
  },
];

async function main() {
  console.log("Start seeding ETSY-style category taxonomy database...");

  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    console.warn("\n⚠️ Koneksi database gagal. Melewati proses seeding.\n");
    await pool.end();
    return;
  }

  // 1. Clear existing database entries
  console.log("Cleaning database...");
  await prisma.notification.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.shippingAddress.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.subcategory.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.sellerProfile.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Categories & Subcategories
  console.log("Seeding Etsy-inspired categories & subcategories...");
  const categoriesMap: Record<string, string> = {};
  const subcategoriesMap: Record<string, string> = {};

  let sortOrderIndex = 1;
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        sortOrder: sortOrderIndex++,
      },
    });
    categoriesMap[cat.slug] = createdCat.id;

    let subSortOrderIndex = 1;
    for (const sub of cat.subcategories) {
      const createdSub = await prisma.subcategory.create({
        data: {
          categoryId: createdCat.id,
          name: sub.name,
          slug: sub.slug,
          sortOrder: subSortOrderIndex++,
        },
      });
      subcategoriesMap[sub.slug] = createdSub.id;
    }
  }

  // 3. Create Super Admin User
  console.log("Seeding Super Admin user...");
  const adminPassword = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD || "Admin@123", 10);
  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: process.env.ADMIN_INITIAL_EMAIL || "admin@artandcraft.id",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Production seeding completed successfully (Taxonomy & Admin created, no dummy listings)!");
  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
