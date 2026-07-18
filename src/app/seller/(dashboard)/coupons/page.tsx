"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Loader2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  Ticket,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountPercent: number | null;
  discountValue: number | null;
  minSpend: number;
  maxUsage: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function SellerCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "value">("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [minSpend, setMinSpend] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsCreating(true);

    try {
      const body: Record<string, unknown> = {
        code,
        minSpend: minSpend ? Number(minSpend) : 0,
        maxUsage: maxUsage ? Number(maxUsage) : null,
        expiresAt: expiresAt || null,
      };

      if (discountType === "percent") {
        body.discountPercent = Number(discountAmount);
      } else {
        body.discountValue = Number(discountAmount);
      }

      const res = await fetch("/api/seller/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setFormSuccess(`Kupon ${data.coupon.code} berhasil dibuat!`);
        setCode("");
        setDiscountAmount("");
        setMinSpend("");
        setMaxUsage("");
        setExpiresAt("");
        setShowForm(false);
        await fetchCoupons();
      } else {
        setFormError(data.error || "Gagal membuat kupon.");
      }
    } catch {
      setFormError("Terjadi kesalahan jaringan.");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await fetch(`/api/seller/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      await fetchCoupons();
    } catch {
      // silent
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Hapus kupon ini?")) return;
    try {
      await fetch(`/api/seller/coupons/${id}`, { method: "DELETE" });
      await fetchCoupons();
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Kupon & Promo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat dan kelola kode diskon untuk toko Anda.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
            setFormSuccess(null);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Buat Kupon Baru
        </button>
      </div>

      {/* Success Banner */}
      {formSuccess && (
        <div className="flex items-center gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
          {formSuccess}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Buat Kupon Baru
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Kode Kupon <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="Contoh: DISKON10"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-mono tracking-widest text-foreground uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Jenis Diskon <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-3">
                <label className={`flex-1 flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all text-sm ${discountType === "percent" ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border"}`}>
                  <input
                    type="radio"
                    name="discountType"
                    value="percent"
                    checked={discountType === "percent"}
                    onChange={() => setDiscountType("percent")}
                    className="hidden"
                  />
                  Persentase (%)
                </label>
                <label className={`flex-1 flex items-center gap-2 rounded-lg border px-4 py-2.5 cursor-pointer transition-all text-sm ${discountType === "value" ? "border-primary bg-primary/5 text-primary font-semibold" : "border-border"}`}>
                  <input
                    type="radio"
                    name="discountType"
                    value="value"
                    checked={discountType === "value"}
                    onChange={() => setDiscountType("value")}
                    className="hidden"
                  />
                  Nominal (Rp)
                </label>
              </div>
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {discountType === "percent" ? "Besar Diskon (%)" : "Besar Diskon (Rp)"}{" "}
                <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                required
                min="1"
                max={discountType === "percent" ? "100" : undefined}
                placeholder={discountType === "percent" ? "10" : "50000"}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Optional fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Min. Pembelian (Rp)
                </label>
                <input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Maks. Penggunaan
                </label>
                <input
                  type="number"
                  value={maxUsage}
                  onChange={(e) => setMaxUsage(e.target.value)}
                  min="1"
                  placeholder="Tidak terbatas"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Berlaku Hingga
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Buat Kupon
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center justify-center text-center">
          <Tag className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Belum ada kupon</h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Buat kupon diskon untuk menarik lebih banyak pembeli ke toko Anda.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground text-sm flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              {coupons.length} Kupon
            </h2>
          </div>
          <div className="divide-y divide-border/60">
            {coupons.map((coupon) => {
              const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
              const usageFull = coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage;

              return (
                <div key={coupon.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${coupon.active && !isExpired && !usageFull ? "bg-primary/10" : "bg-muted"}`}>
                      <Ticket className={`h-5 w-5 ${coupon.active && !isExpired && !usageFull ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-bold tracking-widest text-foreground">
                          {coupon.code}
                        </span>
                        {coupon.active && !isExpired && !usageFull ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">AKTIF</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {isExpired ? "KEDALUWARSA" : usageFull ? "HABIS" : "NONAKTIF"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>
                          Diskon:{" "}
                          <span className="font-semibold text-foreground">
                            {coupon.discountPercent
                              ? `${coupon.discountPercent}%`
                              : coupon.discountValue
                              ? formatRupiah(coupon.discountValue)
                              : "—"}
                          </span>
                        </span>
                        {Number(coupon.minSpend) > 0 && (
                          <span>
                            Min. belanja:{" "}
                            <span className="font-semibold text-foreground">{formatRupiah(Number(coupon.minSpend))}</span>
                          </span>
                        )}
                        <span>
                          Digunakan:{" "}
                          <span className="font-semibold text-foreground">
                            {coupon.usedCount}
                            {coupon.maxUsage !== null ? `/${coupon.maxUsage}` : ""}
                          </span>
                        </span>
                        {coupon.expiresAt && (
                          <span>
                            Berlaku hingga:{" "}
                            <span className="font-semibold text-foreground">
                              {new Date(coupon.expiresAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(coupon)}
                      title={coupon.active ? "Nonaktifkan" : "Aktifkan"}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {coupon.active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      title="Hapus kupon"
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
