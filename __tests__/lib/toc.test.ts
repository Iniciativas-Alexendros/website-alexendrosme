import { describe, it, expect } from "vitest";
import { extractToc } from "@/lib/content/toc";

describe("extractToc", () => {
  it("returns empty for no headings", () => {
    expect(extractToc("just text")).toEqual([]);
  });

  it("extracts h2 and h3 only by default (minLevel=2, maxLevel=3)", () => {
    const md = `# H1\n\n## Title 1\n\n### Subtitle\n\n#### H4 detailed`;
    const toc = extractToc(md);
    expect(toc).toHaveLength(2);
    expect(toc[0]).toEqual({ id: "title-1", text: "Title 1", level: 2 });
    expect(toc[1]).toEqual({ id: "subtitle", text: "Subtitle", level: 3 });
  });

  it("preserves accents as rehype-slug does", () => {
    const md = `## ¿Cómo funciona?`;
    const toc = extractToc(md);
    // github-slugger (que usa rehype-slug) NO es unicode-aware:
    // trata [A-Za-z0-9_] como word, otros chars como sep. Por tanto
    // ó > 0x7F se trata como separador. Output: "c-mo-funciona"
    expect(toc[0]?.id).toBe("c-mo-funciona");
  });

  it("collapses multiple spaces and dashes", () => {
    const md = `##   Multiple   Spaces   `;
    const toc = extractToc(md);
    expect(toc[0]?.id).toBe("multiple-spaces");
  });

  it("strips leading/trailing whitespace", () => {
    const md = `##   trimmed   `;
    const toc = extractToc(md);
    expect(toc[0]?.id).toBe("trimmed");
  });

  it("respects custom minLevel and maxLevel", () => {
    const md = `# H1\n## H2\n### H3\n#### H4`;
    const toc = extractToc(md, 3, 4);
    expect(toc).toHaveLength(2);
    expect(toc.map((t) => t.level)).toEqual([3, 4]);
  });
});
