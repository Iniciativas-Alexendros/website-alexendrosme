import { test, expect } from "@playwright/test";

test.describe("hreflang + /en locale tree", () => {
  test("home ES exposes es/en/x-default alternates", async ({ page }) => {
    await page.goto("/");
    const es = page.locator('link[rel="alternate"][hreflang="es"]');
    const en = page.locator('link[rel="alternate"][hreflang="en"]');
    const xd = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(es).toHaveAttribute("href", /https:\/\/alexendros\.me\/?$/);
    await expect(en).toHaveAttribute("href", /https:\/\/alexendros\.me\/en\/?$/);
    await expect(xd).toHaveAttribute("href", /https:\/\/alexendros\.me\/?$/);
  });

  test("/en home loads with English chrome", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("opinion article pairs hreflang including /en/opinion/…", async ({ page }) => {
    await page.goto("/opinion/critica-tecnologica");
    const en = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(en).toHaveAttribute(
      "href",
      "https://alexendros.me/en/opinion/critica-tecnologica",
    );
  });

  test("locale toggle navigates to /en counterpart", async ({ page }, testInfo) => {
    // Desktop nav chrome: LocaleToggle stays visible; mobile-sm packs it with hamburger.
    test.skip(
      testInfo.project.name === "mobile-sm",
      "Locale toggle is not reliably clickable in the mobile-sm chrome",
    );
    await page.goto("/now");
    await page.getByRole("button", { name: /idioma|language|locale/i }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/now\/?$/);
  });
});
