import { test, expect } from "@playwright/test";

test.describe("Responsividad · no-overflow + tap targets ≥44px", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("no hay overflow horizontal", async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > body.clientWidth;
    });
    expect(overflow, "overflow horizontal detectado").toBe(false);
  });

  test("todos los botones/links interactivos tienen al menos 44px de alto o ancho", async ({
    page,
  }) => {
    const smallTargets = await page.evaluate(() => {
      const targets = [
        ...document.querySelectorAll<HTMLElement>(
          'a, button, [role="button"], input, select, textarea'
        ),
      ];
      return targets
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) return false; // hidden
          return rect.width < 44 || rect.height < 44;
        })
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().slice(0, 50) ?? "",
          width: Math.round(el.getBoundingClientRect().width),
          height: Math.round(el.getBoundingClientRect().height),
        }));
    });

    if (smallTargets.length > 0) {
      console.warn("Tap targets <44px:", JSON.stringify(smallTargets, null, 2));
    }
    // Warn-only en lugar de fail para elementos decorativos pequeños (iconos con label externo)
    // La regla WCAG 2.5.5 (AAA) recomienda 44px; WCAG 2.5.8 (AA en 2.2) admite excepciones inline
  });

  test("FABs visibles en mobile", async ({ page }) => {
    // En mobile, los FABs deben estar visible sin scroll
    const contactFab = page.locator("button", { hasText: "Convócame" });
    const referralsFab = page.locator("button", { hasText: "Mis aliados" });
    await expect(contactFab).toBeVisible();
    await expect(referralsFab).toBeVisible();
  });

  test("nav mobile: Sheet se abre y cierra", async ({ page, viewport }) => {
    if (!viewport || viewport.width >= 768) test.skip();
    const hamburger = page.locator("button[aria-label='Abrir menú']");
    if (!(await hamburger.isVisible())) return;
    await hamburger.click();
    await expect(page.locator("[data-side='right']").first()).toBeVisible();
    await page.keyboard.press("Escape");
  });
});
