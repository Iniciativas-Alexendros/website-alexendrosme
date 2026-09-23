import { test, expect } from "@playwright/test";

test("no eval() in client-side code", async ({ page }) => {
  await page.goto("/");
  const scripts = await page.$$eval("script", (scripts) => scripts.map((s) => s.textContent || ""));

  for (const script of scripts) {
    expect(script).not.toMatch(/eval\s*\(/);
    expect(script).not.toMatch(/new\s+Function\s*\(/);
    expect(script).not.toMatch(/document\.write\s*\(/);
  }
});

test("no inline event handlers", async ({ page }) => {
  await page.goto("/");
  const inlineHandlers = await page.$$eval("[onclick], [onload], [onerror]", (els) => els.length);
  expect(inlineHandlers).toBe(0);
});
