import { prisma } from "./src/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME || "artandcraft";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";

// Seed Data
const sellers = [
  {
    name: "Batik Nusantara",
    slug: "batik-nusantara",
    email: "seller1@artcraft.com",
    category: "Tekstil & Batik",
    catSlug: "tekstil-batik",
    description: "Pengrajin batik tulis asli dari Yogyakarta.",
    products: [
      { title: "Batik Tulis Motif Parang", price: 750000, seed: "batik1" },
      { title: "Kain Tenun Ikat Sumba", price: 1250000, seed: "batik2" },
      { title: "Kemeja Batik Pria Premium", price: 450000, seed: "batik3" },
      { title: "Selendang Sutra Batik", price: 300000, seed: "batik4" },
    ],
  },
  {
    name: "Java Woodcraft",
    slug: "java-woodcraft",
    email: "seller2@artcraft.com",
    category: "Kerajinan Kayu",
    catSlug: "kerajinan-kayu",
    description: "Spesialis ukiran kayu jati Jepara berkualitas tinggi.",
    products: [
      { title: "Patung Kayu Abstrak", price: 850000, seed: "wood1" },
      { title: "Lampu Hias Kayu Jati", price: 550000, seed: "wood2" },
      { title: "Nampan Kayu Estetik", price: 150000, seed: "wood3" },
      { title: "Jam Dinding Kayu Unik", price: 250000, seed: "wood4" },
    ],
  },
  {
    name: "Bali Pottery Studio",
    slug: "bali-pottery",
    email: "seller3@artcraft.com",
    category: "Keramik & Gerabah",
    catSlug: "keramik-gerabah",
    description: "Keramik buatan tangan dengan sentuhan seni Bali.",
    products: [
      { title: "Vas Bunga Keramik", price: 200000, seed: "pot1" },
      { title: "Piring Hias Dinding", price: 175000, seed: "pot2" },
      { title: "Cangkir Kopi Tanah Liat", price: 85000, seed: "pot3" },
      { title: "Set Teko Teh Klasik", price: 450000, seed: "pot4" },
    ],
  },
];

async function fetchImageBuffer(seed: string): Promise<Buffer> {
  const url = `https://picsum.photos/seed/${seed}/800/800`;
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToR2(key: string, buffer: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3.send(command);
  return `${R2_PUBLIC_URL}/${key}`;
}

async function main() {
  console.log("Menghapus mockup lama...");
  // Hapus semua data kecuali admin/buyer murni jika mau, tapi ini kita hapus yg berhubungan dgn seller
  await prisma.product.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.category.deleteMany();
  
  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const [index, sData] of sellers.entries()) {
    console.log(`\n=== Memproses Seller: ${sData.name} ===`);
    
    // 1. Buat User & Seller Profile
    let user = await prisma.user.findUnique({ where: { email: sData.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: sData.name,
          email: sData.email,
          password: hashedPassword,
          role: "SELLER",
        }
      });
    } else {
      await prisma.user.update({
        where: { email: sData.email },
        data: { role: "SELLER" }
      });
    }

    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        storeName: sData.name,
        storeSlug: sData.slug,
        storeDescription: sData.description,
      }
    });

    // 2. Kategori
    let category = await prisma.category.findUnique({ where: { slug: sData.catSlug } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: sData.category,
          slug: sData.catSlug,
        }
      });
    }

    // 3. Produk
    for (const p of sData.products) {
      const productSlug = p.title.toLowerCase().replace(/ /g, "-") + "-" + Math.floor(Math.random() * 1000);
      const r2Key = `products/${sellerProfile.id}/${productSlug}.jpg`;
      
      console.log(`Mengunduh gambar untuk: ${p.title}...`);
      const buffer = await fetchImageBuffer(p.seed);
      
      console.log(`Mengunggah ke R2 Bucket (${r2Key})...`);
      const imageUrl = await uploadToR2(r2Key, buffer, "image/jpeg");

      console.log(`Menyimpan ${p.title} ke database...`);
      await prisma.product.create({
        data: {
          sellerId: sellerProfile.id,
          categoryId: category.id,
          title: p.title,
          slug: productSlug,
          description: `Ini adalah ${p.title} berkualitas tinggi yang dibuat secara manual dengan penuh dedikasi. Cocok untuk mempercantik ruangan atau sebagai koleksi pribadi Anda.`,
          price: p.price,
          stock: Math.floor(Math.random() * 20) + 5,
          weight: 500,
          status: "ACTIVE",
          photos: [imageUrl],
        }
      });
    }
    
    console.log(`Berhasil membuat 4 produk untuk toko ${sData.name}`);
  }

  console.log("\n✅ Semua data dummy telah dibersihkan dan 3 Seller beserta masing-masing 4 produk berhasil di-*seed* ke Database dan R2 Bucket!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
