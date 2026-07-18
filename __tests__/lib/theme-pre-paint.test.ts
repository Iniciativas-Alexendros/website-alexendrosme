import { describe, expect, it } from "vitest";
import { prePaintScriptString } from "@/lib/theme-pre-paint";

const SCRIPT = prePaintScriptString();

describe("prePaintScriptString", () => {
  it("includes the theme cookie name (ax-th) so the read path matches the write path", () => {
    expect(SCRIPT).toContain("ax-th");
  });

  it("includes the reduced-motion cookie name (ax-rd)", () => {
    expect(SCRIPT).toContain("ax-rd");
  });

  it("falls back to localStorage('theme') if the cookie is absent", () => {
    expect(SCRIPT).toContain("localStorage.getItem('theme')");
  });

  it("applies 'light' or 'dark' class to documentElement based on resolved theme", () => {
    expect(SCRIPT).toContain("documentElement.classList.add(t)");
    expect(SCRIPT).toContain("documentElement.classList.add(m)");
  });

  it("sets data-theme attribute alongside the class", () => {
    expect(SCRIPT).toContain("setAttribute('data-theme',t)");
    expect(SCRIPT).toContain("setAttribute('data-theme',m)");
  });

  it("queries prefers-color-scheme: light for the user-system default", () => {
    expect(SCRIPT).toContain("(prefers-color-scheme: light)");
  });

  it("queries prefers-reduced-motion: reduce for the data-reduce hint", () => {
    expect(SCRIPT).toContain("(prefers-reduced-motion: reduce)");
    expect(SCRIPT).toContain("setAttribute('data-reduce','true')");
  });

  it("wraps the body in try/catch so a malformed cookie or storage throw is benign", () => {
    expect(SCRIPT.trim()).toMatch(/^\(function\(\)\{try\{[\s\S]+\}catch\(e\)\{\}\}\)\(\)$/);
  });

  it("does not use eval, Function constructor, or document.write (CSP-safe)", () => {
    expect(SCRIPT).not.toMatch(/\beval\(/);
    expect(SCRIPT).not.toMatch(/\bnew\s+Function\(/);
    expect(SCRIPT).not.toMatch(/document\.write/);
  });

  it("stays under the 800-byte budget for the inline script", () => {
    expect(SCRIPT.length).toBeLessThan(800);
  });
});
