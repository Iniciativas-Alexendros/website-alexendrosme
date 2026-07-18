# Plan E: OG Images Dinámicas por Artículo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar imágenes OpenGraph únicas para cada artículo de `/espensar/[slug]` y `/esposible/[slug]`, además de regenerar la OG home con marca y diseño consistentes.

**Architecture:** Aprovechamos `next/og` con `export const dynamic = "force-static"` (verificado en `app/apple-icon.tsx` ya funciona en static export). Cada artículo define un `<ArticleSlugPage>` con un sibling `opengraph-image.tsx` que devuelve un `ImageResponse` con título+desc+site del frontmatter. Para el home, `opengraph-image.tsx` en `app/` lo reemplaza con un render branded.

**Premisa corregida:** El plan C original afirmaba que "next/og requiere runtime serverless y no funciona con static export" — esto era **FALSO**. La prueba: `app/apple-icon.tsx` usa `ImageResponse` con `dynamic = "force-static"` y produce `/apple-icon.png` en el output estático. NEXT 16+ soporta esto out-of-the-box.

**Tech Stack:** `next/og` (ya instalado vía Next.js), JSX inline (no SVG importado para evitar deps).

## Global Constraints

- Static export — `output: "export"` confirmado; cada `opengraph-image.tsx` necesita `export const dynamic = "force-static"`.
- NO añadir librerías nuevas (satori, resvg, sharp, etc.).
- Las imágenes OG deben caber en 1200×630.
- Las imágenes se generan en build y se sirven como archivos estáticos `/opengraph-image.png` por ruta.
- Validar que los archivos generados se cachean correctamente con `Cache-Control` (vercel.json, ya en Plan A3).

---

### Task E1: Verificar baseline OG — apple-icon.tsx funciona

**Files:**

- Read: `app/apple-icon.tsx`
- Read: `public/og/opengraph-image.png` (existe?)

- [ ] **Step 1: Verificar que opengraph-image.png existe**

```bash
ls -la public/og/ 2>/dev/null || echo "No og directory yet"
ls -la public/og/opengraph-image.png 2>/dev/null && echo "EXISTS" || echo "needs creation"
```

- [ ] **Step 2: Verificar que la OG actual es legible**

```bash
file public/og/opengraph-image.png 2>/dev/null || echo "no file"
```

- [ ] **Step 3: Decisión de diseño**

Si NO existe, el Plan C2 (sitemap) apunta a una URL rota. Crearemos una nueva OG root para home en E2.

Si existe, la reemplazamos con un diseño branded consistente.

⚠️ Si NO existe → añadir a `.gitignore` o crear imagen placeholder mientras se implementa E2. Decisión del implementador.

---

### Task E2: OG branded para home `/`

**Files:**

- Create: `app/opengraph-image.tsx`
- Modify: `app/layout.tsx` (ajustar metadata.images si necesario)
- Modify: `scripts/generate-sitemap.ts` (cambiar URL → `/opengraph-image.png` ?)

- [ ] **Step 1: Crear `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Alexendros — Espacio personal libre de dinero";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function HomeOG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#17130f",
        color: "#fefcf6",
        padding: "80px 100px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle at 70% 30%, #d9b26722 0%, transparent 60%)",
        }}
      />

      {/* Top label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "20px",
          letterSpacing: "0.1em",
          color: "#d9b267",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#d9b267",
          }}
        />
        alexendros.me
      </div>

      {/* Hero */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          gap: "32px",
        }}
      >
        <div
          style={{
            fontSize: "92px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            maxWidth: "1000px",
            color: "#fefcf6",
          }}
        >
          Grandes soluciones
          <br />
          de un ingenio no previsto.
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#a8a093",
            lineHeight: 1.4,
            maxWidth: "800px",
          }}
        >
          Espacio libre de dinero. Soberanía digital, crítica tecnológica, software ético.
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "60px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "20px",
          color: "#a8a093",
        }}
      >
        <span>Valencia, ES</span>
        <span style={{ color: "#d9b267" }}>v0.5.0</span>
      </div>
    </div>,
    { ...size },
  );
}
```

- [ ] **Step 2: Verificar contenido de output**

```bash
npm run build
ls -la out/opengraph-image.png 2>/dev/null && file out/opengraph-image.png
```

`ImageResponse` debe generar `/opengraph-image.png` en `out/`. Los archivos PNG son detectados por file(1).

- [ ] **Step 3: Verificar metadata en layout**

Verificar `app/layout.tsx`:

```tsx
openGraph: {
  // ... existing ...
  images: [
    {
      url: "/opengraph-image.png",  // ← antes: /og/opengraph-image.png
      width: 1200,
      height: 630,
      alt: siteConfig.title,
    },
  ],
},
```

Cambiar URL para apuntar al nuevo archivo. (Si la OG home es global, debe ser API root.)

⚠️ Si Next.js detecta automáticamente `opengraph-image.tsx` en el mismo directorio y lo prioriza sobre el metadata.images URL, dejar URL para fallback manual.

- [ ] **Step 4: Validación E2E**

`tests/seo-home.spec.ts`:

