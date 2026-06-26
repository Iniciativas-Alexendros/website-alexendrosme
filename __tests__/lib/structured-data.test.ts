import { describe, expect, it } from "vitest";
import { personJsonLd, websiteJsonLd } from "@/lib/structured-data";

describe("personJsonLd", () => {
  it("tiene @context de schema.org", () => {
    expect(personJsonLd["@context"]).toBe("https://schema.org");
  });

  it("tiene @type Person", () => {
    expect(personJsonLd["@type"]).toBe("Person");
  });

  it("tiene name no vacío", () => {
    expect(personJsonLd.name).toBeTruthy();
  });

  it("tiene url válida", () => {
    expect(personJsonLd.url).toMatch(/^https?:\/\//);
  });

  it("tiene jobTitle", () => {
    expect(personJsonLd.jobTitle).toBeTruthy();
  });

  it("tiene description no vacía", () => {
    expect(personJsonLd.description).toBeTruthy();
  });

  it("tiene knowsAbout como array con al menos 1 elemento", () => {
    expect(Array.isArray(personJsonLd.knowsAbout)).toBe(true);
    expect(personJsonLd.knowsAbout.length).toBeGreaterThan(0);
  });

  it("tiene address con @type PostalAddress", () => {
    expect(personJsonLd.address["@type"]).toBe("PostalAddress");
    expect(personJsonLd.address.addressLocality).toBeTruthy();
    expect(personJsonLd.address.addressCountry).toHaveLength(2);
  });

  it("tiene sameAs como array con al menos 1 URL", () => {
    expect(Array.isArray(personJsonLd.sameAs)).toBe(true);
    expect(personJsonLd.sameAs.length).toBeGreaterThan(0);
    for (const url of personJsonLd.sameAs) {
      expect(url).toMatch(/^https?:\/\//);
    }
  });
});

describe("websiteJsonLd", () => {
  it("tiene @context de schema.org", () => {
    expect(websiteJsonLd["@context"]).toBe("https://schema.org");
  });

  it("tiene @type WebSite", () => {
    expect(websiteJsonLd["@type"]).toBe("WebSite");
  });

  it("tiene name no vacío", () => {
    expect(websiteJsonLd.name).toBeTruthy();
  });

  it("tiene url válida", () => {
    expect(websiteJsonLd.url).toMatch(/^https?:\/\//);
  });

  it("tiene description no vacía", () => {
    expect(websiteJsonLd.description).toBeTruthy();
  });

  it("tiene author con @type Person", () => {
    expect(websiteJsonLd.author["@type"]).toBe("Person");
    expect(websiteJsonLd.author.name).toBeTruthy();
  });

  it("tiene inLanguage como código de idioma ISO", () => {
    expect(websiteJsonLd.inLanguage).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });
});

describe("consistencia entre structured data", () => {
  it("personJsonLd.url coincide con websiteJsonLd.url", () => {
    expect(personJsonLd.url).toBe(websiteJsonLd.url);
  });

  it("websiteJsonLd.author.name coincide con personJsonLd.name", () => {
    expect(websiteJsonLd.author.name).toBe(personJsonLd.name);
  });
});
