import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/custom-requests - Fetch custom requests for logged-in user or seller
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId }
    });

    const requests = await prisma.customRequest.findMany({
      where: {
        OR: [
          { buyerId: userId },
          ...(sellerProfile ? [{ sellerProfileId: sellerProfile.id }] : [])
        ]
      },
      include: {
        buyer: { select: { name: true, email: true } },
        sellerProfile: { select: { storeName: true, storeSlug: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      requests: requests.map(r => ({
        ...r,
        budget: r.budget ? Number(r.budget) : null,
        offeredPrice: r.offeredPrice ? Number(r.offeredPrice) : null
      }))
    });
  } catch (error: any) {
    console.error("Fetch Custom Requests Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/custom-requests - Create a new custom order request
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sellerProfileId, title, description, budget, referenceImages } = body;

    if (!sellerProfileId || !title || !description) {
      return NextResponse.json({ error: "Semua data wajib diisi." }, { status: 400 });
    }

    const customRequest = await prisma.customRequest.create({
      data: {
        buyerId: session.user.id,
        sellerProfileId,
        title: title.trim(),
        description: description.trim(),
        budget: budget ? Number(budget) : null,
        referenceImages: referenceImages || [],
        status: "PENDING"
      }
    });

    // Notify seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      select: { userId: true, storeName: true }
    });

    if (sellerProfile) {
      await prisma.notification.create({
        data: {
          userId: sellerProfile.userId,
          title: "Permintaan Pesanan Custom Baru! 🎨",
          message: `Pembeli mengajukan pesanan custom "${title.trim()}". Periksa dan berikan penawaran harga.`,
          link: `/seller/custom-requests`
        }
      });
    }

    return NextResponse.json({ success: true, customRequest }, { status: 201 });
  } catch (error: any) {
    console.error("Create Custom Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
