import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();

    // Upsert Cart for user
    const cart = await prisma.cart.upsert({
      where: { userId: session.user.id },
      update: {},
      create: { userId: session.user.id },
    });

    // Delete existing items to replace with new ones (Simple Sync)
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    if (items && items.length > 0) {
      const cartItemsData = items.map((item: any) => ({
        cartId: cart.id,
        productId: item.id,
        quantity: item.quantity,
      }));

      await prisma.cartItem.createMany({
        data: cartItemsData,
      });
    }

    return NextResponse.json({ success: true, message: "Cart synced to DB" });
  } catch (error) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
