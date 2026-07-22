import { describe, expect, it } from "vitest";
import type { Locale, TranslationDict, TranslationValue, I18nContextType } from "@/lib/i18n/types";

describe("i18n types — compile-time contract (runtime smoke tests)", () => {
  it("Locale es valida como 'es'", () => {
    const locale: Locale = "es";
    expect(locale).toBe("es");
  });

  it("Locale en valida como 'en'", () => {
    const locale: Locale = "en";
    expect(locale).toBe("en");
  });

  it("TranslationValue acepta string", () => {
    const v: TranslationValue = "hello";
    expect(typeof v).toBe("string");
  });

  it("TranslationValue acepta string[]", () => {
    const v: TranslationValue = ["a", "b"];
    expect(Array.isArray(v)).toBe(true);
  });

  it("TranslationValue acepta objeto anidado", () => {
    const v: TranslationValue = { nested: { deeper: "value" } };
    const obj = v as Record<string, Record<string, string>>;
    expect(obj.nested?.deeper).toBe("value");
  });

  it("TranslationDict acepta estructura completa", () => {
    const dict: TranslationDict = {
      greeting: "Hola",
      list: ["item1", "item2"],
      section: { title: "Section", body: "Body" },
    };
    expect(dict.greeting).toBe("Hola");
    expect(Array.isArray(dict.list)).toBe(true);
    expect((dict.section as Record<string, unknown>).title).toBe("Section");
  });

  it("I18nContextType tiene la firma correcta", () => {
    const ctx: I18nContextType = {
      locale: "es",
      t: (path: string) => path,
      tArray: (path: string) => [path],
      setLocale: (_locale: Locale) => {},
    };
    expect(ctx.locale).toBe("es");
    expect(ctx.t("hero.title")).toBe("hero.title");
    expect(ctx.tArray("items")).toEqual(["items"]);
  });

  it("I18nContextType.setLocale acepta es o en", () => {
    let captured: Locale = "es";
    const ctx: I18nContextType = {
      locale: "es",
      t: (p: string) => p,
      tArray: () => [],
      setLocale: (l: Locale) => {
        captured = l;
      },
    };
    ctx.setLocale("en");
    expect(captured).toBe("en");
  });
});

describe("i18n type exports desde @/lib/i18n", () => {
  it("exporta Locale, TranslationDict, I18nContextType como tipos", async () => {
    // Verificar que los tipos se exportan correctamente desde el barrel
    const mod = await import("@/lib/i18n");
    // Los tipos no existen en runtime, pero verificamos que el módulo existe
    expect(mod.I18nProvider).toBeDefined();
    expect(mod.useI18n).toBeDefined();
  });
});
