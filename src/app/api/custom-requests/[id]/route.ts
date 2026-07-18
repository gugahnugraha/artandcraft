import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/custom-requests/[id] - Update custom request status/offer
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const body = await req.json();
    const { status, offeredPrice, notes } = body;

    const customRequest = await prisma.customRequest.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
        buyer: { select: { id: true, name: true } }
      }
    });

    if (!customRequest) {
      return NextResponse.json({ error: "Pesanan custom tidak ditemukan" }, { status: 404 });
    }

    const isBuyer = customRequest.buyerId === userId;
    const isSeller = customRequest.sellerProfile.userId === userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Seller submits offer price
    if (isSeller && status === "OFFER_SENT") {
      if (!offeredPrice || Number(offeredPrice) <= 0) {
        return NextResponse.json({ error: "Harga penawaran harus lebih dari 0" }, { status: 400 });
      }

      const updated = await prisma.customRequest.update({
        where: { id },
        data: {
          status: "OFFER_SENT",
          offeredPrice: Number(offeredPrice),
          notes: notes || null
        }
      });

      // Notify buyer
      await prisma.notification.create({
        data: {
          userId: customRequest.buyerId,
          title: "Penawaran Harga Pesanan Custom! 🏷️",
          message: `Toko "${customRequest.sellerProfile.storeName}" memberikan penawaran Rp ${Number(offeredPrice).toLocaleString("id-ID")} untuk "${customRequest.title}".`,
          link: `/dashboard/custom-requests`
        }
      });

      return NextResponse.json({ success: true, request: updated });
    }

    // 2. Buyer accepts or rejects offer
    if (isBuyer && ["ACCEPTED", "REJECTED"].includes(status)) {
      const updated = await prisma.customRequest.update({
        where: { id },
        data: { status }
      });

      // Notify seller
      await prisma.notification.create({
        data: {
          userId: customRequest.sellerProfile.userId,
          title: status === "ACCEPTED" ? "Penawaran Custom Disetujui! 🎉" : "Penawaran Custom Ditolak ⚠️",
          message: `Pembeli ${customRequest.buyer.name} telah ${status === "ACCEPTED" ? "MENYETUJUI" : "MENOLAK"} penawaran harga untuk "${customRequest.title}".`,
          link: `/seller/custom-requests`
        }
      });

      return NextResponse.json({ success: true, request: updated });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error: any) {
    console.error("Update Custom Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
