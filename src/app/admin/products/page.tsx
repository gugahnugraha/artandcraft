import { prisma } from "@/lib/prisma";
import { Package, Search, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";
import AdminProductModerateButtons from "./AdminProductModerateButtons";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const { q, status } = await searchParams;

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { seller: { storeName: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      seller: { select: { storeName: true, storeSlug: true } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" /> Moderasi Katalog Produk
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola dan tinjau seluruh produk kerajinan yang terdaftar di pasar ArtAndCraft.id.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        <form action="/admin/products" method="GET" className="relative w-full sm:max-w-xs">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Cari produk atau nama toko..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
          />
        </form>

        <form action="/admin/products" method="GET" className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {q && <input type="hidden" name="q" value={q} />}
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            name="status"
            defaultValue={status || "ALL"}
            className="rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none w-full sm:w-auto"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif (ACTIVE)</option>
            <option value="ARCHIVED">Diarsipkan (ARCHIVED)</option>            <option value="DRAFT">Draft</option>
            <option value="OUT_OF_STOCK">Stok Habis</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              Tidak ada produk yang cocok dengan pencarian.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-xs font-bold text-muted-foreground uppercase">
                  <th className="p-4">Produk</th>
                  <th className="p-4">Toko</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderasi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border/50 hover:bg-muted/10 last:border-0">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Link href={`/produk/${product.slug}`} target="_blank" className="hover:text-primary transition-colors flex items-center gap-1">
                          {product.title} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{product.seller.storeName}</td>
                    <td className="p-4 text-muted-foreground">{product.category.name}</td>
                    <td className="p-4 font-bold text-foreground">
                      Rp {Number(product.price).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 font-mono font-semibold">{product.stock} pcs</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        product.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : product.status === "ARCHIVED"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <AdminProductModerateButtons productId={product.id} currentStatus={product.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
