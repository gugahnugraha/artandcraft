"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Truck, CheckCircle2 } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  currentCourier?: string | null;
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  currentTrackingNumber,
  currentCourier,
}: OrderStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [courier, setCourier] = useState(currentCourier || "JNE");
  const router = useRouter();

  const updateStatus = async (newStatus: string, extra?: Record<string, string>) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, ...extra }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Gagal memperbarui status pesanan.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus === "AWAITING_PAYMENT") {
    return (
      <button
        disabled
        className="w-full rounded-lg bg-muted py-2 text-sm font-semibold text-muted-foreground cursor-not-allowed text-center"
      >
        Menunggu Pembayaran
      </button>
    );
  }

  if (currentStatus === "PAID") {
    return (
      <div className="space-y-2">
        {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
        <button
          onClick={() => updateStatus("PROCESSING")}
          disabled={isUpdating}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Terima &amp; Proses Pesanan
        </button>
      </div>
    );
  }

  if (currentStatus === "PROCESSING") {
    if (showShipForm) {
      return (
        <div className="space-y-3">
          {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Kurir Pengiriman
            </label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="JNE">JNE</option>
              <option value="J&T">J&amp;T Express</option>
              <option value="SiCepat">SiCepat</option>
              <option value="AnterAja">AnterAja</option>
              <option value="Pos Indonesia">Pos Indonesia</option>
              <option value="TIKI">TIKI</option>
              <option value="GoSend">GoSend</option>
              <option value="GrabExpress">GrabExpress</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Nomor Resi (Opsional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Contoh: JNE-1234567890"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowShipForm(false)}
              className="flex-1 rounded-lg border border-border bg-background py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() =>
                updateStatus("SHIPPED", {
                  trackingNumber: trackingNumber.trim(),
                  shippingCourier: courier,
                })
              }
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
              Kirim Sekarang
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
        <button
          onClick={() => setShowShipForm(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm"
        >
          <Truck className="h-4 w-4" />
          Tandai Sudah Dikirim
        </button>
      </div>
    );
  }

  if (currentStatus === "SHIPPED") {
    return (
      <div className="space-y-2">
        <div className="w-full rounded-lg bg-green-500/10 py-2 text-sm font-semibold text-green-700 text-center flex items-center justify-center gap-1.5">
          <CheckCircle2 className="h-4 w-4" />
          Pesanan Dalam Perjalanan
        </div>
        {currentTrackingNumber && (
          <p className="text-xs text-center text-muted-foreground">
            Resi: <span className="font-mono font-semibold text-foreground">{currentTrackingNumber}</span>
          </p>
        )}
      </div>
    );
  }

  if (currentStatus === "DELIVERED") {
    return (
      <div className="w-full rounded-lg bg-primary/10 py-2 text-sm font-semibold text-primary text-center flex items-center justify-center gap-1.5">
        <CheckCircle2 className="h-4 w-4" />
        Pesanan Selesai
      </div>
    );
  }

  return null;
}
