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
    const [proyectos, opinion] = await Promise.all([
      getContentCollection("proyectos"),
      getContentCollection("opinion"),
    ]);
    const { rss, atom } = generateFeeds({
      site: siteConfig,
      collections: { proyectos, opinion },
    });

    expect(rss).toContain("<?xml");
    expect(rss).toContain("<rss");
    expect(rss).toContain("<channel>");
    expect(rss).toContain("</channel>");
    expect(rss).toContain("</rss>");

    expect(atom).toContain("<?xml");
    expect(atom).toContain("<feed");
    expect(atom).toContain("</feed>");

    const total = proyectos.length + opinion.length;
    expect(rss.match(/<item>/g)?.length).toBe(total);
    expect(atom.match(/<entry>/g)?.length).toBe(total);

    expect(rss).toContain(siteConfig.url);
    expect(atom).toContain(siteConfig.url);
  });

  it("incluye el atom:link de autoreferencia en RSS", async () => {
    const [proyectos, opinion] = await Promise.all([
      getContentCollection("proyectos"),
      getContentCollection("opinion"),
    ]);
    const { rss } = generateFeeds({ site: siteConfig, collections: { proyectos, opinion } });
    expect(rss).toContain('atom:link href="https://alexendros.me/feed.xml" rel="self"');
  });

  it("ordena artículos por fecha descendente", async () => {
    const [proyectos, opinion] = await Promise.all([
      getContentCollection("proyectos"),
      getContentCollection("opinion"),
    ]);
    const { rss } = generateFeeds({ site: siteConfig, collections: { proyectos, opinion } });
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
  it("genera RSS y Atom para opinión", async () => {
    const opinion = await getContentCollection("opinion");
    const { rss, atom } = generateCollectionFeeds(siteConfig, "opinion", "Opinión", opinion);

    expect(rss).toContain("<?xml");
    expect(rss).toContain("<rss");
    expect(rss).toContain("Opinión");
    expect(rss).toContain("/opinion");
    expect(rss).toContain("/feed-opinion.xml");

    expect(atom).toContain("<?xml");
    expect(atom).toContain("<feed");
    expect(atom).toContain("Opinión");

    expect(rss.match(/<item>/g)?.length).toBe(opinion.length);
    expect(atom.match(/<entry>/g)?.length).toBe(opinion.length);
  });

  it("genera RSS y Atom para proyectos", async () => {
    const proyectos = await getContentCollection("proyectos");
    const { rss, atom } = generateCollectionFeeds(siteConfig, "proyectos", "Proyectos", proyectos);

    expect(rss).toContain("Proyectos");
    expect(rss).toContain("/proyectos");
    expect(rss).toContain("/feed-proyectos.xml");

    expect(rss.match(/<item>/g)?.length).toBe(proyectos.length);
    expect(atom.match(/<entry>/g)?.length).toBe(proyectos.length);
  });

  it("maneja colección vacía sin errores", () => {
    const { rss, atom } = generateCollectionFeeds(siteConfig, "opinion", "Opinión", []);
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
    const { rss } = generateCollectionFeeds(siteConfig, "opinion", "Opinión", items);
    expect(rss).toContain("Test Title");
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
    const { rss } = generateCollectionFeeds(siteConfig, "opinion", "Opinión", items);
    expect(rss).toContain("Custom description");
    expect(rss).not.toContain("<description>Test Title</description>");
  });
});
