import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { z } from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Check user existence
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success anyway for security (prevent email enumeration)
      return NextResponse.json({
        message: "Jika email Anda terdaftar, link untuk mereset kata sandi telah dikirim.",
      });
    }

    // Generate and send token
    const tokenObj = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, tokenObj.token);

    return NextResponse.json({
      message: "Jika email Anda terdaftar, link untuk mereset kata sandi telah dikirim.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
