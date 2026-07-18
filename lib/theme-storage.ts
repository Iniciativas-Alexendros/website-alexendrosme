import { createStore, get as idbGet, set as idbSet } from "idb-keyval";

export type ThemeValue = "light" | "dark" | "system";

export interface ThemeStorage {
  get(): Promise<ThemeValue | null>;
  set(value: ThemeValue): Promise<void>;
}

export const THEME_KEY = "theme";
export const VALID_THEMES: ReadonlySet<string> = new Set<ThemeValue>(["light", "dark", "system"]);
export const VALID_THEME_PATTERN = "light|dark|system" as const;
export const THEME_PATTERN_REGEX = new RegExp(`(?:^|;\\s*)(?:ax-th=)?(${VALID_THEME_PATTERN})`);

export function isTheme(value: string): value is ThemeValue {
  return VALID_THEMES.has(value);
}

/**
 * @internal Exported for unit tests only. Consume via `themeStorage`.
 */
export class LocalStorageThemeStorage implements ThemeStorage {
  async get(): Promise<ThemeValue | null> {
    try {
      const raw = localStorage.getItem(THEME_KEY);
      return raw && isTheme(raw) ? raw : null;
    } catch {
      return null;
    }
  }

  async set(value: ThemeValue): Promise<void> {
    if (!isTheme(value)) return;
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      // quota exceeded, incognito, or storage disabled — silently ignore
    }
  }
}

/**
 * @internal Exported for unit tests only. Consume via `themeStorage`.
 */
export class IndexedDBThemeStorage implements ThemeStorage {
  private _store: ReturnType<typeof createStore> | undefined;

  private get store(): ReturnType<typeof createStore> {
    if (!this._store) {
      this._store = createStore("alexendros-theme-db", "theme");
    }
    return this._store;
  }

  async get(): Promise<ThemeValue | null> {
    try {
      const raw = await idbGet(THEME_KEY, this.store);
      return typeof raw === "string" && isTheme(raw) ? raw : null;
    } catch {
      return null;
    }
  }

  async set(value: ThemeValue): Promise<void> {
    if (!isTheme(value)) return;
    try {
      await idbSet(THEME_KEY, value, this.store);
    } catch {
      // storage unavailable, blocked, or quota — silently ignore
    }
  }
}
export const THEME_STORAGE_BACKEND = "localStorage" as "localStorage" | "indexeddb";

export const themeStorage: ThemeStorage =
  THEME_STORAGE_BACKEND === "indexeddb"
    ? new IndexedDBThemeStorage()
    : new LocalStorageThemeStorage();
