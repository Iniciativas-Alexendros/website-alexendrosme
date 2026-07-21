import fs from "node:fs/promises";
import path from "node:path";
import { generateFeeds, generateCollectionFeeds } from "@/lib/feed";
import { getContentCollection } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

async function main() {
  const [espensar, esposible] = await Promise.all([
    getContentCollection("espensar"),
    getContentCollection("esposible"),
  ]);

  // Master feed (all articles)
  const { rss, atom } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });
  await fs.writeFile(path.join(process.cwd(), "public", "feed.xml"), rss, "utf-8");
  await fs.writeFile(path.join(process.cwd(), "public", "feed.atom"), atom, "utf-8");

  // Per-collection feeds
  const { rss: espRss, atom: espAtom } = generateCollectionFeeds(
    siteConfig,
    "espensar",
    "Es pensar",
    espensar,
  );
  await fs.writeFile(path.join(process.cwd(), "public", "feed-espensar.xml"), espRss, "utf-8");
  await fs.writeFile(path.join(process.cwd(), "public", "feed-espensar.atom"), espAtom, "utf-8");

  const { rss: posRss, atom: posAtom } = generateCollectionFeeds(
    siteConfig,
    "esposible",
    "Es posible",
    esposible,
  );
  await fs.writeFile(path.join(process.cwd(), "public", "feed-esposible.xml"), posRss, "utf-8");
  await fs.writeFile(path.join(process.cwd(), "public", "feed-esposible.atom"), posAtom, "utf-8");

  console.log("Feeds generated:");
  console.log("  public/feed.xml + public/feed.atom (master)");
  console.log("  public/feed-espensar.xml + public/feed-espensar.atom");
  console.log("  public/feed-esposible.xml + public/feed-esposible.atom");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
