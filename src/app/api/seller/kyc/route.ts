import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const KycSubmitSchema = z.object({
  ktpNumber: z.string().min(16, "Nomor KTP harus 16 digit angka").max(16, "Nomor KTP harus 16 digit angka"),
  ktpImage: z.string().url("URL foto KTP tidak valid"),
});

// GET /api/seller/kyc - Get KYC status for active seller
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        isVerified: true,
        kycStatus: true,
        ktpNumber: true,
        ktpImage: true,
        kycNotes: true,
      },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Profil toko tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ kyc: sellerProfile });
  } catch (error: any) {
    console.error("Fetch KYC Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/seller/kyc - Submit KYC data for verification
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = KycSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { ktpNumber, ktpImage } = parsed.data;

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Profil toko tidak ditemukan" }, { status: 404 });
    }

    if (sellerProfile.isVerified || sellerProfile.kycStatus === "VERIFIED") {
      return NextResponse.json({ error: "Identitas toko Anda sudah terverifikasi." }, { status: 400 });
    }

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerProfile.id },
      data: {
        ktpNumber,
        ktpImage,
        kycStatus: "PENDING",
        kycNotes: null,
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "Pengajuan KYC Toko Baru 🪪",
          message: `Toko "${sellerProfile.storeName}" mengunggah dokumen KTP untuk verifikasi identitas.`,
          link: `/admin/users`,
        },
      });
    }

    return NextResponse.json({ success: true, kyc: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Submit KYC Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
