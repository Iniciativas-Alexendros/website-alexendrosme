import { test, expect } from "@playwright/test";

test.describe("/now page", () => {
  test("carga con breadcrumb y metadatos", async ({ page }) => {
    await page.goto("/now");

    await expect(page.locator("#breadcrumb-json-ld")).toHaveCount(1);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/now");

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toContain("Ahora");
  });

  test("h1 y contenido visible", async ({ page }) => {
    await page.goto("/now");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toBeVisible();

    // Las secciones deben estar visibles
    await expect(page.locator("h2")).toHaveCount(3);
  });

  test("enlace de volver al inicio existe", async ({ page }) => {
    await page.goto("/now");

    const backLink = page.locator("a.back-link");
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/");
  });
});
