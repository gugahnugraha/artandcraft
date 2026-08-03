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
    <div className="fixed bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] sm:w-auto sm:max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <div className="flex items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-full bg-background/95 p-1.5 sm:p-2 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border/60 backdrop-blur-md">
        
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 overflow-hidden">
          <div className="p-1.5 bg-primary/10 rounded-full shrink-0">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-foreground/90 truncate">
            {announcement}
          </p>
        </div>
        
        <button 
          onClick={handleClose}
          className="shrink-0 p-1.5 mr-1 sm:mr-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Tutup Promo"
        >
          <X className="h-4 w-4" />
        </button>
        
      </div>
    </div>
  );
}
