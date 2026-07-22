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
          variant: true,
        },
      },
    },
  });

  if (!cart) return NextResponse.json({ items: [] });

  const items = cart.items.map((item) => {
    let basePrice = Number(item.product.price);
    if (item.variant && item.variant.price) {
      basePrice = Number(item.variant.price);
    }
    const discount = Number(item.product.discount);
    const finalPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
    
    return {
      id: `${item.product.id}${item.variantId ? '-' + item.variantId : ''}`, // Unique cart item ID
      productId: item.product.id,
      variantId: item.variant?.id || undefined,
      variantName: item.variant ? `${item.variant.name}: ${item.variant.value}` : undefined,
      title: item.product.title,
      price: finalPrice,
      photo: item.product.photos[0] || "",
      sellerName: item.product.seller.storeName,
      quantity: item.quantity,
      maxStock: item.variant ? item.variant.stock : item.product.stock,
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
      const validItems: { cartId: string; productId: string; variantId: string | null; quantity: number }[] = [];
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId, status: "ACTIVE" },
          select: { stock: true },
        });
        
        let availableStock = product ? product.stock : 0;
        
        if (item.variantId) {
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true }
          });
          if (variant) {
            availableStock = variant.stock;
          } else {
            availableStock = 0;
          }
        }

        if (availableStock > 0) {
          validItems.push({
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: Math.min(item.quantity, availableStock),
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
