"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, RotateCcw, ChevronDown, Check } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface SearchFilterSidebarProps {
  categories: CategoryOption[];
}

export default function SearchFilterSidebar({ categories }: SearchFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current query params
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("min") || "";
  const currentMaxPrice = searchParams.get("max") || "";
  const currentSort = searchParams.get("sort") || "newest";

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // Helper to build URL with updated search params
  const applyFilter = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    router.push(`/search?${newParams.toString()}`);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilter({
      min: minPrice ? minPrice : null,
      max: maxPrice ? maxPrice : null,
    });
  };

  const handleReset = () => {
    setMinPrice("");
    setMaxPrice("");
    router.push("/search");
  };

  return (
    <>
      {/* Mobile Filter Trigger Button */}
      <div className="lg:hidden flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
        >
          <Filter className="h-4 w-4 text-primary" />
          Filter & Urutkan
        </button>

        {/* Sort Select on Mobile */}
        <select
          value={currentSort}
          onChange={(e) => applyFilter({ sort: e.target.value })}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="newest">Terbaru</option>
          <option value="price_low">Harga: Terendah</option>
          <option value="price_high">Harga: Tertinggi</option>
        </select>
      </div>

      {/* Filter Content Container */}
      <div
        className={`space-y-6 ${
          mobileFilterOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Filter Produk
          </h3>
          {(currentCategory || currentMinPrice || currentMaxPrice || currentQuery || currentSort !== "newest") && (
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Sort Filter (Desktop) */}
        <div className="hidden lg:block space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Urutkan Berdasarkan
          </label>
          <select
            value={currentSort}
            onChange={(e) => applyFilter({ sort: e.target.value })}
            className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="newest">Paling Baru</option>
            <option value="price_low">Harga: Terendah &rarr; Tertinggi</option>
            <option value="price_high">Harga: Tertinggi &rarr; Terendah</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Kategori
          </label>
          <div className="space-y-1">
            <button
              onClick={() => applyFilter({ category: null })}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                !currentCategory
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              }`}
            >
              <span>Semua Kategori</span>
              {!currentCategory && <Check className="h-4 w-4" />}
            </button>

            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => applyFilter({ category: isSelected ? null : cat.slug })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Rentang Harga (Rp)
          </label>
          <form onSubmit={handlePriceApply} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Terapkan Harga
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
