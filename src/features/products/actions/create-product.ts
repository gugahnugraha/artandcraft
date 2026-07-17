"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { productSchema, ProductInput } from "../schemas";

function generateUniqueSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Append a short timestamp token to ensure slug is globally unique
  return `${baseSlug}-${Date.now().toString(36)}`;
}

export async function createProduct(data: ProductInput) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "Anda harus masuk terlebih dahulu" };
  }

  // 1. Verify user is indeed a SELLER
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!sellerProfile) {
    return { error: "Anda tidak memiliki profil toko penjual aktif" };
  }

  // 2. Validate product input
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
    const slug = generateUniqueSlug(title);

    // Verify SKU is unique if provided
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        return { error: "Kode SKU sudah digunakan pada produk lain" };
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        sellerId: sellerProfile.id,
        categoryId,
        subcategoryId: subcategoryId || null,
        title,
        slug,
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

    return { success: true, product: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { error: "Gagal menyimpan produk. Terjadi kesalahan server." };
  }
}
