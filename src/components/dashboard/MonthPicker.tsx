"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildMonthKey, formatMonthLabel, parseMonthKey } from "@/lib/month";
import { useTranslation } from "@/i18n";

export type MonthPickerLabels = {
  trigger: string;
  prevYear: string;
  nextYear: string;
  thisMonth: string;
};

type MonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  highlightMonths?: string[];
  labels: MonthPickerLabels;
};

export const MonthPicker = ({
  value,
  onChange,
  highlightMonths = [],
  labels,
}: MonthPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { year: parsedYear } = parseMonthKey(value);
  const currentYear = parsedYear ?? new Date().getFullYear();
  const [visibleYear, setVisibleYear] = useState(currentYear);

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClose);
    return () => {
      document.removeEventListener("mousedown", handleClose);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      const { year: nextYear } = parseMonthKey(value);
      if (nextYear) {
        setVisibleYear(nextYear);
      }
      return;
    }

    if (!parsedYear) {
      setVisibleYear(new Date().getFullYear());
    }
  }, [isOpen, parsedYear, value]);

  const highlightSet = useMemo(() => new Set(highlightMonths), [highlightMonths]);

  const { locale: i18nLocale } = useTranslation();

  const mapLocale = (locale: string) => {
    // map internal locale ids to Intl locales
    if (locale === "en") return "en-US";
    if (locale === "tr") return "tr-TR";
    return locale;
  };

  const months = useMemo(() => {
    const intlLocale = mapLocale(i18nLocale);
    return Array.from({ length: 12 }, (_, index) => {
      const monthIndex = index + 1;
      const key = buildMonthKey(visibleYear, monthIndex);
      return {
        key,
        label: formatMonthLabel(key, intlLocale, { month: "short" }),
        isActive: key === value,
        hasData: highlightSet.has(key),
      };
    });
  }, [highlightSet, value, visibleYear, i18nLocale]);

  const handleSelect = (monthKey: string) => {
    onChange(monthKey);
    setIsOpen(false);
  };

  const handleGoToCurrent = () => {
    const now = new Date();
    const current = buildMonthKey(now.getFullYear(), now.getMonth() + 1);
    setVisibleYear(now.getFullYear());
    onChange(current);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-transparent bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-inner shadow-white/20 transition hover:bg-emerald-50 hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:bg-neutral-900/70 dark:text-white dark:hover:bg-emerald-900/20 dark:hover:border-emerald-400/30"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={labels.trigger}
      >
  <span>{formatMonthLabel(value, mapLocale(i18nLocale))}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-xl shadow-emerald-500/15 backdrop-blur-lg dark:border-white/10 dark:bg-neutral-950/95">
          <header className="mb-3 flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-200">
            <button
              type="button"
              className="rounded-lg p-2 transition hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => setVisibleYear((prevYear) => prevYear - 1)}
              aria-label={labels.prevYear}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.5 5L7.5 10L12.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span>{visibleYear}</span>
            <button
              type="button"
              className="rounded-lg p-2 transition hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              onClick={() => setVisibleYear((prevYear) => prevYear + 1)}
              aria-label={labels.nextYear}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </header>

          <div className="grid grid-cols-3 gap-2 text-sm">
            {months.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                className={`relative rounded-xl border px-3 py-2 capitalize transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  item.isActive
                    ? "border-emerald-500 bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30"
                    : "border-white/20 bg-white/70 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-white/10 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-200"
                }`}
              >
                {item.label}
                {item.hasData ? (
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200"
              onClick={handleGoToCurrent}
            >
              {labels.thisMonth}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
