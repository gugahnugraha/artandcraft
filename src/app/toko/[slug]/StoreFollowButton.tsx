"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

interface StoreFollowButtonProps {
  storeId: string;
  storeSlug: string;
  initialFollowing: boolean;
  isLoggedIn: boolean;
}

export default function StoreFollowButton({
  storeId,
  storeSlug,
  initialFollowing,
  isLoggedIn,
}: StoreFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/toko/${storeSlug}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/follow`, {
        method: following ? "DELETE" : "POST",
      });

      if (res.ok) {
        setFollowing((prev) => !prev);
        router.refresh();
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all shadow-sm disabled:opacity-50 ${
        following
          ? "bg-primary/10 text-primary border border-primary hover:bg-primary/20"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 transition-all ${following ? "fill-primary" : ""}`} />
      )}
      {following ? "Mengikuti" : "Ikuti Toko"}
    </button>
  );
}
