"use client";

import { useState } from "react";
import { Loader2, Archive, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminProductModerateButtonsProps {
  productId: string;
  currentStatus: string;
}

export default function AdminProductModerateButtons({ productId, currentStatus }: AdminProductModerateButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleStatus = async () => {
    const nextStatus = currentStatus === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
    const confirmMsg =
      nextStatus === "ARCHIVED"
        ? "Apakah Anda yakin ingin MENGARSIPKAN (takedown) produk ini?"
        : "Apakah Anda yakin ingin MENGAKTIFKAN kembali produk ini?";

    if (!confirm(confirmMsg)) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, reason: "Ditolak / Diarsipkan oleh Admin" }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal memperbarui status produk.");
      }
    } catch {
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleStatus}
      disabled={isLoading}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
        currentStatus === "ACTIVE"
          ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
          : "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : currentStatus === "ACTIVE" ? (
        <>
          <Archive className="h-3 w-3" /> Takedown
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3" /> Aktifkan
        </>
      )}
    </button>
  );
}
