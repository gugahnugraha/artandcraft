"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";

interface PromoPopupProps {
  announcement: string;
}

export default function PromoPopup({ announcement }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isClosed = sessionStorage.getItem("promo_closed_" + announcement);
    if (!isClosed && announcement) {
      // Delay to show popup smoothly after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [announcement]);

  if (!isVisible || !announcement) return null;

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("promo_closed_" + announcement, "true");
  };

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-[100] max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/90 p-5 text-white shadow-2xl border border-primary/20 backdrop-blur-md">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Tutup Promo"
        >
          <X className="h-4 w-4 text-white/90" />
        </button>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/15 rounded-xl shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5 text-amber-200 animate-pulse" />
          </div>
          <div className="space-y-1.5 pr-4">
            <h4 className="font-bold text-sm text-white font-serif tracking-wide">Pemberitahuan</h4>
            <p className="text-xs text-white/90 leading-relaxed font-medium">
              {announcement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
