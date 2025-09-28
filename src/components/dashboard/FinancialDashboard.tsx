"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MonthlySnapshot, InstallmentItem, MoneyItem } from "@/lib/types";
import { formatMonthLabel, monthlyInstallmentAmount } from "@/lib/month";
import { formatCurrency } from "@/utils/format";
import { useTranslation, AVAILABLE_LOCALES, type Locale } from "@/i18n";
import { MonthPicker } from "./MonthPicker";
import { LanguagePicker } from "./financial-dashboard/LanguagePicker";
import CurrencyPicker from "./financial-dashboard/CurrencyPicker";
import { IncomesSection } from "./financial-dashboard/sections/IncomesSection";
import { SubscriptionsSection } from "./financial-dashboard/sections/SubscriptionsSection";
import {
  InstallmentsSection,
  type InstallmentPreview,
} from "./financial-dashboard/sections/InstallmentsSection";
import { PeriodExpensesSection } from "./financial-dashboard/sections/PeriodExpensesSection";
import { SummaryPanel } from "./financial-dashboard/sections/SummaryPanel";
import { HistorySection } from "./financial-dashboard/sections/HistorySection";
import { createId } from "./financial-dashboard/utils/createId";
import {
  getAmountError,
  getCountError,
  getNameError,
  isMoneyFormValid,
} from "./financial-dashboard/utils/validation";

type FinancialDashboardProps = {
  username: string;
  month: string;
  snapshot: MonthlySnapshot;
  availableMonths: string[];
  history: Array<{
    monthKey: string;
    totalIncome: number;
    totalExpenses: number;
    leftover: number;
  }>;
  onMonthChange: (value: string) => void;
  onSnapshotChange: (snapshot: MonthlySnapshot) => void;
  onLogout: () => void;
};

type MoneyListKey = "incomes" | "subscriptions" | "periodExpenses";

