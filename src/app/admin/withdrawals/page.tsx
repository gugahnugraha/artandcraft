"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/withdrawals");
      const data = await res.json();
      if (res.ok) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (withdrawalId: string, status: "APPROVED" | "REJECTED", notes?: string) => {
    setProcessingId(withdrawalId);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ withdrawalId, status, notes }),
      });
      if (res.ok) {
        setRejectModalId(null);
        setRejectReason("");
        fetchWithdrawals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" /> Permintaan Penarikan Dana Penjual
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola dan setujui penarikan saldo toko ke rekening bank penjual.
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm">Belum ada permintaan penarikan dana.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Toko / Penjual</th>
                  <th className="px-6 py-3.5">Rekening Tujuan</th>
                  <th className="px-6 py-3.5">Jumlah</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {withdrawals.map((w) => {
                  const isPending = w.status === "PENDING";
                  return (
                    <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(w.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {w.sellerProfile.storeName}
                        <p className="text-[11px] text-muted-foreground font-normal">{w.sellerProfile.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground text-xs">{w.bankName} - {w.bankAccountNumber}</p>
                        <p className="text-[11px] text-muted-foreground">a.n. {w.bankAccountHolder}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground text-base">
                        Rp {w.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                          w.status === "APPROVED"
                            ? "bg-green-500/10 text-green-600"
                            : w.status === "REJECTED"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600"
                        }`}>
                          {w.status === "APPROVED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {w.status === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
                          {w.status === "PENDING" && <Clock className="h-3.5 w-3.5" />}
                          {w.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(w.id, "APPROVED")}
                              disabled={processingId === w.id}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Setujui (Transfer)
                            </button>
                            <button
                              onClick={() => setRejectModalId(w.id)}
                              disabled={processingId === w.id}
                              className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Tolak Penarikan Dana
            </h3>
            <p className="text-xs text-muted-foreground">
              Alasan penolakan akan dikirimkan kepada penjual dan saldo akan dikembalikan secara otomatis.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Nomor rekening tidak valid / nama tidak sesuai..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalId(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={() => handleAction(rejectModalId, "REJECTED", rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-lg bg-destructive text-sm font-bold text-white hover:bg-destructive/90 disabled:opacity-50"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
