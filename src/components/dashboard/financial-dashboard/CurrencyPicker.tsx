"use client";

import { useEffect, useRef, useState } from "react";

export type CurrencyPickerProps = {
  selected?: string;
  onChange: (next: string) => void;
};

const currencyLabel = (code: string) => {
  switch (code) {
    case "TRY":
      return "₺ TRY";
    case "USD":
      return "$ USD";
    case "EUR":
      return "€ EUR";
    case "GBP":
      return "£ GBP";
    default:
      return code;
  }
};

export const CurrencyPicker = ({ selected, onChange }: CurrencyPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const active = selected ?? "TRY";

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

  const options = ["TRY", "USD", "EUR", "GBP"];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        title={`Currency: ${active}`}
        className="inline-flex items-center justify-center rounded-lg p-2 border border-transparent bg-white/80 text-neutral-900 shadow-inner shadow-white/20 transition hover:bg-emerald-50 hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-neutral-900/70 dark:text-white dark:hover:bg-emerald-900/20 dark:hover:border-emerald-400/30"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold">{currencyLabel(active)}</span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-white/10 bg-white/95 p-3 shadow-xl shadow-emerald-500/15 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-950/95 popover-enter">
          <div className="flex flex-col gap-2">
            <div className="px-1 text-xs text-neutral-500 dark:text-neutral-400">Currency</div>
            <div className="rounded-xl border border-neutral-200/60 bg-white/60 p-1 dark:border-neutral-700 dark:bg-neutral-900/60">
              {options.map((code, index) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onChange(code);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition focus:outline-none ${
                    active === code
                      ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "text-neutral-700 hover:bg-emerald-50"
                  } ${index > 0 ? "mt-1" : ""}`}
                >
                  <div className="flex-1 text-left">
                    <div className="font-medium">{currencyLabel(code)}</div>
                    <div className="text-xs text-neutral-500">{code}</div>
                  </div>
                  {active === code ? (
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

export default CurrencyPicker;
