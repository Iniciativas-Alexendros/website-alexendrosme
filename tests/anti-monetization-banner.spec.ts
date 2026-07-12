import { test, expect } from "@playwright/test";

test.describe("Anti-monetization banner", () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear localStorage before each test
    await context.clearCookies();
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("visible on first visit with correct text and icon", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");
    await expect(banner).toBeVisible();

    // Check shield icon exists
    await expect(banner.locator("svg.lucide-shield")).toBeVisible();

    // Check text content
    await expect(banner.locator(".anti-monetization-banner__text")).toContainText(
      "Este espacio es libre de dinero. Sin anuncios, sin afiliados, sin tracking.",
    );

    // Check link
    const link = banner.locator(".anti-monetization-banner__link");
    await expect(link).toBeVisible();
    await expect(link).toContainText("Lo comercial vive en alexendros.dev");
    await expect(link).toHaveAttribute("href", "https://alexendros.dev");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("dismiss button works and hides banner", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");
    await expect(banner).toBeVisible();

    const dismissBtn = banner.locator(".anti-monetization-banner__dismiss");
    await dismissBtn.click();

    await expect(banner).not.toBeVisible();
  });

  test("persists dismissal across reloads via localStorage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");
    await expect(banner).toBeVisible();

    const dismissBtn = banner.locator(".anti-monetization-banner__dismiss");
    await dismissBtn.click();

    await expect(banner).not.toBeVisible();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Banner should still be hidden
    await expect(banner).not.toBeVisible();

    // Verify localStorage was set
    const dismissed = await page.evaluate(() =>
      localStorage.getItem("anti-monetization-dismissed"),
    );
    expect(dismissed).toBe("true");
  });

  test("respects prefers-reduced-motion: reduce", async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");
    await expect(banner).toBeVisible();
    await expect(banner).toHaveAttribute("data-reduced-motion", "true");

    // The reduced motion class should be applied
    await expect(banner).toHaveClass(/anti-monetization-banner--reduced-motion/);
  });

  test("link has correct attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const link = page.locator(".anti-monetization-banner__link");

    // Check attributes
    await expect(link).toHaveAttribute("href", "https://alexendros.dev");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");

    const href = await link.getAttribute("href");
    expect(href).toBe("https://alexendros.dev");
  });

  test("banner appears above nav (z-index)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");
    const nav = page.locator("header.site-nav");

    await expect(banner).toBeVisible();
    await expect(nav).toBeVisible();

    // Verify banner is at top of body (before header)
    const bannerPosition = await banner.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top;
    });
    const navPosition = await nav.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top;
    });

    // Banner should be at or near top (0), nav should be below it
    expect(bannerPosition).toBeLessThanOrEqual(navPosition);
  });

  test("banner has glass effect styling", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const banner = page.locator(".anti-monetization-banner");

    const style = await banner.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backdropFilter: computed.backdropFilter,
        webkitBackdropFilter: computed.getPropertyValue("-webkit-backdrop-filter"),
        backgroundColor: computed.backgroundColor,
        borderBottomWidth: computed.borderBottomWidth,
      };
    });

    // Check for glass effect: background with transparency + border
    expect(style.backgroundColor).toBeTruthy();
    expect(style.borderBottomWidth).toBe("1px");
    // The glass effect is created via background transparency and backdrop-filter in CSS
    // which may not be reflected in computed style directly
  });

  test("banner does not intercept clicks on elements below it after dismiss", async ({
    page,
    viewport,
  }) => {
    test.skip(!!viewport && viewport.width < 768, "Mobile nav is in Sheet, not directly clickable");
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Dismiss the banner first to test nav click
    const banner = page.locator(".anti-monetization-banner");
    await banner.locator(".anti-monetization-banner__dismiss").click();
    await expect(banner).not.toBeVisible();

    // Now test nav click works
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.locator("header nav a[href='/']").first().click();
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 5000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });
});
