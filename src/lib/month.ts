import { InstallmentItem, MonthlySnapshot } from "@/lib/types";

export const getCurrentMonthKey = () => {
  const now = new Date();
  return buildMonthKey(now.getFullYear(), now.getMonth() + 1);
};

export const createEmptySnapshot = (monthKey: string): MonthlySnapshot => {
  const timestamp = new Date().toISOString();
  return {
    monthKey,
    incomes: [],
    subscriptions: [],
    installments: [],
    periodExpenses: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const monthlyInstallmentAmount = (item: InstallmentItem) => {
  if (item.monthlyAmount && item.monthlyAmount > 0) {
    return item.monthlyAmount;
  }

  if (item.totalAmount && item.monthsRemaining && item.monthsRemaining > 0) {
    return item.totalAmount / item.monthsRemaining;
  }

  if (item.totalAmount && item.monthsPlanned && item.monthsPlanned > 0) {
    return item.totalAmount / item.monthsPlanned;
  }

  return item.totalAmount ?? 0;
};

export const buildMonthKey = (year: number, month: number) => {
  const safeYear = Number.isFinite(year) ? Math.trunc(year) : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? Math.min(Math.max(Math.trunc(month), 1), 12) : 1;
  return `${safeYear}-${String(safeMonth).padStart(2, "0")}`;
};

export const parseMonthKey = (key: string) => {
  const [yearPart, monthPart] = key.split("-");
  const year = Number.parseInt(yearPart ?? "", 10);
  const month = Number.parseInt(monthPart ?? "", 10);

  const safeYear = Number.isFinite(year) ? year : undefined;
  const safeMonth = Number.isFinite(month) && month >= 1 && month <= 12 ? month : undefined;

  return {
    year: safeYear,
    month: safeMonth,
  };
};

export const formatMonthLabel = (
  key: string,
  locale = "tr-TR",
  options?: Intl.DateTimeFormatOptions,
) => {
  const { year, month } = parseMonthKey(key);
  if (!year || !month) {
    return key;
  }

  const date = new Date(year, month - 1);

  const formatter = new Intl.DateTimeFormat(locale, options ?? { year: "numeric", month: "long" });
  return formatter.format(date);
};
