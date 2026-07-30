"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DisputeResolutionButtonsProps {
  orderId: string;
}

export default function DisputeResolutionButtons({ orderId }: DisputeResolutionButtonsProps) {
  const router = useRouter();
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResolve = async (action: "APPROVE_REFUND" | "REJECT_DISPUTE") => {
    const confirmMsg =
      action === "APPROVE_REFUND"
        ? "Apakah Anda yakin ingin MENYETUJUI REFUND ke pembeli? Stok akan dikembalikan."
        : "Apakah Anda yakin ingin MENOLAK komplain dan MENERUSKAN DANA ke penjual?";

    if (!confirm(confirmMsg)) return;

    setLoadingAction(action);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resolve-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resolutionNotes }),
      });
      const result = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setErrorMsg(result.error || "Gagal memproses resolusi sengketa.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="pt-3 border-t border-border/60 space-y-3">
      {errorMsg && (
        <p className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-medium">
          {errorMsg}
        </p>
      )}

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
          Catatan Keputusan Admin / Alasan Mediasi
        </label>
        <input
          type="text"
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          placeholder="Contoh: Bukti foto jelas, refund disetujui / Komplain tidak dapat dibuktikan..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          onClick={() => handleResolve("REJECT_DISPUTE")}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground px-4 py-2 text-xs font-bold transition-all disabled:opacity-50"
        >
          {loadingAction === "REJECT_DISPUTE" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground" />
          )}
          Tolak Komplain (Cairkan ke Seller)
        </button>

        <button
          onClick={() => handleResolve("APPROVE_REFUND")}
          disabled={loadingAction !== null}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold transition-all shadow-md disabled:opacity-50"
        >
          {loadingAction === "APPROVE_REFUND" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Setujui Refund ke Pembeli
        </button>
      </div>
    </div>
  );
}
