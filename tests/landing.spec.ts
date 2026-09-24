import { test, expect } from "@playwright/test";

test.describe("Landing · smoke + anchors + FABs", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("anti-monetization-dismissed", "true");
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("carga sin errores JS y muestra el hero", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.waitForLoadState("networkidle");
    expect(errors).toHaveLength(0);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("skip-link es el primer elemento enfocable y apunta a #main", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skipLink = page.locator(".skip-link:focus, .skip-link:focus-visible");
    await expect(skipLink).toBeVisible();
    const href = await skipLink.getAttribute("href");
    expect(href).toBe("#main");
  });

  test("logo hace scroll al top", async ({ page }) => {
    await page
      .locator(".anti-monetization-banner")
      .waitFor({ state: "hidden", timeout: 5000 })
      .catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.locator("header nav a[href='/']").first().click();
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 5000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test("nav contiene biografía, proyectos y opinión", async ({ page, viewport }) => {
    const isMobile = !viewport || viewport.width < 768;
    if (isMobile) {
      await expect(page.locator("a[href='#biografia']").first()).toBeAttached();
      await expect(page.locator("a[href='/proyectos']").first()).toBeAttached();
      await expect(page.locator("a[href='/opinion']").first()).toBeAttached();
    } else {
      const nav = page.locator("header nav ul").first();
      await expect(nav.locator("a[href='#biografia']")).toBeVisible();
      await expect(nav.locator("a[href='/proyectos']")).toBeVisible();
      await expect(nav.locator("a[href='/opinion']")).toBeVisible();
    }
  });

  test("nav desktop: enlace Productos visible con href/target/rel correctos", async ({
    page,
    viewport,
  }) => {
    const isMobile = !viewport || viewport.width < 768;
    if (!isMobile) {
      const productosLink = page.locator("header nav a[href='https://alexendros.dev']").first();
      await expect(productosLink).toBeVisible();
      await expect(productosLink).toHaveText(/Productos/);
      await expect(productosLink).toHaveAttribute("target", "_blank");
      await expect(productosLink).toHaveAttribute("rel", "noopener noreferrer");
      await expect(productosLink.locator("svg")).toBeAttached();
    }
  });

  test("nav mobile: enlace Productos NO visible (solo desktop)", async ({ page, viewport }) => {
    const isMobile = !viewport || viewport.width < 768;
    if (isMobile) {
      const productosLink = page.locator("header nav a[href='https://alexendros.dev']").first();
      await expect(productosLink).not.toBeVisible();
    }
  });

  test("sección biografía existe en el DOM", async ({ page }) => {
    await expect(page.locator("#biografia")).toBeAttached();
    await expect(page.locator("#publicaciones")).toBeAttached();
  });

  test("FAB Escríbeme es visible y abre el popover", async ({ page }) => {
    const fab = page.locator("button", { hasText: "Escríbeme" });
    await expect(fab).toBeVisible();
    await fab.click();
    await expect(page.locator("a[href^='mailto:']").first()).toBeVisible();
  });

  test("FABs: Escape cierra el popover y devuelve foco al trigger", async ({ page }) => {
    const fab = page.locator("button", { hasText: "Escríbeme" });
    await fab.click();
    await page.keyboard.press("Escape");
    await expect(fab).toBeFocused();
  });

  test("footer: enlace Hub de productos visible con href/target/rel correctos", async ({
    page,
  }) => {
    const footerLink = page.locator("footer a[href='https://alexendros.dev']").first();
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveText(/Hub de productos.*alexendros\.dev/);
    await expect(footerLink).toHaveAttribute("target", "_blank");
    await expect(footerLink).toHaveAttribute("rel", "noopener noreferrer");
    await expect(footerLink.locator("svg")).toBeAttached();
  });
});
