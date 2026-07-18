"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        setErrorMsg("Gagal memperbarui status pesanan.");
      }
    } catch (error) {
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
          Terima & Proses Pesanan
        </button>
      </div>
    );
  }

  if (currentStatus === "PROCESSING") {
    return (
      <div className="space-y-2">
        {errorMsg && <p className="text-xs text-destructive text-center">{errorMsg}</p>}
        <button 
          onClick={() => updateStatus("SHIPPED")}
          disabled={isUpdating}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Tandai Sudah Dikirim
        </button>
      </div>
    );
  }

  if (currentStatus === "SHIPPED") {
    return (
      <button 
        disabled
        className="w-full rounded-lg bg-green-500/20 py-2 text-sm font-semibold text-green-700 cursor-not-allowed text-center"
      >
        Pesanan Dalam Perjalanan
      </button>
    );
  }

  return null;
}
