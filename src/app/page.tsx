"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { FinancialDashboard } from "@/components/dashboard/FinancialDashboard";
import {
  createEmptySnapshot,
  getCurrentMonthKey,
  monthlyInstallmentAmount,
} from "@/lib/month";
import type {
  MonthlySnapshot,
  MoneyItem,
  StoredInstallment,
  StoredMoneyItem,
  InstallmentItem,
  UserRecord,
} from "@/lib/types";
import { deriveInstallmentRuntime, composeMonthRecurringData } from "@/lib/storage";
import { useTranslation } from "@/i18n";

const HomeContent = () => {
  const {
    loading,
    currentUser,
    users,
    register,
    login,
    logout,
    getMonth,
    saveUserRecord,
  } = useAuth();
  const { t } = useTranslation();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  // snapshot shown to UI (composite: global recurring + period expenses)
  const [snapshot, setSnapshot] = useState<MonthlySnapshot | null>(null);
  // Keep a reference of prior composite to diff changes for recurring data
  const [prevComposite, setPrevComposite] = useState<MonthlySnapshot | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setSnapshot(null);
      return;
    }

    const userData = users[currentUser];
    if (!userData) return;

    const months = Object.keys(userData.months);
    if (months.length === 0) {
      const fallback = getCurrentMonthKey();
      setSelectedMonth((prev) => (prev === fallback ? prev : fallback));
      return;
    }

    const sorted = [...months].sort();
    const latest = sorted[sorted.length - 1];
    setSelectedMonth((prev) => (months.includes(prev) ? prev : latest));
  }, [currentUser, users]);

  useEffect(() => {
    if (!currentUser || loading) {
      return;
    }

    if (!selectedMonth) {
      const fallback = getCurrentMonthKey();
      setSelectedMonth(fallback);
      return;
    }

    const existing = getMonth(selectedMonth);

    // Build composite snapshot using global data
    const userData = currentUser ? users[currentUser] : null;
    if (!userData) return;

    // Compose recurring data for this month (filters global items by startMonthKey)
    const composed = composeMonthRecurringData(userData, selectedMonth);
    const globalIncomes = composed.incomes;
    const globalSubscriptions = composed.subscriptions;
    const globalInstallments = composed.globalInstallments;

    const runtimeInstallments: InstallmentItem[] = globalInstallments.map((gi) =>
      deriveInstallmentRuntime(gi, selectedMonth),
    );

    if (existing) {
      // Merge existing + global (global first) without duplicating IDs
      const incomeMap = new Map<string, MoneyItem>();
      [...globalIncomes, ...existing.incomes].forEach((i) => {
        if (!incomeMap.has(i.id)) incomeMap.set(i.id, i);
      });
      const mergedIncomes = Array.from(incomeMap.values());

      const subMap = new Map<string, MoneyItem>();
      [...globalSubscriptions, ...existing.subscriptions].forEach((i) => {
        if (!subMap.has(i.id)) subMap.set(i.id, i);
      });
      const mergedSubs = Array.from(subMap.values());

      // For installments, we prefer runtime values (dynamic monthsRemaining) but also keep any historic ones not global anymore
      const instMap = new Map<string, InstallmentItem>();
      runtimeInstallments.forEach((i) => instMap.set(i.id, i));
      existing.installments.forEach((i) => {
        if (!instMap.has(i.id)) instMap.set(i.id, i);
      });
      const mergedInst = Array.from(instMap.values());

      const hasSameIds = (a: { id: string }[], b: { id: string }[]) => {
        if (a.length !== b.length) return false;
        const set = new Set(a.map((item) => item.id));
        return b.every((item) => set.has(item.id));
      };

      const needsPersist =
        !hasSameIds(mergedIncomes, existing.incomes) ||
        !hasSameIds(mergedSubs, existing.subscriptions) ||
        !hasSameIds(mergedInst, existing.installments);

      if (needsPersist && userData) {
        const persistedMonth: MonthlySnapshot = {
          ...existing,
          incomes: mergedIncomes.map((i) => ({ ...i })),
          subscriptions: mergedSubs.map((s) => ({ ...s })),
          installments: mergedInst.map((inst) => ({ ...inst })),
          updatedAt: new Date().toISOString(),
        };
        const nextUser: UserRecord = {
          ...userData,
          globalIncomes: userData.globalIncomes ?? [],
          globalSubscriptions: userData.globalSubscriptions ?? [],
          globalInstallments: userData.globalInstallments ?? [],
          months: {
            ...userData.months,
            [selectedMonth]: persistedMonth,
          },
        };
        saveUserRecord(nextUser);
      }

      const composite: MonthlySnapshot = {
        ...(needsPersist
          ? {
              ...existing,
              incomes: mergedIncomes,
              subscriptions: mergedSubs,
              installments: mergedInst,
              updatedAt: new Date().toISOString(),
            }
          : existing),
      };
      setPrevComposite(composite);
      setSnapshot(composite);
      return;
    }

    const emptyBase = createEmptySnapshot(selectedMonth);
    // First time this month: persist a month snapshot containing current global recurring items as a baseline
    const monthWithRecurring: MonthlySnapshot = {
      ...emptyBase,
      incomes: [...globalIncomes],
      subscriptions: [...globalSubscriptions],
      installments: runtimeInstallments.map((i) => ({ ...i })),
    };
    if (userData) {
      const nextUser: UserRecord = {
        ...userData,
        globalIncomes: userData.globalIncomes ?? [],
        globalSubscriptions: userData.globalSubscriptions ?? [],
        globalInstallments: userData.globalInstallments ?? [],
        months: {
          ...userData.months,
          [selectedMonth]: monthWithRecurring,
        },
      };
      saveUserRecord(nextUser);
    }

    setPrevComposite(monthWithRecurring);
    setSnapshot(monthWithRecurring);
  }, [currentUser, getMonth, loading, saveUserRecord, selectedMonth, users]);

  const availableMonths = useMemo(() => {
    if (!currentUser) {
      return selectedMonth ? [selectedMonth] : [];
    }

    const userData = users[currentUser];
    if (!userData) {
      return selectedMonth ? [selectedMonth] : [];
    }

    const unique = new Set([selectedMonth, ...Object.keys(userData.months)]);
    return Array.from(unique)
      .filter(Boolean)
      .sort();
  }, [currentUser, selectedMonth, users]);

  const history = useMemo(() => {
    if (!currentUser) return [] as Array<{
      monthKey: string;
      totalIncome: number;
      totalExpenses: number;
      leftover: number;
    }>;

    const userData = users[currentUser];
    if (!userData) return [];

    const months: Record<string, MonthlySnapshot> = {
      ...userData.months,
    };

    if (snapshot) {
      months[snapshot.monthKey] = snapshot;
    }

    return Object.values(months)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .map((monthSnapshot) => {
        const totalIncome = monthSnapshot.incomes.reduce(
          (total, item) => total + item.amount,
          0
        );

        const subscriptionTotal = monthSnapshot.subscriptions.reduce(
          (total, item) => total + item.amount,
          0
        );

        const periodTotal = monthSnapshot.periodExpenses.reduce(
          (total, item) => total + item.amount,
          0
        );

        const installmentTotal = monthSnapshot.installments.reduce(
          (total, item) => total + monthlyInstallmentAmount(item),
          0
        );

        const totalExpenses = subscriptionTotal + periodTotal + installmentTotal;

        return {
          monthKey: monthSnapshot.monthKey,
          totalIncome,
          totalExpenses,
          leftover: totalIncome - totalExpenses,
        };
      });
  }, [currentUser, snapshot, users]);

  const handleSnapshotChange = useCallback(
    (next: MonthlySnapshot) => {
      if (!currentUser) return;
      const userData = users[currentUser];
      if (!userData) return;

      // previous composite for diff
      const previous = prevComposite ?? snapshot;
      const prevIncomeIds = new Set(previous?.incomes.map((i) => i.id) ?? []);
      const prevSubIds = new Set(previous?.subscriptions.map((i) => i.id) ?? []);
      const prevInstIds = new Set(previous?.installments.map((i) => i.id) ?? []);

      // Diff incomes
      const addedIncomes = next.incomes.filter((i) => !prevIncomeIds.has(i.id));
      const removedIncomeIds = [...prevIncomeIds].filter(
        (id) => !next.incomes.some((i) => i.id === id),
      );
      // Global incomes are stored with a startMonthKey. Preserve existing stored items
      // and convert any newly added UI MoneyItem into StoredMoneyItem with startMonthKey = selectedMonth.
      let updatedGlobalIncomes: StoredMoneyItem[] = userData.globalIncomes ? [...userData.globalIncomes] : [];
      if (addedIncomes.length) {
        const converted = addedIncomes.map<StoredMoneyItem>((i) => ({
          id: i.id,
          name: i.name,
          amount: i.amount,
          notes: i.notes,
          startMonthKey: selectedMonth,
        }));
        // avoid duplicates
        const existingIds = new Set(updatedGlobalIncomes.map((g) => g.id));
        updatedGlobalIncomes = [...updatedGlobalIncomes, ...converted.filter((c) => !existingIds.has(c.id))];
      }
      if (removedIncomeIds.length) {
        updatedGlobalIncomes = updatedGlobalIncomes.filter((i) => !removedIncomeIds.includes(i.id));
      }

      // Diff subscriptions
      const addedSubs = next.subscriptions.filter((i) => !prevSubIds.has(i.id));
      const removedSubIds = [...prevSubIds].filter(
        (id) => !next.subscriptions.some((i) => i.id === id),
      );
      let updatedGlobalSubs: StoredMoneyItem[] = userData.globalSubscriptions ? [...userData.globalSubscriptions] : [];
      if (addedSubs.length) {
        const converted = addedSubs.map<StoredMoneyItem>((s) => ({
          id: s.id,
          name: s.name,
          amount: s.amount,
          notes: s.notes,
          startMonthKey: selectedMonth,
        }));
        const existingIds = new Set(updatedGlobalSubs.map((g) => g.id));
        updatedGlobalSubs = [...updatedGlobalSubs, ...converted.filter((c) => !existingIds.has(c.id))];
      }
      if (removedSubIds.length)
        updatedGlobalSubs = updatedGlobalSubs.filter((i) => !removedSubIds.includes(i.id));

      // Diff installments (convert to stored entries)
      const addedInstallments = next.installments.filter((i) => !prevInstIds.has(i.id));
      const removedInstIds = [...prevInstIds].filter(
        (id) => !next.installments.some((i) => i.id === id),
      );
      let updatedGlobalInst: StoredInstallment[] = userData.globalInstallments
        ? [...userData.globalInstallments]
        : [];
      if (addedInstallments.length) {
        const converted: StoredInstallment[] = addedInstallments.map((inst) => {
          // monthsPlanned precedence over monthsRemaining; if only monthsRemaining present use that.
          const planned = inst.monthsPlanned
            ? inst.monthsPlanned
            : inst.monthsRemaining
              ? inst.monthsRemaining
              : undefined;
          let totalAmount = inst.totalAmount;
            if (!totalAmount && inst.monthlyAmount && planned) {
              totalAmount = inst.monthlyAmount * planned;
            }
          return {
            id: inst.id,
            name: inst.name,
            totalAmount: totalAmount,
            monthsPlanned: planned,
            monthlyAmount: inst.monthlyAmount,
            startMonthKey: selectedMonth,
            notes: inst.notes,
          };
        });
        updatedGlobalInst = [...updatedGlobalInst, ...converted];
      }
      if (removedInstIds.length) {
        updatedGlobalInst = updatedGlobalInst.filter((i) => !removedInstIds.includes(i.id));
      }
      // Period expenses remain month specific
      const existingMonth = getMonth(selectedMonth) ?? createEmptySnapshot(selectedMonth);
      const updatedMonth: MonthlySnapshot = {
        ...existingMonth,
        incomes: next.incomes.map((i) => ({ ...i })),
        subscriptions: next.subscriptions.map((s) => ({ ...s })),
        installments: next.installments.map((inst) => ({ ...inst })),
        periodExpenses: next.periodExpenses.map((p) => ({ ...p })),
        updatedAt: new Date().toISOString(),
      };

      // When updating global lists, removals should apply from the selectedMonth forward.
      // Build updated months map where months >= selectedMonth have the removed ids filtered out.
      const updatedMonths: Record<string, MonthlySnapshot> = { ...userData.months };
      const monthKeys = Object.keys(updatedMonths).sort();
      monthKeys.forEach((mKey) => {
        // Only adjust months from selectedMonth onwards
        if (mKey >= selectedMonth) {
          const orig = updatedMonths[mKey];
          updatedMonths[mKey] = {
            ...orig,
            incomes: orig.incomes.filter((i) => !removedIncomeIds.includes(i.id)),
            subscriptions: orig.subscriptions.filter((s) => !removedSubIds.includes(s.id)),
            installments: orig.installments.filter((inst) => !removedInstIds.includes(inst.id)),
          };
        }
      });

      // Ensure the selectedMonth snapshot is updated to reflect next
      updatedMonths[selectedMonth] = updatedMonth;

      const nextUser: UserRecord = {
        ...userData,
        globalIncomes: updatedGlobalIncomes,
        globalSubscriptions: updatedGlobalSubs,
        globalInstallments: updatedGlobalInst,
        months: updatedMonths,
      };
      saveUserRecord(nextUser);

      // Rebuild composite snapshot to reflect stored changes
      const compositeInst = updatedGlobalInst.map((gi) => deriveInstallmentRuntime(gi, selectedMonth));
      const monthOnlyInst = updatedMonth.installments.filter((mi) => !compositeInst.some((ri) => ri.id === mi.id));
      const composite: MonthlySnapshot = {
        ...updatedMonth,
        incomes: updatedMonth.incomes,
        subscriptions: updatedMonth.subscriptions,
        installments: [...compositeInst, ...monthOnlyInst],
      };
      setPrevComposite(composite);
      setSnapshot(composite);
    },
    [currentUser, getMonth, prevComposite, saveUserRecord, selectedMonth, snapshot, users]
  );

  // copy-month logic removed

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-emerald-100 text-neutral-700">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-emerald-100 px-4 py-12 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-900/40">
        <AuthCard
          onLogin={login}
          onRegister={register}
        />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-900/40">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {t("dashboard.loading.message")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-white to-emerald-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-emerald-900/40">
      <FinancialDashboard
        username={currentUser}
        month={selectedMonth}
        snapshot={snapshot}
        availableMonths={availableMonths}
        history={history}
        onMonthChange={setSelectedMonth}
        onSnapshotChange={handleSnapshotChange}
        onLogout={logout}
      />
    </div>
  );
};

const Home = () => (
  <AuthProvider>
    <HomeContent />
  </AuthProvider>
);

export default Home;