```ts
test("OG image present and correct size", async ({ request }) => {
  const res = await request.get("/opengraph-image.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");

  const buffer = await res.body();
  expect(buffer.byteLength).toBeGreaterThan(1000); // header PNG al menos
  // Verificación adicional: leer dimensiones desde header
  // PNG header: bytes 16-19 = width, 20-23 = height (big-endian)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  expect(width).toBe(1200);
  expect(height).toBe(630);
});

test("OpenGraph meta tags reference OG image", async ({ page }) => {
  await page.goto("/");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage).toMatch(/\/opengraph-image\.png$/);
});
```

- [ ] **Step 5: Commit**

```bash
git add app/opengraph-image.tsx app/layout.tsx tests/seo-home.spec.ts
git commit -m "feat: add branded OG image for home via next/og static export"
```

---

### Task E3: OG dinámica por artículo de /espensar/[slug]

**Files:**

- Create: `app/espensar/[slug]/opengraph-image.tsx`
- Modify: `scripts/generate-sitemap.ts` (image URL → `/espensar/<slug>/opengraph-image.png`)
- Test: `tests/seo-article.spec.ts`

- [ ] **Step 1: Crear `app/espensar/[slug]/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { getContentCollection } from "@/lib/content/loader";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export const alt = "Artículo de Alexendros";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const articles = await getContentCollection("espensar");
  const article = articles.find((a) => a.slug === params.slug);
  if (!article) return [{ id: params.slug, alt: "Artículo", size, contentType }];
  return [
    {
      id: params.slug,
      alt: article.frontmatter.title,
      size,
      contentType,
    },
  ];
}

export async function generateStaticParams() {
  const articles = await getContentCollection("espensar");
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function ArticleOG({ params }: { params: { slug: string } }) {
  const articles = await getContentCollection("espensar");
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    // Fallback para slugs que no existen en build
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17130f",
          color: "#fefcf6",
          fontSize: "60px",
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        Alexendros
      </div>,
      { ...size },
    );
  }

  const { title, description, tags, date } = article.frontmatter;
  const dateStr = new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#17130f",
        color: "#fefcf6",
        padding: "80px 100px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Subtle radial */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle at 70% 30%, #d9b26733 0%, transparent 60%)",
        }}
      />

      {/* Top label: section badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "18px",
          letterSpacing: "0.1em",
          color: "#d9b267",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            border: "1px solid #d9b267",
            borderRadius: "999px",
          }}
        >
          Es pensar
        </span>
        <span>{dateStr}</span>
      </div>

      {/* Article title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            maxWidth: "1000px",
            color: "#fefcf6",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: "26px",
              color: "#a8a093",
              lineHeight: 1.4,
              maxWidth: "900px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </div>
        )}
      </div>

      {/* Footer with site */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "60px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "20px",
          color: "#a8a093",
        }}
      >
        <span>alexendros.me/espensar</span>
        <div style={{ display: "flex", gap: "12px" }}>
          {tags.slice(0, 3).map((t) => (
            <span key={t} style={{ color: "#d9b267" }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
```

- [ ] **Step 2: Verificar build genera archivos**

```bash
npm run build
ls public/og/espensar 2>/dev/null
find out/espensar -name "opengraph-image*" 2>/dev/null
```

⚠️ Next.js con static export coloca `opengraph-image.png` como sibling del HTML. Cada `/espensar/[slug]/` debe tener su propia OG.

- [ ] **Step 3: Validar E2E**

```ts
test("Article OG image rendered", async ({ page, request }) => {
  await page.goto("/espensar/soberania-digital");
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(ogImage).toMatch(/\/espensar\/soberania-digital\/opengraph-image\.png$/);

  const res = await request.get("/espensar/soberania-digital/opengraph-image.png");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
  const buffer = await res.body();
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  expect(width).toBe(1200);
  expect(height).toBe(630);
});
```

⚠️ Si el slug `soberania-digital` no existe, ajustar a uno real leyendo `content/espensar/*.mdx`.

- [ ] **Step 4: Commit**

```bash
git add app/espensar/\\[slug\\]/opengraph-image.tsx tests/seo-article.spec.ts
git commit -m "feat: OG image per espensar article via next/og static export"
```

---

### Task E4: OG dinámica por artículo de /esposible/[slug]

**Files:**

- Create: `app/esposible/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Implementar idéntico a E3 pero para esposible**

```tsx
import { ImageResponse } from "next/og";
import { getContentCollection } from "@/lib/content/loader";

export const dynamic = "force-static";
export const alt = "Artículo de Alexendros · Es posible";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
  const articles = await getContentCollection("esposible");
  const article = articles.find((a) => a.slug === params.slug);
  return [
    {
      id: params.slug,
      alt: article?.frontmatter.title ?? "Artículo",
      size,
      contentType,
    },
  ];
}

