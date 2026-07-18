import { describe, it, expect } from "vitest";
import { selectStrategy } from "@/lib/sw-strategy";

describe("SW selectStrategy", () => {
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

  it("/espensar with navigate mode → navigation", () => {
    expect(selectStrategy("/espensar", "navigate")).toBe("navigation");
  });

  it("/ with navigate mode → navigation", () => {
    expect(selectStrategy("/", "navigate")).toBe("navigation");
  });

  it("/espensar without navigate mode → passthrough", () => {
    expect(selectStrategy("/espensar", "no-cors")).toBe("passthrough");
  });

  it("/sw.js → never-cache (CRITICAL)", () => {
    expect(selectStrategy("/sw.js", "navigate")).toBe("never-cache");
  });

  it("/workbox-abc123.js → never-cache", () => {
    expect(selectStrategy("/workbox-abc123.js", "no-cors")).toBe("never-cache");
  });
});
