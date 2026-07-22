"use client";

import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddToCartButtonProps {
  product: {
    id: string;
    title: string;
    price: number;
    discount: number;
    stock: number;
    photos: string[];
    seller: {
      storeName: string;
    };
    variants?: {
      id: string;
      name: string;
      value: string;
      stock: number;
      price: number | null;
    }[];
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const { t } = useLanguage();

  const hasVariants = product.variants && product.variants.length > 0;
  const selectedVariant = hasVariants ? product.variants?.find((v) => v.id === selectedVariantId) : null;

  const basePrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price);
  const discount = Number(product.discount);
  const finalPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice;
  const currentStock = hasVariants ? (selectedVariant?.stock || 0) : product.stock;

  const handleAddToCart = () => {
    if (currentStock <= 0) return;
    if (hasVariants && !selectedVariantId) {
      alert("Silakan pilih varian terlebih dahulu");
      return;
    }
    
    setIsAdding(true);
    addItem({
      id: `${product.id}${selectedVariantId ? '-' + selectedVariantId : ''}`,
      productId: product.id,
      variantId: selectedVariantId || undefined,
      variantName: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : undefined,
      title: product.title,
      price: finalPrice,
      photo: product.photos[0] || "",
      sellerName: product.seller.storeName,
      maxStock: currentStock,
    });
    
    // Simulate a tiny delay for UX
    setTimeout(() => {
      setIsAdding(false);
    }, 400);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-4">
      {hasVariants && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-foreground">
            Pilih Varian {product.variants?.[0]?.name ? `(${product.variants[0].name})` : ""}
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants?.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                disabled={v.stock <= 0}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  selectedVariantId === v.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {v.value} {v.stock <= 0 && "(Habis)"}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={currentStock <= 0 || isAdding}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {currentStock <= 0 ? t.product.out_of_stock : t.product.add_to_cart}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={currentStock <= 0}
        className="rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {t.product.buy_now}
      </button>
      </div>
    </div>
  );
}
