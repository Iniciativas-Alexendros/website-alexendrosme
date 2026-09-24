import { describe, expect, it } from "vitest";
import { slugifyTag, tagPath } from "@/lib/seo/tags";
import { articleOgImageUrl, rootOgImageUrl } from "@/lib/seo/og";
import { hreflangAlternates } from "@/lib/seo/hreflang";

describe("slugifyTag", () => {
  it("strips accents and spaces to kebab ASCII", () => {
    expect(slugifyTag("crítica tecnológica")).toBe("critica-tecnologica");
    expect(slugifyTag("filosofía")).toBe("filosofia");
    expect(slugifyTag("Alexendros")).toBe("alexendros");
  });

  it("builds tag paths", () => {
    expect(tagPath("ética")).toBe("/tags/etica");
  });
});

describe("og helpers", () => {
  it("root uses .png; articles omit extension", () => {
    expect(rootOgImageUrl()).toContain("/opengraph-image.png");
    expect(articleOgImageUrl("opinion", "critica-tecnologica")).toMatch(
      /\/opinion\/critica-tecnologica\/opengraph-image$/,
    );
  });
});

describe("hreflangAlternates", () => {
  it("pairs es and en URLs", () => {
    const alts = hreflangAlternates("/opinion");
    expect(alts.languages.es).toContain("/opinion");
    expect(alts.languages.en).toContain("/en/opinion");
    expect(alts.languages["x-default"]).toContain("/opinion");
  });
});

describe("pathForLocaleSwitch", () => {
  it("strips /en without allowing protocol-relative URLs", async () => {
    const { pathForLocaleSwitch } = await import("@/lib/i18n/locale-path");
    expect(pathForLocaleSwitch("/en//evil.com", "es")).toBe("/evil.com");
    expect(pathForLocaleSwitch("/en///evil.com", "es")).toBe("/evil.com");
    expect(pathForLocaleSwitch("/en/opinion", "es")).toBe("/opinion");
    expect(pathForLocaleSwitch("/en", "es")).toBe("/");
  });

  it("prefixes /en for Spanish paths", async () => {
    const { pathForLocaleSwitch } = await import("@/lib/i18n/locale-path");
    expect(pathForLocaleSwitch("/", "en")).toBe("/en");
    expect(pathForLocaleSwitch("/proyectos", "en")).toBe("/en/proyectos");
    expect(pathForLocaleSwitch("/en/opinion", "en")).toBeNull();
  });
});
