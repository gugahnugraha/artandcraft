"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellerSetupSchema, SellerSetupInput } from "@/features/auth/schemas";
import { sellerSetup } from "@/features/auth/actions/seller-setup";
import { Store, Link2, FileText, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SellerSetupPage() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellerSetupInput>({
    resolver: zodResolver(sellerSetupSchema),
    defaultValues: {
      storeName: "",
      storeSlug: "",
      storeDescription: "",
      storeLogo: "",
      storeBanner: "",
    },
  });

  // Watch storeName to auto-generate a slug suggestion
  const watchStoreName = watch("storeName");

  const generateSlug = () => {
    if (!watchStoreName) return;
    const suggested = watchStoreName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric except spaces and dashes
      .replace(/[\s_]+/g, "-") // replace spaces and underscores with dashes
      .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
    setValue("storeSlug", suggested, { shouldValidate: true });
  };

  const onSubmit = async (data: SellerSetupInput) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await sellerSetup(data);
      if (res?.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else {
        // Successful registration on database.
        // Update client session token to reflect the upgraded SELLER role.
        await update({
          user: {
            ...session?.user,
            role: "SELLER",
          },
        });
        setSuccess(true);
        setIsSubmitting(false);
        // Force navigate to seller dashboard
        window.location.href = "/seller";
      }
    } catch (err: any) {
      setError(t.seller_setup.err_system);
      setIsSubmitting(false);
    }
  };

  // Wait for session loading
  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure user is authenticated
  if (!session) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold font-serif mb-2">{t.seller_setup.access_denied}</h2>
        <p className="text-muted-foreground mb-6">{t.seller_setup.access_denied_desc}</p>
        <Link href="/login" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
          {t.seller_setup.login_now}
        </Link>
      </div>
    );
  }

  // If user is already a SELLER or ADMIN, block onboarding and point to dashboard
  if (session.user.role === "SELLER" || session.user.role === "ADMIN") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
        <h2 className="text-xl font-bold font-serif mb-2">{t.seller_setup.active_title}</h2>
        <p className="text-muted-foreground mb-6">{t.seller_setup.active_desc}</p>
        <Link href="/seller" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors">
          {t.seller_setup.go_to_dashboard}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <CheckCircle2 className="h-16 w-16 text-primary mb-6 animate-bounce" />
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">{t.seller_setup.success_title}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t.seller_setup.success_desc}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all text-center">
            {t.seller_setup.back_to_home}
          </Link>
          <Link href="/seller" className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-all text-center flex items-center justify-center gap-1.5">
            {t.seller_setup.seller_dashboard} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-accent/20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-sm">
        
        {/* Header */}
        <div className="mb-8 border-b border-border/40 pb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            {t.seller_setup.open_store} <span className="text-primary italic">{t.seller_setup.craftsman}</span>{t.seller_setup.yours}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.seller_setup.form_desc}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            
            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t.seller_setup.store_name}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Store className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="storeName"
                  type="text"
                  placeholder={t.seller_setup.store_name_placeholder}
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.storeName ? "border-destructive" : "border-border"
                  }`}
                  {...register("storeName")}
                />
              </div>
              {errors.storeName && (
                <p className="mt-1 text-xs text-destructive">{errors.storeName.message}</p>
              )}
            </div>

            {/* Store Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="storeSlug" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.seller_setup.store_slug}
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  {t.seller_setup.auto_slug}
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Link2 className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="storeSlug"
                  type="text"
                  placeholder="contoh-nama-toko"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.storeSlug ? "border-destructive" : "border-border"
                  }`}
                  {...register("storeSlug")}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.seller_setup.store_link} <code className="font-semibold text-primary">artandcraft.id/toko/{(watch("storeSlug") || "slug")?.toLowerCase()}</code>
              </p>
              {errors.storeSlug && (
                <p className="mt-1 text-xs text-destructive">{errors.storeSlug.message}</p>
              )}
            </div>

            {/* Store Description */}
            <div>
              <label htmlFor="storeDescription" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t.seller_setup.store_desc}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-start pl-3 pt-3">
                  <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <textarea
                  id="storeDescription"
                  rows={4}
                  placeholder={t.seller_setup.store_desc_placeholder}
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.storeDescription ? "border-destructive" : "border-border"
                  }`}
                  {...register("storeDescription")}
                />
              </div>
              {errors.storeDescription && (
                <p className="mt-1 text-xs text-destructive">{errors.storeDescription.message}</p>
              )}
            </div>

            {/* Store Logo (Mock URL) */}
            <div>
              <label htmlFor="storeLogo" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t.seller_setup.store_logo}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <ImageIcon className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="storeLogo"
                  type="text"
                  placeholder="https://example.com/logo.jpg"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.storeLogo ? "border-destructive" : "border-border"
                  }`}
                  {...register("storeLogo")}
                />
              </div>
              {errors.storeLogo && (
                <p className="mt-1 text-xs text-destructive">{errors.storeLogo.message}</p>
              )}
            </div>

            {/* Store Banner (Mock URL) */}
            <div>
              <label htmlFor="storeBanner" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t.seller_setup.store_banner}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <ImageIcon className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <input
                  id="storeBanner"
                  type="text"
                  placeholder="https://example.com/banner.jpg"
                  className={`w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all ${
                    errors.storeBanner ? "border-destructive" : "border-border"
                  }`}
                  {...register("storeBanner")}
                />
              </div>
              {errors.storeBanner && (
                <p className="mt-1 text-xs text-destructive">{errors.storeBanner.message}</p>
              )}
            </div>

          </div>

          {/* Submit */}
          <div className="border-t border-border/40 pt-6 mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t.seller_setup.registering}</span>
                </>
              ) : (
                <span>{t.seller_setup.open_now}</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
