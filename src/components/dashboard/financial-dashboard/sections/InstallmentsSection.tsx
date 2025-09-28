"use client";

import { ChangeEvent, FormEvent } from "react";
import SectionCard from "../../SectionCard";
import { InstallmentItem } from "@/lib/types";
import { formatCurrency } from "@/utils/format";
import { monthlyInstallmentAmount } from "@/lib/month";
import { useTranslation } from "@/i18n";

type FieldChangeHandler = (value: string) => void;

export type InstallmentPreview = {
  total?: number;
  monthly?: number;
} | null;

type InstallmentsSectionProps = {
  items: InstallmentItem[];
  summaryLabel: string;
  countLabel: string;
  formState: {
    name: string;
    amount: string;
    count: string;
    note: string;
  };
  errors: {
    name: string | null;
    amount: string | null;
    count: string | null;
  };
  mode: "total" | "monthly";
  isValid: boolean;
  showInvalidHint: boolean;
  preview: InstallmentPreview;
  onChangeName: FieldChangeHandler;
  onChangeAmount: FieldChangeHandler;
  onChangeCount: FieldChangeHandler;
  onChangeNote: FieldChangeHandler;
  onChangeMode: (mode: "total" | "monthly") => void;
  onSubmit: () => void;
  onRemove: (id: string) => void;
  currency?: string;
  intlLocale?: string;
};

