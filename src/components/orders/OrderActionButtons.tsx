"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle, X, Loader2, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import ImageDropzone from "@/components/ui/ImageDropzone";

interface OrderActionButtonsProps {
  orderId: string;
  status: string;
}

export default function OrderActionButtons({ orderId, status }: OrderActionButtonsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeProof, setDisputeProof] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConfirmReceived = async () => {
    if (!confirm(t.order_actions.confirm_modal_desc)) return;

    setIsConfirming(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal mengonfirmasi pesanan.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDispute(true);
    setErrorMsg("");

    try {
      const proofUrls = disputeProof.trim() ? [disputeProof.trim()] : [];
      const res = await fetch(`/api/orders/${orderId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeReason,
          disputeProof: proofUrls,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setIsDisputeOpen(false);
        router.refresh();
      } else {
        setErrorMsg(result.error || "Gagal mengajukan komplain.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const canConfirm = status === "SHIPPED";
  const canDispute = ["SHIPPED", "DELIVERED"].includes(status);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-sm text-foreground">Aksi Pesanan</h3>
      <div className="flex flex-wrap gap-3">
        {canConfirm && (
          <button
            onClick={handleConfirmReceived}
            disabled={isConfirming}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
          >
            {isConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t.order_actions.confirm_received}
          </button>
        )}

        {canDispute && (
          <button
            onClick={() => setIsDisputeOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-5 py-2.5 text-sm font-bold transition-all"
          >
            <AlertTriangle className="h-4 w-4" />
            {t.order_actions.dispute_btn}
          </button>
        )}

        <Link
          href={`/dashboard/orders/${orderId}/invoice`}
          target="_blank"
          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background hover:bg-muted text-foreground px-5 py-2.5 text-sm font-bold transition-all"
        >
          <Printer className="h-4 w-4 text-primary" />
          {t.order_actions.invoice_print}
        </Link>
      </div>

      {/* Dispute Modal */}
      {isDisputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsDisputeOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 bg-destructive/10 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground">{t.order_actions.dispute_modal_title}</h3>
                <p className="text-xs text-muted-foreground">Dana Anda akan ditahan oleh platform sampai komplain terselesaikan.</p>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-xl font-medium">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t.order_actions.dispute_reason_label} (Min 10 Karakter)
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t.order_actions.dispute_reason_placeholder}
                  rows={4}
                  required
                  minLength={10}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {t.order_actions.dispute_evidence_label}
                </label>
                <ImageDropzone
                  value={disputeProof}
                  onChange={(url) => setDisputeProof(url)}
                  folder="disputes"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDisputeOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  {t.order_actions.confirm_cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute || disputeReason.length < 10}
                  className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingDispute && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.order_actions.dispute_submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
