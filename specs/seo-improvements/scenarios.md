# SEO improvements — Scenarios

## Happy paths

### HP1 — Title and description

Given the site config, `title.length` is 46 and `description.length` is 154.

### HP2 — Biography

The homepage contains a biography section with ≥ 150 words and the keywords "Alexendros", "soberanía digital", "privacidad", "crítica tecnológica" and "software libre".

### HP3 — Latest articles

The homepage shows the latest 3 articles from each collection and links to `/espensar` and `/esposible`.

### HP4 — BreadcrumbList

- Collection page: `Inicio > Es pensar`.
- Article page: `Inicio > Es pensar > <article title>`.
- Legal page: `Inicio > Legal > <page title>`.

### HP5 — Feed

`feed.xml` and `feed.atom` list all public articles sorted by date, with title, link, description and pubDate.

### HP6 — Notion migration

`content/espensar/manifiesto-eligete-a-ti.mdx` exists with valid frontmatter and a cleaned Markdown body.

## Edge cases

### EC1 — Empty collection

Latest articles section is omitted if a collection is empty.

### EC2 — Article without description

Feed uses the article title as the item description.

### EC3 — 404

The 404 page has `noindex` and returns status 200.

### EC4 — Notion page inaccessible

If `ntn` cannot fetch the page, the migration pauses and the user is asked for a Markdown export.
