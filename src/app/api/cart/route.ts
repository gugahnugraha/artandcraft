import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/cart — fetch cloud cart for authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ items: [] });

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              discount: true,
              photos: true,
              stock: true,
              slug: true,
              seller: { select: { storeName: true } },
            },
          },
        },
      },
    },
  });

  if (!cart) return NextResponse.json({ items: [] });

  const items = cart.items.map((item) => {
    const price = Number(item.product.price);
    const discount = Number(item.product.discount);
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
    return {
      id: item.product.id,
      title: item.product.title,
      price: finalPrice,
      photo: item.product.photos[0] || "",
      sellerName: item.product.seller.storeName,
      quantity: item.quantity,
      maxStock: item.product.stock,
    };
  });

  return NextResponse.json({ items });
}

// POST /api/cart — sync local Zustand cart to DB (called on login)
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
      // Validate products exist and have stock
      const validItems: { cartId: string; productId: string; quantity: number }[] = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.id, status: "ACTIVE" },
          select: { stock: true },
        });
        if (product && product.stock > 0) {
          validItems.push({
            cartId: cart.id,
            productId: item.id,
            quantity: Math.min(item.quantity, product.stock),
          });
        }
      }

      if (validItems.length > 0) {
        await prisma.cartItem.createMany({ data: validItems });
      }
    }

    return NextResponse.json({ success: true, message: "Cart synced to DB" });
  } catch (error) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
