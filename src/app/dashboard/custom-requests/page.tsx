"use client";

import { useState, useEffect } from "react";
import { Sparkles, Store, Clock, CheckCircle2, XCircle, Tag, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BuyerCustomRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleRespondOffer = async (id: string, status: "ACCEPTED" | "REJECTED") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/custom-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
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
        <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Pesanan Custom Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau status penawaran harga dan diskusi pesanan khusus yang Anda minta ke para pengrajin.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Belum Ada Pesanan Custom</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            Kunjungi toko pengrajin favorit Anda dan tekan tombol &ldquo;Minta Pesanan Custom&rdquo; untuk membuat karya unik sesuai keinginan Anda.
          </p>
          <Link
            href="/search"
            className="rounded-xl bg-primary px-6 py-2.5 font-bold text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
          >
            Cari Toko Pengrajin
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Store className="h-3.5 w-3.5 text-primary" />
                    <span>Toko: <strong className="text-foreground">{req.sellerProfile.storeName}</strong></span>
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
                  {req.status === "OFFER_SENT" ? "Penawaran Diterima" : req.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {req.description}
              </p>

              {req.budget && (
                <p className="text-xs text-muted-foreground">
                  Estimasi Anggaran Anda: <strong className="text-foreground">Rp {req.budget.toLocaleString("id-ID")}</strong>
                </p>
              )}

              {/* Offer Card if OFFER_SENT */}
              {req.status === "OFFER_SENT" && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Penawaran Harga dari Pengrajin:</p>
                      <p className="font-serif font-bold text-2xl text-amber-900 dark:text-amber-200">
                        Rp {req.offeredPrice.toLocaleString("id-ID")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRespondOffer(req.id, "REJECTED")}
                        disabled={processingId === req.id}
                        className="px-4 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleRespondOffer(req.id, "ACCEPTED")}
                        disabled={processingId === req.id}
                        className="px-5 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                      >
                        {processingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        Setujui Penawaran
                      </button>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                      Catatan Toko: &ldquo;{req.notes}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {req.status === "ACCEPTED" && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-700 dark:text-green-300 flex items-center justify-between">
                  <span>Penawaran disetujui seharga <strong>Rp {req.offeredPrice?.toLocaleString("id-ID")}</strong>. Pengrajin akan memproses pesanan Anda.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
