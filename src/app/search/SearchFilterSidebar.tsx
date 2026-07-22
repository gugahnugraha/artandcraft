"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Filter, RotateCcw, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories?: Array<{ id: string; name: string; slug: string }>;
}

interface SearchFilterSidebarProps {
  categories: CategoryOption[];
}

export default function SearchFilterSidebar({ categories }: SearchFilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Read current query params
  const currentQuery = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSubcategory = searchParams.get("subcategory") || "";
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
          {t.search.mobile_filter_btn}
        </button>

        {/* Sort Select on Mobile */}
        <select
          value={currentSort}
          onChange={(e) => applyFilter({ sort: e.target.value })}
          className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="newest">{t.search.sort_latest}</option>
          <option value="price_low">{t.search.sort_price_low}</option>
          <option value="price_high">{t.search.sort_price_high}</option>
        </select>
      </div>

      {/* Filter Content Container */}
      <div
        className={`space-y-6 lg:p-6 lg:glass-card lg:bg-background/80 lg:rounded-[2rem] lg:border lg:border-border/50 lg:shadow-sm ${
          mobileFilterOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Filter className="h-4 w-4" />
            </div>
            {t.search.title}
          </h3>
          {(currentCategory || currentMinPrice || currentMaxPrice || currentQuery || currentSort !== "newest") && (
            <button
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors font-medium bg-secondary/50 px-2.5 py-1 rounded-full hover:bg-destructive/10"
            >
              <RotateCcw className="h-3 w-3" />
              {t.search.reset_filter}
            </button>
          )}
        </div>

        {/* Sort Filter (Desktop) */}
        <div className="hidden lg:block space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.search.sort_by}
          </label>
          <select
            value={currentSort}
            onChange={(e) => applyFilter({ sort: e.target.value })}
            className="w-full rounded-xl border border-border bg-background py-2.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none transition-all cursor-pointer"
          >
            <option value="newest">{t.search.sort_latest}</option>
            <option value="price_low">{t.search.sort_price_low}</option>
            <option value="price_high">{t.search.sort_price_high}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {t.search.filter_category}
          </label>
          <div className="space-y-1.5">
            <button
              onClick={() => applyFilter({ category: null })}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-all ${
                !currentCategory
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover-lift"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              }`}
            >
              <span>{t.search.all_categories}</span>
              {!currentCategory && <Check className="h-4 w-4" />}
            </button>

            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <button
                    onClick={() => applyFilter({ category: isSelected ? null : cat.slug, subcategory: null })}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover-lift"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>

                  {/* Subcategories Accordion */}
                  {isSelected && cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pl-4 space-y-1 border-l-2 border-primary/20 ml-4 my-2">
                      {cat.subcategories.map((sub) => {
                        const isSubSelected = currentSubcategory === sub.slug;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => applyFilter({ subcategory: isSubSelected ? null : sub.slug })}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                              isSubSelected
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                            }`}
                          >
                            <span>{sub.name}</span>
                            {isSubSelected && <Check className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t.search.price_range} (Rp)
          </label>
          <form onSubmit={handlePriceApply} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder={t.search.min_price}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                placeholder={t.search.max_price}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-xs text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              {t.search.apply_filter}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
