import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "SELLER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status, trackingNumber, shippingCourier } = body;
    const orderId = params.orderId;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Build update data — include tracking fields if provided
    const updateData: Record<string, unknown> = { status };
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (shippingCourier !== undefined) updateData.shippingCourier = shippingCourier || null;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // Create tracking log entry for key transitions
    const trackingDescriptions: Record<string, string> = {
      PROCESSING: "Pesanan sedang dikemas oleh penjual.",
      SHIPPED: trackingNumber
        ? `Pesanan telah dikirim via ${shippingCourier || "kurir"}. Nomor resi: ${trackingNumber}`
        : `Pesanan telah dikirim via ${shippingCourier || "kurir"}.`,
    };

    if (trackingDescriptions[status]) {
      await prisma.orderTracking.create({
        data: {
          orderId,
          status,
          description: trackingDescriptions[status],
        },
      });
    }

    // Notify the buyer on key status transitions
    const notifMap: Record<string, { title: string; message: string }> = {
      PROCESSING: {
        title: "Pesanan Diproses 📦",
        message: `Pesanan #${updatedOrder.id.slice(-8).toUpperCase()} sedang dikemas oleh penjual.`,
      },
      SHIPPED: {
        title: "Pesanan Dikirim! 🚚",
        message: trackingNumber
          ? `Pesanan #${updatedOrder.id.slice(-8).toUpperCase()} dikirim via ${shippingCourier}. Resi: ${trackingNumber}`
          : `Pesanan #${updatedOrder.id.slice(-8).toUpperCase()} sedang dalam perjalanan.`,
      },
    };

    if (notifMap[status]) {
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: notifMap[status].title,
          message: notifMap[status].message,
          link: `/dashboard/orders/${orderId}`,
        },
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
