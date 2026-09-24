import { test, expect } from "@playwright/test";

const BASE = "https://alexendros.me";

interface Article {
  collection: string;
  slug: string;
}

const ARTICLES: Article[] = [
  { collection: "opinion", slug: "critica-tecnologica" },
  { collection: "opinion", slug: "manifiesto-eligete-a-ti" },
  { collection: "opinion", slug: "soberania-digital" },
  { collection: "opinion", slug: "protocolos-vs-plataformas" },
  { collection: "opinion", slug: "escape-del-feudo-algoritmico" },
  { collection: "proyectos", slug: "espacio-libre-de-dinero" },
  { collection: "proyectos", slug: "elegir-con-criterio" },
];

test.describe("OG and Twitter images per article", () => {
  for (const { collection, slug } of ARTICLES) {
    test(`meta tags de ${collection}/${slug} apuntan a ruta per-article`, async ({ page }) => {
      await page.goto(`/${collection}/${slug}`);

      const expected = `${BASE}/${collection}/${slug}/opengraph-image`;

      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      expect(ogImage).toBe(expected);

      const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute("content");
      expect(twitterImage).toBe(expected);
    });
  }
});
