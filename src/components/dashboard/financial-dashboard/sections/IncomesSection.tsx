"use client";

import { ChangeEvent, FormEvent } from "react";
import SectionCard from "../../SectionCard";
import { MoneyItem } from "@/lib/types";
import { formatCurrency } from "@/utils/format";
import { useTranslation } from "@/i18n";

type FieldChangeHandler = (value: string) => void;

type IncomesSectionProps = {
  items: MoneyItem[];
  summaryLabel: string;
  countLabel: string;
  formState: {
    name: string;
    amount: string;
    note: string;
  };
  errors: {
    name: string | null;
    amount: string | null;
  };
  isValid: boolean;
  showInvalidHint: boolean;
  onChangeName: FieldChangeHandler;
  onChangeAmount: FieldChangeHandler;
  onChangeNote: FieldChangeHandler;
  onSubmit: () => void;
  onRemove: (id: string) => void;
  currency?: string;
  intlLocale?: string;
};

export const IncomesSection = ({
  items,
  summaryLabel,
  countLabel,
  formState,
  errors,
  isValid,
  showInvalidHint,
  onChangeName,
  onChangeAmount,
  onChangeNote,
  onSubmit,
  onRemove,
  currency,
  intlLocale,
}: IncomesSectionProps) => {
  const { t } = useTranslation();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => onChangeName(event.target.value);
  const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => onChangeAmount(event.target.value);
  const handleNoteChange = (event: ChangeEvent<HTMLInputElement>) => onChangeNote(event.target.value);

  return (
    <SectionCard
      title={t("dashboard.sections.incomes.title")}
      subtitle={t("dashboard.sections.incomes.subtitle")}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
          <span>{summaryLabel}</span>
          <span className="rounded-lg bg-emerald-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:bg-emerald-400/30 dark:text-emerald-50">
            {countLabel}
          </span>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto]">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="income-name"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
              >
                {t("dashboard.sections.incomes.labels.name")}
              </label>
              <input
                id="income-name"
                className={`rounded-xl border px-3 py-2 sm:py-3 text-sm h-10 sm:h-12 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-rose-500/60 bg-rose-50/70 text-neutral-900 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-white"
                    : "border-neutral-200/60 bg-white/80 text-neutral-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
                }`}
                placeholder={t("dashboard.sections.incomes.placeholders.name")}
                value={formState.name}
                onChange={handleNameChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "income-name-error" : undefined}
              />
              <div className="h-6 mt-1">
                {errors.name ? (
                  <p
                    id="income-name-error"
                    className="text-sm font-medium text-rose-500 dark:text-rose-400"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label
                htmlFor="income-amount"
                className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
              >
                {t("dashboard.sections.incomes.labels.amount")}
              </label>
              <input
                id="income-amount"
                className={`rounded-xl border px-3 py-2 sm:py-3 text-sm h-10 sm:h-12 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.amount
                    ? "border-rose-500/60 bg-rose-50/70 text-neutral-900 focus:border-rose-500 focus:ring-rose-200 dark:border-rose-400/60 dark:bg-rose-500/10 dark:text-white"
                    : "border-neutral-200/60 bg-white/80 text-neutral-900 focus:border-emerald-500 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
                }`}
                placeholder={t("dashboard.sections.incomes.placeholders.amount")}
                type="number"
                min="0"
                step="0.01"
                value={formState.amount}
                onChange={handleAmountChange}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "income-amount-error" : undefined}
              />
              <div className="h-6 mt-1">
                {errors.amount ? (
                  <p
                    id="income-amount-error"
                    className="text-sm font-medium text-rose-500 dark:text-rose-400"
                    role="alert"
                  >
                    {errors.amount}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <div className="h-10 sm:h-12 flex items-center">
                <button
                  type="submit"
                  className={`w-full rounded-xl px-4 h-full py-2 text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isValid
                      ? "bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-600"
                      : "bg-emerald-300/60 text-white/80 shadow-none hover:bg-emerald-300/60"
                  }`}
                  disabled={!isValid}
                >
                  {t("dashboard.sections.incomes.add")}
                </button>
              </div>
              <div className="h-6 mt-2"></div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="income-note"
              className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
            >
              {t("dashboard.sections.incomes.labels.note")}
            </label>
            <input
              id="income-note"
              className="rounded-xl border border-neutral-200/60 bg-white/60 px-3 py-2 text-sm text-neutral-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-white dark:focus:border-emerald-400"
              placeholder={t("dashboard.sections.incomes.placeholders.note")}
              value={formState.note}
              onChange={handleNoteChange}
            />
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
                {t("dashboard.sections.incomes.empty")}
              </li>
            ) : (
              items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-white/5 dark:bg-neutral-950/40"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-neutral-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatCurrency(item.amount, { locale: intlLocale, currency })}
                    </p>
                    {item.notes ? (
                      <p className="text-xs italic text-neutral-400 dark:text-neutral-500">{item.notes}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg bg-neutral-900/5 px-3 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  >
                    {t("dashboard.sections.incomes.remove")}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
};
