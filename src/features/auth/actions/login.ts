"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { loginSchema, LoginInput } from "../schemas";

export async function login(data: LoginInput) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Email atau password tidak valid" };
  }

  const { email, password } = parsed.data;

  try {
    await signIn("credentials", {
      email: email.toLowerCase(),
      password,
      redirectTo: "/",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email atau password salah" };
        default:
          return { error: "Gagal masuk. Terjadi masalah sistem." };
      }
    }
    // Critical: Rethrow the redirect exception so Next.js handles route transition
    throw error;
  }
}
