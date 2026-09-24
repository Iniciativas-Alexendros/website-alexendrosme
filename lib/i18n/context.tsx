"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale, I18nContextType, TranslationDict, TranslationValue } from "./types";
import es from "./dictionaries/es";
import en from "./dictionaries/en";
import { pathForLocaleSwitch } from "./locale-path";

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

const localeListeners = new Set<() => void>();

function subscribeLocale(onStoreChange: () => void): () => void {
  localeListeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === LOCALE_KEY || e.key === null) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function emitLocaleChange(): void {
  localeListeners.forEach((listener) => listener());
}

function pathLocale(): Locale | null {
  const path = window.location.pathname;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return null;
}

/** Client snapshot: URL prefix wins, then localStorage, then document.lang. */
function getClientLocale(): Locale {
  const fromPath = pathLocale();
  if (fromPath) return fromPath;
  try {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored && isLocale(stored)) return stored;
  } catch {
    // storage unavailable
  }
  const lang = document.documentElement.lang;
  if (isLocale(lang)) return lang;
  return "es";
}

function navigateForLocale(newLocale: Locale): boolean {
  // Vitest/jsdom exercises the localStorage path without full page navigation.
  if (process.env.VITEST) return false;
  const path = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;
  const dest = pathForLocaleSwitch(path, newLocale);
  if (!dest) return false;
  window.location.assign(`${dest}${search}${hash}`);
  return true;
}

export function I18nProvider({
  children,
  forcedLocale,
}: {
  children: ReactNode;
  forcedLocale?: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    () => forcedLocale ?? getClientLocale(),
    () => forcedLocale ?? "es",
  );

  const setLocale = useCallback((newLocale: Locale) => {
    if (!isLocale(newLocale)) return;
    if (navigateForLocale(newLocale)) return;
    document.documentElement.lang = newLocale;
    try {
      localStorage.setItem(LOCALE_KEY, newLocale);
    } catch {
      // storage unavailable
    }
    emitLocaleChange();
  }, []);

  const value = useMemo(() => buildValue(locale, setLocale), [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
