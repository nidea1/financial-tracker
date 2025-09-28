"use client";

import { useMemo } from "react";
import { useTranslation, type Locale } from "@/i18n";
import { formatCurrency } from "@/utils/format";

export type SummaryTotals = {
  totalIncome: number;
  subscriptionTotal: number;
  installmentTotal: number;
  periodTotal: number;
  totalExpenses: number;
  leftover: number;
};

type SummaryPanelProps = {
  monthKey: string;
  locale: Locale;
  totals: SummaryTotals;
  formatMonthLabel: (month: string, locale: string) => string;
  mapLocaleToIntl: (locale?: Locale) => string;
  currency?: string;
  intlLocale?: string;
};

export const SummaryPanel = ({
  monthKey,
  locale,
  totals,
  formatMonthLabel,
  mapLocaleToIntl,
  currency,
  intlLocale,
}: SummaryPanelProps) => {
  const { t } = useTranslation();

  const { expenseRatio, clampedExpenseRatio, expenseRatioPercent, expenseBarWidth, leftoverIsPositive } = useMemo(() => {
    const ratio = totals.totalIncome > 0 ? totals.totalExpenses / totals.totalIncome : 0;
    const clamped = Math.min(Math.max(ratio, 0), 1);
    return {
      expenseRatio: ratio,
      clampedExpenseRatio: clamped,
      expenseRatioPercent: Math.round(Math.max(ratio, 0) * 100),
      expenseBarWidth: `${clamped * 100}%`,
      leftoverIsPositive: totals.leftover >= 0,
    };
  }, [totals.totalIncome, totals.totalExpenses, totals.leftover]);

  const leftoverValueClass = leftoverIsPositive ? "text-emerald-100" : "text-rose-200";
  const leftoverStatusAccentClass = leftoverIsPositive
    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-50"
    : "border-rose-500/40 bg-rose-500/10 text-rose-100";
  const leftoverStatusMessage = leftoverIsPositive
    ? t("dashboard.summary.leftoverPositive")
    : t("dashboard.summary.leftoverNegative");

  return (
    <div className="rounded-3xl border border-white/10 bg-emerald-500/90 p-6 text-white shadow-xl shadow-emerald-500/40 backdrop-blur-lg dark:border-emerald-400/30">
      <h2 className="text-lg font-semibold">{t("dashboard.summary.title")}</h2>
      <p className="mt-1 text-sm text-white/80">
        {t("dashboard.summary.month", { month: formatMonthLabel(monthKey, mapLocaleToIntl(locale)) })}
      </p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt>{t("dashboard.summary.income")}</dt>
          <dd className="font-semibold">{formatCurrency(totals.totalIncome, { locale: intlLocale, currency })}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("dashboard.summary.subscriptions")}</dt>
          <dd>{formatCurrency(totals.subscriptionTotal, { locale: intlLocale, currency })}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("dashboard.summary.installments")}</dt>
          <dd>{formatCurrency(totals.installmentTotal, { locale: intlLocale, currency })}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt>{t("dashboard.summary.period")}</dt>
          <dd>{formatCurrency(totals.periodTotal, { locale: intlLocale, currency })}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-white/30 pt-3 text-base font-semibold">
          <dt>{t("dashboard.summary.leftover")}</dt>
          <dd className={leftoverValueClass}>{formatCurrency(totals.leftover, { locale: intlLocale, currency })}</dd>
        </div>
      </dl>
      <div className="mt-6 space-y-4 text-xs text-white/80">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-white/70">
            <span>{t("dashboard.summary.expenseRatio")}</span>
            <span>{expenseRatioPercent}%</span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-white/20"
            role="progressbar"
            aria-valuenow={clampedExpenseRatio}
            aria-valuemin={0}
            aria-valuemax={1}
          >
            <div
              className={`h-full rounded-full ${expenseRatio > 1 ? "bg-rose-200" : "bg-white"}`}
              style={{ width: expenseBarWidth }}
            />
          </div>
          <p>
            {t("dashboard.summary.expenseLegend", {
              expenses: formatCurrency(totals.totalExpenses, { locale: intlLocale, currency }),
              income: formatCurrency(totals.totalIncome, { locale: intlLocale, currency }),
            })}
          </p>
        </div>
        <p className={`rounded-2xl border px-4 py-3 text-[11px] font-medium ${leftoverStatusAccentClass}`}>
          {leftoverStatusMessage}
        </p>
        <p>{t("dashboard.summary.helper")}</p>
      </div>
    </div>
  );
};
