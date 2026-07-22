"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/store/cart";

/**
 * CartSync — auto-syncs Zustand local cart with DB on login.
 *
 * Strategy:
 * 1. On user login: POST local cart items to /api/cart (merge into DB).
 * 2. If local cart is empty on login: GET /api/cart and hydrate Zustand.
 *
 * Mount this once at the root layout level inside SessionProvider.
 */
export function useCartSync() {
  const { data: session, status } = useSession();
  const { items, clearCart } = useCart();
  const synced = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user || synced.current) return;

    synced.current = true;

    const sync = async () => {
      if (items.length > 0) {
        // Push local cart to DB
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });
      } else {
        // Pull cloud cart and hydrate local Zustand store
        const res = await fetch("/api/cart");
        if (res.ok) {
          const data = await res.json();
          if (data.items?.length > 0) {
            const { addItem } = useCart.getState();
            for (const item of data.items) {
              addItem(
                {
                  id: item.id,
                  productId: item.productId,
                  variantId: item.variantId,
                  variantName: item.variantName,
                  title: item.title,
                  price: item.price,
                  photo: item.photo,
                  sellerName: item.sellerName,
                  maxStock: item.maxStock,
                },
                item.quantity
              );
            }
          }
        }
      }
    };

    sync().catch(console.error);
  }, [status, session, items]);

  // Reset sync flag when user logs out
  useEffect(() => {
    if (status === "unauthenticated") {
      synced.current = false;
    }
  }, [status]);
}
