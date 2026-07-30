"use server";

import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function resendVerificationEmail(identifier: string) {
  if (!identifier) {
    return { error: "Email atau Username wajib diisi." };
  }

  const cleanIdentifier = identifier.toLowerCase().trim();

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { username: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return { error: "Pengguna dengan Email atau Username tersebut tidak ditemukan." };
    }

    if (user.emailVerified) {
      return { message: "Email ini sudah terverifikasi. Silakan langsung masuk." };
    }

    const tokenObj = await generateVerificationToken(user.email);
    await sendVerificationEmail(user.email, tokenObj.token);

    return {
      success: true,
      message: `Email verifikasi baru telah dikirim ke ${user.email}. Silakan periksa inbox/spam Anda.`,
    };
  } catch (error) {
    console.error("Resend Verification Email Error:", error);
    return { error: "Gagal mengirim ulang email verifikasi. Silakan coba beberapa saat lagi." };
  }
}
