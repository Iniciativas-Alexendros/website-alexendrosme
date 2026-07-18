import { describe, it, expect } from "vitest";
import es from "@/lib/i18n/dictionaries/es";
import en from "@/lib/i18n/dictionaries/en";

type Dict = typeof es;

function resolveFromDict(dict: Dict, path: string): unknown {
  const keys = path.split(".");
  let current: unknown = dict;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return path;
    current = (current as Record<string, unknown>)[key];
  }
  return current ?? path;
}

describe("i18n dictionaries (es / en parity)", () => {
  it("have identical key sets", () => {
    const collectKeys = (obj: unknown, prefix = ""): string[] => {
      if (typeof obj !== "object" || obj === null) return prefix ? [prefix] : [];
      if (Array.isArray(obj)) return prefix ? [prefix] : [];
      return Object.entries(obj).flatMap(([k, v]) => {
        const next = prefix ? `${prefix}.${k}` : k;
        if (typeof v === "object" && v !== null && !Array.isArray(v)) return collectKeys(v, next);
        return [next];
      });
    };
    const esKeys = collectKeys(es).sort();
    const enKeys = collectKeys(en).sort();
    expect(esKeys).toEqual(enKeys);
  });
});

describe("resolveFromDict (string leaves)", () => {
  it("returns the string value at a nested path", () => {
    expect(resolveFromDict(es, "hero.signature")).toBe(
      "Alexendros. Grandes soluciones de un ingenio no previsto.",
    );
    expect(resolveFromDict(en, "hero.signature")).toBe(
      "Alexendros. Great solutions from unforeseen ingenuity.",
    );
  });

  it("returns the path string when a key is missing", () => {
    expect(resolveFromDict(es, "non.existent.key")).toBe("non.existent.key");
  });

  it("returns the path when traversing into a string leaf", () => {
    expect(resolveFromDict(es, "hero.signature.foo")).toBe("hero.signature.foo");
  });
});

describe("resolveFromDict (string[] leaves)", () => {
  it("returns the array at sections.expFormacion.items (es)", () => {
    const v = resolveFromDict(es, "sections.expFormacion.items");
    expect(Array.isArray(v)).toBe(true);
    expect(v).toHaveLength(3);
  });

  it("returns the array at sections.expStack.items (en)", () => {
    const v = resolveFromDict(en, "sections.expStack.items");
    expect(Array.isArray(v)).toBe(true);
    expect(v).toHaveLength(6);
  });

  it("returns the array at sections.expHerramientas.items (es)", () => {
    const v = resolveFromDict(es, "sections.expHerramientas.items");
    expect(Array.isArray(v)).toBe(true);
    expect(v).toHaveLength(4);
  });

  it("returns the path when key is missing", () => {
    expect(resolveFromDict(es, "sections.expFormacion.nonexistent")).toBe(
      "sections.expFormacion.nonexistent",
    );
  });

  it("does NOT confuse array leaves with string leaves", () => {
    // `category` is a string; `items` is a string[]
    const cat = resolveFromDict(es, "sections.expFormacion.category");
    const items = resolveFromDict(es, "sections.expFormacion.items");
    expect(typeof cat).toBe("string");
    expect(Array.isArray(items)).toBe(true);
  });
});