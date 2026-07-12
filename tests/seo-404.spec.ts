import { test, expect } from "@playwright/test";

test("404 no es indexable y vuelve al inicio", async ({ page }) => {
  await page.goto("/pagina-que-no-existe");

  const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
  expect(robots).toContain("noindex");

  await expect(page.locator("text=Página no encontrada")).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio", exact: true })).toBeVisible();
});
