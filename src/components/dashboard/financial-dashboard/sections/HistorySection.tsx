"use client";

import SectionCard from "../../SectionCard";
import { formatCurrency } from "@/utils/format";
import { useTranslation, type Locale } from "@/i18n";

type HistoryEntry = {
  monthKey: string;
  totalIncome: number;
  totalExpenses: number;
  leftover: number;
};

type HistorySectionProps = {
  history: HistoryEntry[];
  activeMonth: string;
  locale: Locale;
  formatMonthLabel: (month: string, locale: string) => string;
  mapLocaleToIntl: (locale?: Locale) => string;
  currency?: string;
  intlLocale?: string;
};

export const HistorySection = ({
  history,
  activeMonth,
  locale,
  formatMonthLabel,
  mapLocaleToIntl,
  currency,
  intlLocale,
}: HistorySectionProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard
      title={t("dashboard.history.title")}
      subtitle={t("dashboard.history.subtitle")}
    >
      <ul className="space-y-3 text-sm">
        {history.length === 0 ? (
          <li className="rounded-xl border border-dashed border-neutral-200/70 px-4 py-3 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
            {t("dashboard.history.empty")}
          </li>
        ) : (
          history.map((entry) => {
            const isActive = entry.monthKey === activeMonth;
            return (
              <li
                key={entry.monthKey}
                className={`rounded-2xl border px-4 py-3 ${
                  isActive
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-white/10 bg-white/60 dark:border-white/5 dark:bg-neutral-950/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {formatMonthLabel(entry.monthKey, mapLocaleToIntl(locale))}
                  </span>
                  <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                    {isActive ? t("dashboard.history.active") : ""}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <span>
                    {t("dashboard.history.income", {
                      amount: formatCurrency(entry.totalIncome, { locale: intlLocale, currency }),
                    })}
                  </span>
                  <span>
                    {t("dashboard.history.expenses", {
                      amount: formatCurrency(entry.totalExpenses, { locale: intlLocale, currency }),
                    })}
                  </span>
                  <span>
                    {t("dashboard.history.leftover", {
                      amount: formatCurrency(entry.leftover, { locale: intlLocale, currency }),
                    })}
                  </span>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </SectionCard>
  );
};
