"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import CustomRequestModal from "@/components/ui/CustomRequestModal";

interface CustomRequestButtonProps {
  sellerProfileId: string;
  storeName: string;
}

export default function CustomRequestButton({ sellerProfileId, storeName }: CustomRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-white transition-all shadow-sm"
      >
        <Sparkles className="h-3 w-3" />
        <span>Minta Pesanan Custom</span>
      </button>

      <CustomRequestModal
        sellerProfileId={sellerProfileId}
        storeName={storeName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
