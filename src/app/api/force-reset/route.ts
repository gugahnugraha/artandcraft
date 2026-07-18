import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const email = "buyer@artcraft.com";
  const password = "password123";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, role: "BUYER" }
    });

    return NextResponse.json({ message: "Password force reset successful", email: updated.email });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
