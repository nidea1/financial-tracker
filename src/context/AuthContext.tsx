"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { hashPassword, generateSalt } from "@/lib/crypto";
import { createEmptySnapshot } from "@/lib/month";
import { readSession, readStorage, writeSession, readUserRecord, writeUserRecord } from "@/lib/storage";
import { MonthlySnapshot, StorageShape, UserRecord } from "@/lib/types";
import { useTranslation } from "@/i18n";

const INITIAL_STORAGE: StorageShape = {
  users: {},
};

export type AuthResult = {
  success: boolean;
  error?: string;
};

const noopAsync = async (): Promise<AuthResult> => ({
  success: false,
  error: "Auth sağlayıcısı hazır değil.",
});

type AuthContextValue = {
  loading: boolean;
  currentUser: string | null;
  users: StorageShape["users"];
  register: (username: string, password: string) => Promise<AuthResult>;
  login: (username: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  getMonth: (monthKey: string) => MonthlySnapshot | null;
  saveMonth: (snapshot: MonthlySnapshot) => void;
  saveAllMonths: (months: Record<string, MonthlySnapshot>) => void;
  saveUserRecord: (user: UserRecord) => void;
};

const defaultContextValue: AuthContextValue = {
  loading: true,
  currentUser: null,
  users: {},
  register: noopAsync,
  login: noopAsync,
  logout: () => {},
  getMonth: () => null,
  saveMonth: () => {},
  saveAllMonths: () => {},
  saveUserRecord: () => {},
};

const AuthContext = createContext<AuthContextValue>(defaultContextValue);

const withLoadingGuard = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch (error) {
    console.warn("AuthContext guard", error);
    return fallback;
  }
};

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [storage, setStorage] = useState<StorageShape>(INITIAL_STORAGE);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const refreshStorage = useCallback(async () => {
    const latest = await readStorage();
    setStorage(latest);
    return latest;
  }, []);

  // Note: per-user writes use writeUserRecord; monolithic writes remain available via writeStorage if needed.

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await refreshStorage();
        if (!active) return;
        const sessionUser = withLoadingGuard(() => readSession(), null);
        if (active && sessionUser) {
          // Load user's specific record into storage.users[currentUser]
          const userRecord = await readUserRecord(sessionUser);
          if (userRecord) {
            setStorage((prev) => ({ users: { ...prev.users, [sessionUser]: userRecord } }));
            setCurrentUser(sessionUser);
          } else {
            setCurrentUser(sessionUser);
          }
        } else if (active) {
          setCurrentUser(sessionUser);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, [refreshStorage]);

  const register = useCallback(
    async (username: string, password: string) => {
      const normalized = username.trim().toLowerCase();
      if (!normalized) {
        return {
          success: false,
          error: t("auth.errors.usernameMissing"),
        } as const;
      }

      if (password.length < 6) {
        return {
          success: false,
          error: t("auth.errors.passwordTooShort"),
        } as const;
      }

      try {
        const current = await refreshStorage();

        if (current.users[normalized]) {
          return {
            success: false,
            error: t("auth.errors.usernameTaken"),
          } as const;
        }

        const salt = generateSalt();
        const passwordHash = await hashPassword(password, salt);
        const newUser: UserRecord = {
          username: normalized,
          passwordHash,
          salt,
          createdAt: new Date().toISOString(),
          months: {},
        };

        // Persist only the user's file
        await writeUserRecord(normalized, newUser);
        // also update in-memory storage.users
        setStorage((prev) => ({ users: { ...prev.users, [normalized]: newUser } }));
        writeSession(normalized);
        setCurrentUser(normalized);
        return { success: true } as const;
      } catch (error) {
        console.error("Failed to register user", error);
        return {
          success: false,
          error: t("auth.errors.unexpected"),
        } as const;
      }
    },
    [refreshStorage, t]
  );

  const login = useCallback(
    async (username: string, password: string) => {
      const normalized = username.trim().toLowerCase();

      try {
        // Prefer per-user read
        const record = await readUserRecord(normalized) ?? (await refreshStorage()).users[normalized];
        if (!record) {
          return {
            success: false,
            error: t("auth.errors.userNotFound"),
          } as const;
        }

        const passwordHash = await hashPassword(password, record.salt);
        if (passwordHash !== record.passwordHash) {
          return {
            success: false,
            error: t("auth.errors.passwordIncorrect"),
          } as const;
        }

  writeSession(normalized);
  setCurrentUser(normalized);
        return { success: true } as const;
      } catch (error) {
        console.error("Failed to login", error);
        return {
          success: false,
          error: t("auth.errors.unexpected"),
        } as const;
      }
    },
    [refreshStorage, t]
  );

  const logout = useCallback(() => {
    writeSession(null);
    setCurrentUser(null);
  }, []);

  const getMonth = useCallback(
    (monthKey: string) => {
      if (!currentUser) return null;
      const user = storage.users[currentUser];
      if (!user) return null;

      const existing = user.months[monthKey];
      if (existing) {
        return existing;
      }

      return null;
    },
    [currentUser, storage.users]
  );

  const saveMonth = useCallback(
    (snapshot: MonthlySnapshot) => {
      if (!currentUser) return;
      const user = storage.users[currentUser];
      if (!user) return;

      const nextUser: UserRecord = {
        ...user,
        months: {
          ...user.months,
          [snapshot.monthKey]: {
            ...snapshot,
            updatedAt: new Date().toISOString(),
          },
        },
      };

      const nextStorage: StorageShape = {
        users: {
          ...storage.users,
          [currentUser]: nextUser,
        },
      };

      // Persist only this user's record
      setStorage(nextStorage);
      void writeUserRecord(currentUser, nextUser).catch((error) => {
        console.error("Failed to save month (user file)", error);
        void refreshStorage();
      });
    },
    [currentUser, refreshStorage, storage.users]
  );

  const saveAllMonths = useCallback(
    (months: Record<string, MonthlySnapshot>) => {
      if (!currentUser) return;
      const user = storage.users[currentUser];
      if (!user) return;

      const nextUser: UserRecord = {
        ...user,
        months,
      };

      const nextStorage: StorageShape = {
        users: {
          ...storage.users,
          [currentUser]: nextUser,
        },
      };

      setStorage(nextStorage);
      void writeUserRecord(currentUser, nextUser).catch((error) => {
        console.error("Failed to save all months (user file)", error);
        void refreshStorage();
      });
    },
    [currentUser, refreshStorage, storage.users]
  );

  const saveUserRecord = useCallback(
    (userRecord: UserRecord) => {
      if (!currentUser) return;
      const nextStorage: StorageShape = {
        users: {
          ...storage.users,
          [currentUser]: userRecord,
        },
      };
      setStorage(nextStorage);
      void writeUserRecord(currentUser, userRecord).catch((error) => {
        console.error("Failed to save user record (user file)", error);
        void refreshStorage();
      });
    },
    [currentUser, refreshStorage, storage.users]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      currentUser,
      users: storage.users,
      register,
      login,
      logout,
      getMonth,
      saveMonth,
      saveAllMonths,
      saveUserRecord,
    }),
    [currentUser, getMonth, loading, login, logout, register, saveAllMonths, saveMonth, saveUserRecord, storage.users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const ensureMonth = (
  monthKey: string,
  existing: MonthlySnapshot | null
): MonthlySnapshot => {
  if (existing) return existing;
  return createEmptySnapshot(monthKey);
};
