import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Platform Commission Rate
 * 5% dari setiap transaksi yang berhasil masuk ke kas platform (admin).
 * Seller menerima 95% dari total penjualan produk.
 */
const PLATFORM_COMMISSION_RATE = 0.05;

/**
 * POST /api/orders/[id]/confirm
 * Buyer confirms they received the order.
 * - Moves SHIPPED → DELIVERED
 * - Credits seller balance (minus platform commission)
 * - Records platform earnings in admin wallet
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
          product: { select: { sellerId: true, title: true } },
        },
      },
    },
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

  // ─── Calculate earnings per seller with platform commission ───────────────
  // Map: sellerId → { gross, commission, net }
  const sellerEarnings = new Map<string, { gross: number; commission: number; net: number }>();

  order.items.forEach((item) => {
    const sellerId = item.product.sellerId;
    const itemTotal = Number(item.price) * item.quantity;
    const commission = Math.round(itemTotal * PLATFORM_COMMISSION_RATE);
    const net = itemTotal - commission;

    const existing = sellerEarnings.get(sellerId);
    if (existing) {
      sellerEarnings.set(sellerId, {
        gross: existing.gross + itemTotal,
        commission: existing.commission + commission,
        net: existing.net + net,
      });
    } else {
      sellerEarnings.set(sellerId, { gross: itemTotal, commission, net });
    }
  });

  const totalCommission = Array.from(sellerEarnings.values()).reduce(
    (sum, e) => sum + e.commission,
    0
  );

  await prisma.$transaction(async (tx) => {
    // 1. Update Order Status → DELIVERED
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

    // 4. Credit Seller Balances (net amount after commission)
    for (const [sellerId, earnings] of sellerEarnings.entries()) {
      // Credit net amount to seller wallet
      await tx.sellerProfile.update({
        where: { id: sellerId },
        data: {
          balance: { increment: earnings.net },
        },
      });

      await tx.walletTransaction.create({
        data: {
          sellerProfileId: sellerId,
          type: "CREDIT",
          amount: earnings.net,
          description: `Hasil penjualan pesanan #${id.slice(-8).toUpperCase()} (setelah komisi platform 5%)`,
          referenceId: id,
        },
      });

      // Seller notification with breakdown
      const sellerProfile = await tx.sellerProfile.findUnique({
        where: { id: sellerId },
        select: { userId: true, storeName: true },
      });

      if (sellerProfile) {
        await tx.notification.create({
          data: {
            userId: sellerProfile.userId,
            title: "Saldo Toko Bertambah! 💰",
            message:
              `Dana Rp ${earnings.net.toLocaleString("id-ID")} dari pesanan ` +
              `#${id.slice(-8).toUpperCase()} telah masuk ke saldo toko Anda ` +
              `(komisi platform: Rp ${earnings.commission.toLocaleString("id-ID")}).`,
            link: `/seller/wallet`,
          },
        });
      }
    }

    // 5. Record Platform Commission — diarahkan ke profil seller milik admin
    // Simpan sebagai platform_earning ke satu seller_profile milik akun admin
    // agar dapat dilacak di dashboard admin.
    if (totalCommission > 0) {
      const adminUser = await tx.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUser) {
        const adminSellerProfile = await tx.sellerProfile.findUnique({
          where: { userId: adminUser.id },
        });

        if (adminSellerProfile) {
          await tx.sellerProfile.update({
            where: { id: adminSellerProfile.id },
            data: { balance: { increment: totalCommission } },
          });

          await tx.walletTransaction.create({
            data: {
              sellerProfileId: adminSellerProfile.id,
              type: "CREDIT",
              amount: totalCommission,
              description: `Komisi platform (5%) dari pesanan #${id.slice(-8).toUpperCase()}`,
              referenceId: id,
            },
          });
        }
      }
    }
  });

  // Redirect back to order detail after confirmation
  return NextResponse.redirect(
    new URL(`/dashboard/orders/${id}`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    { status: 303 }
  );
}
