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
  const [proyectos, opinion] = await Promise.all([
    getContentCollection("proyectos"),
    getContentCollection("opinion"),
  ]);

  const pages = [
    urlEntry(`${BASE}/`, NOW, "monthly", "1.0"),
    urlEntry(`${BASE}/now`, NOW, "weekly", "0.7"),
    urlEntry(`${BASE}/proyectos`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/opinion`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/tags`, NOW, "monthly", "0.6"),
    urlEntry(`${BASE}/legal/aviso-legal`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/privacidad`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/cookies`, NOW, "yearly", "0.2"),
    urlEntry(`${BASE}/legal/seguridad`, NOW, "yearly", "0.3"),
    urlEntry(`${BASE}/en`, NOW, "monthly", "0.9"),
    urlEntry(`${BASE}/en/now`, NOW, "weekly", "0.6"),
    urlEntry(`${BASE}/en/proyectos`, NOW, "weekly", "0.7"),
    urlEntry(`${BASE}/en/opinion`, NOW, "weekly", "0.7"),
    urlEntry(`${BASE}/en/tags`, NOW, "monthly", "0.5"),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-pages.xml"),
    sitemapXml(pages),
    "utf-8",
  );

  const proyectosUrls = [
    urlEntry(`${BASE}/proyectos`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/en/proyectos`, NOW, "weekly", "0.7"),
    ...proyectos.flatMap((a) => [
      urlEntryWithImage(
        `${BASE}/proyectos/${a.slug}`,
        a.frontmatter.date ?? NOW,
        "monthly",
        "0.7",
        `${BASE}/proyectos/${a.slug}/opengraph-image`,
      ),
      urlEntry(`${BASE}/en/proyectos/${a.slug}`, a.frontmatter.date ?? NOW, "monthly", "0.6"),
    ]),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-proyectos.xml"),
    sitemapXml(proyectosUrls, true),
    "utf-8",
  );

  const opinionUrls = [
    urlEntry(`${BASE}/opinion`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/en/opinion`, NOW, "weekly", "0.7"),
    ...opinion.flatMap((a) => [
      urlEntryWithImage(
        `${BASE}/opinion/${a.slug}`,
        a.frontmatter.date ?? NOW,
        "monthly",
        "0.7",
        `${BASE}/opinion/${a.slug}/opengraph-image`,
      ),
      urlEntry(`${BASE}/en/opinion/${a.slug}`, a.frontmatter.date ?? NOW, "monthly", "0.6"),
    ]),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-opinion.xml"),
    sitemapXml(opinionUrls, true),
    "utf-8",
  );

  const index = [
    `<sitemap><loc>${BASE}/sitemap-pages.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
    `<sitemap><loc>${BASE}/sitemap-proyectos.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
    `<sitemap><loc>${BASE}/sitemap-opinion.xml</loc><lastmod>${NOW}</lastmod></sitemap>`,
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap.xml"),
    sitemapIndex(index),
    "utf-8",
  );

  console.log(
    "Sitemaps generated:\n  public/sitemap.xml (index)\n  public/sitemap-pages.xml\n  public/sitemap-proyectos.xml (with images)\n  public/sitemap-opinion.xml (with images)",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
