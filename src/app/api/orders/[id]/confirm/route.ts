import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/confirm
 * Buyer confirms they received the order — moves SHIPPED → DELIVERED
 */
export async function POST(_req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
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

  await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status: "DELIVERED" },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: id,
        status: "Pesanan Diterima",
        description: "Pembeli mengonfirmasi pesanan telah diterima.",
      },
    }),
    prisma.notification.create({
      data: {
        userId: order.userId,
        title: "Pesanan Selesai! ✅",
        message: `Pesanan #${id.slice(-8).toUpperCase()} telah selesai. Terima kasih telah berbelanja di ArtAndCraft.id!`,
        link: `/dashboard/orders/${id}`,
      },
    }),
  ]);

  // Redirect back to order detail after confirmation
  return NextResponse.redirect(
    new URL(`/dashboard/orders/${id}`, process.env.NEXTAUTH_URL || "http://localhost:3000"),
    { status: 303 }
  );
}
