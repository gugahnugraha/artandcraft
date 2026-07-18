"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Loader2, CheckCircle2 } from "lucide-react";

interface CustomRequestModalProps {
  sellerProfileId: string;
  storeName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomRequestModal({
  sellerProfileId,
  storeName,
  isOpen,
  onClose,
}: CustomRequestModalProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerProfileId,
          title,
          description,
          budget: budget ? Number(budget) : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
          router.push("/dashboard/custom-requests");
        }, 1500);
      } else {
        setError(data.error || "Gagal mengajukan pesanan custom.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-serif font-bold text-xl text-foreground">
            Minta Pesanan Custom ke {storeName}
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Jelaskan kerajinan khusus yang ingin Anda buat. Pengrajin akan meninjau dan memberikan penawaran harga.
        </p>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <CheckCircle2 className="h-12 w-12 text-green-500 animate-bounce" />
            <h4 className="font-bold text-foreground">Permintaan Berhasil Dikirim!</h4>
            <p className="text-xs text-muted-foreground">Mengarahkan Anda ke dasbor pesanan custom...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Judul Pesanan Custom
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Ukiran Kayu Nama Pasangan 30cm"
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Rincian & Spesifikasi Pesanan
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan ukuran, bahan, warna, tulisan khusus, atau detail lainnya..."
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Estimasi Anggaran (Opsional - Rp)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Contoh: 500000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="px-6 py-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>Kirim Permintaan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
