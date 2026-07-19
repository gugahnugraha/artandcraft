"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { id, Translations } from "../locales/id";
import { en } from "../locales/en";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("language") as Language;
    if (saved === "en" || saved === "id") {
      setLanguageState(saved);
    }

    // ─── Theme Sync & Hot Reload ───
    // 1. Instantly apply color from cache if exists
    const cachedColor = localStorage.getItem("primary_color");
    if (cachedColor) {
      document.documentElement.style.setProperty("--primary", cachedColor);
      document.documentElement.style.setProperty("--ring", cachedColor);
    }

    // 2. Fetch latest configurations from API
    const syncTheme = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (res.ok && data.config?.primary_color) {
          const color = data.config.primary_color;
          document.documentElement.style.setProperty("--primary", color);
          document.documentElement.style.setProperty("--ring", color);
          localStorage.setItem("primary_color", color);
        }
      } catch (err) {
        console.error("Theme sync error:", err);
      }
    };
    syncTheme();

    // 3. Listen to localStorage changes (for multi-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "primary_color" && e.newValue) {
        document.documentElement.style.setProperty("--primary", e.newValue);
        document.documentElement.style.setProperty("--ring", e.newValue);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = language === "en" ? en : id;

  // Prevent hydration mismatch by rendering default translation on server,
  // but using state on client.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {/* We render children immediately, relying on the fact that initial state matches SSR default */}
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
