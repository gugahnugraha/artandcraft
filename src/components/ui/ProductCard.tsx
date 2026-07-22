"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  id?: string;
  title?: string;
  slug?: string;
  price?: number;
  discount?: number;
  photos?: string[];
  categoryName?: string;
  sellerName?: string;
  location?: string;
  rating?: number;
  reviewsCount?: number;
  product?: any;
}

export default function ProductCard(props: ProductCardProps) {
  const { t } = useLanguage();
  const p = props.product || props;
  const title = p.title || "Produk Kerajinan";
  const slug = p.slug || "";
  const price = Number(p.price || 0);
  const discount = Number(p.discount || 0);
  const photos = p.photos || [];
  const categoryName = p.categoryName || p.category?.name || "";
  const sellerName = p.sellerName || p.seller?.storeName || "";
  const rating = p.rating || 4.9;
  const reviewsCount = p.reviewsCount || 18;

  const [isWishlisted, setIsWishlisted] = useState(false);
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <Link href={`/produk/${slug}`} className="group flex flex-col block relative w-full hover-lift p-2 -m-2 rounded-2xl transition-all">
      
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-muted/30 rounded-xl overflow-hidden mb-3 transition-all group-hover:shadow-md">
        {photos && photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[0]}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-muted/40 group-hover:scale-105 transition-transform duration-500">
            <span className="font-serif text-3xl font-light text-muted-foreground/30">
              {categoryName ? categoryName.charAt(0) : (title?.charAt(0) || "A")}
            </span>
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[2px]">
          <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg border border-white/40">
            {t.product.quick_view}
          </span>
        </div>

        {/* Wishlist Button (Always visible on hover, or always visible) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm hover:scale-110 active:scale-95 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label="Add to Wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground/80"
            }`}
          />
        </button>
      </div>

      {/* Info container */}
      <div className="flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-1 group-hover:underline decoration-foreground/30 underline-offset-4">
          {title}
        </h3>
        
        {/* Seller & Rating */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs text-muted-foreground">{sellerName}</span>
          {rating > 0 && (
            <div className="flex items-center gap-0.5 ml-auto">
              <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-[10px] text-muted-foreground ml-0.5">({reviewsCount})</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-1 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="font-bold text-primary text-sm">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                Rp {price.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                -{discount}%
              </span>
            </>
          ) : (
            <span className="font-bold text-foreground text-sm">
              Rp {price.toLocaleString("id-ID")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
