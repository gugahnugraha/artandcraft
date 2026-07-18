import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

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

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Verify signature key for security
    const hash = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hash !== signature_key) {
      console.error("Invalid Midtrans signature key");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
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

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { items: true },
    });

    if (!order) {
      console.error(`Order not found: ${order_id}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order_id },
        data: {
          status: newOrderStatus as any,
          paymentStatus: dbPaymentStatus,
          paymentMethod: payment_type,
        },
      });

      // If cancelled, restore stock
      if (newOrderStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // Add Notification for the user
      let notifTitle = "";
      let notifMessage = "";
      if (newOrderStatus === "PAID" && order.status !== "PAID") {
        notifTitle = "Pembayaran Berhasil";
        notifMessage = `Pembayaran untuk pesanan ${order_id.substring(0,8)} telah berhasil dikonfirmasi.`;
      } else if (newOrderStatus === "CANCELLED" && order.status !== "CANCELLED") {
        notifTitle = "Pesanan Dibatalkan";
        notifMessage = `Pesanan ${order_id.substring(0,8)} dibatalkan karena waktu pembayaran habis.`;
      }

      if (notifTitle) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            title: notifTitle,
            message: notifMessage,
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: "OK" }, { status: 200 });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
