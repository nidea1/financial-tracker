"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TranslationProvider, AVAILABLE_LOCALES, type Locale } from "@/i18n";

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("locale");
      if (stored && AVAILABLE_LOCALES.includes(stored as Locale)) {
        setLocale(stored as Locale);
        // ensure document lang matches
        try {
          document.documentElement.lang = stored;
        } catch {}
        return;
      }
    } catch {}

    setLocale("tr");
    try {
      document.documentElement.lang = "tr";
    } catch {}
  }, []);

  const handleLocaleChange = (next: Locale) => {
    try {
      localStorage.setItem("locale", next);
    } catch {}
    setLocale(next);
    try {
      document.documentElement.lang = next;
    } catch {}
  };

  return (
    <TranslationProvider locale={locale} onLocaleChange={handleLocaleChange}>
      {children}
    </TranslationProvider>
  );
}
