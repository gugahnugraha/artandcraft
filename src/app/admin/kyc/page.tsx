import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ShieldCheck, FileCheck, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import AdminKycActionButtons from "./AdminKycActionButtons";

export const dynamic = "force-dynamic";

export default async function AdminKycPage() {
  const sellerProfiles = await prisma.sellerProfile.findMany({
    where: {
      kycStatus: { in: ["PENDING", "VERIFIED", "REJECTED"] },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const pendingSellers = sellerProfiles.filter((s) => s.kycStatus === "PENDING");
  const processedSellers = sellerProfiles.filter((s) => s.kycStatus !== "PENDING");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" /> Verifikasi KYC Dokumen Toko
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tinjau dokumen KTP penjual untuk menyetujui akses penarikan dana dompet toko.
        </p>
      </div>

      {/* Pending Submissions */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-amber-500" />
          Pengajuan Menunggu Verifikasi ({pendingSellers.length})
        </h2>

        {pendingSellers.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Tidak ada pengajuan KYC yang sedang menunggu verifikasi saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingSellers.map((seller) => (
              <div key={seller.id} className="bg-card border border-amber-500/30 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{seller.storeName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Pemilik: {seller.user.name} ({seller.user.email}) · Toko Slug: <code>{seller.storeSlug}</code>
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full border border-amber-500/20">
                    PENDING REVIEW
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-muted-foreground font-semibold">Nomor KTP (16 Digit):</span>
                    <p className="font-mono text-sm font-bold text-foreground mt-0.5">{seller.ktpNumber || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Dokumen Foto KTP:</span>
                    <div className="mt-1">
                      {seller.ktpImage ? (
                        <a
                          href={seller.ktpImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline bg-background px-3 py-1.5 rounded-lg border border-border"
                        >
                          Lihat Foto KTP <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="italic text-muted-foreground">Belum diunggah</span>
                      )}
                    </div>
                  </div>
                </div>

                <AdminKycActionButtons sellerProfileId={seller.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Submissions */}
      {processedSellers.length > 0 && (
        <div className="pt-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Riwayat Verifikasi Selesai ({processedSellers.length})</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b border-border font-bold text-muted-foreground uppercase">
                    <th className="p-3">Toko</th>
                    <th className="p-3">No. KTP</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Catatan Admin</th>
                    <th className="p-3">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {processedSellers.map((seller) => (
                    <tr key={seller.id} className="border-b border-border/50 hover:bg-muted/10 last:border-0">
                      <td className="p-3 font-semibold text-foreground">{seller.storeName}</td>
                      <td className="p-3 font-mono">{seller.ktpNumber || "-"}</td>
                      <td className="p-3">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          seller.kycStatus === "VERIFIED" ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"
                        }`}>
                          {seller.kycStatus}
                        </span>
                      </td>
                      <td className="p-3 italic text-muted-foreground">{seller.kycNotes || "-"}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(seller.updatedAt), "d MMM yyyy", { locale: idLocale })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
