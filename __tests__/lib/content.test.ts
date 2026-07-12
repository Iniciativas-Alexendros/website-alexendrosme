import { describe, expect, it } from "vitest";
import { getRawContent, getContentCollection } from "@/lib/content/loader";

describe("colección espensar", () => {
  it("incluye el artículo migrado desde Notion", async () => {
    const article = await getRawContent("espensar", "manifiesto-eligete-a-ti");
    expect(article).not.toBeNull();
    expect(article?.frontmatter.title).toBe("Manifiesto “¡Elígete a ti!”");
    expect(article?.frontmatter.description).toBeTruthy();
    expect(article?.frontmatter.tags.length).toBeGreaterThan(0);
    expect(article?.content.length).toBeGreaterThan(500);
  });

  it("no hay artículos en borrador", async () => {
    const items = await getContentCollection("espensar");
    for (const item of items) {
      expect(item.frontmatter.draft).toBe(false);
    }
  });
});
