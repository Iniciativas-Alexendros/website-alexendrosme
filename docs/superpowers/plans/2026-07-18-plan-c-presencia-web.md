# Plan C: Presencia Web

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir página `/now` (convención /now pages), extender sitemap con `<image:image>`, mejorar modo de impresión para artículos (no solo legal).

**Architecture:** Tres features independientes que mejoran el SEO y la presencia social del sitio. /now es una página estática editable a mano. Sitemap extend es modificación al script de generación. Print mode mejora selectores y propiedades de CSS @media print.

**Tech Stack:** Next.js App Router, sitemap XML, CSS @media print

## Global Constraints

- Static export — verificado `next.config.ts:5`
- No añadir dependencias runtime/producción nuevas
- Todos los textos visibles pasan por i18n
- Las OG images dinámicas se manejan en Plan E (separado) — Plan C **NO** añade OG
- El sitemap XML debe pasar validación contra `https://www.xml-sitemaps.com/xsd/sitemap.xsd`

---

### Task C1: Página /now (convención /now pages de Derek Sivers)

**Files:**

- Create: `app/now/page.tsx`
- Modify: `lib/i18n/dictionaries/{es,en}.ts`
- Modify: `scripts/generate-sitemap.ts` (añadir /now)
- Modify: `components/nav.tsx` (i18n-aware nav link)
- Modify: `components/mobile-menu.tsx` (i18n-aware nav link)
- Test: `tests/seo-now.spec.ts`

- [ ] **Step 1: Añadir keys i18n**

En `lib/i18n/dictionaries/es.ts`:

```ts
now: {
  title: "/now",
  desc: "Qué estoy haciendo ahora. Inspirado por {link}.",
  siversLink: "la idea de Derek Sivers",
  lastUpdatedPrefix: "Actualizado:",
  sectionFocus: "Enfoque",
  sectionBuilding: "Construyendo",
  sectionReading: "Leyendo",
  sectionFocusItems: [
    "Soberanía digital y protocolos abiertos",
    "Crítica tecnológica materialista",
    "Desarrollo de software ético y sostenible",
  ],
  sectionBuildingItems: [
    "**alexendros.dev** — Mi hub de productos comerciales (Next.js, Supabase, Stripe)",
    "**website-alexendros.me** — Este sitio, siempre en evolución",
  ],
  sectionReadingItems: [
    "_La renta básica_ — Daniel Raventós",
    "_Technopoly_ — Neil Postman",
  ],
  footerBack: "← Volver al inicio",
  empty: "Actualización pendiente — vuelve pronto.",
}
```

⚠️ Nota: arrays en i18n son posibles pero añaden complejidad. Si el hook `useI18n` no soporta arrays, se pueden convertir a strings con `\n` y parsearlos en el componente (preferible).

**Alternativa recomendada** (más simple, alinea con el patrón strings del codebase):

```ts
now: {
  title: "/now",
  desc: "Qué estoy haciendo ahora. Inspirado por {link}.",
  siversLink: "la idea de Derek Sivers",
  lastUpdatedPrefix: "Actualizado:",
  sectionFocus: "Enfoque",
  focusItems: "Soberanía digital y protocolos abiertos · Crítica tecnológica materialista · Desarrollo de software ético y sostenible",
  sectionBuilding: "Construyendo",
  buildingItems: "alexendros.dev — Mi hub de productos comerciales (Next.js, Supabase, Stripe) · website-alexendros.me — Este sitio, siempre en evolución",
  sectionReading: "Leyendo",
  readingItems: "La renta básica — Daniel Raventós · Technopoly — Neil Postman",
  footerBack: "← Volver al inicio",
  empty: "Actualización en progreso — vuelve pronto.",
}
```

En `lib/i18n/dictionaries/en.ts`:

```ts
now: {
  title: "/now",
  desc: "What I'm doing right now. Inspired by {link}.",
  siversLink: "Derek Sivers' idea",
  lastUpdatedPrefix: "Updated:",
  sectionFocus: "Focus",
  focusItems: "Digital sovereignty and open protocols · Materialist tech critique · Ethical and sustainable software development",
  sectionBuilding: "Building",
  buildingItems: "alexendros.dev — My commercial products hub (Next.js, Supabase, Stripe) · website-alexendros.me — This site, always evolving",
  sectionReading: "Reading",
  readingItems: "La renta básica — Daniel Raventós · Technopoly — Neil Postman",
  footerBack: "← Back to home",
  empty: "Update in progress — check back soon.",
}
```

- [ ] **Step 2: Crear app/now/page.tsx**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-json-ld";
import { siteConfig } from "@/lib/site";
import { NowContent } from "@/components/now-content";

