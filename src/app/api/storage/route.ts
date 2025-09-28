import { NextRequest, NextResponse } from "next/server";
import { listUserFiles, readUserFile, migrateStorageShapeToPerUser } from "@/lib/server/userStorage";
import { StorageShape, UserRecord } from "@/lib/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isMoneyItemArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.amount === "number"
  );

const isInstallmentArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) && typeof item.id === "string" && typeof item.name === "string"
  );

const isMonthlySnapshot = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  const { monthKey, incomes, subscriptions, installments, periodExpenses, createdAt, updatedAt } = value as Record<string, unknown>;
  return (
    typeof monthKey === "string" &&
    isMoneyItemArray(incomes) &&
    isMoneyItemArray(subscriptions) &&
    isInstallmentArray(installments) &&
    isMoneyItemArray(periodExpenses) &&
    typeof createdAt === "string" &&
    typeof updatedAt === "string"
  );
};

const isStoredMoneyItemArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.amount === "number" &&
      typeof item.startMonthKey === "string"
  );

const isStoredInstallmentArray = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      isRecord(item) &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.startMonthKey === "string"
  );

const isUserRecord = (value: unknown): value is UserRecord => {
  if (!isRecord(value)) return false;

  const {
    username,
    passwordHash,
    salt,
    createdAt,
    globalIncomes,
    globalSubscriptions,
    globalInstallments,
    months,
  } = value as Record<string, unknown>;

  if (
    typeof username !== "string" ||
    typeof passwordHash !== "string" ||
    typeof salt !== "string" ||
    typeof createdAt !== "string"
  ) {
    return false;
  }

  if (globalIncomes && !isStoredMoneyItemArray(globalIncomes)) return false;
  if (globalSubscriptions && !isStoredMoneyItemArray(globalSubscriptions)) return false;
  if (globalInstallments && !isStoredInstallmentArray(globalInstallments)) return false;

  if (!isRecord(months)) return false;

  return Object.values(months).every(isMonthlySnapshot);
};

const isStorageShape = (value: unknown): value is StorageShape => {
  if (!isRecord(value)) return false;
  const { users } = value as Record<string, unknown>;
  if (!isRecord(users)) return false;
  return Object.values(users).every(isUserRecord);
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  // Compose a StorageShape by reading individual user files in data/users/
  try {
    const files = await listUserFiles();
    const users: Record<string, UserRecord> = {};
    for (const f of files) {
      try {
        const p = await readUserFile(f.replace(/\.json$/, ""));
        if (p) users[p.username] = p;
      } catch (e) {
        // ignore individual file errors
        console.warn('Failed to read user file', f, e);
      }
    }

    const storage: StorageShape = { users };
    return NextResponse.json(storage, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error('Failed to assemble per-user storage', error);
    return NextResponse.json({ users: {} } as StorageShape, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    if (!isStorageShape(payload)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

  // Write each user's file individually (per-user storage). This avoids recreating data/storage.json.
  await migrateStorageShapeToPerUser(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to persist storage", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
