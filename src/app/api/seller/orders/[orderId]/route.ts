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

    const { status } = await req.json();
    const orderId = params.orderId;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Optionally: If status is SHIPPED, create a notification for the BUYER
    if (status === "SHIPPED") {
      await prisma.notification.create({
        data: {
          userId: updatedOrder.userId,
          title: "Pesanan Dikirim! 🚚",
          message: `Pesanan Anda #${updatedOrder.id.slice(-8)} sedang dalam perjalanan.`,
        }
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
