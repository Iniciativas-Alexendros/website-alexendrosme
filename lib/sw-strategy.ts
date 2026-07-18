const CACHE_VERSION = "v1";
export const STATIC_CACHE = `ax-static-${CACHE_VERSION}`;
export const NAV_CACHE = `ax-nav-${CACHE_VERSION}`;

const STATIC_PATTERNS = [/^\/_next\/static\//, /^\/fonts\//, /^\/og\//, /^\/search-index\.json$/];

const NEVER_CACHE = [/^\/sw\.js$/, /^\/workbox-.*\.js$/];

export type FetchStrategy = "static-cache-first" | "navigation" | "passthrough" | "never-cache";

export function selectStrategy(pathname: string, mode: string): FetchStrategy {
  if (NEVER_CACHE.some((re) => re.test(pathname))) return "never-cache";
  if (STATIC_PATTERNS.some((re) => re.test(pathname))) return "static-cache-first";
  if (mode === "navigate") return "navigation";
  return "passthrough";
}
