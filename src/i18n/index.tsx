"use client";

import { createContext, ReactNode, useContext, useMemo, useState, useCallback } from "react";
import { tr, type TrMessages } from "./locales/tr";
import { en, type EnMessages } from "./locales/en";

// Expand Locale type to allow future locales. Include 'en' as a selectable
// option even if translations may fallback to Turkish for now.
export type Locale = "tr" | "en";

type TranslationValues = Record<string, string | number>;

type TranslationContextValue = {
  locale: Locale;
  messages: TrMessages;
  t: (key: string, values?: TranslationValues) => string;
  setLocale: (locale: Locale) => void;
};

const defaultLocale: Locale = "tr";

// messagesByLocale holds messages for each supported locale. We use a
// Partial<Record<Locale, ...>> to allow adding locales incrementally.
const messagesByLocale: Partial<Record<Locale, TrMessages | EnMessages>> = {
  tr,
  en,
};

export const AVAILABLE_LOCALES: Locale[] = ["tr", "en"];

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

const resolvePath = (messages: TrMessages, key: string): unknown => {
  return key.split(".").reduce<unknown>((result, segment) => {
    if (result && typeof result === "object" && segment in result) {
      return (result as Record<string, unknown>)[segment];
    }

    return undefined;
  }, messages);
};

const formatTemplate = (template: string, values?: TranslationValues) => {
  if (!values) {
    return template;
  }

  return template.replace(/{{(.*?)}}/g, (_, rawKey: string) => {
    const trimmed = rawKey.trim();
    const value = values[trimmed];
    return value === undefined || value === null ? `` : String(value);
  });
};

export const TranslationProvider = ({
  locale: initialLocale = defaultLocale,
  children,
  onLocaleChange,
}: {
  locale?: Locale;
  children: ReactNode;
  // optional external locale change handler for controlled usage
  onLocaleChange?: (locale: Locale) => void;
}) => {
  // support either controlled (onLocaleChange provided) or internal state
  const [internalLocale, setInternalLocale] = useState<Locale>(initialLocale);

  const locale = initialLocale ?? internalLocale;

  const setLocale = useCallback(
    (next: Locale) => {
      if (onLocaleChange) {
        onLocaleChange(next);
      } else {
        setInternalLocale(next);
      }
    },
    [onLocaleChange]
  );

  const selectedMessages: TrMessages = messagesByLocale[locale] ?? tr;

  const value = useMemo<TranslationContextValue>(() => {
    return {
      locale,
      messages: selectedMessages,
      t: (key, values) => {
        const resolved = resolvePath(selectedMessages, key);
        if (resolved == null) {
          console.warn(`[i18n] Missing translation key: ${key}`);
          return key;
        }

        if (typeof resolved === "string") {
          return formatTemplate(resolved, values);
        }

        console.warn(`[i18n] Translation key does not resolve to a string: ${key}`);
        return key;
      },
      setLocale,
    };
  }, [locale, selectedMessages, setLocale]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }

  return context;
};

