import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/conversations - List conversations for logged in user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has a seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
    });

    // Fetch conversations where user is buyer OR seller
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: userId },
          ...(sellerProfile ? [{ sellerProfileId: sellerProfile.id }] : [])
        ]
      },
      include: {
        buyer: { select: { id: true, name: true, image: true, email: true } },
        sellerProfile: { select: { id: true, storeName: true, storeLogo: true, storeSlug: true, userId: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Fetch Conversations Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/messages/conversations - Start or get existing conversation
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sellerProfileId, productId, initialMessage } = body;

    if (!sellerProfileId) {
      return NextResponse.json({ error: "Seller profile ID required" }, { status: 400 });
    }

    // Ensure conversation exists or create one
    let conversation = await prisma.conversation.findUnique({
      where: {
        buyerId_sellerProfileId: {
          buyerId: session.user.id,
          sellerProfileId
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          buyerId: session.user.id,
          sellerProfileId,
          productId: productId || null
        }
      });
    }

    // If initial message provided, create it
    if (initialMessage && initialMessage.trim() !== "") {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          text: initialMessage.trim()
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error: any) {
    console.error("Create Conversation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
