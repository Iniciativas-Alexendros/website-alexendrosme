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

  it("description tiene entre 150 y 160 caracteres", () => {
    expect(siteConfig.description.length).toBeGreaterThanOrEqual(150);
    expect(siteConfig.description.length).toBeLessThanOrEqual(160);
  });

  it("description contiene las keywords objetivo", () => {
    const d = siteConfig.description.toLowerCase();
    expect(d).toContain("soberanía digital");
    expect(d).toContain("privacidad");
    expect(d).toContain("software libre");
    expect(d).toContain("crítica tecnológica");
  });

  it("url usa https", () => {
    expect(siteConfig.url).toMatch(/^https:\/\/.+/);
  });

  it("schema website.json comparte description con siteConfig", () => {
    expect(websiteSchema.description).toBe(siteConfig.description);
  });
});
