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

    if (!order_id || !signature_key) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    
    // Verify signature key if server key is configured
    if (serverKey) {
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
        .digest("hex");

      if (signature_key !== expectedSignature) {
        console.error("Invalid Midtrans Signature Key");
        return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
      }
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: { user: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine new order status based on Midtrans transaction status
    let newStatus: any = order.status;
    let paymentStatus = order.paymentStatus;

    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "AWAITING_PAYMENT";
        paymentStatus = "challenge";
      } else if (fraud_status === "accept") {
        newStatus = "PAID";
        paymentStatus = "paid";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "PAID";
      paymentStatus = "paid";
    } else if (transaction_status === "cancel" || transaction_status === "deny" || transaction_status === "expire") {
      newStatus = "CANCELLED";
      paymentStatus = "failed";
    } else if (transaction_status === "pending") {
      newStatus = "AWAITING_PAYMENT";
      paymentStatus = "unpaid";
    }

    // Update order in database
    await prisma.order.update({
      where: { id: order_id },
      data: {
        status: newStatus,
        paymentStatus,
        paymentMethod: payment_type || order.paymentMethod,
      },
    });

    // Create notification for buyer if payment is successful
    if (newStatus === "PAID" && order.status !== "PAID") {
      await prisma.notification.create({
        data: {
          userId: order.userId,
          title: "Pembayaran Diterima 🎉",
          message: `Pembayaran untuk pesanan #${order.id.slice(-6)} telah berhasil diverifikasi. Pengrajin akan segera memproses barang Anda.`,
          link: `/dashboard/orders/${order.id}`,
        },
      });
    }

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });
  } catch (error: any) {
    console.error("Midtrans Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
