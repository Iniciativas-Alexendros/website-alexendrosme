import { siteConfig } from "@/lib/site";

/** Absolute path starting with `/`, no trailing slash except root. */
export function hreflangAlternates(esPath: string): {
  canonical: string;
  languages: Record<string, string>;
} {
  const path = esPath === "/" ? "" : esPath.replace(/\/$/, "");
  const esUrl = `${siteConfig.url}${path || "/"}`.replace(/([^:]\/)\/+/g, "$1");
  const enPath = path ? `/en${path}` : "/en";
  const enUrl = `${siteConfig.url}${enPath}`;

  return {
    canonical: path || "/",
    languages: {
      es: esUrl.endsWith("/") && esUrl !== `${siteConfig.url}/` ? esUrl.slice(0, -1) : esUrl,
      en: enUrl,
      "x-default":
        esUrl.endsWith("/") && esUrl !== `${siteConfig.url}/` ? esUrl.slice(0, -1) : esUrl,
    },
  };
}

export function enPathFromEs(esPath: string): string {
  if (esPath === "/" || esPath === "") return "/en";
  return `/en${esPath.startsWith("/") ? esPath : `/${esPath}`}`;
}