export const FinancialDashboard = ({
  username,
  month,
  snapshot,
  availableMonths,
  history,
  onMonthChange,
  onSnapshotChange,
  onLogout,
}: FinancialDashboardProps) => {
  const [incomeName, setIncomeName] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeNote, setIncomeNote] = useState("");
  const [subscriptionName, setSubscriptionName] = useState("");
  const [subscriptionAmount, setSubscriptionAmount] = useState("");
  const [subscriptionNote, setSubscriptionNote] = useState("");
  const [periodName, setPeriodName] = useState("");
  const [periodAmount, setPeriodAmount] = useState("");
  const [periodNote, setPeriodNote] = useState("");
  const [installmentForm, setInstallmentForm] = useState({
    name: "",
    amount: "",
    count: "",
    note: "",
  });
  const [installmentMode, setInstallmentMode] = useState<"total" | "monthly">("total");
  const { t, setLocale, locale } = useTranslation();
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>(undefined);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("TRY");

  const mapLocaleToIntl = useCallback((value?: Locale) => {
    if (value === "en") return "en-US";
    if (value === "tr") return "tr-TR";
    return "tr-TR";
  }, []);

  const intlLocale = useMemo(() => mapLocaleToIntl(selectedLocale ?? locale), [mapLocaleToIntl, selectedLocale, locale]);

  // initialize selectedLocale from provider locale
  useEffect(() => {
    if (locale && AVAILABLE_LOCALES.includes(locale)) {
      setSelectedLocale(locale);
    } else {
      setSelectedLocale("tr");
    }
  }, [locale]);

  const totals = useMemo(() => {
    const totalIncome = snapshot.incomes.reduce((total, item) => total + item.amount, 0);
    const subscriptionTotal = snapshot.subscriptions.reduce((total, item) => total + item.amount, 0);
    const periodTotal = snapshot.periodExpenses.reduce((total, item) => total + item.amount, 0);
    const installmentTotal = snapshot.installments.reduce(
      (total, item) => total + monthlyInstallmentAmount(item),
      0,
    );

    const totalExpenses = subscriptionTotal + periodTotal + installmentTotal;
    const leftover = totalIncome - totalExpenses;

    return {
      totalIncome,
      subscriptionTotal,
      periodTotal,
      installmentTotal,
      totalExpenses,
      leftover,
    };
  }, [snapshot]);

  const incomeNameError = getNameError(incomeName, t);
  const incomeAmountError = getAmountError(incomeAmount, t);
  const isIncomeValid = isMoneyFormValid(incomeName, incomeAmount);
  const showIncomeInvalidHint =
    !isIncomeValid && (incomeName.trim().length > 0 || incomeAmount.trim().length > 0);

  const subscriptionNameError = getNameError(subscriptionName, t);
  const subscriptionAmountError = getAmountError(subscriptionAmount, t);
  const isSubscriptionValid = isMoneyFormValid(subscriptionName, subscriptionAmount);
  const showSubscriptionInvalidHint =
    !isSubscriptionValid &&
    (subscriptionName.trim().length > 0 || subscriptionAmount.trim().length > 0);

  const periodNameError = getNameError(periodName, t);
  const periodAmountError = getAmountError(periodAmount, t);
  const isPeriodValid = isMoneyFormValid(periodName, periodAmount);
  const showPeriodInvalidHint =
    !isPeriodValid && (periodName.trim().length > 0 || periodAmount.trim().length > 0);

  const installmentNameError = getNameError(installmentForm.name, t);
  const installmentAmountError = getAmountError(installmentForm.amount, t);
  const installmentCountError = getCountError(installmentForm.count, t);
  const installmentAmountValue = Number(installmentForm.amount);
  const installmentCountValue = Number(installmentForm.count);
  const isInstallmentValid =
    installmentForm.name.trim().length > 0 &&
    !Number.isNaN(installmentAmountValue) &&
    installmentAmountValue > 0 &&
    !Number.isNaN(installmentCountValue) &&
    installmentCountValue > 0;
  const showInstallmentInvalidHint =
    !isInstallmentValid &&
    (installmentForm.name.trim().length > 0 ||
      installmentForm.amount.trim().length > 0 ||
      installmentForm.count.trim().length > 0);

  const incomesSummaryLabel = t("dashboard.sections.incomes.summary", {
    amount: formatCurrency(totals.totalIncome, { locale: intlLocale, currency: selectedCurrency}),
  });
  const incomesCountLabel = t("dashboard.sections.incomes.count", {
    count: snapshot.incomes.length,
  });
  const subscriptionsSummaryLabel = t("dashboard.sections.subscriptions.summary", {
    amount: formatCurrency(totals.subscriptionTotal, { locale: intlLocale, currency: selectedCurrency}),
  });
  const subscriptionsCountLabel = t("dashboard.sections.subscriptions.count", {
    count: snapshot.subscriptions.length,
  });
  const installmentsSummaryLabel = t("dashboard.sections.installments.summary", {
    amount: formatCurrency(totals.installmentTotal, { locale: intlLocale, currency: selectedCurrency}),
  });
  const installmentsCountLabel = t("dashboard.sections.installments.count", {
    count: snapshot.installments.length,
  });
  const periodSummaryLabel = t("dashboard.sections.periodExpenses.summary", {
    amount: formatCurrency(totals.periodTotal, { locale: intlLocale, currency: selectedCurrency}),
  });
  const periodCountLabel = t("dashboard.sections.periodExpenses.count", {
    count: snapshot.periodExpenses.length,
  });

  const makeMoneyItem = useCallback(
    (name: string, amount: string, note?: string): MoneyItem | null => {
      const trimmedName = name.trim();
      const parsed = Number(amount);
      const trimmedNote = note?.trim();

      if (!trimmedName || Number.isNaN(parsed) || parsed <= 0) {
        return null;
      }

      return {
        id: createId(),
        name: trimmedName,
        amount: parsed,
        notes: trimmedNote ? trimmedNote : undefined,
      };
    },
    [],
  );

  const appendItem = useCallback(
    (key: MoneyListKey, item: MoneyItem) => {
      const next: MonthlySnapshot = {
        ...snapshot,
        [key]: [...(snapshot[key] as MoneyItem[]), item],
      };

      onSnapshotChange(next);
    },
    [snapshot, onSnapshotChange],
  );

  const handleRemoveItem = useCallback(
    (key: MoneyListKey, id: string) => {
      const currentList = snapshot[key] as MoneyItem[];
      const next: MonthlySnapshot = {
        ...snapshot,
        [key]: currentList.filter((entry) => entry.id !== id),
      };

      onSnapshotChange(next);
    },
    [snapshot, onSnapshotChange],
  );

  const handleAddInstallment = useCallback(() => {
    const name = installmentForm.name.trim();
    if (!name) return;

    const parsedAmount = Number(installmentForm.amount);
    const parsedCount = Number(installmentForm.count);
    const trimmedNote = installmentForm.note.trim();

    if (
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      Number.isNaN(parsedCount) ||
      parsedCount <= 0
    ) {
      return;
    }

    const base: InstallmentItem = {
      id: createId(),
      name,
      monthsPlanned: parsedCount,
      monthsRemaining: parsedCount,
      notes: trimmedNote ? trimmedNote : undefined,
    };

    let installment: InstallmentItem;

    if (installmentMode === "total") {
      const monthlyAmount = parsedAmount / parsedCount;
      installment = {
        ...base,
        totalAmount: parsedAmount,
        monthlyAmount,
      };
    } else {
      const totalAmount = parsedAmount * parsedCount;
      installment = {
        ...base,
        totalAmount,
        monthlyAmount: parsedAmount,
      };
    }

    const next: MonthlySnapshot = {
      ...snapshot,
      installments: [...snapshot.installments, installment],
    };

    onSnapshotChange(next);

    setInstallmentForm({
      name: "",
      amount: "",
      count: "",
      note: "",
    });
  }, [installmentForm, installmentMode, onSnapshotChange, snapshot]);

  const handleRemoveInstallment = useCallback(
    (id: string) => {
      const next: MonthlySnapshot = {
        ...snapshot,
        installments: snapshot.installments.filter((entry) => entry.id !== id),
      };

      onSnapshotChange(next);
    },
    [snapshot, onSnapshotChange],
  );

  const installmentPreview = useMemo<InstallmentPreview>(() => {
    const amount = Number(installmentForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return null;
    }

    const count = Number(installmentForm.count);

    if (installmentMode === "total") {
      if (Number.isNaN(count) || count <= 0) {
        return {
          total: amount,
          monthly: undefined,
        };
      }

      return {
        total: amount,
        monthly: amount / count,
      };
    }

    if (Number.isNaN(count) || count <= 0) {
      return {
        total: undefined,
        monthly: amount,
      };
    }

    return {
      total: amount * count,
      monthly: amount,
    };
  }, [installmentForm.amount, installmentForm.count, installmentMode]);

  const handleIncomeSubmit = useCallback(() => {
    const item = makeMoneyItem(incomeName, incomeAmount, incomeNote);
    if (!item) return;

    appendItem("incomes", item);
    setIncomeName("");
    setIncomeAmount("");
    setIncomeNote("");
  }, [appendItem, incomeAmount, incomeName, incomeNote, makeMoneyItem]);

  const handleSubscriptionSubmit = useCallback(() => {
    const item = makeMoneyItem(subscriptionName, subscriptionAmount, subscriptionNote);
    if (!item) return;

    appendItem("subscriptions", item);
    setSubscriptionName("");
    setSubscriptionAmount("");
    setSubscriptionNote("");
  }, [appendItem, makeMoneyItem, subscriptionAmount, subscriptionName, subscriptionNote]);

  const handlePeriodSubmit = useCallback(() => {
    const item = makeMoneyItem(periodName, periodAmount, periodNote);
    if (!item) return;

    appendItem("periodExpenses", item);
    setPeriodName("");
    setPeriodAmount("");
    setPeriodNote("");
  }, [appendItem, makeMoneyItem, periodAmount, periodName, periodNote]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-10/12 flex-col gap-8 pb-16 pt-10 text-neutral-900 dark:text-white sm:px-8 lg:gap-10 lg:px-12 xl:gap-12 xl:px-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%),_linear-gradient(160deg,_rgba(59,130,246,0.1),_rgba(16,185,129,0.05))]" />

      <header className="relative z-30 w-full rounded-3xl border border-white/10 bg-white/70 p-4 shadow-xl shadow-emerald-500/10 backdrop-blur-xl dark:border-white/5 dark:bg-neutral-900/70 sm:p-6 lg:px-12">
        <div className="mx-auto flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
              {t("dashboard.welcome")}
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold text-neutral-900 dark:text-white sm:text-3xl">
              {username}
            </h1>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="min-w-0 flex-1">
                <MonthPicker
                  value={month}
                  onChange={(next) => onMonthChange(next)}
                  highlightMonths={availableMonths}
                  labels={{
                    trigger: t("dashboard.controls.monthPicker.trigger"),
                    prevYear: t("dashboard.controls.monthPicker.prev"),
                    nextYear: t("dashboard.controls.monthPicker.next"),
                    thisMonth: t("dashboard.controls.monthPicker.current"),
                  }}
                />
              </div>
              <div className="relative ml-2">
                <LanguagePicker
                  selected={selectedLocale ?? locale}
                  onChange={(next) => {
                    setSelectedLocale(next);
                    setLocale(next);
                  }}
                />
              </div>
              <div className="relative ml-2">
                <CurrencyPicker selected={selectedCurrency} onChange={setSelectedCurrency} />
              </div>
            </div>

            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="flex gap-2 sm:items-center">
                <button
                  type="button"
                  onClick={onLogout}
                  className="hidden rounded-lg border border-transparent bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 dark:bg-white/10 dark:text-white dark:hover:bg-emerald-500/20 sm:inline-block"
                >
                  {t("dashboard.logout")}
                </button>
              </div>
            </div>

            <div className="mt-1 sm:hidden">
              <button
                type="button"
                onClick={onLogout}
                className="w-full rounded-lg border border-transparent bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-800 dark:bg-white/10 dark:text-white dark:hover:bg-emerald-500/20"
              >
                {t("dashboard.logout")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] xl:grid-cols-[3fr_1fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <IncomesSection
            items={snapshot.incomes}
            summaryLabel={incomesSummaryLabel}
            countLabel={incomesCountLabel}
            formState={{ name: incomeName, amount: incomeAmount, note: incomeNote }}
            errors={{ name: incomeNameError, amount: incomeAmountError }}
            isValid={isIncomeValid}
            showInvalidHint={showIncomeInvalidHint}
            onChangeName={setIncomeName}
            onChangeAmount={setIncomeAmount}
            onChangeNote={setIncomeNote}
            onSubmit={handleIncomeSubmit}
            onRemove={(id) => handleRemoveItem("incomes", id)}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />

          <SubscriptionsSection
            items={snapshot.subscriptions}
            summaryLabel={subscriptionsSummaryLabel}
            countLabel={subscriptionsCountLabel}
            formState={{
              name: subscriptionName,
              amount: subscriptionAmount,
              note: subscriptionNote,
            }}
            errors={{ name: subscriptionNameError, amount: subscriptionAmountError }}
            isValid={isSubscriptionValid}
            showInvalidHint={showSubscriptionInvalidHint}
            onChangeName={setSubscriptionName}
            onChangeAmount={setSubscriptionAmount}
            onChangeNote={setSubscriptionNote}
            onSubmit={handleSubscriptionSubmit}
            onRemove={(id) => handleRemoveItem("subscriptions", id)}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />

          <InstallmentsSection
            items={snapshot.installments}
            summaryLabel={installmentsSummaryLabel}
            countLabel={installmentsCountLabel}
            formState={installmentForm}
            errors={{
              name: installmentNameError,
              amount: installmentAmountError,
              count: installmentCountError,
            }}
            mode={installmentMode}
            isValid={isInstallmentValid}
            showInvalidHint={showInstallmentInvalidHint}
            preview={installmentPreview}
            onChangeName={(value) => setInstallmentForm((prev) => ({ ...prev, name: value }))}
            onChangeAmount={(value) => setInstallmentForm((prev) => ({ ...prev, amount: value }))}
            onChangeCount={(value) => setInstallmentForm((prev) => ({ ...prev, count: value }))}
            onChangeNote={(value) => setInstallmentForm((prev) => ({ ...prev, note: value }))}
            onChangeMode={setInstallmentMode}
            onSubmit={handleAddInstallment}
            onRemove={handleRemoveInstallment}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />

          <PeriodExpensesSection
            items={snapshot.periodExpenses}
            summaryLabel={periodSummaryLabel}
            countLabel={periodCountLabel}
            formState={{
              name: periodName,
              amount: periodAmount,
              note: periodNote,
            }}
            errors={{ name: periodNameError, amount: periodAmountError }}
            isValid={isPeriodValid}
            showInvalidHint={showPeriodInvalidHint}
            onChangeName={setPeriodName}
            onChangeAmount={setPeriodAmount}
            onChangeNote={setPeriodNote}
            onSubmit={handlePeriodSubmit}
            onRemove={(id) => handleRemoveItem("periodExpenses", id)}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start lg:space-y-8 xl:space-y-10">
          <SummaryPanel
            monthKey={month}
            locale={locale}
            totals={totals}
            formatMonthLabel={formatMonthLabel}
            mapLocaleToIntl={mapLocaleToIntl}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />

          <HistorySection
            history={history}
            activeMonth={month}
            locale={locale}
            formatMonthLabel={formatMonthLabel}
            mapLocaleToIntl={mapLocaleToIntl}
            currency={selectedCurrency}
            intlLocale={intlLocale}
          />
        </aside>
      </div>
    </div>
  );
};
