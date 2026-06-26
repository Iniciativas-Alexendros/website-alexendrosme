import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";

describe("siteConfig", () => {
  describe("campos básicos", () => {
    it("tiene name no vacío", () => {
      expect(siteConfig.name).toBeTruthy();
    });

    it("tiene title no vacío", () => {
      expect(siteConfig.title).toBeTruthy();
    });

    it("tiene description no vacía", () => {
      expect(siteConfig.description).toBeTruthy();
    });

    it("tiene url con https", () => {
      expect(siteConfig.url).toMatch(/^https:\/\/.+/);
    });

    it("tiene email válido", () => {
      expect(siteConfig.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("tiene location no vacía", () => {
      expect(siteConfig.location).toBeTruthy();
    });
  });

  describe("links", () => {
    it("todos los links son URLs válidas", () => {
      for (const [key, url] of Object.entries(siteConfig.links)) {
        expect(url, `links.${key}`).toMatch(/^https?:\/\//);
      }
    });

    it("tiene al menos 3 redes sociales", () => {
      expect(Object.keys(siteConfig.links).length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("nav", () => {
    it("tiene al menos 1 entrada", () => {
      expect(siteConfig.nav.length).toBeGreaterThan(0);
    });

    it("cada entrada tiene label y href", () => {
      for (const item of siteConfig.nav) {
        expect(item.label).toBeTruthy();
        expect(item.href).toBeTruthy();
      }
    });

    it("todos los href son anchors (empiezan con #)", () => {
      for (const item of siteConfig.nav) {
        expect(item.href).toMatch(/^#/);
      }
    });
  });

  describe("legalNav", () => {
    it("tiene al menos 3 entradas", () => {
      expect(siteConfig.legalNav.length).toBeGreaterThanOrEqual(3);
    });

    it("cada entrada tiene label y href", () => {
      for (const item of siteConfig.legalNav) {
        expect(item.label).toBeTruthy();
        expect(item.href).toBeTruthy();
      }
    });

    it("todos los href empiezan con /", () => {
      for (const item of siteConfig.legalNav) {
        expect(item.href).toMatch(/^\//);
      }
    });

    it("incluye aviso-legal, privacidad y cookies", () => {
      const hrefs = siteConfig.legalNav.map((item) => item.href);
      expect(hrefs).toContain("/legal/aviso-legal");
      expect(hrefs).toContain("/legal/privacidad");
      expect(hrefs).toContain("/legal/cookies");
    });
  });

  describe("contact", () => {
    it("tiene email válido", () => {
      expect(siteConfig.contact.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it("tiene telegram con handle que empieza con @", () => {
      expect(siteConfig.contact.telegram.handle).toMatch(/^@/);
    });

    it("tiene matrix con handle que contiene :", () => {
      expect(siteConfig.contact.matrix.handle).toContain(":");
    });
  });
});
