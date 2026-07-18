import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const email = "buyer@artcraft.com";
  const password = "password123";

  try {
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ message: "User already exists", user: { email: existing.email, password: "password123" } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: "Test Buyer",
        email: email,
        password: hashedPassword,
        role: "BUYER"
      }
    });

    return NextResponse.json({ message: "Test user created successfully", user: { email: user.email, password: "password123" } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 200 });
  }
}
