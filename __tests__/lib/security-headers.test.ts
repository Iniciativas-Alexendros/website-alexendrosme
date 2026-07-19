import { describe, it, expect } from "vitest";
import vercelConfig from "@/vercel.json";

type HeaderEntry = { key: string; value: string };
type HeaderBlock = { source: string; headers?: HeaderEntry[] };

const headers = (vercelConfig as { headers: HeaderBlock[] }).headers;

function findBlock(source: string): HeaderBlock {
  const block = headers.find((h) => h.source === source);
  if (!block) throw new Error(`Header block ${source} not found in vercel.json`);
  return block;
}

function headerValue(block: HeaderBlock, key: string): string {
  const value = block.headers?.find((h) => h.key === key)?.value;
  if (value === undefined) throw new Error(`Header ${key} not in block ${block.source}`);
  return value;
}

function csp(): string {
  const block = findBlock("/(.*)");
  return headerValue(block, "Content-Security-Policy");
}

describe("CSP — Plan A1", () => {
  it("allows 'unsafe-inline' in style-src for Next.js font injection", () => {
    const styleSrc = csp().match(/style-src[^;]+/)?.[0] ?? "";
    expect(styleSrc).toMatch(/'unsafe-inline'/);
  });

  it("includes sha256 hash in style-src", () => {
    const styleSrc = csp().match(/style-src[^;]+/)?.[0] ?? "";
    expect(styleSrc).toMatch(/'sha256-[A-Za-z0-9+/=]+'/);
  });

  it("preserves 'unsafe-inline' in script-src (required for Vercel Analytics)", () => {
    const scriptSrc = csp().match(/script-src[^;]+/)?.[0] ?? "";
    expect(scriptSrc).toMatch(/'unsafe-inline'/);
  });

  it("preserves va.vercel-scripts.com in script-src", () => {
    const scriptSrc = csp().match(/script-src[^;]+/)?.[0] ?? "";
    expect(scriptSrc).toContain("va.vercel-scripts.com");
  });
});

describe("Cache-Control — Plan A3", () => {
  it("fonts uses immutable + 1 year", () => {
    const cc = headerValue(findBlock("/fonts/(.*)"), "Cache-Control");
    expect(cc).toBe("public, max-age=31536000, immutable");
  });

  it("_next/static uses immutable + 1 year", () => {
    const cc = headerValue(findBlock("/_next/static/(.*)"), "Cache-Control");
    expect(cc).toBe("public, max-age=31536000, immutable");
  });

  it("/og/(.*) cacheable for 1 day", () => {
    const cc = headerValue(findBlock("/og/(.*)"), "Cache-Control");
    expect(cc).toContain("max-age=86400");
  });

  it("/search-index.json cacheable for 1 hour", () => {
    const cc = headerValue(findBlock("/search-index.json"), "Cache-Control");
    expect(cc).toBe("public, max-age=3600");
  });

  it("/manifest.json cacheable for 1 day", () => {
    const cc = headerValue(findBlock("/manifest.json"), "Cache-Control");
    expect(cc).toBe("public, max-age=86400");
  });

  it("/icon.svg cacheable for 1 day", () => {
    const cc = headerValue(findBlock("/icon.svg"), "Cache-Control");
    expect(cc).toBe("public, max-age=86400");
  });
});
