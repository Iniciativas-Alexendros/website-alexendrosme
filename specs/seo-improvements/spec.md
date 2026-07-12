# SEO improvements — Spec

## Objective

Improve the on-page SEO, technical SEO and content quality of `alexendros.me`, and add the editorial features required by the roadmap, so that the overall SEO score rises and the site is ready for content growth.

## Functional requirements

1. **Title and meta description**
   - `siteConfig.title` must have ≤ 60 characters and start with the keyword "Alexendros".
   - `siteConfig.description` must be between 150 and 160 characters, include keywords (soberanía digital, privacidad, software libre, crítica tecnológica) and a CTA.

2. **Homepage content**
   - The biography section must contain real content (≥ 150 words) that includes the keywords "Alexendros", "soberanía digital", "privacidad", "crítica tecnológica" and "software libre".
   - The homepage must contain an "Últimos ensayos" section with links to `/espensar`, `/esposible` and the latest articles from each collection.

3. **Schema and breadcrumbs**
   - Every nested route (collections, articles, legal pages) must expose a valid `BreadcrumbList` JSON-LD.
   - Existing `Person` and `WebSite` schemas must stay in place and stay synchronized with the meta description.

4. **404 page**
   - `app/not-found.tsx` must expose `robots: { index: false }` and a short description.

5. **RSS / Atom feed**
   - A build-time script must generate `public/feed.xml` (RSS 2.0) and `public/feed.atom` (Atom 1.0) from the content collections.
   - `public/robots.txt` must reference the feed.

6. **Sitemap and first editorial post**
   - Migrate the Notion page "Manifiesto “¡Elígete a ti!”" to `content/espensar/manifiesto-eligete-a-ti.mdx`.
   - Update `public/sitemap.xml` to include the new article.
   - Ensure the article renders with correct `Article` JSON-LD and metadata.

7. **Core Web Vitals**
   - After the other changes, run a Lighthouse audit and apply the highest-impact performance fix.

## Acceptance criteria

- `npm run test`, `npm run lint`, `npm run typecheck` and `npm run build` pass.
- `npm run test:e2e` passes.
- The homepage title and description length checks pass.
- The feed is valid XML and contains all published articles.
- `BreadcrumbList` JSON-LD is present on every nested route.
- Lighthouse does not introduce new regressions.
