"use client";

import { useEffect, useState, useRef } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { Sparkles, Loader2 } from "lucide-react";

interface RelatedProductsProps {
  slug: string;
}

export default function RelatedProducts({ slug }: RelatedProductsProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(`/api/products/${slug}/recommendations`);
        if (res.ok) {
          const { data } = await res.json();
          setProducts(data || []);
        }
      } catch (error) {
        console.error("Failed to load recommendations", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [slug]);

  if (loading) {
    return (
      <div className="mt-16 py-10 bg-accent/20 rounded-2xl flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Mungkin Anda Suka (Pilihan Cerdas)
        </h2>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar group"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[280px] sm:min-w-[320px] max-w-[320px] shrink-0 snap-start">
              <ProductCard product={product} layout="horizontal" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