export const InstallmentsSection = ({
  items,
  summaryLabel,
  countLabel,
  formState,
  errors,
  mode,
  isValid,
  showInvalidHint,
  preview,
  onChangeName,
  onChangeAmount,
  onChangeCount,
  onChangeNote,
  onChangeMode,
  onSubmit,
  onRemove,
  currency,
  intlLocale,
}: InstallmentsSectionProps) => {
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => onChangeName(event.target.value);
  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => onChangeAmount(event.target.value);
  const handleCountChange = (event: ChangeEvent<HTMLInputElement>) => onChangeCount(event.target.value);
  const handleNoteChange = (event: ChangeEvent<HTMLInputElement>) => onChangeNote(event.target.value);

  return (
    <SectionCard
      title={t("dashboard.sections.installments.title")}
      subtitle={t("dashboard.sections.installments.subtitle")}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-700 dark:border-purple-400/20 dark:bg-purple-400/10 dark:text-purple-100">
          <span>{summaryLabel}</span>
          <span className="rounded-lg bg-purple-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-800 dark:bg-purple-400/30 dark:text-purple-50">
            {countLabel}
          </span>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="installment-name"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
            >
              {t("dashboard.sections.installments.labels.name")}
            </label>
            <input
              id="installment-name"
              className={`rounded-xl border px-3 py-2 sm:py-3 text-sm h-10 sm:h-12 shadow-sm transition focus:outline-none focus:ring-2 ${
                errors.name
                  ? "border-rose-500/60 bg-rose-50/70 text-neutral-900 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-white"
                  : "border-neutral-200/60 bg-white/80 text-neutral-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
              }`}
              placeholder={t("dashboard.sections.installments.placeholders.name")}
              value={formState.name}
              onChange={handleNameChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "installment-name-error" : undefined}
            />
            {errors.name ? (
              <p
                id="installment-name-error"
                className="text-sm font-medium text-rose-500 dark:text-rose-400 mt-1"
                role="alert"
              >
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              {t("dashboard.sections.installments.labels.mode")}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  mode === "total"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-white/70 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-200 outline-1 outline-gray-400/50"
                }`}
                onClick={() => onChangeMode("total")}
              >
                {t("dashboard.sections.installments.modes.total")}
              </button>
              <button
                type="button"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                  mode === "monthly"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-white/70 text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-200 outline-1 outline-gray-400/50"
                }`}
                onClick={() => onChangeMode("monthly")}
              >
                {t("dashboard.sections.installments.modes.monthly")}
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="installment-amount"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
              >
                {mode === "total"
                  ? t("dashboard.sections.installments.labels.totalAmount")
                  : t("dashboard.sections.installments.labels.monthlyAmount")}
              </label>
              <input
                id="installment-amount"
                className={`rounded-xl border px-3 py-2 sm:py-3 text-sm h-10 sm:h-12 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? "border-rose-500/60 bg-rose-50/70 text-neutral-900 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-white"
                    : "border-neutral-200/60 bg-white/80 text-neutral-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
                }`}
                placeholder={
                  mode === "total"
                    ? t("dashboard.sections.installments.placeholders.totalAmount")
                    : t("dashboard.sections.installments.placeholders.monthlyAmount")
                }
                type="number"
                min="0"
                step="0.01"
                value={formState.amount}
                onChange={handleAmountChange}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "installment-amount-error" : undefined}
              />
              {errors.amount ? (
                <p
                  id="installment-amount-error"
                  className="text-sm font-medium text-rose-500 dark:text-rose-400 mt-1"
                  role="alert"
                >
                  {errors.amount}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="installment-count"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
              >
                {t("dashboard.sections.installments.labels.count")}
              </label>
              <input
                id="installment-count"
                className={`rounded-xl border px-3 py-2 sm:py-3 text-sm h-10 sm:h-12 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.count
                    ? "border-rose-500/60 bg-rose-50/70 text-neutral-900 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-white"
                    : "border-neutral-200/60 bg-white/80 text-neutral-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
                }`}
                placeholder={t("dashboard.sections.installments.placeholders.count")}
                type="number"
                min="1"
                step="1"
                value={formState.count}
                onChange={handleCountChange}
                aria-invalid={Boolean(errors.count)}
                aria-describedby={errors.count ? "installment-count-error" : undefined}
              />
              {errors.count ? (
                <p
                  id="installment-count-error"
                  className="text-sm font-medium text-rose-500 dark:text-rose-400 mt-1"
                  role="alert"
                >
                  {errors.count}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="installment-note"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
            >
              {t("dashboard.sections.installments.labels.note")}
            </label>
            <input
              id="installment-note"
              className="rounded-xl border border-neutral-200/60 bg-white/60 px-3 py-2 text-sm text-neutral-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
              placeholder={t("dashboard.sections.installments.placeholders.note")}
              value={formState.note}
              onChange={handleNoteChange}
            />
          </div>

          {preview ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-700 shadow-inner dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200">
              <p>{t("dashboard.sections.installments.preview.helper")}</p>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                {typeof preview.total === "number" ? (
                  <span>
                    {t("dashboard.sections.installments.preview.total", {
                      amount: formatCurrency(preview.total),
                    })}
                  </span>
                ) : null}
                {typeof preview.monthly === "number" ? (
                  <span>
                    {t("dashboard.sections.installments.preview.monthly", {
                      amount: formatCurrency(preview.monthly),
                    })}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <p>{t("dashboard.sections.installments.helper")}</p>
            <button
              type="submit"
              className={`rounded-lg px-3 h-9 sm:h-11 py-1 font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                isValid
                  ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 hover:text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/20"
                  : "bg-neutral-300/40 text-neutral-500 hover:bg-neutral-300/40 dark:bg-neutral-700/40 dark:text-neutral-500"
              }`}
              disabled={!isValid}
            >
              {t("dashboard.sections.installments.save")}
            </button>
          </div>
          {showInvalidHint ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-500 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-200">
              {t("dashboard.validation.formIncomplete")}
            </div>
          ) : null}
        </form>

  <div className={items.length > 3 ? "max-h-56 overflow-y-auto pr-2 scrollable-section" : ""}>
          <ul className="space-y-2">
            {items.length === 0 ? (
              <li className="rounded-xl border border-dashed border-neutral-200/80 bg-white/50 px-4 py-3 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-400">
                {t("dashboard.sections.installments.empty")}
              </li>
            ) : (
              items.map((item) => {
                const monthly = monthlyInstallmentAmount(item);
                let scheduleInfo = "";
                if (
                  typeof item.monthsRemaining === "number" &&
                  typeof item.monthsPlanned === "number" &&
                  item.monthsRemaining > 0
                ) {
                  const current = item.monthsPlanned - item.monthsRemaining + 1;
                  scheduleInfo = ` ${t("dashboard.sections.installments.currentOverTotal", {
                    current,
                    total: item.monthsPlanned,
                  })}`;
                } else if (item.monthsRemaining) {
                  scheduleInfo = ` ${t("dashboard.sections.installments.remaining", {
                    count: item.monthsRemaining,
                  })}`;
                } else if (item.monthsPlanned) {
                  scheduleInfo = ` ${t("dashboard.sections.installments.planned", {
                    count: item.monthsPlanned,
                  })}`;
                }

                return (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/5 dark:bg-neutral-950/40"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {t("dashboard.sections.installments.perMonth", {
                                  amount: formatCurrency(monthly, { locale: intlLocale, currency }),
                                })}
                        {scheduleInfo}
                      </p>
                      {item.totalAmount ? (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {t("dashboard.sections.installments.total", {
                            amount: formatCurrency(item.totalAmount, { locale: intlLocale, currency }),
                          })}
                        </p>
                      ) : null}
                      {item.notes ? (
                        <p className="text-xs italic text-neutral-400 dark:text-neutral-500">{item.notes}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="rounded-lg bg-neutral-900/5 px-3 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                    >
                      {t("dashboard.sections.installments.remove")}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
};
