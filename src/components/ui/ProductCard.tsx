"use client";

import Link from "next/link";
import { Star, Heart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount: number;
  photos: string[];
  categoryName: string;
  sellerName: string;
  location?: string;
  rating?: number;
  reviewsCount?: number;
}

export default function ProductCard({
  title,
  slug,
  price,
  discount,
  photos,
  categoryName,
  sellerName,
  rating = 4.9,
  reviewsCount = 18,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <Link href={`/produk/${slug}`} className="group flex flex-col block relative w-full">
      
      {/* Image container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-muted/30 rounded-xl overflow-hidden mb-2 transition-all">
        {photos && photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[0]}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-muted/40">
            <span className="font-serif text-3xl font-light text-muted-foreground/30">
              {categoryName ? categoryName.charAt(0) : title.charAt(0)}
            </span>
          </div>
        )}

        {/* Wishlist Button (Always visible on hover, or always visible) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm hover:scale-105 active:scale-95 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
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
              <span className="font-bold text-foreground text-sm">
                Rp {finalPrice.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                Rp {price.toLocaleString("id-ID")}
              </span>
              <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-sm">
                {discount}% OFF
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
