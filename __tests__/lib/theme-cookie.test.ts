import { beforeEach, describe, expect, it } from "vitest";
import { __test, clearThemeCookie, readThemeCookie, writeThemeCookie } from "@/lib/theme-cookie";

/**
 * happy-dom + jsdom style cookie jars are unreliable for unit tests
 * (state survives, attributes get mangled, etc.). Build a minimal
 * mock that mirrors WHATWG only at the level our code uses: key=value
 * records keyed by cookie name. Writer counts accumulate so multi-write
 * operations (theme + reduce) are observable.
 */
function installCookieMock(): {
  seed: (raw: string) => void;
  writes: () => string[];
  reset: () => void;
} {
  const store = new Map<string, string>();
  const writeLog: string[] = [];

  const apply = (raw: string): void => {
    const trimmed = raw.trim().split(";")[0] ?? "";
    const eq = trimmed.indexOf("=");
    if (eq < 0) return;
    const k = trimmed.slice(0, eq).trim();
    const v = trimmed.slice(eq + 1).trim();
    if (!k) return;
    store.set(k, v);
  };

  Object.defineProperty(document, "cookie", {
    configurable: true,
    get(): string {
      return Array.from(store, ([k, v]) => `${k}=${v}`).join("; ");
    },
    set(value: string): void {
      writeLog.push(value);
      apply(value);
    },
  });

  return {
    seed(raw: string) {
      writeLog.length = 0;
      store.clear();
      raw
        .split(";")
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach(apply);
    },
    writes: () => [...writeLog],
    reset() {
      writeLog.length = 0;
      store.clear();
      Object.defineProperty(document, "cookie", { configurable: true, value: "" });
      Object.defineProperty(document, "cookie", {
        configurable: true,
        get(): string {
          return Array.from(store, ([k, v]) => `${k}=${v}`).join("; ");
        },
        set(value: string): void {
          writeLog.push(value);
          apply(value);
        },
      });
    },
  };
}

describe("writeThemeCookie", () => {
  let mock: ReturnType<typeof installCookieMock>;

  beforeEach(() => {
    mock = installCookieMock();
    mock.seed("");
  });

  it("writes both the theme cookie AND the reduce cookie (separate writes)", () => {
    writeThemeCookie({ theme: "dark", reduce: true });
    const all = mock.writes();
    expect(all).toHaveLength(2);
    expect(all[0]).toMatch(/^ax-th=dark\b/);
    expect(all[1]).toMatch(/^ax-rd=1\b/);
  });

  it.each(["light", "dark", "system"] as const)(
    "encodes the value %s so URL-special characters survive",
    (theme) => {
      writeThemeCookie({ theme, reduce: false });
      const all = mock.writes();
      expect(all).toHaveLength(2);
      expect(all[0]).toMatch(new RegExp(`^ax-th=${theme}\\b`));
      expect(all[1]).toMatch(/^ax-rd=0\b/);
    },
  );

  it("applies Path=/, SameSite=Strict, Max-Age=31536000 to both writes", () => {
    writeThemeCookie({ theme: "dark", reduce: true });
    for (const write of mock.writes()) {
      expect(write).toMatch(/Path=\//);
      expect(write).toMatch(/SameSite=Strict/);
      expect(write).toMatch(/Max-Age=31536000/);
    }
  });

  it("drops the Secure flag when not in an https context (dev-friendly)", () => {
    // happy-dom default location is about:blank — non-secure.
    writeThemeCookie({ theme: "dark", reduce: false });
    for (const write of mock.writes()) {
      expect(write).not.toMatch(/;\s*Secure\b/);
    }
  });

  it("keeps both cookies readable after a single call (multi-write works)", () => {
    writeThemeCookie({ theme: "dark", reduce: true });
    const cookie = document.cookie;
    expect(cookie).toMatch(/(?:^|;\s*)ax-th=dark/);
    expect(cookie).toMatch(/(?:^|;\s*)ax-rd=1\b/);
  });
});

describe("readThemeCookie", () => {
  let mock: ReturnType<typeof installCookieMock>;

  beforeEach(() => {
    mock = installCookieMock();
  });

  it("returns null when no theme cookies are present", () => {
    mock.seed("");
    expect(readThemeCookie()).toBeNull();
  });

  it("returns the stored theme when both cookies are valid", () => {
    mock.seed("ax-th=dark; ax-rd=1");
    expect(readThemeCookie()).toEqual({ theme: "dark", reduce: true });
  });

  it("defaults reduce=false when ax-rd is absent", () => {
    mock.seed("ax-th=light");
    expect(readThemeCookie()).toEqual({ theme: "light", reduce: false });
  });

  it.each(["purple", "PURPLE", "Light", "", "0"] as string[])(
    "ignores invalid theme %s but still reads the reduce hint",
    (bad) => {
      mock.seed(`ax-th=${encodeURIComponent(bad)}; ax-rd=1`);
      expect(readThemeCookie()).toEqual({ theme: "system", reduce: true });
    },
  );

  it("returns null when theme is invalid AND reduce hint is missing", () => {
    mock.seed(`ax-th=${encodeURIComponent("purple")}`);
    expect(readThemeCookie()).toBeNull();
  });

  it("decodes URL-encoded values", () => {
    mock.seed("ax-th=system; ax-rd=1");
    expect(readThemeCookie()).toEqual({ theme: "system", reduce: true });
  });

  it("handles tabs/spaces in the cookie separator", () => {
    mock.seed("ax-th=light;\tax-rd=1");
    expect(readThemeCookie()).toEqual({ theme: "light", reduce: true });
  });
});

describe("clearThemeCookie", () => {
  let mock: ReturnType<typeof installCookieMock>;

  beforeEach(() => {
    mock = installCookieMock();
  });

  it("writes two Expires=Thu, 01 Jan 1970 entries (one per cookie)", () => {
    mock.seed("ax-th=dark; ax-rd=1");
    clearThemeCookie();
    const all = mock.writes();
    expect(all).toHaveLength(2);
    const expiredTheme = all.find((w) => w.startsWith("ax-th="));
    const expiredReduce = all.find((w) => w.startsWith("ax-rd="));
    expect(expiredTheme).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(expiredReduce).toMatch(/Expires=Thu, 01 Jan 1970/);
  });
});

describe("constants exposed for testability", () => {
  it("exposes the cookie names", () => {
    expect(__test.THEME_COOKIE_NAME).toBe("ax-th");
    expect(__test.REDUCE_COOKIE_NAME).toBe("ax-rd");
  });

  it("exposes a 1-year Max-Age exactly", () => {
    expect(__test.COOKIE_MAX_AGE_SECONDS).toBe(60 * 60 * 24 * 365);
  });

  it("exported VALID_THEMES contains the canonical whitelist", () => {
    expect(__test.VALID_THEMES.has("light")).toBe(true);
    expect(__test.VALID_THEMES.has("dark")).toBe(true);
    expect(__test.VALID_THEMES.has("system")).toBe(true);
    expect(__test.VALID_THEMES.has("purple")).toBe(false);
  });
});
