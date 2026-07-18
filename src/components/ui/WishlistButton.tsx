"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

export default function WishlistButton({ productId, className = "", showText = true }: WishlistButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }
    
    // Fetch wishlist status
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setIsLiked(data.items.some((item: any) => item.productId === productId));
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [productId, status]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }

    setIsToggling(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.action === "added");
      }
    } catch (err) {
      console.error("Failed to toggle wishlist", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isToggling}
      className={`flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-6 py-3 font-bold text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading || isToggling ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 ${isLiked ? "fill-primary text-primary" : "text-primary"}`} />
      )}
      {showText && <span>{isLiked ? "Tersimpan" : "Wishlist"}</span>}
    </button>
  );
}
