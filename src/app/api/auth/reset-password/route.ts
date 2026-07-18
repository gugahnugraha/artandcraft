import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const ResetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Token tidak valid atau tidak ditemukan." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date(verificationToken.expires) < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { message: "Token telah kedaluwarsa." },
        { status: 400 }
      );
    }

    // Extract email (format is 'password-reset:email')
    const email = verificationToken.identifier.replace("password-reset:", "");

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi Anda berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
