import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function runSitemapScript(): void {
  execFileSync("npx", ["tsx", "scripts/generate-sitemap.ts"], {
    stdio: "pipe",
  });
}

function readFile(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), "public", name), "utf-8");
}

describe("generate-sitemap", () => {
  it("writes index + 3 segmented sitemaps", () => {
    runSitemapScript();
    for (const f of [
      "sitemap.xml",
      "sitemap-pages.xml",
      "sitemap-proyectos.xml",
      "sitemap-opinion.xml",
    ]) {
      expect(fs.existsSync(path.join(process.cwd(), "public", f))).toBe(true);
    }
  });

  it("index references all three sub-sitemaps", () => {
    const xml = readFile("sitemap.xml");
    expect(xml).toContain("sitemap-pages.xml");
    expect(xml).toContain("sitemap-proyectos.xml");
    expect(xml).toContain("sitemap-opinion.xml");
  });

  it("pages sitemap includes /proyectos, /opinion and /tags", () => {
    const xml = readFile("sitemap-pages.xml");
    expect(xml).toContain("https://alexendros.me/proyectos");
    expect(xml).toContain("https://alexendros.me/opinion");
    expect(xml).toContain("https://alexendros.me/tags");
    expect(xml).toContain("https://alexendros.me/");
    expect(xml).toContain("https://alexendros.me/legal/aviso-legal");
    expect(xml).not.toContain("https://alexendros.me/now");
  });

  it("pages sitemap includes /en tree", () => {
    const xml = readFile("sitemap-pages.xml");
    expect(xml).toContain("https://alexendros.me/en");
    expect(xml).toContain("https://alexendros.me/en/opinion");
    expect(xml).toContain("https://alexendros.me/en/proyectos");
    expect(xml).not.toContain("https://alexendros.me/en/now");
  });

  it("article sitemaps include image: namespace", () => {
    const proy = readFile("sitemap-proyectos.xml");
    expect(proy).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
    expect(proy).toMatch(/<image:image>[\s\S]*<\/image:image>/);
    const opinion = readFile("sitemap-opinion.xml");
    expect(opinion).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  });

  it("article image:loc points to per-article /opengraph-image (no .png)", () => {
    const proy = readFile("sitemap-proyectos.xml");
    const locations = proy.match(/<image:loc>([^<]+)<\/image:loc>/g) ?? [];
    expect(locations.length).toBeGreaterThan(0);
    for (const loc of locations) {
      expect(loc).toMatch(/\/proyectos\/[^/]+\/opengraph-image</);
      expect(loc).not.toContain("opengraph-image.png");
    }
  });

  it("XML is well-formed (basic structural check)", () => {
    const indexXml = readFile("sitemap.xml");
    expect(indexXml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(indexXml).toMatch(/<sitemapindex[^>]*>/);
    expect(indexXml.endsWith("</sitemapindex>\n")).toBe(true);

    for (const f of ["sitemap-pages.xml", "sitemap-proyectos.xml", "sitemap-opinion.xml"]) {
      const xml = readFile(f);
      expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
      expect(xml).toMatch(/<urlset[^>]*>/);
      expect(xml.endsWith("</urlset>\n")).toBe(true);
    }
  });
});
