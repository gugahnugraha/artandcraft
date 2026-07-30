"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema, RegisterInput } from "../schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function register(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data registrasi tidak valid" };
  }

  const { name, username, email, password } = parsed.data;
  const cleanEmail = email.toLowerCase().trim();
  const cleanUsername = username.toLowerCase().trim();

  try {
    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingEmail) {
      return { error: "Email sudah terdaftar" };
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUsername) {
      return { error: "Username sudah digunakan. Silakan pilih username lain." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        role: "BUYER",
        emailVerified: null,
      },
    });

    // Generate and send verification email
    try {
      const { generateVerificationToken } = await import("@/lib/tokens");
      const { sendVerificationEmail } = await import("@/lib/mail");
      const tokenObj = await generateVerificationToken(user.email);
      await sendVerificationEmail(user.email, tokenObj.token);
    } catch (mailErr) {
      console.error("Failed to send verification email on registration:", mailErr);
    }

    return {
      success: true,
      message: `Registrasi berhasil! Kami telah mengirimkan email verifikasi ke ${cleanEmail}. Silakan periksa inbox/spam email Anda untuk memverifikasi akun sebelum masuk.`,
    };
  } catch (error) {
    console.error("Registration database error:", error);
    return { error: "Terjadi kesalahan saat menyimpan data pendaftaran ke database" };
  }
}
