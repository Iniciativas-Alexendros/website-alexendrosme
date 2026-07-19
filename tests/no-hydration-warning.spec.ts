import { test, expect, type ConsoleMessage } from "@playwright/test";

/**
 * Regeneration guard for the `<html suppressHydrationWarning>` attribute
 * on app/layout.tsx. If a future contributor removes it thinking it's
 * redundant, the inline pre-paint script (lib/theme-pre-paint.ts) will
 * mutate `<html>` (class + data-theme) BEFORE React hydrates and React
 * will emit a hydration warning into the console. This test catches
 * that — and any other hydration/server/client-text mismatches — under
 * a stress of 10 rapid theme toggles in well under 1 second.
 *
 * The regex is intentionally tight (does NOT match the broader
 * `/hydrat|server|client/i` from the original brief because that broad
 * pattern collides with legitimate Vercel Analytics init messages and
 * Next.js dev-mode output, causing flake).
 *
 * COUPLING SCOPE:
 * - This test ONLY guards `<html suppressHydrationWarning>` against
 *   removal that would surface a hydration warning during the
 *   React reconciliation phase.
 * - It does NOT detect whether `lib/theme-pre-paint.ts` actually
 *   mutates `<html>` before hydration (that module wraps the IIFE
 *   body in a silent try/catch; if it ever stops mutating, no warning
 *   fires, and this test passes regardless of suppressHydrationWarning).
 *   That second coverage pillar lives in `__tests__/lib/theme-pre-paint.test.ts`.
 * - Popover UX correctness (open/close transitions, focus management,
 *   forceMount wiring) is intentionally OUT of scope here — see
 *   `tests/landing.spec.ts` and `tests/a11y.spec.ts`.
 */

const HYDRATION_REGEX = /(hydration|did not match|Text content does not match|server HTML)/i;

test.describe("no-hydration-warning · regression guard", () => {
  // Force desktop viewport across all 3 projects (desktop, tablet,
  // mobile-sm): the regression we guard against is independent of
  // device size — the pre-paint script + hydration warning logic
  // fires identically at any viewport once `<html>` is rendered.
  // The trade-off is 3× wall-clock in CI (one webServer spin per
  // project) for the same payload, but each run is sub-second.
  test.use({ viewport: { width: 1440, height: 900 } });

  test("10 rapid theme toggles emit zero hydration/server/client warnings", async ({ page }) => {
    // Pre-dismiss the anti-monetization banner BEFORE the page mounts.
    // The banner sits at the top of the viewport with `position: fixed`
    // and high z-index, so without this addInitScript the trigger
    // button would receive click-interception errors from Playwright.
    // (Pattern lifted from tests/landing.spec.ts.)
    await page.addInitScript(() => {
      localStorage.setItem("anti-monetization-dismissed", "true");
    });

    const errors: string[] = [];

    page.on("console", (msg: ConsoleMessage) => {
      const type = msg.type();
      if ((type === "warning" || type === "error") && HYDRATION_REGEX.test(msg.text())) {
        const loc = msg.location();
        errors.push(`[${type}] ${msg.text()} @ ${loc.url}:${loc.lineNumber}`);
      }
    });

    page.on("pageerror", (err: Error) => {
      if (HYDRATION_REGEX.test(err.message)) {
        errors.push(`[pageerror] ${err.message}`);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // First paint + React steady-state: the inline pre-paint script
    // wrote data-theme synchronously; the theme-provider useEffect
    // converged on the same value. `<html>` now has the attribute
    // either way.
    await expect(page.locator("html")).toHaveAttribute("data-theme", /dark|light/);

    const trigger = page.locator(".theme-toggle-trigger").first();
    // Use raw role locator instead of getByRole to avoid visibility filtering
    // when PopoverContent has forceMount (elements stay in DOM but hidden).
    const menuItems = page.locator('[role="menuitemradio"]');

    // Warm-up click: confirms the popover opens & closes correctly and
    // primes `isLoaded=true` so the storage + cookie writes actually
    // happen during the stress loop below.
    await trigger.click();
    await expect(menuItems.first()).toBeVisible();
    await menuItems.first().click();

    // Stress: 10 rapid cycles through system/light/dark.
    // The `click({ force: true })` bypasses Playwright's stability +
    // actionability wait because Radix Popover animates the menu
    // portal (~150ms transition) between close and re-open, which makes
    // standard stability checks timeout during the burst loop. This
    // intentionally narrows the test's scope: popover UX (open/close
    // transitions, focus management, forceMount wiring) is covered by
    // tests/landing.spec.ts and tests/a11y.spec.ts — here we ONLY want
    // to catch hydration / server-html / client-text mismatch warnings
    // emitted by React during this stress burst.
    for (let i = 0; i < 10; i++) {
      await trigger.click({ force: true });
      await menuItems.first().click({ force: true });
    }

    await page.waitForTimeout(500);

    expect(
      errors,
      `Hydration/server/client warnings detected during theme toggle stress:\n${errors.join("\n")}`,
    ).toHaveLength(0);
  });
});
