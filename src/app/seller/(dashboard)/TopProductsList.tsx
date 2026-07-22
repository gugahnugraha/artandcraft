"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface TopProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string | null;
  totalSold: number;
  totalRevenue: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export default function TopProductsList({ products }: TopProductsListProps) {
  const { t } = useLanguage();
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/10 rounded-xl border border-dashed border-border h-[300px]">
        <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">{t.seller_dashboard.prod_no_data}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {products.map((product, index) => (
        <Link
          key={product.id}
          href={`/produk/${product.slug}`}
          target="_blank"
          className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-colors group"
        >
          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform" />
            ) : (
              <Package className="h-5 w-5 text-muted-foreground/50" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
              {product.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{product.totalSold}{t.seller_dashboard.sold}</span>
              <span>•</span>
              <span>Rp {product.price.toLocaleString("id-ID")}</span>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground mb-0.5">{t.seller_dashboard.revenue}</p>
            <p className="font-bold text-sm text-green-600 dark:text-green-500">
              Rp {product.totalRevenue.toLocaleString("id-ID")}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
