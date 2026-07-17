"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteProduct } from "@/features/products/actions/delete-product";
import { Search, Edit2, Trash2, ShieldAlert, Sparkles, Filter, Loader2, AlertCircle } from "lucide-react";
import { ProductStatus } from "@/features/products/schemas";

interface SerializedProduct {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  price: number;
  discount: number;
  stock: number;
  status: ProductStatus;
  photos: string[];
  category: {
    name: string;
  };
  createdAt: Date;
}

export default function ProductListClient({ initialProducts }: { initialProducts: SerializedProduct[] }) {
  const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (productId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini secara permanen?")) return;

    setDeletingId(productId);
    setError(null);

    try {
      const res = await deleteProduct(productId);
      if (res?.error) {
        setError(res.error);
        setDeletingId(null);
      } else {
        setProducts(products.filter((p) => p.id !== productId));
        setDeletingId(null);
      }
    } catch (err) {
      setError("Gagal menghapus produk karena masalah jaringan.");
      setDeletingId(null);
    }
  };

  // Filter products based on search and status selects
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.sku && prod.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || prod.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Error notification */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Cari nama produk atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-background py-2 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all w-full sm:w-auto"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="DRAFT">Draf</option>
            <option value="OUT_OF_STOCK">Habis</option>
            <option value="ARCHIVED">Diarsipkan</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card">
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">Produk Tidak Ditemukan</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {products.length === 0
              ? "Toko Anda belum memiliki produk terdaftar. Mulai unggah produk kerajinan tangan Anda sekarang."
              : "Tidak ada produk yang cocok dengan pencarian atau filter Anda."}
          </p>
          {products.length === 0 && (
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-primary/95 transition-all shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Unggah Produk Pertama</span>
            </Link>
          )}
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const hasDiscount = prod.discount > 0;
            const discountedPrice = prod.price * (1 - prod.discount / 100);

            return (
              <div
                key={prod.id}
                className="group relative rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Image / Thumbnail placeholder */}
                <div className="aspect-video w-full bg-primary/5 border-b border-border/40 relative flex items-center justify-center overflow-hidden">
                  {prod.photos && prod.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={prod.photos[0]}
                      alt={prod.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-lg font-serif text-primary/30 group-hover:scale-105 transition-transform duration-300">
                      {prod.title.split(" ").slice(-1)[0]}
                    </span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm ${
                      prod.status === "ACTIVE"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                        : prod.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        : "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-200"
                    }`}
                  >
                    {prod.status === "ACTIVE"
                      ? "Aktif"
                      : prod.status === "DRAFT"
                      ? "Draf"
                      : prod.status === "OUT_OF_STOCK"
                      ? "Stok Habis"
                      : "Diarsipkan"}
                  </span>

                  {/* SKU */}
                  {prod.sku && (
                    <span className="absolute bottom-3 right-3 text-[9px] font-mono font-bold bg-background/80 text-foreground px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                      SKU: {prod.sku}
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
                    {prod.category.name}
                  </span>
                  <h3 className="font-semibold text-foreground text-sm line-clamp-2 min-h-[40px] mb-3 group-hover:text-primary transition-colors">
                    {prod.title}
                  </h3>

                  {/* Prices & Stock */}
                  <div className="flex items-baseline justify-between border-t border-border/40 pt-4 mt-auto">
                    <div>
                      {hasDiscount && (
                        <span className="block text-xs text-muted-foreground line-through">
                          Rp {prod.price.toLocaleString("id-ID")}
                        </span>
                      )}
                      <span className="text-base font-bold text-foreground">
                        Rp {(hasDiscount ? discountedPrice : prod.price).toLocaleString("id-ID")}
                      </span>
                    </div>

                    <span className="text-xs text-muted-foreground font-medium">
                      Stok: <strong className="text-foreground">{prod.stock} unit</strong>
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 border-t border-border/40 pt-4 mt-4 text-xs font-semibold">
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-1 rounded-md border border-border bg-card py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Edit (Milestone Selanjutnya)"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(prod.id)}
                      disabled={deletingId === prod.id}
                      className="rounded-md border border-destructive/20 text-destructive bg-destructive/5 p-2 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 disabled:opacity-50"
                    >
                      {deletingId === prod.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
