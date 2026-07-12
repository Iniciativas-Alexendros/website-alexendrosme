import { describe, expect, it } from "vitest";
import { generateFeeds } from "@/lib/feed";
import { siteConfig } from "@/lib/site";
import { getContentCollection } from "@/lib/content/loader";

describe("generateFeeds", () => {
  it("genera RSS y Atom con todos los artículos públicos", async () => {
    const espensar = await getContentCollection("espensar");
    const esposible = await getContentCollection("esposible");
    const { rss, atom } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });

    expect(rss).toContain("<rss");
    expect(atom).toContain("<feed");

    const total = espensar.length + esposible.length;
    expect(rss.match(/<item>/g)?.length).toBe(total);
    expect(atom.match(/<entry>/g)?.length).toBe(total);

    expect(rss).toContain(siteConfig.url);
    expect(atom).toContain(siteConfig.url);
  });
});
