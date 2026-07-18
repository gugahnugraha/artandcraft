import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const midtransClient = require("midtrans-client");

// Initialize Snap client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

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

    // 3. Generate Midtrans Snap Token
    const midtransParams = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Math.round(grandTotal),
      },
      customer_details: {
        first_name: shippingAddress.fullName,
        email: session.user.email,
        phone: shippingAddress.phoneNumber,
      },
      item_details: [
        ...orderItemsData.map(item => ({
          id: item.productId,
          price: Math.round(item.price),
          quantity: item.quantity,
          name: `Produk ID: ${item.productId}`.substring(0, 50),
        })),
        ...(shippingCost > 0 ? [{
          id: 'SHIPPING',
          price: Math.round(shippingCost),
          quantity: 1,
          name: 'Ongkos Kirim'
        }] : [])
      ]
    };

    let token = "";
    if (process.env.MIDTRANS_SERVER_KEY) {
      try {
        const transaction = await snap.createTransaction(midtransParams);
        token = transaction.token;
      } catch (midtransError: any) {
        console.error("Midtrans Error:", midtransError.message);
        // We can either fail the checkout or allow it and handle payment later
        return NextResponse.json({ error: "Gagal menghubungkan ke sistem pembayaran." }, { status: 500 });
      }
    } else {
      console.warn("MIDTRANS_SERVER_KEY is missing. Skipping token generation for testing.");
    }

    return NextResponse.json({ success: true, orderId: order.id, token }, { status: 201 });
  } catch (error: any) {
    console.error("Checkout Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
