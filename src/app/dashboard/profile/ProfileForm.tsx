"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Camera, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: Date;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [name, setName] = useState(user.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingProfile, startSaveProfile] = useTransition();
  const [savingPassword, startSavePassword] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    startSaveProfile(async () => {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: t.profile.msg_profile_success });
        router.refresh();
      } else {
        setProfileMsg({ type: "error", text: data.message || t.profile.msg_profile_error });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: t.profile.msg_pwd_mismatch });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: t.profile.msg_pwd_length });
      return;
    }
    startSavePassword(async () => {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: "success", text: t.profile.msg_pwd_success });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: data.message || t.profile.msg_pwd_error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">{t.profile.heading}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.profile.desc}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">{t.profile.personal_info}</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 text-primary font-serif font-bold text-3xl flex items-center justify-center overflow-hidden border-4 border-background shadow-md">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                title={t.profile.change_photo}
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.name || t.profile.default_user}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t.profile.joined}
                {new Date(user.createdAt).toLocaleDateString(language === "en" ? "en-US" : "id-ID", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t.profile.full_name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder={t.profile.name_placeholder}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t.profile.email}
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{t.profile.email_readonly}</p>
            </div>
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
              profileMsg.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}>
              {profileMsg.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {profileMsg.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {t.profile.save_changes}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-foreground">{t.profile.change_password}</h2>
        </div>
        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {t.profile.current_password}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder={t.profile.current_password}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t.profile.new_password}
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder={t.profile.new_password_placeholder}
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t.profile.confirm_password}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                placeholder={t.profile.confirm_placeholder}
              />
            </div>
          </div>

          {passwordMsg && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm ${
              passwordMsg.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}>
              {passwordMsg.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {passwordMsg.text}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {t.profile.update_password}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
