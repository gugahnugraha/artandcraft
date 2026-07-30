import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/orders/[id]/resolve-dispute
 * Admin menyelesaikan sengketa/komplain pesanan (Dispute Resolution)
 */
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, resolutionNotes } = body; // action: "APPROVE_REFUND" | "REJECT_DISPUTE"

    if (!["APPROVE_REFUND", "REJECT_DISPUTE"].includes(action)) {
      return NextResponse.json({ error: "Aksi tidak valid (APPROVE_REFUND atau REJECT_DISPUTE)" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, sellerId: true, title: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "DISPUTED") {
      return NextResponse.json({ error: "Pesanan ini tidak sedang dalam status sengketa (DISPUTED)." }, { status: 400 });
    }

    if (action === "APPROVE_REFUND") {
      // ─── ADMIN APPROVES REFUND TO BUYER ─────────────────────────────────────
      await prisma.$transaction(async (tx) => {
        // 1. Update order status -> REFUNDED
        await tx.order.update({
          where: { id },
          data: {
            status: "REFUNDED",
            disputeNotes: resolutionNotes || "Komplain pembeli disetujui. Dana dikembalikan.",
          },
        });

        // 2. Restore product stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // 3. Log Tracking
        await tx.orderTracking.create({
          data: {
            orderId: id,
            status: "REFUNDED",
            description: `Admin menyetujui refund pembeli: ${resolutionNotes || "Komplain valid."}`,
          },
        });

        // 4. Notify Buyer
        await tx.notification.create({
          data: {
            userId: order.userId,
            title: "Pengembalian Dana (Refund) Disetujui! 💰",
            message: `Komplain pesanan #${id.slice(-8).toUpperCase()} disetujui Admin. Dana dikembalikan penuh.`,
            link: `/dashboard/orders/${id}`,
          },
        });

        // 5. Notify Seller
        const sellerIds = Array.from(new Set(order.items.map((i) => i.product.sellerId)));
        for (const sellerId of sellerIds) {
          const seller = await tx.sellerProfile.findUnique({ where: { id: sellerId }, select: { userId: true } });
          if (seller) {
            await tx.notification.create({
              data: {
                userId: seller.userId,
                title: "Komplain Disetujui (Refund) ⚠️",
                message: `Admin menyetujui komplain pesanan #${id.slice(-8).toUpperCase()}. Dana dikembalikan ke pembeli.`,
                link: `/seller/orders`,
              },
            });
          }
        }
      });

      return NextResponse.json({ success: true, message: "Refund berhasil disetujui" });
    } else {
      // ─── ADMIN REJECTS DISPUTE & RELEASES FUNDS TO SELLER ──────────────────
      await prisma.$transaction(async (tx) => {
        // 1. Update order status -> DELIVERED
        await tx.order.update({
          where: { id },
          data: {
            status: "DELIVERED",
            disputeNotes: resolutionNotes || "Komplain ditolak. Pesanan dinyatakan selesai.",
          },
        });

        // 2. Release 95% balance to seller, 5% to admin credit
        const PLATFORM_FEE_PERCENTAGE = 0.05;

        const sellerItemsMap: Record<string, number> = {};
        for (const item of order.items) {
          const sellerId = item.product.sellerId;
          const itemTotal = Number(item.price) * item.quantity;
          sellerItemsMap[sellerId] = (sellerItemsMap[sellerId] || 0) + itemTotal;
        }

        const adminUser = await tx.user.findFirst({
          where: { role: "ADMIN" },
          select: { sellerProfile: { select: { id: true } } },
        });
        const adminSellerProfileId = adminUser?.sellerProfile?.id;

        for (const [sellerId, sellerTotalAmount] of Object.entries(sellerItemsMap)) {
          const platformFee = Math.round(sellerTotalAmount * PLATFORM_FEE_PERCENTAGE);
          const sellerNetEarnings = sellerTotalAmount - platformFee;

          // Credit net earnings to seller balance
          await tx.sellerProfile.update({
            where: { id: sellerId },
            data: { balance: { increment: sellerNetEarnings } },
          });

          await tx.walletTransaction.create({
            data: {
              sellerProfileId: sellerId,
              amount: sellerNetEarnings,
              type: "CREDIT",
              description: `Penghasilan pesanan #${id.slice(-8).toUpperCase()} (setelah resolusi komplain, komisi 5%: Rp ${platformFee.toLocaleString("id-ID")})`,
            },
          });

          // Credit 5% platform fee to admin wallet
          if (adminSellerProfileId) {
            await tx.sellerProfile.update({
              where: { id: adminSellerProfileId },
              data: { balance: { increment: platformFee } },
            });

            await tx.walletTransaction.create({
              data: {
                sellerProfileId: adminSellerProfileId,
                amount: platformFee,
                type: "CREDIT",
                description: `Komisi Platform 5% dari resolusi pesanan #${id.slice(-8).toUpperCase()}`,
              },
            });
          }
        }

        // 3. Log Tracking
        await tx.orderTracking.create({
          data: {
            orderId: id,
            status: "DELIVERED",
            description: `Admin menolak komplain: ${resolutionNotes || "Pesanan sesuai spesifikasi."}`,
          },
        });

        // 4. Notifications
        await tx.notification.create({
          data: {
            userId: order.userId,
            title: "Resolusi Komplain Selesai ⚖️",
            message: `Komplain pesanan #${id.slice(-8).toUpperCase()} telah ditinjau. Pesanan dinyatakan selesai.`,
            link: `/dashboard/orders/${id}`,
          },
        });
      });

      return NextResponse.json({ success: true, message: "Komplain ditolak, dana diteruskan ke penjual" });
    }
  } catch (error: any) {
    console.error("Resolve Dispute Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
