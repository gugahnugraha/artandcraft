import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendShippingNotificationEmail } from "@/lib/mail";

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PAID: ["PROCESSING"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["SHIPPED"], // Allow updating tracking number
};

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

    // ─── SECURITY: Validate order ownership ────────────────────────────────────
    // Find the order and verify that it contains at least one product
    // belonging to the seller currently logged in.
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { seller: { select: { userId: true } } },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
    }

    // ADMIN can update any order; SELLER can only update orders containing their products
    if (session.user.role === "SELLER") {
      const sellerOwnsThisOrder = order.items.some(
        (item) => item.product?.seller?.userId === session.user.id
      );

      if (!sellerOwnsThisOrder) {
        console.warn(
          `[SECURITY] Seller ${session.user.id} attempted to update order ${orderId} that does not belong to them.`
        );
        return NextResponse.json({ error: "Forbidden: Order ini bukan milik toko Anda." }, { status: 403 });
      }
    }

    // ─── Validate state machine transition ─────────────────────────────────────
    const currentStatus = order.status;
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status) && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: `Tidak dapat mengubah status dari ${currentStatus} menjadi ${status}.` },
        { status: 400 }
      );
    }

    // ─── Build update data ─────────────────────────────────────────────────────
    const updateData: Record<string, unknown> = { status };
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber || null;
    if (shippingCourier !== undefined) updateData.shippingCourier = shippingCourier || null;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    // ─── Tracking log for key transitions ─────────────────────────────────────
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

    // ─── Buyer Notification ────────────────────────────────────────────────────
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

    // ─── Email ke buyer saat pesanan SHIPPED ──────────────────────────────────
    if (status === "SHIPPED") {
      const buyer = await prisma.user.findUnique({
        where: { id: updatedOrder.userId },
        select: { email: true, name: true },
      });

      if (buyer?.email) {
        sendShippingNotificationEmail({
          to: buyer.email,
          buyerName: buyer.name || "Pembeli",
          orderId,
          courier: shippingCourier || updatedOrder.shippingCourier || "Kurir",
          trackingNumber: trackingNumber || updatedOrder.trackingNumber || undefined,
        }).catch((e) => console.error("[MAIL] Gagal kirim email shipping:", e));
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
