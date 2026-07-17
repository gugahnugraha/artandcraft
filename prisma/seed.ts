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

const categoriesData = [
  {
    name: "Painting",
    slug: "painting",
    description: "Lukisan tangan otentik bergaya klasik hingga modern",
    subcategories: ["Lukisan Cat Minyak", "Lukisan Akrilik", "Sketsa Wajah", "Lukisan Kanvas"],
  },
  {
    name: "Crochet",
    slug: "crochet",
    description: "Seni rajutan benang wol premium buatan tangan",
    subcategories: ["Tas Rajut", "Boneka Amigurumi", "Pakaian Rajut", "Aksesoris Rajut"],
  },
  {
    name: "Macrame",
    slug: "macrame",
    description: "Seni anyaman simpul tali untuk dekorasi estetik",
    subcategories: ["Hiasan Dinding", "Gantungan Pot", "Tas Macrame", "Dreamcatcher"],
  },
  {
    name: "Resin Art",
    slug: "resin-art",
    description: "Karya seni resin bening dengan ornamen bunga dan kayu",
    subcategories: ["Tatakan Gelas (Coaster)", "Nampan Hias", "Perhiasan Resin", "Pajangan Meja"],
  },
  {
    name: "Wood Craft",
    slug: "wood-craft",
    description: "Kerajinan ukiran jepara dan perabot kayu jati pilihan",
    subcategories: ["Ukiran Jepara", "Patung Kayu", "Wadah Saji Jati", "Peralatan Makan Kayu"],
  },
  {
    name: "Leather Craft",
    slug: "leather-craft",
    description: "Produk kulit asli buatan tangan dengan jahitan presisi",
    subcategories: ["Dompet Kulit", "Tas Kulit", "Gantungan Kunci", "Sabuk Kulit"],
  },
  {
    name: "Jewelry",
    slug: "jewelry",
    description: "Perhiasan perak bakar bali dan kuningan etnik nusantara",
    subcategories: ["Cincin Perak Bali", "Kalung Etnik", "Anting Handmade", "Gelang Manik-manik"],
  },
  {
    name: "Home Decor",
    slug: "home-decor",
    description: "Hiasan dan dekorasi interior rumah bernuansa hangat",
    subcategories: ["Cermin Anyaman", "Bantal Sofa Etnik", "Keranjang Enceng Gondok", "Lilin Aromaterapi"],
  },
  {
    name: "Pottery",
    slug: "pottery",
    description: "Tembikar tanah liat tradisional dari Kasongan dan Lombok",
    subcategories: ["Keramik Kasongan", "Vas Gerabah", "Cangkir Tanah Liat", "Piring Keramik Lukis"],
  },
  {
    name: "Textile",
    slug: "textile",
    description: "Tenun ikat NTT, kain ulos, dan tenun lurik jawa",
    subcategories: ["Tenun Ikat NTT", "Ulos Batak", "Lurik Yogyakarta", "Syal Etnik"],
  },
  {
    name: "Batik",
    slug: "batik",
    description: "Batik tulis sutera asli dan batik cap premium nusantara",
    subcategories: ["Batik Tulis Solo", "Batik Cap Cirebon", "Batik Lukis Modern", "Kain Jarik Klasik"],
  },
  {
    name: "Custom Gift",
    slug: "custom-gift",
    description: "Hadiah unik yang dipersonalisasi khusus untuk momen spesial",
    subcategories: ["Kado Wisuda", "Hantaran Pernikahan", "Sketsa Kustom", "Hiasan Kayu Nama"],
  },
  {
    name: "Miniature",
    slug: "miniature",
    description: "Replika detail dalam ukuran mini yang berseni tinggi",
    subcategories: ["Miniatur Rumah Adat", "Miniatur Kapal Pinisi", "Diorama Jalanan", "Replika Kendaraan"],
  },
  {
    name: "Embroidery",
    slug: "embroidery",
    description: "Sulam tangan detail pada kain linen dan pakaian",
    subcategories: ["Sulam Hoop Art", "Pakaian Sulam", "Tas Sulam", "Taplak Meja Sulam"],
  },
  {
    name: "Calligraphy",
    slug: "calligraphy",
    description: "Seni menulis indah huruf arab dan aksara jawa klasik",
    subcategories: ["Kaligrafi Arab Kuningan", "Kaligrafi Kayu", "Aksesar Jawa Tradisional"],
  },
];