export async function generateStaticParams() {
  const articles = await getContentCollection("esposible");
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function EsPosibleArticleOG({ params }: { params: { slug: string } }) {
  const articles = await getContentCollection("esposible");
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#17130f",
          color: "#fefcf6",
          fontSize: "60px",
        }}
      >
        Alexendros
      </div>,
      { ...size },
    );
  }

  const { title, description, tags, date } = article.frontmatter;
  const dateStr = new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0f1a14", // Verdé para diferenciar de espensar
        color: "#e8f4ec",
        padding: "80px 100px",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "18px",
          letterSpacing: "0.1em",
          color: "#7ec998",
          textTransform: "uppercase",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            border: "1px solid #7ec998",
            borderRadius: "999px",
          }}
        >
          Es posible
        </span>
        <span>{dateStr}</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            maxWidth: "1000px",
            color: "#e8f4ec",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: "26px",
              color: "#9cb5a5",
              lineHeight: 1.4,
              maxWidth: "900px",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "60px",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "20px",
          color: "#9cb5a5",
        }}
      >
        <span>alexendros.me/esposible</span>
        <div style={{ display: "flex", gap: "12px" }}>
          {tags.slice(0, 3).map((t) => (
            <span key={t} style={{ color: "#7ec998" }}>
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
```

Notas sobre color: El plan usa `#0f1a14` y `#7ec998` como acento verdé — estos colores **deben** añadirse a `lib/site.ts` o `app/styles/tokens/colors.css` para coherencia con el design system, si más adelante se quiere extender. En este task basta con hardcodear dentro del JSX (la OG no usa CSS variables).

⚠️ Si el equipo prefiere mantener el tono dorado `#d9b267` para todos, eliminar la diferenciación de color y usar el mismo esquema que E3.

- [ ] **Step 2: Validar build y E2E**

```bash
npm run build
find out/esposible -name "opengraph-image*"
```

Test E2E análogo a E3.

- [ ] **Step 3: Commit**

```bash
git add app/esposible/\\[slug\\]/opengraph-image.tsx tests/seo-article.spec.ts
git commit -m "feat: OG image per esposible article via next/og static export"
```

---

### Task E5: Actualizar sitemap para apuntar a OG dinámicas

**Files:**

- Modify: `scripts/generate-sitemap.ts`

- [ ] **Step 1: Cambiar URL imagen en sitemap**

Actualmente `urlEntryWithImage` usa `${BASE}/og/opengraph-image.png` (default). Hay que ajustarlo para que use `/<collection>/<slug>/opengraph-image.png` por artículo.

En `scripts/generate-sitemap.ts`:

```ts
function urlEntryWithImage(
  loc: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  imageUrl: string, // ← obligatorio, sin default
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

// En la generación de espensar:
const espensarUrls = [
  urlEntry(`${BASE}/espensar`, NOW, "weekly", "0.8"),
  ...espensar.map((a) =>
    urlEntryWithImage(
      `${BASE}/espensar/${a.slug}`,
      a.frontmatter.date ?? NOW,
      "monthly",
      "0.7",
      `${BASE}/espensar/${a.slug}/opengraph-image.png`, // ← URL específica
    ),
  ),
].join("\n");

// Igual para esposible:
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
```

- [ ] **Step 2: Actualizar test de sitemap**

`__tests__/lib/sitemap.test.ts`, modificar el match:

```ts
it("includes per-article image:loc", () => {
  const xml = require("node:fs").readFileSync(
    path.join(process.cwd(), "public", "sitemap-espensar.xml"),
    "utf-8",
  );
  expect(xml).toMatch(
    /<image:loc>https:\/\/alexendros\.me\/espensar\/[^/]+\/opengraph-image\.png<\/image:loc>/,
  );
});
```

- [ ] **Step 3: Validación**

```bash
npx vitest run __tests__/lib/sitemap.test.ts
npm run generate-sitemap
xmllint --noout public/sitemap-espensar.xml
grep -c "image:loc" public/sitemap-espensar.xml
```

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-sitemap.ts __tests__/lib/sitemap.test.ts
git commit -m "seo: sitemap uses per-article OG image URLs"
```

---

## Self-Review

**Spec coverage:**

- OG images dinámicas por artículo (nativamente vía `next/og` + `force-static`) → Tasks E3, E4 ✅
- OG branded para home → Task E2 ✅
- Sitemap con URLs de OG por artículo → Task E5 ✅
- E1 verificación previa → ✅

**Premisa corregida:** Plan C original argumentaba que `next/og` no funciona con static export — refutado por evidencia (`app/apple-icon.tsx` ya lo usa). Plan E aprovecha esta capacidad para generar OG por artículo sin trabajo extra (sin necesidad de `satori`+`resvg` runtime).

**Placeholder scan:** Sin placeholders. Todos los pasos tienen código completo.

**Type consistency:**

- Todos los `opengraph-image.tsx` exportan `dynamic = "force-static"` consistentemente.
- `size`, `contentType`, `alt` consistentes entre archivos.
- `generateStaticParams` consume `getContentCollection()` ya tipado.

**Orden de ejecución:**

1. E1 (verificación inicial — depende del estado actual)
2. E2 (home OG base)
3. E3 (espensar OGs por artículo)
4. E4 (esposible OGs por artículo — paralelo a E3)
5. E5 (sitemap actualiza URLs)

E2, E3, E4 son ortogonales; pueden ir en paralelo.
