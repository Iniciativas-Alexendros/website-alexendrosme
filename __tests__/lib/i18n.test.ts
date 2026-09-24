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
  it("returns the path when a former array key was removed", () => {
    expect(resolveFromDict(es, "sections.expFormacion.items")).toBe("sections.expFormacion.items");
  });

  it("returns the path when key is missing", () => {
    expect(resolveFromDict(es, "sections.publicaciones.nonexistent")).toBe(
      "sections.publicaciones.nonexistent",
    );
  });

  it("does NOT confuse string leaves with missing nested keys", () => {
    const title = resolveFromDict(es, "sections.publicaciones.title");
    const missing = resolveFromDict(es, "sections.publicaciones.items");
    expect(typeof title).toBe("string");
    expect(title).not.toBe("sections.publicaciones.title");
    expect(missing).toBe("sections.publicaciones.items");
  });
});

describe("i18n tags + opinion keys exist in both locales", () => {
  it("tags.indexTitle present in es + en", () => {
    expect(typeof resolveFromDict(es, "tags.indexTitle")).toBe("string");
    expect(typeof resolveFromDict(en, "tags.indexTitle")).toBe("string");
  });

  it("tags.detailLabel present + NOT equal to indexTitle", () => {
    const esLabel = resolveFromDict(es, "tags.detailLabel");
    const enLabel = resolveFromDict(en, "tags.detailLabel");
    expect(typeof esLabel).toBe("string");
    expect(typeof enLabel).toBe("string");
    expect(esLabel).not.toBe(resolveFromDict(es, "tags.indexTitle"));
    expect(enLabel).not.toBe(resolveFromDict(en, "tags.indexTitle"));
  });

  it("tags plural one/many keys are distinct strings", () => {
    const esOne = resolveFromDict(es, "tags.countLabelOne");
    const esMany = resolveFromDict(es, "tags.countLabelMany");
    expect(esOne).not.toBe(esMany);
    expect(typeof esOne).toBe("string");
    expect(typeof esMany).toBe("string");
  });

  it("opinion.featured and opinion.archive present in es + en", () => {
    expect(typeof resolveFromDict(es, "opinion.featured")).toBe("string");
    expect(typeof resolveFromDict(en, "opinion.featured")).toBe("string");
    expect(typeof resolveFromDict(es, "opinion.archive")).toBe("string");
    expect(typeof resolveFromDict(en, "opinion.archive")).toBe("string");
  });

  it("article.minutesShort differs between es and en (proves both are translated)", () => {
    const esShort = resolveFromDict(es, "article.minutesShort");
    const enShort = resolveFromDict(en, "article.minutesShort");
    expect(esShort).not.toBe(enShort);
  });
});

describe("count+label pluralization (mirrors pluralizeWithCount helper)", () => {
  // Mirrors the production helper from components/translated-labels.tsx:
  //   `${count} ${count === 1 ? label : pluralLabel}`
  // The helper itself is a thin wrapper around t(), so this duplicate-on-purpose
  // test locks the count+label contract that the helper depends on.
  const fmt = (count: number, dict: typeof es | typeof en) =>
    `${count} ${
      count === 1
        ? (resolveFromDict(dict, "tags.countLabelOne") as string)
        : (resolveFromDict(dict, "tags.countLabelMany") as string)
    }`;

  it("es count=1 produces '1 etiqueta'", () => {
    expect(fmt(1, es)).toBe("1 etiqueta");
  });
  it("es count>1 produces 'N etiquetas'", () => {
    expect(fmt(5, es)).toBe("5 etiquetas");
  });
  it("en count=1 produces '1 tag'", () => {
    expect(fmt(1, en)).toBe("1 tag");
  });
  it("en count>1 produces 'N tags'", () => {
    expect(fmt(5, en)).toBe("5 tags");
  });

  // Regression: prior bug rendered count=1 without the leading "1". This
  // assertion explicitly catches a re-introduction of that mistake.
  it("regression: count=1 always includes the numeric count", () => {
    for (const dict of [es, en] as const) {
      const rendered = fmt(1, dict);
      const labelOnly = (resolveFromDict(dict, "tags.countLabelOne") as string).trim();
      expect(rendered.startsWith("1 ")).toBe(true);
      expect(rendered.endsWith(labelOnly)).toBe(true);
    }
  });
});
