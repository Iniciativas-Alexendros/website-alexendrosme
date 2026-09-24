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
