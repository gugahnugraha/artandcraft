import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ items: [] });

  const wishlist = await prisma.wishlist.findUnique({
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
              slug: true,
              seller: { select: { storeName: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ items: wishlist?.items || [] });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { productId } = body;

  if (!productId) return NextResponse.json({ message: "productId required" }, { status: 400 });

  // Ensure wishlist exists
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Check if item exists in wishlist
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      }
    }
  });

  if (existingItem) {
    // Remove if exists
    await prisma.wishlistItem.delete({
      where: { id: existingItem.id }
    });
    return NextResponse.json({ success: true, action: "removed" });
  } else {
    // Add if doesn't exist
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      }
    });
    return NextResponse.json({ success: true, action: "added" });
  }
}
