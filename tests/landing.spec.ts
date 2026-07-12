import { test, expect } from "@playwright/test";

test.describe("Landing · smoke + anchors + FABs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
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
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.locator("header nav a[href='/']").first().click();
    // Esperar hasta que el scroll termine (smooth puede tardar >600ms; CI más lento)
    await page.waitForFunction(() => window.scrollY < 100, { timeout: 5000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(100);
  });

  test("nav contiene los 3 anchors correctos", async ({ page, viewport }) => {
    const isMobile = !viewport || viewport.width < 768;
    if (isMobile) {
      // En mobile los anchors están dentro del Sheet — verificar que existen en el DOM
      await expect(page.locator("a[href='#biografia']").first()).toBeAttached();
      await expect(page.locator("a[href='#misiones']").first()).toBeAttached();
      await expect(page.locator("a[href='#experiencias']").first()).toBeAttached();
    } else {
      const nav = page.locator("header nav ul").first();
      await expect(nav.locator("a[href='#biografia']")).toBeVisible();
      await expect(nav.locator("a[href='#misiones']")).toBeVisible();
      await expect(nav.locator("a[href='#experiencias']")).toBeVisible();
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
      // Verificar icono ExternalLink presente
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

  test("secciones id existen en el DOM", async ({ page }) => {
    await expect(page.locator("#biografia")).toBeAttached();
    await expect(page.locator("#misiones")).toBeAttached();
    await expect(page.locator("#experiencias")).toBeAttached();
  });

  test("FAB Convócame es visible y abre el popover", async ({ page }) => {
    const fab = page.locator("button", { hasText: "Convócame" });
    await expect(fab).toBeVisible();
    await fab.click();
    await expect(page.locator("a[href^='mailto:']").first()).toBeVisible();
  });

  test("FABs: Escape cierra el popover y devuelve foco al trigger", async ({ page }) => {
    const fab = page.locator("button", { hasText: "Convócame" });
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
    // Verificar icono ExternalLink presente
    await expect(footerLink.locator("svg")).toBeAttached();
  });
});
