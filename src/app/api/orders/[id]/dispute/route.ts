import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const DisputeSchema = z.object({
  disputeReason: z.string().min(10, "Alasan komplain minimal 10 karakter"),
  disputeProof: z.array(z.string().url()).optional(),
});

/**
 * POST /api/orders/[id]/dispute
 * Pembeli mengajukan komplain / retur pesanan
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = DisputeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { disputeReason, disputeProof } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { sellerId: true, title: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!["SHIPPED", "DELIVERED"].includes(order.status)) {
      return NextResponse.json(
        { error: "Komplain hanya bisa diajukan untuk pesanan berstatus Dikirim atau Diterima." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Order status to DISPUTED
      await tx.order.update({
        where: { id },
        data: {
          status: "DISPUTED",
          disputeReason,
          disputeProof: disputeProof || [],
        },
      });

      // 2. Order Tracking log
      await tx.orderTracking.create({
        data: {
          orderId: id,
          status: "DISPUTED",
          description: `Pembeli mengajukan komplain: "${disputeReason.slice(0, 100)}"`,
        },
      });

      // 3. Buyer Notification
      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Komplain Berhasil Diajukan ⚠️",
          message: `Komplain untuk pesanan #${id.slice(-8).toUpperCase()} telah diterima dan sedang ditinjau oleh Admin & Penjual.`,
          link: `/dashboard/orders/${id}`,
        },
      });

      // 4. Notify Sellers
      const sellerIds = Array.from(new Set(order.items.map((i) => i.product.sellerId)));
      for (const sellerId of sellerIds) {
        const seller = await tx.sellerProfile.findUnique({
          where: { id: sellerId },
          select: { userId: true, storeName: true },
        });

        if (seller) {
          await tx.notification.create({
            data: {
              userId: seller.userId,
              title: "Komplain Pesanan Masuk! ⚠️",
              message: `Pembeli mengajukan komplain pada pesanan #${id.slice(-8).toUpperCase()}. Dana sementara ditahan platform.`,
              link: `/seller/orders`,
            },
          });
        }
      }

      // 5. Notify Admin
      const admins = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: "Sengketa Pesanan Baru (Dispute) ⚖️",
            message: `Pesanan #${id.slice(-8).toUpperCase()} memerlukan mediasi sengketa komplain pembeli.`,
            link: `/admin/transactions`,
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Komplain berhasil diajukan" }, { status: 200 });
  } catch (error: any) {
    console.error("Dispute Order Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
