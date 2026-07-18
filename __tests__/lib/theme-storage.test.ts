import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("idb-keyval", () => ({
  createStore: vi.fn(() => ({ __store: "mock" })),
  get: vi.fn(),
  set: vi.fn(),
}));

import { createStore, get as idbGet, set as idbSet } from "idb-keyval";
import {
  IndexedDBThemeStorage,
  LocalStorageThemeStorage,
  THEME_STORAGE_BACKEND,
  isTheme,
  themeStorage,
  type ThemeValue,
} from "@/lib/theme-storage";

const STORAGE_KEY = "theme";

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("isTheme type predicate", () => {
  it.each(["light", "dark", "system"] as const)("accepts %s", (v) => {
    expect(isTheme(v)).toBe(true);
  });

  it.each([
    "purple",
    "LIGHT",
    "",
    "light ",
    "0",
    "{}",
    "null",
    "undefined",
    "[object Object]",
    "true",
    "1",
  ])("rejects %s", (v) => {
    expect(isTheme(v)).toBe(false);
  });
});

describe("LocalStorageThemeStorage", () => {
  let inst: LocalStorageThemeStorage;

  beforeEach(() => {
    localStorage.clear();
    inst = new LocalStorageThemeStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("get()", () => {
    it("returns null when storage is empty", async () => {
      await expect(inst.get()).resolves.toBeNull();
    });

    it("returns null when stored value is invalid", async () => {
      localStorage.setItem(STORAGE_KEY, "purple");
      await expect(inst.get()).resolves.toBeNull();
    });

    it.each(["light", "dark", "system"] as const)(
      "returns the stored valid theme %s",
      async (v) => {
        localStorage.setItem(STORAGE_KEY, v);
        await expect(inst.get()).resolves.toBe(v);
      },
    );

    it("returns null on incognito-style error", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });
      await expect(inst.get()).resolves.toBeNull();
    });
  });

  describe("set()", () => {
    it.each(["light", "dark", "system"] as const)("writes the value %s", async (v) => {
      await inst.set(v);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(v);
    });

    it("ignores quota errors silently", async () => {
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
      await expect(inst.set("dark" as ThemeValue)).resolves.toBeUndefined();
    });

    it.each(["purple", "", "LIGHT", "null"] as string[])(
      "does not write invalid value %s",
      async (bad) => {
        await inst.set(bad as ThemeValue);
        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      },
    );
  });
});

describe("IndexedDBThemeStorage", () => {
  let inst: IndexedDBThemeStorage;

  beforeEach(() => {
    vi.mocked(idbGet).mockReset();
    vi.mocked(idbSet).mockReset();
    vi.mocked(createStore).mockClear();
    inst = new IndexedDBThemeStorage();
  });

  it("lazy-creates the store only on first access", async () => {
    expect(vi.mocked(createStore)).not.toHaveBeenCalled();
    vi.mocked(idbGet).mockResolvedValue(undefined);
    await inst.get();
    expect(vi.mocked(createStore)).toHaveBeenCalledTimes(1);
    await inst.get();
    expect(vi.mocked(createStore)).toHaveBeenCalledTimes(1);
  });

  it("returns null when idbGet yields undefined", async () => {
    vi.mocked(idbGet).mockResolvedValue(undefined);
    await expect(inst.get()).resolves.toBeNull();
  });

  it("returns null when idbGet yields non-string garbage", async () => {
    vi.mocked(idbGet).mockResolvedValue(123);
    await expect(inst.get()).resolves.toBeNull();
  });

  it.each(["light", "dark", "system"] as const)("returns %s when stored", async (v) => {
    vi.mocked(idbGet).mockResolvedValue(v);
    await expect(inst.get()).resolves.toBe(v);
  });

  it("invokes idbSet with key, value, and a store handle", async () => {
    vi.mocked(idbSet).mockResolvedValue(undefined);
    await inst.set("light" as ThemeValue);
    expect(vi.mocked(idbSet)).toHaveBeenCalledWith(STORAGE_KEY, "light", expect.anything());
  });

  it("swallows idbGet rejections", async () => {
    vi.mocked(idbGet).mockRejectedValue(new Error("blocked"));
    await expect(inst.get()).resolves.toBeNull();
  });

  it("swallows idbSet rejections", async () => {
    vi.mocked(idbSet).mockRejectedValue(new Error("versionerror"));
    await expect(inst.set("dark" as ThemeValue)).resolves.toBeUndefined();
  });

  it.each(["purple", "", "LIGHT", "null"] as string[])(
    "does not write invalid value %s",
    async (bad) => {
      await inst.set(bad as ThemeValue);
      expect(idbSet).not.toHaveBeenCalled();
    },
  );
});

describe("Backend flip-point (single constant)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("THEME_STORAGE_BACKEND is 'localStorage' on this commit", () => {
    expect(THEME_STORAGE_BACKEND).toBe("localStorage");
  });

  it("themeStorage resolves through localStorage, not idb-keyval", async () => {
    localStorage.setItem(STORAGE_KEY, "dark");
    const idbGetCallsBefore = vi.mocked(idbGet).mock.calls.length;
    await expect(themeStorage.get()).resolves.toBe("dark");
    expect(vi.mocked(idbGet).mock.calls.length).toBe(idbGetCallsBefore);
  });

  it("singleton round-trips cleanly through a microtask", async () => {
    localStorage.clear();
    const promise = themeStorage.get();
    await flushMicrotasks();
    await expect(promise).resolves.toBeNull();
  });
});
