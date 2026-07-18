import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ storeId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await params;

  try {
    const existing = await prisma.storeFollower.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Already following" });
    }

    await prisma.$transaction([
      prisma.storeFollower.create({
        data: {
          userId: session.user.id,
          storeId,
        },
      }),
      prisma.sellerProfile.update({
        where: { id: storeId },
        data: { followersCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { storeId } = await params;

  try {
    const existing = await prisma.storeFollower.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Not following" });
    }

    await prisma.$transaction([
      prisma.storeFollower.delete({
        where: {
          userId_storeId: {
            userId: session.user.id,
            storeId,
          },
        },
      }),
      prisma.sellerProfile.update({
        where: { id: storeId },
        data: { followersCount: { decrement: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
