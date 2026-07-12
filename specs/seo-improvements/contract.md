# SEO improvements — Contract

## Data models

### `siteConfig`

```ts
{
  name: string;
  title: string;        // ≤ 60 chars, starts with "Alexendros"
  description: string;  // 150–160 chars
  url: string;          // https://alexendros.me
  email: string;
  location: string;
  links: { dev: string; github: string; linkedin: string; twitter: string };
  nav: { label: string; href: string }[];
  legalNav: { label: string; href: string }[];
  contact: { email: string; telegram: {...}; matrix: {...} };
}
```

### `Frontmatter`

```ts
{
  title: string;
  date: string;         // ISO 8601
  tags: string[];
  description?: string;
  canonical?: string;
  draft: boolean;
}
```

### `CollectionType`

`"espensar" | "esposible"`

## Functions

### `getContentCollection(type: CollectionType)`

Returns non-draft items sorted by `date` descending.

### `getRawContent(type: CollectionType, slug: string)`

Returns a single item with body.

### `buildBreadcrumbJsonLd(items: { name: string; href: string }[])`

Returns a `Schema.org/BreadcrumbList` JSON-LD object.

- `items[0]` is always `{ name: "Inicio", href: siteConfig.url }`.
- The last item must match the current page.
- `itemListElement` uses `position` starting at 1.

### `generateFeeds(options: { site: SiteConfig; collections: Record<CollectionType, CollectionItem[]> })`

Returns `{ rss: string; atom: string }`.

- RSS 2.0 root element: `<rss version="2.0">` with `<channel>`.
- Atom 1.0 root element: `<feed xmlns="http://www.w3.org/2005/Atom">`.
- Both feeds contain `<title>`, `<link>`, `<description>/<subtitle>`, `<language>` and `<lastBuildDate>/<updated>`.
- Each item contains `<title>`, `<link>`, `<description>/<summary>` and `<pubDate>/<updated>`.

### `writeFeeds(rss: string, atom: string)`

Writes `public/feed.xml` and `public/feed.atom`.

## Static files

- `public/sitemap.xml` — list of canonical URLs.
- `public/robots.txt` — allow all, point to sitemap and feed.
- `public/schema/person.json` and `public/schema/website.json` — JSON-LD.
