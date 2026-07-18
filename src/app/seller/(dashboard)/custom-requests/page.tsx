"use client";

import { useState, useEffect } from "react";
import { Sparkles, User, Clock, CheckCircle2, XCircle, Tag, Loader2 } from "lucide-react";

export default function SellerCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerModalId, setOfferModalId] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerNotes, setOfferNotes] = useState("");
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/custom-requests");
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModalId || !offerPrice || Number(offerPrice) <= 0) return;

    setIsSubmittingOffer(true);
    try {
      const res = await fetch(`/api/custom-requests/${offerModalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "OFFER_SENT",
          offeredPrice: Number(offerPrice),
          notes: offerNotes,
        }),
      });

      if (res.ok) {
        setOfferModalId(null);
        setOfferPrice("");
        setOfferNotes("");
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary" /> Permintaan Pesanan Custom
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola permintaan pesanan khusus dari calon pembeli dan berikan penawaran harga.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Belum ada permintaan pesanan custom dari pembeli.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === "PENDING";
            return (
              <div key={req.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Pembeli: <strong className="text-foreground">{req.buyer.name}</strong> ({req.buyer.email})</span>
                      <span>•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString("id-ID")}</span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground">{req.title}</h3>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    req.status === "ACCEPTED"
                      ? "bg-green-500/10 text-green-600"
                      : req.status === "OFFER_SENT"
                      ? "bg-amber-500/10 text-amber-600"
                      : req.status === "REJECTED"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {req.status === "ACCEPTED" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {req.status === "OFFER_SENT" && <Tag className="h-3.5 w-3.5" />}
                    {req.status === "REJECTED" && <XCircle className="h-3.5 w-3.5" />}
                    {req.status === "PENDING" && <Clock className="h-3.5 w-3.5" />}
                    {req.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {req.description}
                </p>

                {req.budget && (
                  <p className="text-xs text-muted-foreground">
                    Estimasi Anggaran Pembeli: <strong className="text-foreground">Rp {req.budget.toLocaleString("id-ID")}</strong>
                  </p>
                )}

                {req.offeredPrice && (
                  <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1">
                    <p className="text-muted-foreground">Penawaran Anda:</p>
                    <p className="font-bold text-foreground text-sm">Rp {req.offeredPrice.toLocaleString("id-ID")}</p>
                    {req.notes && <p className="italic text-muted-foreground">&ldquo;{req.notes}&rdquo;</p>}
                  </div>
                )}

                {isPending && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setOfferModalId(req.id)}
                      className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Tag className="h-4 w-4" />
                      Berikan Penawaran Harga
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Modal */}
      {offerModalId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-xl text-foreground">Beri Penawaran Harga Custom</h3>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Harga Penawaran (Rp)
                </label>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  placeholder="Contoh: 750000"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Catatan / Ketentuan (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder="Contoh: Estimasi pengerjaan 5 hari kerja, sudah termasuk paking kayu..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOfferModalId(null)}
                  className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer || !offerPrice}
                  className="px-5 py-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingOffer ? "Mengirim..." : "Kirim Penawaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
