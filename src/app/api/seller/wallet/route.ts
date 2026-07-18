import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/seller/wallet - Fetch wallet info, transactions, and withdrawals
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        walletTransactions: {
          orderBy: { createdAt: "desc" },
          take: 20
        },
        withdrawals: {
          orderBy: { createdAt: "desc" },
          take: 20
        }
      }
    });

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: Number(sellerProfile.balance),
      bankName: sellerProfile.bankName,
      bankAccountNumber: sellerProfile.bankAccountNumber,
      bankAccountHolder: sellerProfile.bankAccountHolder,
      transactions: sellerProfile.walletTransactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount)
      })),
      withdrawals: sellerProfile.withdrawals.map(w => ({
        ...w,
        amount: Number(w.amount)
      }))
    });
  } catch (error: any) {
    console.error("Fetch Seller Wallet Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT /api/seller/wallet - Update bank details
export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bankName, bankAccountNumber, bankAccountHolder } = body;

    if (!bankName || !bankAccountNumber || !bankAccountHolder) {
      return NextResponse.json({ error: "Semua data rekening bank harus diisi." }, { status: 400 });
    }

    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId: session.user.id },
      data: {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountHolder: bankAccountHolder.trim()
      }
    });

    return NextResponse.json({
      success: true,
      bankName: updatedProfile.bankName,
      bankAccountNumber: updatedProfile.bankAccountNumber,
      bankAccountHolder: updatedProfile.bankAccountHolder
    });
  } catch (error: any) {
    console.error("Update Bank Details Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
