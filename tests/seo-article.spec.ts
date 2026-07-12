import { test, expect } from "@playwright/test";

test("artículo de espensar tiene BreadcrumbList y metadatos", async ({ page }) => {
  await page.goto("/espensar/critica-tecnologica");

  await expect(page.locator("#breadcrumb-json-ld")).toHaveCount(1);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toContain("/espensar/critica-tecnologica");
});
