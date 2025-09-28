export type MoneyItem = {
  id: string;
  name: string;
  amount: number;
  notes?: string;
};

export type InstallmentItem = {
  id: string;
  name: string;
  totalAmount?: number;
  monthsPlanned?: number;
  monthsRemaining?: number;
  monthlyAmount?: number;
  notes?: string;
};

// Installments stored globally need to remember which month they started so that
// remaining months can be derived for any viewed month. We do NOT persist
// monthsRemaining; it is computed dynamically from startMonthKey + monthsPlanned.
export type StoredInstallment = {
  id: string;
  name: string;
  totalAmount?: number;
  monthsPlanned?: number; // original planned count (or remaining when created with remaining mode)
  monthlyAmount?: number; // explicit monthly amount if entered in monthly mode
  startMonthKey: string; // YYYY-MM the installment was first added
  notes?: string;
};

export type StoredMoneyItem = {
  id: string;
  name: string;
  amount: number;
  notes?: string;
  startMonthKey: string; // month when this global item starts being active
};

export type MonthlySnapshot = {
  monthKey: string;
  incomes: MoneyItem[];
  subscriptions: MoneyItem[];
  installments: InstallmentItem[];
  periodExpenses: MoneyItem[];
  createdAt: string;
  updatedAt: string;
};

export type UserRecord = {
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  // Global recurring data (propagated to months starting from startMonthKey)
  globalIncomes?: StoredMoneyItem[];
  globalSubscriptions?: StoredMoneyItem[];
  globalInstallments?: StoredInstallment[];
  months: Record<string, MonthlySnapshot>;
};

export type StorageShape = {
  users: Record<string, UserRecord>;
};
