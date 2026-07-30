"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { setupAccount } from "@/features/auth/actions/setup-account";
import { ShieldCheck, User, KeyRound, Loader2, AlertCircle, Sparkles, Eye, EyeOff } from "lucide-react";

export default function SetupAccountPage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Username wajib diisi");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await setupAccount({
        username,
        password,
        confirmPassword,
      });

      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
      } else if (res.success) {
        // Trigger NextAuth session update to refresh JWT token
        await update({
          user: {
            username: res.username,
            hasPassword: true,
          },
        });

        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center py-8 px-4 sm:px-6 bg-gradient-to-b from-background via-accent/10 to-accent/30 my-auto min-h-[80vh]">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl">
        
        {/* Badge & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Lengkapi Profil Akun Anda</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Atur Username & Password
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Selamat datang di <span className="font-semibold text-foreground">ArtAndCraft.id</span>! Karena Anda masuk via Google, silakan tentukan username dan password untuk keamanan dan akses login fleksibel.
          </p>
        </div>

        {/* Logged in User Snippet */}
        {session?.user && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border">
            {session.user.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-10 w-10 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                {session.user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="min-w-0 text-left">
              <p className="font-bold text-xs text-foreground truncate">{session.user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Pilih Username Unik
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="contoh: pengrajin_kayu"
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                required
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Huruf, angka, dan underscore (_). Minimal 3 karakter.
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Buat Password Baru
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-10 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">Minimal 6 karakter.</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Konfirmasi Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-10 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Menyimpan Akun...</span>
              </>
            ) : (
              <span>Simpan & Lanjutkan →</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
