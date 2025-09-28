"use client";

import { FormEvent, useState } from "react";
import { AuthResult } from "@/context/AuthContext";
import { useTranslation } from "@/i18n";
import { LanguagePicker } from "@/components/dashboard/financial-dashboard/LanguagePicker";

const cardVariants = {
  base: "mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/60 p-8 shadow-xl backdrop-blur-lg dark:bg-neutral-900/70 dark:border-white/5",
  title: "text-2xl font-semibold text-neutral-900 dark:text-white",
  subtitle: "mt-2 text-sm text-neutral-600 dark:text-neutral-300",
  tabs: "mt-6 flex items-center gap-2 rounded-full bg-neutral-200/80 p-1 dark:bg-neutral-800/80",
  tabButton:
    "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500",
  tabActive: "bg-white shadow dark:bg-neutral-700",
  label: "text-sm font-medium text-neutral-700 dark:text-neutral-200",
  input:
    "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-neutral-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-emerald-400",
  button:
    "mt-6 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400/70",
  helper: "mt-6 text-center text-sm text-neutral-600 dark:text-neutral-300",
  error:
    "mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300",
};

type AuthCardProps = {
  onLogin: (username: string, password: string) => Promise<AuthResult>;
  onRegister: (username: string, password: string) => Promise<AuthResult>;
};

export const AuthCard = ({ onLogin, onRegister }: AuthCardProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, setLocale } = useTranslation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      setError(t("auth.errors.usernameRequired"));
      return;
    }

    if (!password) {
      setError(t("auth.errors.passwordRequired"));
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError(t("auth.errors.passwordMismatch"));
      return;
    }

    setPending(true);
    const action = mode === "login" ? onLogin : onRegister;
    try {
      const result = await action(username, password);
      if (!result.success) {
        setError(result.error ?? t("auth.errors.generic"));
      } else {
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError(t("auth.errors.unexpected"));
    } finally {
      setPending(false);
    }
  };

  const activeTabClass = (value: "login" | "register") =>
    `${cardVariants.tabButton} ${mode === value ? cardVariants.tabActive : "text-neutral-500 dark:text-neutral-400"}`;

  return (
    <div className={cardVariants.base}>
      <div className="flex items-start justify-end">
        <LanguagePicker
          selected={undefined}
          onChange={(next) => setLocale(next)}
        />
      </div>
      <h1 className={cardVariants.title}>{t("auth.title")}</h1>
      <p className={cardVariants.subtitle}>{t("auth.subtitle")}</p>

      <div className={cardVariants.tabs}>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={activeTabClass("login")}
        >
          {t("auth.tabs.login")}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
          }}
          className={activeTabClass("register")}
        >
          {t("auth.tabs.register")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="username" className={cardVariants.label}>
            {t("auth.labels.username")}
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            className={cardVariants.input}
            placeholder={t("auth.placeholders.username")}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={pending}
          />
        </div>

        <div>
          <label htmlFor="password" className={cardVariants.label}>
            {t("auth.labels.password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className={cardVariants.input}
            placeholder={t("auth.placeholders.password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
          />
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="confirmPassword" className={cardVariants.label}>
              {t("auth.labels.confirmPassword")}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={cardVariants.input}
              placeholder={t("auth.placeholders.confirmPassword")}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={pending}
            />
          </div>
        )}

        {error ? <div className={cardVariants.error}>{error}</div> : null}

        <button type="submit" className={cardVariants.button} disabled={pending}>
          {pending
            ? t("common.processing")
            : mode === "login"
              ? t("auth.buttons.login")
              : t("auth.buttons.register")}
        </button>
      </form>

      <p className={cardVariants.helper}>{t("auth.helper")}</p>
    </div>
  );
};
