import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(), // product ID
      quantity: z.number().min(1),
      price: z.number(),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string(),
    phoneNumber: z.string(),
    street: z.string(),
    city: z.string(),
    province: z.string(),
    postalCode: z.string(),
  }),
  paymentMethod: z.string(),
  shippingCost: z.number(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    const { items, shippingAddress, paymentMethod, shippingCost } = validatedData;

    if (items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Calculate totals securely by verifying prices against the database
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 404 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.title}` },
          { status: 400 }
        );
      }

      // Calculate final price considering discount
      const price = Number(product.price);
      const discount = Number(product.discount);
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

      totalAmount += finalPrice * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: finalPrice,
      });
    }

    const grandTotal = totalAmount + shippingCost;

    // 2. Create the Order in a database transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "AWAITING_PAYMENT",
          totalAmount,
          shippingCost,
          grandTotal,
          paymentMethod,
          paymentStatus: "unpaid",
          shippingCourier: "REGULAR", // Mock courier
          items: {
            create: orderItemsData,
          },
          shippingAddress: {
            create: {
              fullName: shippingAddress.fullName,
              phoneNumber: shippingAddress.phoneNumber,
              street: shippingAddress.street,
              city: shippingAddress.city,
              province: shippingAddress.province,
              postalCode: shippingAddress.postalCode,
              country: "Indonesia",
            },
          },
        },
      });

      // Update product stock
      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear the user's backend cart if exists
      const userCart = await tx.cart.findUnique({
        where: { userId: session.user.id },
      });
      if (userCart) {
        await tx.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
      }

      return newOrder;
    });

    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
