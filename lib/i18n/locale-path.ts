"use client";

import { usePathname } from "next/navigation";

/** Returns `"/en"` when on the English tree, otherwise `""`. */
export function useLocalePrefix(): string {
  const pathname = usePathname();
  return pathname === "/en" || pathname.startsWith("/en/") ? "/en" : "";
}

export function withLocalePrefix(prefix: string, path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("#")) return path;

  if (path.includes("#")) {
    const [basePath, hash] = path.split("#");
    return `${withLocalePrefix(prefix, basePath || "/")}#${hash}`;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!prefix) return normalized === "/" ? "/" : normalized;
  if (normalized === "/") return prefix;
  return `${prefix}${normalized}`;
}

/**
 * Same-origin path when switching locale via the URL tree.
 * Collapses duplicate slashes so `/en//host` cannot become protocol-relative `//host`.
 */
export function pathForLocaleSwitch(pathname: string, newLocale: "es" | "en"): string | null {
  const path = pathname || "/";
  if (newLocale === "en") {
    if (path === "/en" || path.startsWith("/en/")) return null;
    const dest = path === "/" ? "/en" : `/en${path}`;
    return dest.replace(/\/{2,}/g, "/");
  }
  if (path !== "/en" && !path.startsWith("/en/")) return null;
  if (path === "/en") return "/";
  const rest = path.slice(3) || "/";
  const normalized = rest.replace(/^\/+/, "/") || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}
