/**
 * Cookie layer for theme + reduced-motion preference.
 *
 * Bridges the React-managed `themeStorage` (lib/theme-storage.ts) to a
 * pre-paint READ path: a synchronous inline `<script>` in `<head>`
 * (lib/theme-pre-paint.ts) reads these cookies and applies the
 * matching classes to `<html>` BEFORE first paint, eliminating the
 * FOUC that the React `useEffect` chain introduces after PR #110.
 *
 * NOT httpOnly: the httpOnly flag is silently dropped by browsers when
 * set from `document.cookie`. Use a regular Secure cookie and document
 * the trade-off in ADR 0004.
 */

import { VALID_THEMES } from "@/lib/theme-storage";

const THEME_COOKIE_NAME = "ax-th";
const REDUCE_COOKIE_NAME = "ax-rd";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

export interface ThemeCookieState {
  theme: "light" | "dark" | "system";
  reduce: boolean;
}

function isSecureContext(): boolean {
  return typeof window !== "undefined" && window.location?.protocol === "https:";
}

function defaultCookieAttributes(): string {
  // Path always; SameSite=Strict (no cross-site leg); Secure when https
  // (no-op on http localhost for dev); 1y Max-Age so repeat visits
  // benefit even after the user clears localStorage.
  return [
    "Path=/",
    "SameSite=Strict",
    isSecureContext() ? "Secure" : "",
    `Max-Age=${COOKIE_MAX_AGE_SECONDS}`,
  ]
    .filter(Boolean)
    .join("; ");
}

export function readThemeCookie(): ThemeCookieState | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ?? "";
  const themeMatch = cookies.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE_NAME}=([^;]+)`));
  const reduceMatch = cookies.match(new RegExp(`(?:^|;\\s*)${REDUCE_COOKIE_NAME}=([^;]+)`));
  const themeRaw = themeMatch ? decodeURIComponent(themeMatch[1] ?? "") : null;
  const reduce = reduceMatch ? decodeURIComponent(reduceMatch[1] ?? "") === "1" : null;
  if (themeRaw && VALID_THEMES.has(themeRaw)) {
    return { theme: themeRaw as ThemeCookieState["theme"], reduce: reduce ?? false };
  }
  if (reduce === true) {
    return { theme: "system", reduce: true };
  }
  return null;
}

export function writeThemeCookie(state: ThemeCookieState): void {
  if (typeof document === "undefined") return;
  const attrs = defaultCookieAttributes();
  try {
    document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(state.theme)}; ${attrs}`;
  } catch {
    // quota exceeded, Safari ITP, or blocked context — silently ignore
  }
  try {
    document.cookie = `${REDUCE_COOKIE_NAME}=${state.reduce ? "1" : "0"}; ${attrs}`;
  } catch {
    // same as above
  }
}

export function clearThemeCookie(): void {
  if (typeof document === "undefined") return;
  const past = "Thu, 01 Jan 1970 00:00:00 GMT";
  try {
    document.cookie = `${THEME_COOKIE_NAME}=; Path=/; Expires=${past}`;
  } catch {
    // ignore
  }
  try {
    document.cookie = `${REDUCE_COOKIE_NAME}=; Path=/; Expires=${past}`;
  } catch {
    // ignore
  }
}

/**
 * @internal Exported solely for vitest unit tests. Not part of the
 * public API; do not import from app code. Mirrors the @internal
 * tagged adapter classes in lib/theme-storage.ts.
 */
export const __test = {
  THEME_COOKIE_NAME,
  REDUCE_COOKIE_NAME,
  VALID_THEMES,
  COOKIE_MAX_AGE_SECONDS,
};
