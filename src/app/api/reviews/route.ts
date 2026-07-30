import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const ReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  orderId: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Data tidak valid", errors: parsed.error.issues },
        { status: 400 }
      );
    }

    const { productId, rating, comment, orderId } = parsed.data;

    // ─── SECURITY: Verified Purchase Check ───────────────────────────────────
    // Pembeli hanya dapat mengulas produk yang sudah mereka beli DAN sudah
    // berstatus DELIVERED (pesanan dikonfirmasi diterima).
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: session.user.id,
          status: "DELIVERED",
        },
      },
      select: { id: true },
    });

    if (!verifiedPurchase) {
      return NextResponse.json(
        {
          message:
            "Anda hanya dapat mengulas produk yang sudah Anda beli dan terima. Pastikan pesanan sudah berstatus Diterima.",
        },
        { status: 403 }
      );
    }

    // ─── Upsert Review (1 ulasan per produk per user) ─────────────────────────
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      create: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment?.trim() || null,
        orderId: orderId || null,
      },
      update: {
        rating,
        comment: comment?.trim() || null,
        orderId: orderId || null,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("Review API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    return NextResponse.json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error: any) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
