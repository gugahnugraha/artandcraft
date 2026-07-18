import { prisma } from "./src/lib/prisma";
import dotenv from "dotenv";

dotenv.config();

const OLD_DOMAIN = "https://pub-9a3b44b9b5694e06bd5eed8886ba6a3e.r2.dev";
const NEW_DOMAIN = process.env.R2_PUBLIC_URL || "https://cdn.artandcraft.id";

async function main() {
  console.log(`Mengganti domain foto produk dari:`);
  console.log(`OLD: ${OLD_DOMAIN}`);
  console.log(`NEW: ${NEW_DOMAIN}\n`);

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    if (product.photos && product.photos.length > 0) {
      const newPhotos = product.photos.map((photo) =>
        photo.replace(OLD_DOMAIN, NEW_DOMAIN)
      );

      if (JSON.stringify(newPhotos) !== JSON.stringify(product.photos)) {
        await prisma.product.update({
          where: { id: product.id },
          data: { photos: newPhotos },
        });
        console.log(`✅ Updated: ${product.title}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n🎉 Selesai! Berhasil memperbarui ${updatedCount} produk ke Custom Domain R2!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
