"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { loginSchema, LoginInput } from "../schemas";

export async function login(data: LoginInput, callbackUrl?: string) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Email atau password tidak valid" };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirectTo: callbackUrl || "/",
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      const causeMessage = error.cause?.err?.message || error.message || "";
      if (causeMessage.includes("EMAIL_UNVERIFIED")) {
        return {
          error: "EMAIL_UNVERIFIED",
          message: "Email Anda belum diverifikasi. Silakan periksa inbox atau folder spam email Anda untuk melakukan verifikasi.",
        };
      }

      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email/Username atau password salah." };
        default:
          return { error: "Gagal masuk. Terjadi masalah sistem." };
      }
    }
    // Critical: Rethrow the redirect exception so Next.js handles route transition
    throw error;
  }
}
