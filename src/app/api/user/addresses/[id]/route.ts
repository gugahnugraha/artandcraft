import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/user/addresses/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Make sure this address belongs to the user
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ message: "Alamat tidak ditemukan." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id } });

  // If deleted address was default, promote the newest remaining address
  if (address.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return NextResponse.json({ success: true });
}
