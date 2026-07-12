# SEO improvements — Test plan

## Unit tests (Vitest)

1. `__tests__/lib/seo.test.ts`
   - `siteConfig.title` length ≤ 60 and starts with "Alexendros".
   - `siteConfig.description` length between 150 and 160.
   - `siteConfig.description` contains target keywords.
   - `siteConfig.url` is https.
   - `public/schema/website.json` description matches `siteConfig.description`.

2. `__tests__/lib/breadcrumb.test.ts`
   - `buildBreadcrumbJsonLd` returns a valid schema object.
   - First item is `Inicio`.
   - Last item matches the current page.

3. `__tests__/lib/feed.test.ts`
   - `generateFeeds` returns XML strings.
   - Both feeds contain at least the existing articles.
   - Feed items are sorted by date descending.
   - Each item has title, link, description and pubDate.

4. `__tests__/lib/content.test.ts`
   - The migrated Notion article exists and has required frontmatter.
   - All `espensar` articles are public (not drafts).

## End-to-end tests (Playwright)

5. `tests/seo-home.spec.ts`
   - Homepage title and h1 contain "Alexendros".
   - Biography section is present and not empty.
   - "Últimos ensayos" section links to `/espensar` and `/esposible`.

6. `tests/seo-article.spec.ts`
   - Article page has `BreadcrumbList` JSON-LD.
   - Article page has canonical and OG tags.

7. `tests/seo-feed.spec.ts`
   - `feed.xml` and `feed.atom` are served with status 200.
   - XML is parseable and contains items.

8. `tests/seo-404.spec.ts`
   - 404 page returns 200 with `noindex` robots meta.

## Execution order

1. Run all unit tests first (red state).
2. Implement and fix until unit tests pass.
3. Run Playwright tests (green state).
4. Run Lighthouse and address any regression.
