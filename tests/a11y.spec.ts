import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "home", path: "/" },
  { name: "proyectos (collection)", path: "/proyectos" },
  { name: "proyectos: alignux", path: "/proyectos/alignux" },
  { name: "proyectos: neubat", path: "/proyectos/neubat" },
  { name: "opinion (collection)", path: "/opinion" },
  { name: "opinion: crítica tecnológica", path: "/opinion/critica-tecnologica" },
  { name: "opinion: manifiesto elígete a ti", path: "/opinion/manifiesto-eligete-a-ti" },
  { name: "opinion: soberanía digital", path: "/opinion/soberania-digital" },
  { name: "opinion: escape del feudo", path: "/opinion/escape-del-feudo-algoritmico" },
  { name: "opinion: protocolos vs plataformas", path: "/opinion/protocolos-vs-plataformas" },
  { name: "tags (index)", path: "/tags" },
  { name: "tags: Alexendros", path: "/tags/alexendros" },
  { name: "legal: aviso legal", path: "/legal/aviso-legal" },
  { name: "legal: privacidad", path: "/legal/privacidad" },
  { name: "legal: cookies", path: "/legal/cookies" },
  { name: "legal: seguridad", path: "/legal/seguridad" },
  { name: "error 404", path: "/nonexistent-page" },
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
              `[${v.impact}] ${v.id}: ${v.description}\n  Nodes: ${v.nodes.map((n) => n.target.join(", ")).join(" | ")}`,
          )
          .join("\n\n");
        console.error(`Violations on ${path}:\n${summary}`);
      }

      expect(results.violations).toHaveLength(0);
    });
  });
}
