import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/withdrawals - Admin fetches all withdrawal requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sellerProfile: {
          select: { storeName: true, storeSlug: true, user: { select: { email: true } } }
        }
      }
    });

    return NextResponse.json({
      withdrawals: withdrawals.map(w => ({
        ...w,
        amount: Number(w.amount)
      }))
    });
  } catch (error: any) {
    console.error("Fetch Admin Withdrawals Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/withdrawals - Admin approves or rejects withdrawal
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { withdrawalId, status, notes } = body;

    if (!withdrawalId || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Status harus APPROVED atau REJECTED" }, { status: 400 });
    }

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { sellerProfile: true }
    });

    if (!withdrawal) {
      return NextResponse.json({ error: "Permintaan penarikan tidak ditemukan" }, { status: 404 });
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: "Status penarikan ini sudah diproses" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          notes: notes || null
        }
      });

      // If rejected, refund balance back to seller
      if (status === "REJECTED") {
        const amount = Number(withdrawal.amount);

        await tx.sellerProfile.update({
          where: { id: withdrawal.sellerProfileId },
          data: {
            balance: { increment: amount }
          }
        });

        await tx.walletTransaction.create({
          data: {
            sellerProfileId: withdrawal.sellerProfileId,
            type: "CREDIT",
            amount,
            description: `Pengembalian dana (Penarikan ditolak: ${notes || "Persyaratan tidak sesuai"})`,
            referenceId: withdrawalId
          }
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.sellerProfile.userId,
            title: "Penarikan Dana Ditolak ⚠️",
            message: `Permintaan penarikan dana sebesar Rp ${amount.toLocaleString("id-ID")} ditolak. Dana telah dikembalikan ke saldo toko Anda.`,
            link: `/seller/wallet`
          }
        });
      } else if (status === "APPROVED") {
        const amount = Number(withdrawal.amount);

        await tx.notification.create({
          data: {
            userId: withdrawal.sellerProfile.userId,
            title: "Penarikan Dana Disetujui! 💸",
            message: `Dana sebesar Rp ${amount.toLocaleString("id-ID")} telah mentransfer ke rekening ${withdrawal.bankName} (${withdrawal.bankAccountNumber}).`,
            link: `/seller/wallet`
          }
        });
      }
    });

    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    console.error("Process Admin Withdrawal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
