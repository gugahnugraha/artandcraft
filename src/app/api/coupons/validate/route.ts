import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/coupons/validate
 * Body: { code: string, subtotal: number }
 * Returns discount amount if coupon is valid.
 */
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "Kode kupon tidak boleh kosong." }, { status: 400 });
    }

    if (typeof subtotal !== "number" || subtotal <= 0) {
      return NextResponse.json({ error: "Subtotal tidak valid." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    // ── Existence check ──────────────────────────────────────────────────────
    if (!coupon) {
      return NextResponse.json({ error: "Kode kupon tidak ditemukan." }, { status: 404 });
    }

    // ── Active check ─────────────────────────────────────────────────────────
    if (!coupon.active) {
      return NextResponse.json({ error: "Kode kupon sudah tidak aktif." }, { status: 400 });
    }

    // ── Expiry check ─────────────────────────────────────────────────────────
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Kode kupon sudah kedaluwarsa." }, { status: 400 });
    }

    // ── Usage limit check ─────────────────────────────────────────────────────
    if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) {
      return NextResponse.json({ error: "Kupon sudah mencapai batas penggunaan." }, { status: 400 });
    }

    // ── Min spend check ───────────────────────────────────────────────────────
    const minSpend = Number(coupon.minSpend);
    if (subtotal < minSpend) {
      return NextResponse.json(
        {
          error: `Minimum pembelian untuk kupon ini adalah Rp ${minSpend.toLocaleString("id-ID")}.`,
        },
        { status: 400 }
      );
    }

    // ── Calculate discount ────────────────────────────────────────────────────
    let discountAmount = 0;

    if (coupon.discountPercent !== null) {
      discountAmount = Math.floor((subtotal * Number(coupon.discountPercent)) / 100);
    } else if (coupon.discountValue !== null) {
      discountAmount = Number(coupon.discountValue);
    }

    // Cap discount to not exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountAmount,
      discountPercent: coupon.discountPercent ? Number(coupon.discountPercent) : null,
      discountValue: coupon.discountValue ? Number(coupon.discountValue) : null,
      message: `Kupon berhasil diterapkan! Hemat Rp ${discountAmount.toLocaleString("id-ID")}.`,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
