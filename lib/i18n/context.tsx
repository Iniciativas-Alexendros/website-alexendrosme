"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import type { Locale, I18nContextType, TranslationDict, TranslationValue } from "./types";
import es from "./dictionaries/es";
import en from "./dictionaries/en";

const LOCALE_KEY = "ax-locale";
const VALID_LOCALES: ReadonlySet<string> = new Set(["es", "en"]);

function isLocale(value: string): value is Locale {
  return VALID_LOCALES.has(value);
}

const dictionaries: Record<Locale, TranslationDict> = { es, en };

function resolveFromDict(dict: TranslationDict, path: string): TranslationValue {
  const keys = path.split(".");
  let current: TranslationValue | undefined = dict;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) {
      return path;
    }
    current = (current as Record<string, TranslationValue>)[key];
  }
  return current ?? path;
}

const I18nContext = createContext<I18nContextType>({
  locale: "es",
  t: (path: string) => path,
  tArray: () => [],
  setLocale: () => {},
});

function buildValue(locale: Locale, setLocaleFn: (l: Locale) => void): I18nContextType {
  const dict = dictionaries[locale];
  return {
    locale,
    t: (path: string) => {
      const v = resolveFromDict(dict, path);
      return typeof v === "string" ? v : path;
    },
    tArray: (path: string) => {
      const v = resolveFromDict(dict, path);
      return Array.isArray(v) ? v : [];
    },
    setLocale: setLocaleFn,
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && isLocale(stored)) {
      setLocaleState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!isLocale(newLocale)) return;
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch {
      // storage unavailable
    }
  }, []);

  // Prevent hydration mismatch — render children only after mount
  if (!mounted) {
    return (
      <I18nContext.Provider value={buildValue("es", setLocale)}>{children}</I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={buildValue(locale, setLocale)}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  return context;
}
