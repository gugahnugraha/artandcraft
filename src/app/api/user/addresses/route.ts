import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const AddressSchema = z.object({
  label: z.string().min(1).max(20),
  fullName: z.string().min(2).max(100),
  phoneNumber: z.string().min(8).max(20),
  street: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  province: z.string().min(2).max(100),
  postalCode: z.string().min(5).max(5),
});

// GET /api/user/addresses — list user addresses
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ addresses });
}

// POST /api/user/addresses — create new address
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Data tidak valid", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Check if this is the first address — make it default
  const existingCount = await prisma.address.count({
    where: { userId: session.user.id },
  });

  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
      isDefault: existingCount === 0,
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
