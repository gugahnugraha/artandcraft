import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/confirm
 * Buyer confirms they received the order — moves SHIPPED → DELIVERED and credits seller balance
 */
export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { sellerId: true, title: true } }
        }
      }
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "SHIPPED") {
    return NextResponse.json(
      { error: "Pesanan harus berstatus SHIPPED untuk dikonfirmasi penerimaan" },
      { status: 400 }
    );
  }

  // Calculate earnings per seller
  const sellerEarnings = new Map<string, number>();

  order.items.forEach(item => {
    const sellerId = item.product.sellerId;
    const itemTotal = Number(item.price) * item.quantity;
    sellerEarnings.set(sellerId, (sellerEarnings.get(sellerId) || 0) + itemTotal);
  });

  await prisma.$transaction(async (tx) => {
    // 1. Update Order Status
    await tx.order.update({
      where: { id },
      data: { status: "DELIVERED" },
    });

    // 2. Order Tracking
    await tx.orderTracking.create({
      data: {
        orderId: id,
        status: "Pesanan Diterima",
        description: "Pembeli mengonfirmasi pesanan telah diterima.",
      },
    });

    // 3. Buyer Notification
    await tx.notification.create({
      data: {
        userId: order.userId,
        title: "Pesanan Selesai! ✅",
        message: `Pesanan #${id.slice(-8).toUpperCase()} telah selesai. Terima kasih telah berbelanja di ArtAndCraft.id!`,
        link: `/dashboard/orders/${id}`,
      },
    });

    // 4. Credit Seller Balances
    for (const [sellerId, amount] of sellerEarnings.entries()) {
      await tx.sellerProfile.update({
        where: { id: sellerId },
        data: {
          balance: { increment: amount }
        }
      });

      await tx.walletTransaction.create({
        data: {
          sellerProfileId: sellerId,
          type: "CREDIT",
          amount,
          description: `Hasil penjualan pesanan #${id.slice(-8).toUpperCase()}`,
          referenceId: id,
        }
      });

      // Get seller userId for notification
      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { userId: true, storeName: true }
      });

      if (sellerProfile) {
        await tx.notification.create({
          data: {
            userId: sellerProfile.userId,
            title: "Saldo Toko Bertambah! 💰",
            message: `Dana sebesar Rp ${amount.toLocaleString("id-ID")} dari pesanan #${id.slice(-8).toUpperCase()} telah diteruskan ke saldo toko Anda.`,
            link: `/seller/wallet`,
          }
        });
      }
    }
  });

  // Redirect back to order detail after confirmation
  return NextResponse.redirect(
    new URL(`/dashboard/orders/${id}`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    { status: 303 }
  );
}
