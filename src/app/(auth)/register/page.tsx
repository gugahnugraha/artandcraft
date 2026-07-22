"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/features/auth/schemas";
import { register as registerAction } from "@/features/auth/actions/register";
import { User, Mail, KeyRound, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await registerAction(data);
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      if (err.message !== "NEXT_REDIRECT") {
        setError(t.auth_register.err_system);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-4 px-4 sm:px-6 bg-gradient-to-b from-background to-accent/20 my-auto">
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t.auth_register.join}<span className="text-primary font-bold">{t.auth_register.community}</span>{t.auth_register.our}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t.auth_register.subtitle}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-3 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2.5">
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t.auth_register.name_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder={t.auth_register.name_placeholder}
                  className={`w-full rounded-lg border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("name")}
                />
              </div>
              {errors.name && (
                <p className="mt-0.5 text-[10px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t.auth_register.email_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full rounded-lg border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.email ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-0.5 text-[10px] text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t.auth_register.password_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.password ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-0.5 text-[10px] text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                {t.auth_register.confirm_password_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full rounded-lg border bg-background py-1.5 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.confirmPassword ? "border-destructive" : "border-border"
                  }`}
                  {...registerField("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-0.5 text-[10px] text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex h-9 items-center justify-center gap-2 rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50 mt-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{t.auth_register.registering}</span>
              </>
            ) : (
              <span>{t.auth_register.register}</span>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-card px-2 text-muted-foreground font-semibold">{t.auth_register.or_continue_with}</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={() => nextAuthSignIn("google", { callbackUrl: "/" })}
          type="button"
          className="w-full flex h-9 items-center justify-center gap-2.5 rounded-lg border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-all shadow-sm"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38C16.88,15.75,14.69,17,12,17c-3.31,0-6-2.69-6-6s2.69-6,6-6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11s4.03,9,9,9c4.78,0,8.65-3.56,9-8.4C21.04,11.4,21.35,11.1,21.35,11.1z" fill="#EA4335" />
              <path d="M12,20c2.42,0,4.59-0.97,6.3-2.54l-2.06-2.06C15.14,16.33,13.66,17,12,17c-2.69,0-4.88-1.25-5.38-3.2H1.27v2.4C2.62,18.73,7.03,20,12,20z" fill="#34A853" />
              <path d="M6.62,13.8C6.38,13.1,6.25,12.35,6.25,11.5s0.13-1.6,0.37-2.3V6.8H1.27C0.47,8.2,0,9.8,0,11.5s0.47,3.3,1.27,4.7L6.62,13.8z" fill="#FBBC05" />
              <path d="M12,6c1.66,0,3.14,0.67,4.24,1.76l2.06-2.06C16.59,2.97,14.42,2,12,2C7.03,2,3,6.03,3,11h3.62C7.12,9.05,9.31,7.8,12,7.8c0.04,0,12,6,12,6z" fill="#4285F4" />
            </g>
          </svg>
          <span>{t.auth_register.register_google}</span>
        </button>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          {t.auth_register.have_account}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            {t.auth_register.login_here}
          </Link>
        </p>

      </div>
    </div>
  );
}
