import fs from "node:fs/promises";
import path from "node:path";
import { getContentCollection } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

const BASE = siteConfig.url;
const NOW = new Date().toISOString().split("T")[0] ?? new Date().toISOString().slice(0, 10);

function urlEntry(loc: string, lastmod: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function urlEntryWithImage(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  imageUrl: string,
) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
    </image:image>
  </url>`;
}

function sitemapXml(urls: string, withImageNamespace = false) {
  const ns = withImageNamespace
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>
${urls}
</urlset>
`;
}

function sitemapIndex(entries: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;
}

async function main() {
  const [espensar, esposible] = await Promise.all([
    getContentCollection("espensar"),
    getContentCollection("esposible"),
  ]);

  // ── Static pages ───────────────────────────────────
  const pages = [
    urlEntry(`${BASE}/`, NOW, "monthly", "1.0"),
    urlEntry(`${BASE}/now`, NOW, "weekly", "0.7"),
    urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/esposible`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/tags`, NOW, "monthly", "0.6"),
    urlEntry(`${BASE}/legal/aviso-legal`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/privacidad`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/cookies`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/seguridad`, NOW, "yearly", "0.3"),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-pages.xml"),
    sitemapXml(pages),
    "utf-8",
  );

  // ── Es pensar (con OG por artículo) ───────────────
  const espensarUrls = [
    urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
    ...espensar.map((a) =>
      urlEntryWithImage(
        `${BASE}/espensar/${a.slug}`,
        a.frontmatter.date ?? NOW,
        "monthly",
        "0.7",
        `${BASE}/espensar/${a.slug}/opengraph-image.png`,
      ),
    ),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-espensar.xml"),
    sitemapXml(espensarUrls, true),
    "utf-8",
  );

  // ── Es posible (con OG por artículo) ─────────────
  const esposibleUrls = [
    urlEntry(`${BASE}/esposible`, NOW, "weekly", "0.8"),
    ...esposible.map((a) =>
      urlEntryWithImage(
        `${BASE}/esposible/${a.slug}`,
        a.frontmatter.date ?? NOW,
        "monthly",
        "0.7",
        `${BASE}/esposible/${a.slug}/opengraph-image.png`,
      ),
    ),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-esposible.xml"),
    sitemapXml(esposibleUrls, true),
    "utf-8",
  );

  // ── Sitemap index ────────────────────────────────
  const index = [
    `<sitemap><loc>${BASE}/sitemap-pages.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
    `<sitemap><loc>${BASE}/sitemap-espensar.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
    `<sitemap><loc>${BASE}/sitemap-esposible.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap.xml"),
    sitemapIndex(index),
    "utf-8",
  );

  // eslint-disable-next-line no-console
  console.log(
    "Sitemaps generated:\n  public/sitemap.xml (index)\n  public/sitemap-pages.xml\n  public/sitemap-espensar.xml (with images)\n  public/sitemap-esposible.xml (with images)",
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
