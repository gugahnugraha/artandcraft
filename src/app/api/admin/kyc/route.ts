import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/kyc - Admin approves or rejects seller KYC verification
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sellerProfileId, status, notes } = body;

    if (!sellerProfileId || !["VERIFIED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status harus VERIFIED atau REJECTED" }, { status: 400 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Profil toko tidak ditemukan" }, { status: 404 });
    }

    const isVerified = status === "VERIFIED";

    const updated = await prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        isVerified,
        kycStatus: status,
        kycNotes: notes || null,
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: sellerProfile.userId,
        title: isVerified ? "Verifikasi Identitas (KYC) Disetujui! ✅" : "Verifikasi Identitas (KYC) Ditolak ⚠️",
        message: isVerified
          ? "Akun toko Anda kini telah terverifikasi resmi. Anda dapat melakukan penarikan dana."
          : `Pengajuan verifikasi KTP ditolak: ${notes || "Dokumen tidak sesuai / tidak terbaca."}`,
        link: "/seller/wallet",
      },
    });

    return NextResponse.json({ success: true, seller: updated });
  } catch (error: any) {
    console.error("Admin Process KYC Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
