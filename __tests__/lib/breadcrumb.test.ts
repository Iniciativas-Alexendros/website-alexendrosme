import { describe, expect, it } from "vitest";
import { buildBreadcrumbJsonLd } from "@/lib/seo/breadcrumb";
import { siteConfig } from "@/lib/site";

describe("buildBreadcrumbJsonLd", () => {
  it("devuelve un BreadcrumbList con Inicio como primer elemento", () => {
    const json = buildBreadcrumbJsonLd([
      { name: "Opinión", href: `${siteConfig.url}/opinion` },
      { name: "Crítica tecnológica", href: `${siteConfig.url}/opinion/critica-tecnologica` },
    ]);

    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@type"]).toBe("BreadcrumbList");
    expect(json.itemListElement).toHaveLength(3);
    expect(json.itemListElement[0]?.position).toBe(1);
    expect(json.itemListElement[0]?.item.name).toBe("Inicio");
    expect(json.itemListElement[2]?.item.name).toBe("Crítica tecnológica");
  });
});
