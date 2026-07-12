import { test, expect } from "@playwright/test";

const testPages = [
  { name: "home", path: "/" },
  { name: "aviso-legal", path: "/legal/aviso-legal" },
];

const themes: Array<"light" | "dark"> = ["light", "dark"];

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const testPage of testPages) {
  for (const theme of themes) {
    for (const viewport of viewports) {
      test(`visual regression: ${testPage.name} - ${theme} - ${viewport.name}`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Set theme via localStorage before navigation to avoid FOUC
        await page.addInitScript((theme) => {
          localStorage.setItem("theme", theme);
          document.documentElement.classList.add(theme);
          document.documentElement.setAttribute("data-theme", theme);
          document.documentElement.classList.remove(theme === "light" ? "dark" : "light");
        }, theme);

        await page.goto(testPage.path, { waitUntil: "networkidle" });

        // Wait for fonts to load
        await page.waitForLoadState("networkidle");
        await page.evaluate(() => document.fonts.ready);

        // Hide dynamic elements that cause flaky screenshots
        await page.addStyleTag({
          content: `
            .particle-bg, .atm__haze, .atm__spark, .atm__dust,
            .marquee-track, [data-testid="particle-bg"] {
              display: none !important;
            }
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          `,
        });

        // Wait a bit for styles to apply
        await page.waitForTimeout(100);

        // Take screenshot
        await expect(page).toHaveScreenshot(`${testPage.name}-${theme}-${viewport.name}.png`, {
          fullPage: true,
          animations: "disabled",
          threshold: 0.2,
          maxDiffPixels: 1000,
        });
      });
    }
  }
}
