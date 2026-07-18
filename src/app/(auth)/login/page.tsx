"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/features/auth/schemas";
import { login } from "@/features/auth/actions/login";
import { KeyRound, Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const errCode = searchParams.get("error");

    if (verified === "true") {
      setSuccess("Email Anda berhasil diverifikasi! Silakan masuk ke akun Anda.");
    }

    if (errCode) {
      if (errCode === "missing_token" || errCode === "invalid_token") {
        setError("Token verifikasi tidak valid atau tidak ditemukan.");
      } else if (errCode === "expired_token") {
        setError("Link verifikasi telah kedaluwarsa. Silakan lakukan registrasi ulang.");
      } else if (errCode === "user_not_found") {
        setError("Pengguna dengan email tersebut tidak ditemukan.");
      } else {
        setError("Gagal memverifikasi email Anda.");
      }
    }
  }, [searchParams]);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const callbackUrl = searchParams.get("callbackUrl") || undefined;

      const res = await login(data, callbackUrl);
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch (err: any) {
      // In server actions, redirect throws an error that is handled by Next.js.
      // If it's a redirect, we shouldn't show it as an error.
      if (err.message !== "NEXT_REDIRECT") {
        setError("Terjadi kesalahan sistem saat mencoba masuk.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/20">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Selamat Datang <span className="text-primary italic">Kembali</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Masuk untuk mengakses keranjang belanja dan dashboard Anda
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {success && (
          <div className="flex items-center gap-2.5 rounded-lg bg-green-50 border border-green-200 p-3.5 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kata Sandi
                </label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-semibold">
                  Lupa sandi?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sedang Masuk...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 text-muted-foreground font-semibold">Atau Lanjutkan Dengan</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => nextAuthSignIn("google", { callbackUrl: "/" })}
          type="button"
          className="w-full flex h-11 items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.69,17,12,17c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.78,0,8.65-3.56,9-8.4C21.04,11.4,21.35,11.1,21.35,11.1z" fill="#EA4335" />
              <path d="M12,20c2.42,0,4.59-0.97,6.3-2.54l-2.06-2.06C15.14,16.33,13.66,17,12,17c-2.69,0-4.88-1.25-5.38-3.2H1.27v2.4C2.62,18.73,7.03,20,12,20z" fill="#34A853" />
              <path d="M6.62,13.8C6.38,13.1,6.25,12.35,6.25,11.5s0.13-1.6,0.37-2.3V6.8H1.27C0.47,8.2,0,9.8,0,11.5s0.47,3.3,1.27,4.7L6.62,13.8z" fill="#FBBC05" />
              <path d="M12,6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11h3.62C7.12,9.05,9.31,7.8,12,7.8c0.04,0,12,6,12,6z" fill="#4285F4" />
            </g>
          </svg>
          <span>Masuk dengan Google</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Belum memiliki akun?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
}
