import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CACHE_VERSION, selectStrategy } from "@/lib/sw-strategy";

describe("SW selectStrategy", () => {
  it("CACHE_VERSION matches public/sw.js", () => {
    const sw = readFileSync(join(process.cwd(), "public/sw.js"), "utf8");
    const match = sw.match(/const CACHE_VERSION = "([^"]+)"/);
    expect(match?.[1]).toBe(CACHE_VERSION);
  });

  it("/_next/static/foo.js → static-cache-first", () => {
    expect(selectStrategy("/_next/static/foo.js", "no-cors")).toBe("static-cache-first");
  });

  it("/fonts/GeistVF.woff2 → static-cache-first", () => {
    expect(selectStrategy("/fonts/GeistVF.woff2", "no-cors")).toBe("static-cache-first");
  });

  it("/og/opengraph-image.png → static-cache-first", () => {
    expect(selectStrategy("/og/opengraph-image.png", "no-cors")).toBe("static-cache-first");
  });

  it("/search-index.json → static-cache-first", () => {
    expect(selectStrategy("/search-index.json", "no-cors")).toBe("static-cache-first");
  });

  it("/ideas with navigate mode → navigation", () => {
    expect(selectStrategy("/ideas", "navigate")).toBe("navigation");
  });

  it("/ with navigate mode → navigation", () => {
    expect(selectStrategy("/", "navigate")).toBe("navigation");
  });

  it("/ideas without navigate mode → passthrough", () => {
    expect(selectStrategy("/ideas", "no-cors")).toBe("passthrough");
  });

  it("/sw.js → never-cache (CRITICAL)", () => {
    expect(selectStrategy("/sw.js", "navigate")).toBe("never-cache");
  });

  it("/workbox-abc123.js → never-cache", () => {
    expect(selectStrategy("/workbox-abc123.js", "no-cors")).toBe("never-cache");
  });
});
