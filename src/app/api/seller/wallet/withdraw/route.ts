import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount < 50000) {
      return NextResponse.json({ error: "Minimal penarikan dana adalah Rp 50.000." }, { status: 400 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    if (!sellerProfile.bankName || !sellerProfile.bankAccountNumber || !sellerProfile.bankAccountHolder) {
      return NextResponse.json({ error: "Silakan atur rekening bank tujuan Anda terlebih dahulu." }, { status: 400 });
    }

    const currentBalance = Number(sellerProfile.balance);
    if (currentBalance < amount) {
      return NextResponse.json({ error: "Saldo toko Anda tidak mencukupi." }, { status: 400 });
    }

    // Process Withdrawal in Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct balance
      await tx.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: {
          balance: { decrement: amount }
        }
      });

      // 2. Create Withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          sellerProfileId: sellerProfile.id,
          amount,
          bankName: sellerProfile.bankName!,
          bankAccountNumber: sellerProfile.bankAccountNumber!,
          bankAccountHolder: sellerProfile.bankAccountHolder!,
          status: "PENDING"
        }
      });

      // 3. Create Debit Wallet Transaction
      await tx.walletTransaction.create({
        data: {
          sellerProfileId: sellerProfile.id,
          type: "DEBIT",
          amount,
          description: `Penarikan dana ke ${sellerProfile.bankName} (${sellerProfile.bankAccountNumber})`,
          referenceId: withdrawal.id
        }
      });

      return withdrawal;
    });

    return NextResponse.json({ success: true, withdrawal: result }, { status: 201 });
  } catch (error: any) {
    console.error("Withdrawal Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
