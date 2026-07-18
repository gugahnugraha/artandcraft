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