async function main() {
  console.log("Start seeding database...");

  // Test pool connection first to fail gracefully if DB is offline
  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    console.warn("\n⚠️  Koneksi database gagal (ECONNREFUSED). Melewati proses seeding.");
    console.warn("Pastikan Anda sudah mengonfigurasi DATABASE_URL yang aktif di file .env Anda.\n");
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
  console.log("Seeding categories and subcategories...");
  const categoriesMap: Record<string, string> = {};
  const subcategoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      },
    });
    categoriesMap[cat.slug] = createdCat.id;

    for (const sub of cat.subcategories) {
      const subSlug = sub
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const createdSub = await prisma.subcategory.create({
        data: {
          categoryId: createdCat.id,
          name: sub,
          slug: `${cat.slug}-${subSlug}`,
        },
      });
      subcategoriesMap[`${cat.slug}-${subSlug}`] = createdSub.id;
    }
  }

  // 3. Create Users (Seller, Admin, Buyer)
  console.log("Seeding users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const sellerUser = await prisma.user.create({
    data: {
      name: "Budi Kusuma",
      email: "seller@artandcraft.id",
      password: hashedPassword,
      role: Role.SELLER,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin ArtAndCraft",
      email: "admin@artandcraft.id",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const buyerUser = await prisma.user.create({
    data: {
      name: "Siti Rahma",
      email: "buyer@artandcraft.id",
      password: hashedPassword,
      role: Role.BUYER,
    },
  });

  // 4. Create Seller Profile
  console.log("Seeding seller profile...");
  const sellerProfile = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      storeName: "JavArtisan Studio",
      storeSlug: "javartisan",
      storeDescription:
        "JavArtisan Studio menghadirkan peralatan makan kayu jati solid dan gerabah tradisional berkualitas tinggi langsung dari pengrajin lokal Jepara dan Kasongan.",
      storeLogo: "",
      storeBanner: "",
      storeRating: 4.9,
      followersCount: 142,
    },
  });

  // 5. Create Mock Products
  console.log("Seeding products...");
  await prisma.product.create({
    data: {
      sellerId: sellerProfile.id,
      categoryId: categoriesMap["pottery"],
      subcategoryId: subcategoriesMap["pottery-keramik-kasongan"],
      title: "Kendi Keramik Kasongan Klasik",
      slug: "kendi-keramik-kasongan-klasik",
      description:
        "Kendi tanah liat tradisional yang dibuat dengan teknik putar manual oleh pengrajin Kasongan Bantul. Sangat indah digunakan sebagai dekorasi ruang tamu bergaya etnik maupun tempat penyimpanan air alami.",
      price: 185000.0,
      discount: 10.0, // 10% discount
      stock: 15,
      weight: 1200.0, // 1.2 kg
      dimensions: "W:18cm H:28cm L:18cm",
      sku: "KAS-KND-001",
      photos: [],
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.product.create({
    data: {
      sellerId: sellerProfile.id,
      categoryId: categoriesMap["wood-craft"],
      subcategoryId: subcategoriesMap["wood-craft-wadah-saji-jati"],
      title: "Mangkuk Kayu Jati Solid 20cm",
      slug: "mangkuk-kayu-jati-solid-20cm",
      description:
        "Mangkuk saji premium yang dipahat utuh dari balok kayu jati tua pilihan asal Jepara. Dilapisi dengan finishing food-grade beewax alami, menjadikannya sangat aman untuk menyajikan makanan hangat maupun dingin.",
      price: 95000.0,
      discount: 0.0,
      stock: 45,
      weight: 450.0,
      dimensions: "W:20cm H:8cm L:20cm",
      sku: "JEP-MNG-JTI",
      photos: [],
      status: ProductStatus.ACTIVE,
    },
  });

  await prisma.product.create({
    data: {
      sellerId: sellerProfile.id,
      categoryId: categoriesMap["batik"],
      subcategoryId: subcategoriesMap["batik-batik-tulis-solo"],
      title: "Selendang Sutera Batik Tulis Solo",
      slug: "selendang-sutera-batik-tulis-solo",
      description:
        "Kain selendang sutera mewah bermotif parang rusak klasik, dibatik manual menggunakan canting tulis dan lilin malam tradisional. Memerlukan waktu pengerjaan hingga 3 bulan untuk menjamin kesempurnaan motif bolak-balik.",
      price: 1250000.0,
      discount: 5.0,
      stock: 3,
      weight: 200.0,
      dimensions: "W:50cm H:1cm L:200cm",
      sku: "SOL-SLD-SUT",
      photos: [],
      status: ProductStatus.ACTIVE,
    },
  });

  console.log("Seeding completed successfully!");
  await pool.end();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // End is handled
  });
