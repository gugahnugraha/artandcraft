import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/products/[id]/status
 * Admin moderates product status (ACTIVE, ARCHIVED, DRAFT, OUT_OF_STOCK)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, reason } = body;

    if (!["ACTIVE", "ARCHIVED", "DRAFT", "OUT_OF_STOCK"].includes(status)) {
      return NextResponse.json({ error: "Status produk tidak valid" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: { select: { userId: true, storeName: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { status },
    });

    // Notify seller if product was archived/takedown by admin
    if (status === "ARCHIVED") {
      await prisma.notification.create({
        data: {
          userId: product.seller.userId,
          title: "Produk Diarsipkan oleh Admin ⚠️",
          message: `Produk "${product.title}" telah diarsipkan oleh Admin. Catatan: ${reason || "Tidak memenuhi standar produk platform."}`,
          link: "/seller/products",
        },
      });
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error("Admin Product Moderation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
