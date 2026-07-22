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
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const { t } = useLanguage();

  const price = Number(product.price);
  const discount = Number(product.discount);
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    setIsAdding(true);
    addItem({
      id: product.id,
      title: product.title,
      price: finalPrice,
      photo: product.photos[0] || "",
      sellerName: product.seller.storeName,
      maxStock: product.stock,
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
    <div className="flex gap-3 pt-2">
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0 || isAdding}
        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
        {product.stock <= 0 ? t.product.out_of_stock : t.product.add_to_cart}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={product.stock <= 0}
        className="rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {t.product.buy_now}
      </button>
    </div>
  );
}
