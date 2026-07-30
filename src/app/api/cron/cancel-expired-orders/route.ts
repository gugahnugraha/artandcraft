import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/cron/cancel-expired-orders
 *
 * Dipanggil oleh Vercel Cron Jobs setiap jam.
 * Membatalkan otomatis pesanan yang sudah > 24 jam tanpa pembayaran
 * dan mengembalikan stok produk secara atomik.
 *
 * Security: hanya bisa dipanggil oleh Vercel Cron (CRON_SECRET) atau admin.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAYMENT_EXPIRY_HOURS = 24;

export async function GET(req: Request) {
  // ─── Auth: validasi CRON_SECRET dari Vercel ───────────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error("[CRON] Unauthorized cron request blocked.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cutoffTime = new Date(
      Date.now() - PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000
    );

    // Cari semua pesanan yang masih menunggu pembayaran dan sudah melewati cutoff
    const expiredOrders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "AWAITING_PAYMENT"] },
        paymentStatus: { in: ["unpaid", "pending"] },
        createdAt: { lt: cutoffTime },
      },
      include: {
        items: {
          select: { productId: true, quantity: true },
        },
      },
    });

    if (expiredOrders.length === 0) {
      console.log("[CRON] Tidak ada pesanan kadaluwarsa ditemukan.");
      return NextResponse.json({
        success: true,
        cancelled: 0,
        message: "Tidak ada pesanan yang perlu dibatalkan.",
      });
    }

    console.log(`[CRON] Memproses ${expiredOrders.length} pesanan kadaluwarsa...`);

    let cancelledCount = 0;
    const errors: string[] = [];

    // Proses setiap order secara individual dalam transaction terpisah
    // agar 1 kegagalan tidak rollback semua
    for (const order of expiredOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // 1. Update status order → CANCELLED
          await tx.order.update({
            where: { id: order.id },
            data: {
              status: "CANCELLED",
              paymentStatus: "failed",
            },
          });

          // 2. Kembalikan stok produk
          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          // 3. Buat notifikasi ke buyer
          await tx.notification.create({
            data: {
              userId: order.userId,
              title: "Pesanan Otomatis Dibatalkan ⏰",
              message: `Pesanan #${order.id.slice(-8).toUpperCase()} dibatalkan karena batas waktu pembayaran (${PAYMENT_EXPIRY_HOURS} jam) telah terlewati.`,
              link: `/dashboard/orders/${order.id}`,
            },
          });

          // 4. Tracking log
          await tx.orderTracking.create({
            data: {
              orderId: order.id,
              status: "CANCELLED",
              description: `Pesanan dibatalkan otomatis karena tidak ada pembayaran dalam ${PAYMENT_EXPIRY_HOURS} jam.`,
            },
          });
        });

        cancelledCount++;
        console.log(`[CRON] ✅ Order ${order.id.slice(-8).toUpperCase()} dibatalkan.`);
      } catch (err: any) {
        console.error(`[CRON] ❌ Gagal batalkan order ${order.id}:`, err.message);
        errors.push(order.id);
      }
    }

    console.log(
      `[CRON] Selesai. Dibatalkan: ${cancelledCount}, Gagal: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      cancelled: cancelledCount,
      failed: errors.length,
      failedIds: errors,
      cutoffTime: cutoffTime.toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON] Fatal error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