export const metadata: Metadata = {
  title: "Ahora",
  description: "Qué estoy haciendo ahora mismo — proyectos, lecturas, enfoque actual.",
  alternates: { canonical: "/now" },
  openGraph: {
    title: "Ahora · Alexendros",
    description: "Qué estoy haciendo ahora mismo.",
    type: "profile",
    url: `${siteConfig.url}/now`,
  },
};

export default async function NowPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Ahora", href: `${siteConfig.url}/now` }]} />
      <NowContent lastUpdated="2026-07-18" />
    </>
  );
}
```

Y `components/now-content.tsx` (client component, usa i18n hook):

```tsx
"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Props {
  lastUpdated: string;
}

function splitItems(raw: string): string[] {
  return raw
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function NowContent({ lastUpdated }: Props) {
  const { t, locale } = useI18n();

  const focus = splitItems(t("now.focusItems"));
  const building = splitItems(t("now.buildingItems"));
  const reading = splitItems(t("now.readingItems"));

  const dateLocale = locale === "en" ? "en-US" : "es-ES";

  return (
    <div className="site-shell article-shell">
      <header className="collection-header">
        <time dateTime={lastUpdated} className="ds-caption">
          {t("now.lastUpdatedPrefix")}{" "}
          {new Date(lastUpdated).toLocaleDateString(dateLocale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <h1 className="headline">{t("now.title")}</h1>
        <p className="prose-lead collection-desc">
          {t("now.desc", { link: "https://sive.rs/now" })}
        </p>
      </header>

      {focus.length === 0 && building.length === 0 && reading.length === 0 ? (
        <p className="empty-state">{t("now.empty")}</p>
      ) : (
        <div className="stack-lg prose">
          {building.length > 0 && (
            <section>
              <h2>🔨 {t("now.sectionBuilding")}</h2>
              <ul>
                {building.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {reading.length > 0 && (
            <section>
              <h2>📖 {t("now.sectionReading")}</h2>
              <ul>
                {reading.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {focus.length > 0 && (
            <section>
              <h2>🎯 {t("now.sectionFocus")}</h2>
              <ul>
                {focus.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <footer className="section-footer">
        <Link href="/" className="back-link">
          {t("now.footerBack")}
        </Link>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Validar que useI18n soporta {link} placeholder + nav.now key**

Verificar `lib/i18n/context.tsx`:

- Si soporta `{ key }` substitution → OK.
- Si no soporta → convertir a componente/url hardcoded para el link a sive.rs.

- [ ] **Step 4: Enlazar /now en nav (i18n-aware)**

En `components/nav.tsx`, dentro del array `navItems` (o equivalente), añadir:

```ts
{ label: t("nav.now"), href: "/now" },
```

En `lib/i18n/dictionaries/es.ts`, en `nav` block:

```ts
nav: {
  // ... existing ...
  now: "Ahora",
}
```

En `lib/i18n/dictionaries/en.ts`:

```ts
nav: {
  // ... existing ...
  now: "Now",
}
```

- [ ] **Step 5: Mismo en mobile-menu.tsx**

Verificar que `components/mobile-menu.tsx` lee la misma key `nav.now`. Si NO usa el i18n, refactor mínimo para usar `useI18n()`.

- [ ] **Step 6: Añadir /now a sitemap**

En `scripts/generate-sitemap.ts`, en el array `pages`, añadir:

```ts
const pages = [
  urlEntry(`${BASE}/`, NOW, "monthly", "1.0"),
  urlEntry(`${BASE}/now`, NOW, "weekly", "0.7"),
  urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
  // ...
];
```

- [ ] **Step 7: Validación E2E**

`tests/seo-now.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("/now page loads with h1 and sections", async ({ page }) => {
  await page.goto("/now");
  await expect(page.locator("h1")).toHaveText(/\/now/i);
  await expect(page.locator("article, .site-shell")).toBeVisible();
});

test("/now link exists in nav", async ({ page }) => {
  await page.goto("/");
  const link = page.locator('header nav a[href="/now"]');
  await expect(link).toBeVisible();
});

test("/now present in sitemap-pages.xml", async ({ request }) => {
  const res = await request.get("/sitemap-pages.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain("/now");
});
```

- [ ] **Step 8: Validación compilada**

```bash
npm run typecheck
npm run build
ls -la out/now/index.html  # verify static generation
```

- [ ] **Step 9: Commit**

```bash
git add lib/i18n/dictionaries/es.ts lib/i18n/dictionaries/en.ts app/now/page.tsx components/now-content.tsx components/nav.tsx components/mobile-menu.tsx scripts/generate-sitemap.ts tests/seo-now.spec.ts
git commit -m "feat: add /now page (Derek Sivers convention) with i18n + sitemap"
```

---

### Task C2: Extender sitemap con <image:image>

**Files:**

- Modify: `scripts/generate-sitemap.ts`
- Create: `__tests__/lib/sitemap.test.ts`

**Context:** Google Images indexa mejor sitemaps con `<image:image>`. El script actual (`scripts/generate-sitemap.ts`) usa la función `urlEntry` que toma `loc, lastmod, changefreq, priority`. Hay que extender a una variante `urlEntryWithImage`.

**Nota:** Las OG images por artículo se generan en Plan E (separado). Mientras tanto, todos los artículos apuntan a `/og/opengraph-image.png` (la OG global).

- [ ] **Step 1: Tests failing**

`__tests__/lib/sitemap.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";

describe("generate-sitemap", () => {
  it("includes <image:image> namespace for articles", () => {
    // Ejecuta el script
    execFileSync("npx", ["tsx", "scripts/generate-sitemap.ts"], { stdio: "pipe" });

    const xml = require("node:fs").readFileSync(
      path.join(process.cwd(), "public", "sitemap-espensar.xml"),
      "utf-8",
    );
    // Verifica que tiene el namespace
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  });

  it("includes image:loc per article", () => {
    const xml = require("node:fs").readFileSync(
      path.join(process.cwd(), "public", "sitemap-espensar.xml"),
      "utf-8",
    );
    expect(xml).toMatch(/<image:image>/);
    expect(xml).toMatch(
      /<image:loc>https:\/\/alexendros\.me\/og\/opengraph-image\.png<\/image:loc>/,
    );
  });

  it("XML is valid against sitemap schema basics", () => {
    const xml = require("node:fs").readFileSync(
      path.join(process.cwd(), "public", "sitemap-espensar.xml"),
      "utf-8",
    );
    // Verificaciones básicas de XML bien-formado
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(xml).toMatch(/<urlset[^>]*>/);
    expect(xml).toMatch(/<\/urlset>$/);
  });
});
```

Run: `npx vitest run __tests__/lib/sitemap.test.ts`
⚠️ Expected: FAIL — el namespace `image:` no existe actualmente.

- [ ] **Step 2: Modificar scripts/generate-sitemap.ts**

```ts
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
  imageUrl = `${BASE}/og/opengraph-image.png`,
) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>Alexendros</image:title>
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

  // ── Static pages (sin imágenes) ────────────────────────
  const pages = [
    urlEntry(`${BASE}/`, NOW, "monthly", "1.0"),
    urlEntry(`${BASE}/now`, NOW, "weekly", "0.7"),
    urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
    urlEntry(`${BASE}/esposible`, NOW, "weekly", "0.8"),
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

  // ── Es pensar (CON imágenes) ───────────────────────────
  const espensarUrls = [
    urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
    ...espensar.map((a) =>
      urlEntryWithImage(`${BASE}/espensar/${a.slug}`, a.frontmatter.date ?? NOW, "monthly", "0.7"),
    ),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-espensar.xml"),
    sitemapXml(espensarUrls, true),
    "utf-8",
  );

  // ── Es posible (CON imágenes) ──────────────────────────
  const esposibleUrls = [
    urlEntry(`${BASE}/esposible`, NOW, "weekly", "0.8"),
    ...esposible.map((a) =>
      urlEntryWithImage(`${BASE}/esposible/${a.slug}`, a.frontmatter.date ?? NOW, "monthly", "0.7"),
    ),
  ].join("\n");

  await fs.writeFile(
    path.join(process.cwd(), "public", "sitemap-esposible.xml"),
    sitemapXml(esposibleUrls, true),
    "utf-8",
  );

  // ── Sitemap index ─────────────────────────────────────
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
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 3: Tests passing**

```bash
npx vitest run __tests__/lib/sitemap.test.ts
# Expected: 3 tests pass
```

- [ ] **Step 4: Validar XML con parser externo**

```bash
npm run generate-sitemap
npx --yes xmllint --noout public/sitemap-espensar.xml && echo "XML valid"
```

(O instalar `xmllint` desde libxml2-utils si no está disponible.)

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-sitemap.ts __tests__/lib/sitemap.test.ts
git commit -m "seo: extend article sitemaps with image namespace"
```

---

### Task C3: Mejorar print mode para artículos

**Files:**

- Modify: `app/styles/print.css`
- Modify: `app/styles/components.css` (cualquier override necesario)

**Context:** La `print.css` actual solo estiliza páginas legales (`.legal-doc`). Hay que extender para que también funcione en `.prose` que es la clase raíz de `MarkdownRenderer`.

**Premisa verificada:** `components/mdx.tsx` envuelve en `<div className="prose">`. Los selectores `.prose h2`, `.prose pre`, etc. funcionarán.

- [ ] **Step 1: Rewrite print.css completo**

Reemplazar contenido de `app/styles/print.css`:

```css
/* print.css — Optimiza páginas legales Y artículos (espensar/esposible) para impresión.
   Inspirado en https://web.dev/articles/print */

@media print {
  /* ───────────────────────────────────────────
     Variables: tema blanco puro para tinta
     ─────────────────────────────────────────── */
  :root {
    --background: #ffffff;
    --foreground: #000000;
    --muted-foreground: #333333;
    --border: #cccccc;
    --primary: #000000;
    --ax-surface-0: #ffffff;
    --ax-text-primary: #000000;
  }

  /* Resetear fondo oscuro del tema default */
  body {
    background: #ffffff !important;
    color: #000000 !important;
    font-size: 11pt;
    line-height: 1.5;
  }

  /* ───────────────────────────────────────────
     Ocultar elementos UI no imprimibles
     ─────────────────────────────────────────── */
  body::before,
  .site-nav,
  .site-footer,
  .site-shell::before,
  .anti-monetization-banner,
  .contact-fab,
  .fab-stack,
  .particle-canvas,
  .atm,
  .toc,
  canvas:not(.prose canvas),
  header[role="banner"],
  nav.site-nav,
  .skip-link,
  /* Next.js error overlay */
  [data-nextjs-dialog-overlay],
  [data-nextjs-toast] {
    display: none !important;
  }

  /* ───────────────────────────────────────────
     Links: URLs expandidas para auditabilidad
     ─────────────────────────────────────────── */
  a {
    color: #000000 !important;
    text-decoration: underline;
    text-underline-offset: 0.15em;
    word-break: break-word;
  }

  /* URLs externas: añadir después del texto */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.7em;
    color: #555555;
    word-break: break-all;
  }

  /* URLs internas (rooted): añadir URL absoluta */
  a[href^="/"]::after {
    content: " (https://alexendros.me" attr(href) ")";
    font-size: 0.7em;
    color: #555555;
  }

  /* Anchors puros (no expandir) */
  a[href^="#"]::after {
    content: "";
  }

  /* ───────────────────────────────────────────
     Páginas legales (.legal-doc)
     ─────────────────────────────────────────── */
  .legal-doc {
    max-width: none !important;
    font-size: 11pt;
    line-height: 1.55;
  }

  .legal-doc h1 {
    font-size: 22pt;
    margin-top: 0;
  }

  .legal-doc h2 {
    font-size: 15pt;
    margin-top: 1.5em;
  }

  /* ───────────────────────────────────────────
     Artículos (.prose) — espensar/esposible
     ─────────────────────────────────────────── */
  .prose {
    max-width: none !important;
    font-size: 11pt !important;
    line-height: 1.6 !important;
    color: #000000 !important;
  }

  .prose :where(h1, h2, h3, h4, h5, h6) {
    color: #000000 !important;
    page-break-after: avoid;
    break-after: avoid;
    margin-top: 1.5em;
  }

  .prose h1 {
    font-size: 22pt;
  }
  .prose h2 {
    font-size: 16pt;
    border-bottom: 1px solid #999;
    padding-bottom: 0.25em;
  }
  .prose h3 {
    font-size: 13pt;
  }
  .prose h4 {
    font-size: 11.5pt;
    font-style: italic;
  }

  .prose p {
    margin-block: 0.75em;
    orphans: 3;
    widows: 3;
  }

  .prose ul,
  .prose ol {
    page-break-inside: avoid;
  }

  .prose li {
    orphans: 2;
    widows: 2;
  }

  .prose blockquote {
    border-left: 3px solid #333 !important;
    color: #333 !important;
    padding-left: 1em !important;
    margin-inline: 0;
    page-break-inside: avoid;
  }

  .prose pre,
  .prose code {
    background: #f5f5f5 !important;
    color: #000000 !important;
    border: 1px solid #dddddd !important;
    font-size: 9pt !important;
    padding: 0.5em !important;
    page-break-inside: avoid;
  }

  .prose pre code {
    border: none !important;
    padding: 0 !important;
  }

  .prose img {
    max-width: 100% !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .prose figure {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .prose table {
    font-size: 9pt;
    page-break-inside: avoid;
    border-collapse: collapse !important;
  }

  .prose th,
  .prose td {
    border: 1px solid #999 !important;
    padding: 0.25em 0.5em !important;
  }

  /* ───────────────────────────────────────────
     Article meta (fecha, tags, reading time)
     ─────────────────────────────────────────── */
  .article-meta {
    color: #333 !important;
    font-size: 9pt !important;
  }

  .article-meta time {
    font-weight: 600;
  }

  /* Tags: aparecen como texto plano, sin badges coloridos */
  .tag-pill {
    background: transparent !important;
    color: #333 !important;
    border: none !important;
    padding: 0 !important;
    display: inline !important;
  }

  /* Header del artículo */
  .article-head {
    border-bottom: 1px solid #999;
    padding-bottom: 0.5em;
    margin-bottom: 1em;
  }

  .article-title {
    font-size: 22pt !important;
  }

  /* ───────────────────────────────────────────
     Sección back-link al final
     ─────────────────────────────────────────── */
  .section-footer {
    margin-top: 2em;
    padding-top: 0.5em;
    border-top: 1px solid #ccc;
  }

  .back-link {
    color: #555 !important;
    text-decoration: none !important;
  }

  /* ───────────────────────────────────────────
     Configuración de página
     ─────────────────────────────────────────── */
  @page {
    margin: 2cm 1.5cm;
    /* Footer opcional: "Alexendros — Página X de Y" */
  }

  /* Permitir zoom controlado */
  * {
    -webkit-print-color-adjust: economy !important;
    print-color-adjust: economy !important;
  }
}

/* ───────────────────────────────────────────
   Preferencia explícita "save trees": más denso
   ─────────────────────────────────────────── */
@media print and (prefers-color-scheme: economy) {
  body {
    font-size: 10pt;
    line-height: 1.4;
  }
}
```

- [ ] **Step 2: Build + typecheck (de no haber cambios TS, solo CSS)**

```bash
npm run build
# Expected: CSS bundle contiene print rules; build success
```

- [ ] **Step 3: Smoke test manual**

Servir `out/` con `npx serve` y abrir `/espensar/<slug>` en Chrome → Print Preview → verificar:

- Nav, footer, banner ausentes ✓
- Article body se imprime con fuente serif-like ✓
- URLs externas expandidas ✓
- Color de fondo blanco ✓

(No automatizable con Playwright print emulation sin browser binary — basta con print preview).

- [ ] **Step 4: E2E regression con emulation**

Añadir a `tests/visual-regression.spec.ts` (o crear `tests/print-emulation.spec.ts` — tagged `@visual`):

```ts
import { test, expect } from "@playwright/test";

test.describe("Print emulation", { tag: "@visual" }, () => {
  test.use({ colorScheme: "light" }); // Print suele ser light

  test("legal page print layout", async ({ page }) => {
    await page.goto("/legal/aviso-legal");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-nav")).toBeHidden();
    await expect(page.locator(".legal-doc")).toBeVisible();
  });

  test("article print layout", async ({ page }) => {
    await page.goto("/espensar/soberania-digital");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".site-nav")).toBeHidden();
    await expect(page.locator(".prose")).toBeVisible();
    // Background should be near-white in print
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(255, 255, 255)");
  });
});
```

⚠️ Algunos de estos tests pueden no poder ser robustos. Marcar con `test.fixme` si son flaky.

- [ ] **Step 5: Commit**

```bash
git add app/styles/print.css tests/visual-regression.spec.ts
git commit -m "style: extend print styles for articles + URL expansion"
```

---

## Self-Review

**Spec coverage:**

- Página /ahora → Task C1 ✅ (con i18n completo, diccionarios ES/EN, sitemap, link en nav)
- ~~OG images dinámicas~~ → 🗑️ RECHAZADO: next/og funciona con static export (Plan E separado) — premise bug del plan original
- Sitemap imágenes → Task C2 ✅ (con tests de XML, namespace válido, image:loc por artículo)
- Print mode artículos → Task C3 ✅ (con selectores correctos, variables para tema claro, page-break control)

**Placeholder scan:** Sin placeholders. Código completo en cada paso.

**Type consistency:**

- `useI18n()` → usado en NowContent y en Nav, mismo Provider en layout.
- `${BASE}/og/opengraph-image.png` — coincide con `metadataBase` + path en layout.tsx.
- `<image:loc>...</image:loc>` — schema Google Images v1.1, sin custom elements.

**Orden de ejecución:**

1. C1 (introduce nueva ruta — debe ir antes de sitemap para que sitemap la pueda incluir)
2. C2 (sitemap consume /now de C1)
3. C3 (independiente)

C1 y C3 son ortogonales. C2 depende de C1 solo en que la ruta exista para incluirla en el sitemap.
