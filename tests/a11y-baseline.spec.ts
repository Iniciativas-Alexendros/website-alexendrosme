import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "proyectos", path: "/proyectos" },
  { name: "alignux", path: "/proyectos/alignux" },
  { name: "neubat", path: "/proyectos/neubat" },
  { name: "opinion", path: "/opinion" },
  { name: "critica-tecnologica", path: "/opinion/critica-tecnologica" },
  { name: "manifiesto-eligete-a-ti", path: "/opinion/manifiesto-eligete-a-ti" },
  { name: "soberania-digital", path: "/opinion/soberania-digital" },
  { name: "escape-del-feudo", path: "/opinion/escape-del-feudo-algoritmico" },
  { name: "protocolos-vs-plataformas", path: "/opinion/protocolos-vs-plataformas" },
  { name: "tags", path: "/tags" },
  { name: "tags-alexendros", path: "/tags/alexendros" },
  { name: "aviso-legal", path: "/legal/aviso-legal" },
  { name: "privacidad", path: "/legal/privacidad" },
  { name: "cookies", path: "/legal/cookies" },
  { name: "seguridad", path: "/legal/seguridad" },
  { name: "error-404", path: "/nonexistent-page" },
];

for (const { name, path } of pages) {
  test.describe(`a11y baseline · ${name}`, () => {
    test("baseline completo guardado", async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toHaveLength(0);

      const metrics = {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
      };

      test.info().attach(`baseline-${name}`, {
        body: JSON.stringify(metrics, null, 2),
        contentType: "application/json",
      });
    });
  });
}
