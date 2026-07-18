import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ─── GET /api/seller/coupons — list all coupons for this seller ───────────────
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile) return NextResponse.json({ coupons: [] });

  const coupons = await prisma.coupon.findMany({
    where: { sellerProfileId: sellerProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ coupons });
}

// ─── POST /api/seller/coupons — create a new coupon ──────────────────────────
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile) return NextResponse.json({ error: "Profil toko tidak ditemukan." }, { status: 404 });

  const body = await req.json();
  const { code, discountPercent, discountValue, minSpend, maxUsage, expiresAt } = body;

  if (!code || typeof code !== "string" || code.trim().length < 3) {
    return NextResponse.json({ error: "Kode kupon minimal 3 karakter." }, { status: 400 });
  }

  if (!discountPercent && !discountValue) {
    return NextResponse.json({ error: "Masukkan nilai diskon (persen atau nominal)." }, { status: 400 });
  }

  if (discountPercent && discountValue) {
    return NextResponse.json({ error: "Pilih salah satu: diskon persen ATAU diskon nominal." }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        sellerProfileId: sellerProfile.id,
        code: code.trim().toUpperCase(),
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountValue: discountValue ? Number(discountValue) : null,
        minSpend: minSpend ? Number(minSpend) : 0,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true,
      },
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Kode kupon sudah digunakan." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal membuat kupon." }, { status: 500 });
  }
}
