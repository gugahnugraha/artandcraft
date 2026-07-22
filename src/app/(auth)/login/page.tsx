"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/features/auth/schemas";
import { login } from "@/features/auth/actions/login";
import { KeyRound, Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Inner component that uses useSearchParams ────────────────────────────────
// Must be wrapped in <Suspense> at page level for static prerender compatibility.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    const errCode = searchParams.get("error");

    if (verified === "true") {
      setSuccess(t.auth_login.success_verified);
    }

    if (errCode) {
      if (errCode === "missing_token" || errCode === "invalid_token") {
        setError(t.auth_login.err_invalid_token);
      } else if (errCode === "expired_token") {
        setError(t.auth_login.err_expired_token);
      } else if (errCode === "user_not_found") {
        setError(t.auth_login.err_user_not_found);
      } else {
        setError(t.auth_login.err_verification_failed);
      }
    }
  }, [searchParams, t]);

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
      const sp = new URLSearchParams(window.location.search);
      const callbackUrl = sp.get("callbackUrl") || undefined;

      const res = await login(data, callbackUrl);
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch (err: any) {
      if (err.message !== "NEXT_REDIRECT") {
        setError(t.auth_login.err_system);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-6 px-4 sm:px-6 bg-gradient-to-b from-background to-accent/20 my-auto">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-lg">

        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {t.auth_login.welcome} <span className="text-primary font-bold">{t.auth_login.back}</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.auth_login.subtitle}
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
        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-3">

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t.auth_login.email_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={`w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.auth_login.password_label}
                </label>
                <Link href="/forgot-password" className="text-[11px] text-primary hover:underline font-semibold">
                  {t.auth_login.forgot_password}
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-destructive">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.auth_login.signing_in}</span>
              </>
            ) : (
              <span>{t.auth_login.sign_in}</span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground font-semibold">{t.auth_login.or_continue_with}</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => nextAuthSignIn("google", { callbackUrl: "/" })}
          type="button"
          className="w-full flex h-10 items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.69,17,12,17c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.78,0,8.65-3.56,9-8.4C21.04,11.4,21.35,11.1,21.35,11.1z" fill="#EA4335" />
              <path d="M12,20c2.42,0,4.59-0.97,6.3-2.54l-2.06-2.06C15.14,16.33,13.66,17,12,17c-2.69,0-4.88-1.25-5.38-3.2H1.27v2.4C2.62,18.73,7.03,20,12,20z" fill="#34A853" />
              <path d="M6.62,13.8C6.38,13.1,6.25,12.35,6.25,11.5s0.13-1.6,0.37-2.3V6.8H1.27C0.47,8.2,0,9.8,0,11.5s0.47,3.3,1.27,4.7L6.62,13.8z" fill="#FBBC05" />
              <path d="M12,6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11h3.62C7.12,9.05,9.31,7.8,12,7.8c0.04,0,12,6,12,6z" fill="#4285F4" />
            </g>
          </svg>
          <span>{t.auth_login.sign_in_google}</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          {t.auth_login.no_account}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            {t.auth_login.register_now}
          </Link>
        </p>

      </div>
    </div>
  );
}

// ─── Page shell — wraps LoginForm in Suspense for SSG prerender compatibility ─
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
