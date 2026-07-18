import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ─── PATCH /api/seller/coupons/[id] — toggle active or update coupon ─────────
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const coupon = await prisma.coupon.findFirst({
    where: { id, sellerProfileId: sellerProfile.id },
  });
  if (!coupon) return NextResponse.json({ error: "Kupon tidak ditemukan." }, { status: 404 });

  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      active: body.active !== undefined ? Boolean(body.active) : coupon.active,
    },
  });

  return NextResponse.json({ coupon: updated });
}

// ─── DELETE /api/seller/coupons/[id] — delete a coupon ───────────────────────
export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const coupon = await prisma.coupon.findFirst({
    where: { id, sellerProfileId: sellerProfile.id },
  });
  if (!coupon) return NextResponse.json({ error: "Kupon tidak ditemukan." }, { status: 404 });

  await prisma.coupon.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
