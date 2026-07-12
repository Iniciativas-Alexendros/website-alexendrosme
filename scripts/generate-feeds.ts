import fs from "node:fs/promises";
import path from "node:path";
import { generateFeeds } from "@/lib/feed";
import { getContentCollection } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

async function main() {
  const [espensar, esposible] = await Promise.all([
    getContentCollection("espensar"),
    getContentCollection("esposible"),
  ]);

  const { rss, atom } = generateFeeds({ site: siteConfig, collections: { espensar, esposible } });

  await fs.writeFile(path.join(process.cwd(), "public", "feed.xml"), rss, "utf-8");
  await fs.writeFile(path.join(process.cwd(), "public", "feed.atom"), atom, "utf-8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
