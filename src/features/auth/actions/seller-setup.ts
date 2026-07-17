"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sellerSetupSchema, SellerSetupInput } from "../schemas";

export async function sellerSetup(data: SellerSetupInput) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { error: "Anda harus masuk terlebih dahulu" };
  }

  const parsed = sellerSetupSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data pendaftaran toko tidak valid" };
  }

  const { storeName, storeSlug, storeDescription, storeLogo, storeBanner } = parsed.data;

  try {
    // 1. Verify slug uniqueness
    const existingSlug = await prisma.sellerProfile.findUnique({
      where: { storeSlug: storeSlug.toLowerCase() },
    });

    if (existingSlug) {
      return { error: "Slug toko sudah digunakan oleh pengrajin lain" };
    }

    // 2. Check if user already has a seller profile
    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return { error: "Anda sudah mendaftarkan toko sebelumnya" };
    }

    // 3. Create profile and upgrade user's role to SELLER in a transaction
    await prisma.$transaction([
      prisma.sellerProfile.create({
        data: {
          userId: session.user.id,
          storeName,
          storeSlug: storeSlug.toLowerCase(),
          storeDescription,
          storeLogo: storeLogo || null,
          storeBanner: storeBanner || null,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "SELLER" },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Seller onboarding transaction failure:", error);
    return { error: "Gagal memproses pendaftaran toko. Silakan coba beberapa saat lagi." };
  }
}
