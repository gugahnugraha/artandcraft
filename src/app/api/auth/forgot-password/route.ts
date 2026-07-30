import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = rateLimit(`forgot_password:${ip}`, { limit: 5, windowSec: 300 });
    if (!limiter.success) {
      return NextResponse.json(
        { message: "Terlalu banyak permintaan reset password. Silakan coba lagi beberapa menit kemudian." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check user existence
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Return generic message for security to prevent email enumeration
      return NextResponse.json({
        message: "Jika email Anda terdaftar, link untuk mereset kata sandi telah dikirim.",
      });
    }

    // Generate and send token with cooldown protection
    try {
      const tokenObj = await generatePasswordResetToken(cleanEmail);
      await sendPasswordResetEmail(cleanEmail, tokenObj.token);
    } catch (tokenErr: any) {
      if (tokenErr.message?.startsWith("SILENT_COOLDOWN:")) {
        const waitSec = tokenErr.message.split(":")[1];
        return NextResponse.json(
          { message: `Mohon tunggu ${waitSec} detik sebelum meminta email reset password baru.` },
          { status: 429 }
        );
      }
      throw tokenErr;
    }

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
