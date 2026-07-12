import type { CollectionType, Frontmatter } from "@/lib/content/types";

interface FeedSite {
  name: string;
  description: string;
  url: string;
  email: string;
}

interface FeedItem {
  slug: string;
  frontmatter: Frontmatter;
}

interface FeedOptions {
  site: FeedSite;
  collections: Record<CollectionType, FeedItem[]>;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateFeeds({ site, collections }: FeedOptions): { rss: string; atom: string } {
  const items = (Object.entries(collections) as [CollectionType, FeedItem[]][])
    .flatMap(([type, list]) => list.map((item) => ({ type, item })))
    .sort(
      (a, b) =>
        new Date(b.item.frontmatter.date).getTime() - new Date(a.item.frontmatter.date).getTime(),
    );

  const lastBuildDate = new Date().toUTCString();
  const lastBuildIso = new Date().toISOString();

  const rssItems = items
    .map(({ type, item }) => {
      const url = `${site.url}/${type}/${item.slug}`;
      const description = item.frontmatter.description ?? item.frontmatter.title;
      const pubDate = new Date(item.frontmatter.date).toUTCString();
      return `    <item>
      <title>${escapeXml(item.frontmatter.title)}</title>
      <link>${escapeXml(url)}</link>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
    </item>`;
    })
    .join("\n");

  const atomItems = items
    .map(({ type, item }) => {
      const url = `${site.url}/${type}/${item.slug}`;
      const description = item.frontmatter.description ?? item.frontmatter.title;
      const updated = new Date(item.frontmatter.date).toISOString();
      return `  <entry>
    <title>${escapeXml(item.frontmatter.title)}</title>
    <link href="${escapeXml(url)}" />
    <id>${escapeXml(url)}</id>
    <updated>${updated}</updated>
    <summary>${escapeXml(description)}</summary>
  </entry>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)}</title>
    <link>${escapeXml(site.url)}</link>
    <description>${escapeXml(site.description)}</description>
    <language>es</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(site.url)}/feed.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>`;

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(site.name)}</title>
  <link href="${escapeXml(site.url)}" />
  <id>${escapeXml(site.url)}</id>
  <updated>${lastBuildIso}</updated>
  <subtitle>${escapeXml(site.description)}</subtitle>
${atomItems}
</feed>`;

  return { rss, atom };
}
