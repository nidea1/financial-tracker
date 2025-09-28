"use client";

import { useEffect, useRef, useState } from "react";
import { AVAILABLE_LOCALES, type Locale, useTranslation } from "@/i18n";

export type LanguagePickerProps = {
  selected?: Locale;
  onChange: (next: Locale) => void;
};

const flagFor = (loc: Locale) => {
  switch (loc) {
    case "tr":
      return "🇹🇷";
    case "en":
      return "🇺🇸";
    default:
      return "🏳️";
  }
};

export const LanguagePicker = ({ selected, onChange }: LanguagePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { locale } = useTranslation();

  const activeLocale: Locale = selected && AVAILABLE_LOCALES.includes(selected)
    ? selected
    : locale;

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        title={activeLocale === "tr" ? "Dil: Türkçe" : "Language: English"}
        className="inline-flex items-center justify-center rounded-lg p-2 border border-transparent bg-white/80 text-neutral-900 shadow-inner shadow-white/20 transition hover:bg-emerald-50 hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-neutral-900/70 dark:text-white dark:hover:bg-emerald-900/20 dark:hover:border-emerald-400/30"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span aria-hidden="true" className="text-lg leading-none">{flagFor(activeLocale)}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-white/10 bg-white/95 p-3 shadow-xl shadow-emerald-500/15 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-950/95 popover-enter">
          <div className="flex flex-col gap-2">
            <div className="px-1 text-xs text-neutral-500 dark:text-neutral-400">Dil seçimi</div>
            <div className="rounded-xl border border-neutral-200/60 bg-white/60 p-1 dark:border-neutral-700 dark:bg-neutral-900/60">
              {AVAILABLE_LOCALES.map((loc, index) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    onChange(loc);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition focus:outline-none ${
                    activeLocale === loc
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "text-neutral-700 hover:bg-emerald-50"
                  } ${index > 0 ? "mt-1" : ""}`}
                >
                  <span
                    className={`h-6 w-6 flex-none rounded-full grid place-items-center text-xs font-semibold ${
                      loc === "tr"
                        ? "bg-emerald-200 text-emerald-700"
                        : "bg-neutral-200 text-neutral-800"
                    }`}
                  >
                    {flagFor(loc)}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{loc === "tr" ? "Türkçe" : "English"}</div>
                    <div className="text-xs text-neutral-500">
                      {loc === "tr" ? "Varsayılan / Turkish" : "English / İngilizce"}
                    </div>
                  </div>
                  {activeLocale === loc ? (
                    <svg className="h-4 w-4 text-emerald-600" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 10l2 2 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
