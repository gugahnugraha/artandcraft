import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Only allow in development environment for security
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Aksi ini hanya diperbolehkan di lingkungan development." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.email} sekarang adalah ADMIN. Silakan relogin/refresh session Anda.`,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
