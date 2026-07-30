import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
} from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
    } = body;

    if (!order_id || !signature_key || !status_code || !gross_amount) {
      console.error("[SECURITY] Midtrans Webhook: Payload tidak lengkap.");
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    if (!serverKey) {
      console.warn("[SECURITY WARNING] MIDTRANS_SERVER_KEY tidak diset di environment variables!");
    }

    // Strict SHA-512 Signature verification
    if (serverKey) {
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== expectedSignature) {
        console.error(`[SECURITY ALERT] Signature key mismatch untuk Order ID ${order_id}! Potential forgery attempt.`);
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    // Determine order status based on Midtrans response
    let newOrderStatus = "AWAITING_PAYMENT";
    let dbPaymentStatus = "unpaid";

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        dbPaymentStatus = "challenge";
      } else if (fraud_status === "accept") {
        newOrderStatus = "PAID";
        dbPaymentStatus = "paid";
      }
    } else if (transaction_status === "settlement") {
      newOrderStatus = "PAID";
      dbPaymentStatus = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newOrderStatus = "CANCELLED";
      dbPaymentStatus = "failed";
    } else if (transaction_status === "pending") {
      newOrderStatus = "AWAITING_PAYMENT";
      dbPaymentStatus = "pending";
    }

    // Find order with items and products
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      console.error(`[WEBHOOK] Order ID tidak ditemukan di DB: ${order_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isTransitionToPaid = newOrderStatus === "PAID" && order.status !== "PAID";
    const isTransitionToCancelled = newOrderStatus === "CANCELLED" && order.status !== "CANCELLED";

    // Atomically execute DB updates
    await prisma.$transaction(async (tx) => {
      // 1. Update Order State
      await tx.order.update({
        where: { id: order_id },
        data: {
          status: newOrderStatus as any,
          paymentStatus: dbPaymentStatus,
          paymentMethod: payment_type || order.paymentMethod,
        },
      });

      // 2. Restore stock if cancelled
      if (isTransitionToCancelled) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }

        // Notification for Buyer
        await tx.notification.create({
          data: {
            userId: order.userId,
            title: "Pesanan Dibatalkan ⚠️",
            message: `Pesanan #${order_id.substring(0, 8)} telah dibatalkan karena waktu pembayaran telah habis atau pembayaran ditolak.`,
            link: `/dashboard/orders/${order.id}`,
          },
        });
      }

      // 3. Buyer & Seller Notifications when Order becomes PAID
      if (isTransitionToPaid) {
        // Buyer Notification
        await tx.notification.create({
          data: {
            userId: order.userId,
            title: "Pembayaran Berhasil 🎉",
            message: `Pembayaran untuk pesanan #${order_id.substring(0, 8)} telah diverifikasi. Pengrajin akan segera menyiapkan barang Anda.`,
            link: `/dashboard/orders/${order.id}`,
          },
        });

        // Group purchased items by seller and notify each seller
        const sellersMap = new Map<string, { sellerUserId: string; storeName: string; totalAmount: number }>();

        for (const item of order.items) {
          if (item.product?.seller) {
            const seller = item.product.seller;
            const existing = sellersMap.get(seller.id) || {
              sellerUserId: seller.userId,
              storeName: seller.storeName,
              totalAmount: 0,
            };
            existing.totalAmount += Number(item.price) * item.quantity;
            sellersMap.set(seller.id, existing);
          }
        }

        for (const [, sellerData] of sellersMap) {
          await tx.notification.create({
            data: {
              userId: sellerData.sellerUserId,
              title: "Pesanan Baru Masuk! 📦",
              message: `Toko ${sellerData.storeName} menerima pesanan baru #${order_id.substring(0, 8)} senilai Rp ${sellerData.totalAmount.toLocaleString("id-ID")}. Segera proses dan kirim pesanan!`,
              link: `/seller/orders`,
            },
          });
        }
      }
    });

    // ─── Send Transactional Emails (after DB commit, non-blocking) ───────────
    if (isTransitionToPaid) {
      // Fetch buyer info for email
      const buyer = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { email: true, name: true },
      });

      if (buyer?.email) {
        const emailItems = order.items.map((item) => ({
          title: item.product?.title || `Produk #${item.productId.slice(-6)}`,
          quantity: item.quantity,
          price: Number(item.price),
        }));

        // Email ke buyer — non-blocking, jangan sampai gagal email hentikan response
        sendOrderConfirmationEmail({
          to: buyer.email,
          buyerName: buyer.name || "Pembeli",
          orderId: order.id,
          grandTotal: Number(order.grandTotal),
          items: emailItems,
        }).catch((e) => console.error("[MAIL] Gagal kirim email konfirmasi ke buyer:", e));

        // Email ke setiap seller
        const sellersMap = new Map<string, { email: string; storeName: string; items: { title: string; quantity: number }[]; total: number }>();
        for (const item of order.items) {
          if (item.product?.seller) {
            const s = item.product.seller;
            const existing = sellersMap.get(s.id) || {
              email: "",
              storeName: s.storeName,
              items: [],
              total: 0,
            };
            // Fetch seller email if not already fetched
            if (!existing.email) {
              const sellerUser = await prisma.user.findUnique({
                where: { id: s.userId },
                select: { email: true },
              });
              existing.email = sellerUser?.email || "";
            }
            existing.items.push({ title: item.product.title, quantity: item.quantity });
            existing.total += Number(item.price) * item.quantity;
            sellersMap.set(s.id, existing);
          }
        }

        for (const [, sellerData] of sellersMap) {
          if (sellerData.email) {
            sendNewOrderNotificationEmail({
              to: sellerData.email,
              storeName: sellerData.storeName,
              orderId: order.id,
              totalAmount: sellerData.total,
              items: sellerData.items,
            }).catch((e) => console.error("[MAIL] Gagal kirim email notif ke seller:", e));
          }
        }
      }
    }

    console.log(`[WEBHOOK SUCCESS] Order ${order_id} updated to status: ${newOrderStatus}`);
    return NextResponse.json({ success: true, status: newOrderStatus }, { status: 200 });
  } catch (error: any) {
    console.error("Midtrans Webhook Internal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
