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

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "BUYER",
      },
    });
  } catch (error) {
    console.error("Registration database error:", error);
    return { error: "Terjadi kesalahan saat menyimpan data ke database" };
  }

  // Trigger login outside the database try-catch to allow Auth.js redirects to propagate
  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Registrasi berhasil, tetapi gagal masuk otomatis. Silakan masuk secara manual." };
    }
    throw error;
  }
}
