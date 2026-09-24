import { siteConfig } from "@/lib/site";

/** Root site OG — static export emits `opengraph-image.png`. */
export function rootOgImageUrl(): string {
  return `${siteConfig.url}/opengraph-image.png`;
}

/**
 * Per-article OG — static export emits `opengraph-image` (no extension).
 * Metadata must match the file on disk or social crawlers get 404.
 */
export function articleOgImageUrl(collection: "opinion" | "proyectos", slug: string): string {
  return `${siteConfig.url}/${collection}/${slug}/opengraph-image`;
}
