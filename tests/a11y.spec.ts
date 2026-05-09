import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "aviso-legal", path: "/legal/aviso-legal" },
  { name: "privacidad", path: "/legal/privacidad" },
  { name: "cookies", path: "/legal/cookies" },
];

for (const { name, path } of pages) {
  test.describe(`a11y WCAG 2.1 AA · ${name}`, () => {
    test("sin violaciones axe-core", async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      if (results.violations.length > 0) {
        const summary = results.violations
          .map(
            (v) =>
              `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.target.join(", ")).join(" | ")}`
          )
          .join("\n\n");
        console.error(`Violations on ${path}:\n${summary}`);
      }

      expect(results.violations).toHaveLength(0);
    });
  });
}
