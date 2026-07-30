"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const setupAccountSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username minimal 3 karakter")
      .max(20, "Username maksimal 20 karakter")
      .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan underscore (_)"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type SetupAccountInput = z.infer<typeof setupAccountSchema>;

export async function setupAccount(data: SetupAccountInput) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Anda belum masuk. Silakan login terlebih dahulu." };
  }

  const parsed = setupAccountSchema.safeParse(data);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Data tidak valid";
    return { error: firstError };
  }

  const { username, password } = parsed.data;
  const cleanUsername = username.toLowerCase().trim();

  try {
    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: cleanUsername,
        id: { not: session.user.id },
      },
    });

    if (existingUser) {
      return { error: "Username sudah digunakan oleh pengguna lain. Silakan pilih username lain." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: cleanUsername,
        password: hashedPassword,
        // Google OAuth users have emailVerified, but ensure it is set
        emailVerified: session.user.emailVerified || new Date(),
      },
    });

    return { success: true, username: cleanUsername };
  } catch (error) {
    console.error("Setup Account Error:", error);
    return { error: "Terjadi kesalahan saat menyimpan akun. Silakan coba lagi." };
  }
}
