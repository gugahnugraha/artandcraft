import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/user/addresses/[id]/default — set as default address
export async function PATCH(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== session.user.id) {
    return NextResponse.json({ message: "Alamat tidak ditemukan." }, { status: 404 });
  }

  // Unset all defaults for this user, then set the requested one
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    }),
    prisma.address.update({
      where: { id },
      data: { isDefault: true },
    }),
  ]);

  return NextResponse.json({ success: true });
}
