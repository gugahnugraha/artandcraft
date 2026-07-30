"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminKycActionButtonsProps {
  sellerProfileId: string;
}

export default function AdminKycActionButtons({ sellerProfileId }: AdminKycActionButtonsProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAction = async (status: "VERIFIED" | "REJECTED") => {
    const confirmMsg =
      status === "VERIFIED"
        ? "Apakah Anda yakin ingin MENYETUJUI verifikasi KTP toko ini?"
        : "Apakah Anda yakin ingin MENOLAK pengajuan verifikasi KTP ini?";

    if (!confirm(confirmMsg)) return;

    setLoadingAction(status);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerProfileId, status, notes }),
      });
      const result = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setErrorMsg(result.error || "Gagal memproses verifikasi KYC.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="pt-2 space-y-3">
      {errorMsg && (
        <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20 font-medium">
          {errorMsg}
        </p>
      )}

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Catatan Admin (Wajib diisi jika menolak)
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Dokumen KTP buram, nomor KTP tidak sesuai..."
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => handleAction("REJECTED")}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-50"
        >
          {loadingAction === "REJECTED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
          Tolak KYC
        </button>

        <button
          onClick={() => handleAction("VERIFIED")}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-md disabled:opacity-50"
        >
          {loadingAction === "VERIFIED" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Setujui Verifikasi KTP
        </button>
      </div>
    </div>
  );
}
