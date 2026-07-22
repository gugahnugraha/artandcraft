"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError(t.auth_forgot.err_empty_email);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message);
      } else {
        setError(data.message || t.auth_forgot.err_failed);
      }
    } catch (err) {
      setError(t.auth_forgot.err_system);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/20">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            {t.auth_forgot.forgot}<span className="text-primary italic">{t.auth_forgot.password}</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth_forgot.subtitle}
          </p>
        </div>

        {/* Messaging */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2.5 rounded-lg bg-green-50 border border-green-200 p-3.5 text-sm text-green-700">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t.auth_forgot.email_label}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.auth_forgot.sending_link}</span>
                </>
              ) : (
                <span>{t.auth_forgot.send_link}</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {t.auth_forgot.back_to}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            {t.auth_forgot.login_page}
          </Link>
        </p>

      </div>
    </div>
  );
}
