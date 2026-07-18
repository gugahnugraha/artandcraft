"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface AskSellerButtonProps {
  sellerProfileId: string;
  productId?: string;
  storeName?: string;
  variant?: "default" | "outline" | "icon";
  className?: string;
}

export default function AskSellerButton({
  sellerProfileId,
  productId,
  storeName,
  variant = "default",
  className = "",
}: AskSellerButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const displayStoreName = storeName || t.header.artisan;

  const handleClick = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerProfileId,
          productId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/dashboard/messages?id=${data.conversationId}`);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={`${t.product.ask_seller} (${displayStoreName})`}
        className={`rounded-xl border border-border bg-card h-[52px] w-[52px] flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 ${className}`}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 ${className}`}
      >
        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
        <span>{t.product.ask_seller}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50 ${className}`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4 text-primary" />}
      <span>{t.product.ask_seller} ({displayStoreName})</span>
    </button>
  );
}
