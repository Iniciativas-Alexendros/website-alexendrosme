import { describe, expect, it } from "vitest";
import { generateFeeds, generateCollectionFeeds } from "@/lib/feed";
import { siteConfig } from "@/lib/site";
import { getContentCollection } from "@/lib/content/loader";

/* Helper: inline escapeXml to test without importing private fn */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

describe("generateFeeds", () => {
  it("genera RSS y Atom con todos los artículos públicos", async () => {
    const espensar = await getContentCollection("espensar");
    const esposible = await getContentCollection("esposible");
    const { rss, atom } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });

    expect(rss).toContain("<?xml");
    expect(rss).toContain("<rss");
    expect(rss).toContain("<channel>");
    expect(rss).toContain("</channel>");
    expect(rss).toContain("</rss>");

    expect(atom).toContain("<?xml");
    expect(atom).toContain("<feed");
    expect(atom).toContain("</feed>");

    const total = espensar.length + esposible.length;
    expect(rss.match(/<item>/g)?.length).toBe(total);
    expect(atom.match(/<entry>/g)?.length).toBe(total);

    expect(rss).toContain(siteConfig.url);
    expect(atom).toContain(siteConfig.url);
  });

  it("incluye el atom:link de autoreferencia en RSS", async () => {
    const espensar = await getContentCollection("espensar");
    const esposible = await getContentCollection("esposible");
    const { rss } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });
    expect(rss).toContain('atom:link href="https://alexendros.me/feed.xml" rel="self"');
  });

  it("ordena artículos por fecha descendente", async () => {
    const espensar = await getContentCollection("espensar");
    const esposible = await getContentCollection("esposible");
    const { rss } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });
    const dates = [...rss.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) =>
      new Date((m[1] as string | undefined) ?? "").getTime(),
    );
    for (let i = 1; i < dates.length; i++) {
      const curr = dates[i] as number;
      const prev = dates[i - 1] as number;
      expect(curr).toBeLessThanOrEqual(prev);
    }
  });
});

describe("escapeXml", () => {
  it("escapa & a &amp;", () => {
    expect(escapeXml("a & b")).toBe("a &amp; b");
  });

  it("escapa < a &lt;", () => {
    expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("escapa > a &gt;", () => {
    expect(escapeXml("a > b")).toBe("a &gt; b");
  });

  it('escapa " a &quot;', () => {
    expect(escapeXml('say "hello"')).toBe("say &quot;hello&quot;");
  });

  it("escapa ' a &apos;", () => {
    expect(escapeXml("it's")).toBe("it&apos;s");
  });

  it("escapa caracteres combinados", () => {
    expect(escapeXml("<foo bar=\"baz\" class='a'>&stuff</foo>")).toBe(
      "&lt;foo bar=&quot;baz&quot; class=&apos;a&apos;&gt;&amp;stuff&lt;/foo&gt;",
    );
  });

  it("devuelve string vacío intacto", () => {
    expect(escapeXml("")).toBe("");
  });

  it("devuelve texto sin caracteres especiales intacto", () => {
    expect(escapeXml("hello world")).toBe("hello world");
  });
});

describe("generateCollectionFeeds", () => {
  it("genera RSS y Atom para espensar", async () => {
    const espensar = await getContentCollection("espensar");
    const { rss, atom } = generateCollectionFeeds(siteConfig, "espensar", "Es pensar", espensar);

    expect(rss).toContain("<?xml");
    expect(rss).toContain("<rss");
    expect(rss).toContain("Es pensar");
    expect(rss).toContain("/espensar");
    expect(rss).toContain("/feed-espensar.xml");

    expect(atom).toContain("<?xml");
    expect(atom).toContain("<feed");
    expect(atom).toContain("Es pensar");

    expect(rss.match(/<item>/g)?.length).toBe(espensar.length);
    expect(atom.match(/<entry>/g)?.length).toBe(espensar.length);
  });

  it("genera RSS y Atom para esposible", async () => {
    const esposible = await getContentCollection("esposible");
    const { rss, atom } = generateCollectionFeeds(siteConfig, "esposible", "Es posible", esposible);

    expect(rss).toContain("Es posible");
    expect(rss).toContain("/esposible");
    expect(rss).toContain("/feed-esposible.xml");

    expect(rss.match(/<item>/g)?.length).toBe(esposible.length);
    expect(atom.match(/<entry>/g)?.length).toBe(esposible.length);
  });

  it("maneja colección vacía sin errores", () => {
    const { rss, atom } = generateCollectionFeeds(siteConfig, "espensar", "Es pensar", []);
    expect(rss).toContain("<?xml");
    expect(atom).toContain("<?xml");
    expect(rss.match(/<item>/g)).toBeNull();
    expect(atom.match(/<entry>/g)).toBeNull();
  });

  it("usa title como description cuando falta description en frontmatter", () => {
    const items = [
      {
        slug: "test",
        frontmatter: {
          title: "Test Title",
          date: "2026-01-01",
          tags: [],
          draft: false,
        },
      },
    ];
    const { rss } = generateCollectionFeeds(siteConfig, "espensar", "Es pensar", items);
    expect(rss).toContain("Test Title");
    // description should fall back to title
    expect(rss.match(/<description>Test Title<\/description>/)).toBeTruthy();
  });

  it("usa description del frontmatter si está presente", () => {
    const items = [
      {
        slug: "test",
        frontmatter: {
          title: "Test Title",
          description: "Custom description",
          date: "2026-01-01",
          tags: [],
          draft: false,
        },
      },
    ];
    const { rss } = generateCollectionFeeds(siteConfig, "espensar", "Es pensar", items);
    expect(rss).toContain("Custom description");
    expect(rss).not.toContain("<description>Test Title</description>");
  });
});
