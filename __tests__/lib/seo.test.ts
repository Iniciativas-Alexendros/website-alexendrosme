import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "@/lib/site";

const websiteSchema = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "public", "schema", "website.json"), "utf-8"),
);

describe("SEO metadata", () => {
  it("title empieza con Alexendros y no supera 60 caracteres", () => {
    expect(siteConfig.title).toMatch(/^Alexendros/);
    expect(siteConfig.title.length).toBeLessThanOrEqual(60);
  });

  it("description tiene entre 140 y 170 caracteres", () => {
    expect(siteConfig.description.length).toBeGreaterThanOrEqual(140);
    expect(siteConfig.description.length).toBeLessThanOrEqual(170);
  });

  it("description contiene las keywords objetivo", () => {
    const d = siteConfig.description.toLowerCase();
    expect(d).toContain("opinión");
    expect(d).toContain("proyectos");
    expect(d).toContain("libertad");
    expect(d).toContain("valencia");
  });

  it("url usa https", () => {
    expect(siteConfig.url).toMatch(/^https:\/\/.+/);
  });

  it("schema website.json comparte description con siteConfig", () => {
    expect(websiteSchema.description).toBe(siteConfig.description);
  });
});
