"use client";

import { MoneyItem, StorageShape, StoredInstallment, UserRecord } from "@/lib/types";
import { parseMonthKey } from "@/lib/month";

const STORAGE_ENDPOINT = "/api/storage";
const SESSION_KEY = "financial-tracker-session";

const defaultStorage: StorageShape = {
  users: {},
};

const migrateStorage = (raw: StorageShape): StorageShape => {
  const parsed: StorageShape = {
    ...defaultStorage,
    ...raw,
    users: raw.users ?? {},
  };

  Object.values(parsed.users).forEach((user) => {
    if (!user.globalIncomes) user.globalIncomes = [];
    if (!user.globalSubscriptions) user.globalSubscriptions = [];
    if (!user.globalInstallments) user.globalInstallments = [];

    const monthEntries = Object.values(user.months ?? {});

    if (user.globalIncomes.length === 0 && monthEntries.length > 0) {
      const incomeFirstSeen = new Map<string, { item: MoneyItem; monthKey: string }>();
      monthEntries.forEach((month) => {
        month.incomes.forEach((income) => {
          if (!incomeFirstSeen.has(income.id)) {
            incomeFirstSeen.set(income.id, { item: { ...income }, monthKey: month.monthKey });
          }
        });
      });
      user.globalIncomes = Array.from(incomeFirstSeen.values()).map((v) => ({
        id: v.item.id,
        name: v.item.name,
        amount: v.item.amount,
        notes: v.item.notes,
        startMonthKey: v.monthKey,
      }));
    }

    if (user.globalSubscriptions.length === 0 && monthEntries.length > 0) {
      const subFirstSeen = new Map<string, { item: MoneyItem; monthKey: string }>();
      monthEntries.forEach((month) => {
        month.subscriptions.forEach((subscription) => {
          if (!subFirstSeen.has(subscription.id)) {
            subFirstSeen.set(subscription.id, { item: { ...subscription }, monthKey: month.monthKey });
          }
        });
      });
      user.globalSubscriptions = Array.from(subFirstSeen.values()).map((v) => ({
        id: v.item.id,
        name: v.item.name,
        amount: v.item.amount,
        notes: v.item.notes,
        startMonthKey: v.monthKey,
      }));
    }

    if (user.globalInstallments.length === 0 && monthEntries.length > 0) {
      const instMap = new Map<string, StoredInstallment>();
      monthEntries.forEach((month) => {
        month.installments.forEach((inst) => {
          if (instMap.has(inst.id)) return;
          const planned = inst.monthsPlanned
            ? inst.monthsPlanned
            : inst.monthsRemaining
              ? inst.monthsRemaining
              : undefined;
          const totalAmount =
            inst.totalAmount ??
            (inst.monthlyAmount && planned ? inst.monthlyAmount * planned : undefined);
          instMap.set(inst.id, {
            id: inst.id,
            name: inst.name,
            totalAmount,
            monthsPlanned: planned,
            monthlyAmount: inst.monthlyAmount,
            startMonthKey: month.monthKey,
            notes: inst.notes,
          });
        });
      });
      user.globalInstallments = Array.from(instMap.values());
    }
  });

  return parsed;
};

export const readStorage = async (): Promise<StorageShape> => {
  // Backwards-compatible: fetch entire storage shape if the monolithic endpoint exists.
  try {
    const response = await fetch(STORAGE_ENDPOINT, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-store",
      },
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const payload = (await response.json()) as StorageShape;
    return migrateStorage(payload);
  } catch (error) {
    console.warn("Failed to load monolithic storage from API", error);
    return defaultStorage;
  }
};

export const writeStorage = async (data: StorageShape) => {
  try {
    const response = await fetch(STORAGE_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to persist storage to API", error);
    throw error;
  }
};

const USER_ENDPOINT = "/api/storage"; // /api/storage/:username

export const readUserRecord = async (username: string): Promise<UserRecord | null> => {
  try {
    const url = `${USER_ENDPOINT}/${encodeURIComponent(username)}`;
    const res = await fetch(url, { method: "GET", headers: { Accept: "application/json", "Cache-Control": "no-store" } });
    if (!res.ok) return null;
    const payload = (await res.json()) as UserRecord;
    return payload;
  } catch (error) {
    console.warn("Failed to read user record", error);
    return null;
  }
};

export const writeUserRecord = async (username: string, record: UserRecord) => {
  try {
    const url = `${USER_ENDPOINT}/${encodeURIComponent(username)}`;
    const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
    if (!res.ok) throw new Error(`Unexpected status ${res.status}`);
  } catch (error) {
    console.error("Failed to persist user record", error);
    throw error;
  }
};

export const readSession = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(SESSION_KEY);
};

export const writeSession = (username: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (username) {
    window.localStorage.setItem(SESSION_KEY, username);
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

export const clearStorage = async () => {
  await writeStorage(defaultStorage);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
};

// Helper to derive months difference between two month keys (YYYY-MM)
const monthDiff = (from: string, to: string) => {
  const a = parseMonthKey(from);
  const b = parseMonthKey(to);
  if (!a.year || !a.month || !b.year || !b.month) return 0;
  return (b.year - a.year) * 12 + (b.month - a.month);
};

// Compose incomes/subscriptions/installments for a given month merging global + snapshot overrides.
export const composeMonthRecurringData = (
  user: UserRecord,
  monthKey: string,
) => {
  const base = user.months[monthKey];
  const incomes: MoneyItem[] = [
    // Only include global incomes that started on or before this month
    ...((user.globalIncomes ?? []).filter((g) => monthDiff(g.startMonthKey, monthKey) >= 0).map((g) => ({
      id: g.id,
      name: g.name,
      amount: g.amount,
      notes: g.notes,
    }) as MoneyItem)),
    ...(base ? base.incomes : []),
  ];
  const subscriptions: MoneyItem[] = [
    ...((user.globalSubscriptions ?? []).filter((g) => monthDiff(g.startMonthKey, monthKey) >= 0).map((g) => ({
      id: g.id,
      name: g.name,
      amount: g.amount,
      notes: g.notes,
    }) as MoneyItem)),
    ...(base ? base.subscriptions : []),
  ];

  // Derive active global installments for this month
  const globalInstallments: StoredInstallment[] = (user.globalInstallments ?? []).filter((inst) => {
    const elapsed = monthDiff(inst.startMonthKey, monthKey);
    if (elapsed < 0) {
      return false;
    }

    if (inst.monthsPlanned && inst.monthsPlanned > 0) {
      return elapsed < inst.monthsPlanned;
    }

    return true;
  });

  return { incomes, subscriptions, globalInstallments };
};

export const deriveInstallmentRuntime = (
  stored: StoredInstallment,
  currentMonthKey: string,
) => {
  const elapsed = monthDiff(stored.startMonthKey, currentMonthKey);
  const remaining = stored.monthsPlanned && stored.monthsPlanned > 0
    ? Math.max(stored.monthsPlanned - elapsed, 0)
    : undefined;
  return {
    id: stored.id,
    name: stored.name,
    totalAmount: stored.totalAmount,
    monthlyAmount: stored.monthlyAmount,
    monthsPlanned: stored.monthsPlanned,
    monthsRemaining: remaining,
    notes: stored.notes,
  };
};
