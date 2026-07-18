"use client";

import { useCartSync } from "@/hooks/useCartSync";

/**
 * CartSyncProvider — mounts the cart sync hook at root level.
 * Must be placed inside SessionProvider.
 */
export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
  useCartSync();
  return <>{children}</>;
}
