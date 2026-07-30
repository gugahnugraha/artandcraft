import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, FileText, ExternalLink } from "lucide-react";
import DisputeResolutionButtons from "./DisputeResolutionButtons";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const disputedOrders = await prisma.order.findMany({
    where: { status: "DISPUTED" },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: {
            select: { title: true, photos: true, seller: { select: { storeName: true, userId: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-destructive" /> Resolusi Sengketa & Komplain
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar pesanan yang dikomplain pembeli. Tinjau bukti dan buat keputusan mediasi resmi platform.
        </p>
      </div>

      {/* Disputes List */}
      {disputedOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-foreground">Tidak Ada Sengketa Aktif</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Semua pesanan berjalan lancar tanpa ada komplain atau sengketa yang memerlukan tindakan admin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {disputedOrders.map((order) => {
            const sellerNames = Array.from(new Set(order.items.map((i) => i.product.seller.storeName))).join(", ");

            return (
              <div key={order.id} className="bg-card border border-destructive/30 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Order Meta Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                  <div>
                    <span className="text-xs font-mono font-bold text-primary">
                      ORDER #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Diajukan oleh: <strong>{order.user.name}</strong> ({order.user.email}) · {format(new Date(order.updatedAt), "d MMMM yyyy HH:mm", { locale: idLocale })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Nilai Sengketa:</span>
                    <p className="text-lg font-black text-foreground">
                      Rp {Number(order.grandTotal).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Dispute Reason & Proof */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-destructive/5 p-4 rounded-xl border border-destructive/20">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-destructive mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Alasan Komplain Pembeli
                    </h4>
                    <p className="text-xs text-foreground leading-relaxed italic font-medium">
                      &ldquo;{order.disputeReason || "Tidak ada alasan spesifik."}&rdquo;
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-primary" /> Bukti Foto Unboxing / Kerusakan
                    </h4>
                    {order.disputeProof.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Tidak ada foto bukti diunggah.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {order.disputeProof.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-background px-3 py-1.5 rounded-lg border border-border"
                          >
                            Buka Bukti #{idx + 1} <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items & Store */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Toko Terkait: <span className="text-foreground">{sellerNames}</span>
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs p-2.5 bg-muted/30 rounded-lg">
                        <span className="font-semibold text-foreground">{item.product.title}</span>
                        <span className="text-muted-foreground">{item.quantity}x @ Rp {Number(item.price).toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Action Buttons Client Component */}
                <DisputeResolutionButtons orderId={order.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
