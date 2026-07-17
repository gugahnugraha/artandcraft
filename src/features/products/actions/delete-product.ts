"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "Anda harus masuk terlebih dahulu" };
  }

  // 1. Verify seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    return { error: "Anda tidak memiliki profil toko penjual aktif" };
  }

  // 2. Verify product ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    return { error: "Produk tidak ditemukan" };
  }

  if (existingProduct.sellerId !== sellerProfile.id) {
    return { error: "Anda tidak memiliki izin untuk menghapus produk ini" };
  }

  try {
    // 3. Remove product from database
    await prisma.product.delete({
      where: { id: productId },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { error: "Gagal menghapus produk. Terjadi kesalahan server." };
  }
}
