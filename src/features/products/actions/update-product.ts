"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, ProductInput } from "../schemas";

export async function updateProduct(productId: string, data: ProductInput) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "Anda harus masuk terlebih dahulu" };
  }

  // 1. Verify user's seller profile
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    return { error: "Anda tidak memiliki profil toko penjual aktif" };
  }

  // 2. Verify product existence and ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!existingProduct) {
    return { error: "Produk tidak ditemukan" };
  }

  if (existingProduct.sellerId !== sellerProfile.id) {
    return { error: "Anda tidak memiliki izin untuk mengedit produk ini" };
  }

  // 3. Validate product input
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data produk tidak valid" };
  }

  const {
    title,
    description,
    price,
    discount,
    stock,
    weight,
    dimensions,
    sku,
    categoryId,
    subcategoryId,
    photos,
    status,
  } = parsed.data;

  try {
    // Verify SKU uniqueness if changed
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        return { error: "Kode SKU sudah digunakan pada produk lain" };
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        categoryId,
        subcategoryId: subcategoryId || null,
        title,
        description,
        price,
        discount,
        stock,
        weight,
        dimensions: dimensions || null,
        sku: sku || null,
        photos,
        status,
      },
    });

    return { success: true, product: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { error: "Gagal memperbarui data produk. Terjadi kesalahan server." };
  }
}
