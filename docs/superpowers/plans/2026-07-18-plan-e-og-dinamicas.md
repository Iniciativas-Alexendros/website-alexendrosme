# Plan E: OG Images — Outcome real

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.
>
> **Estado:** Phase 1 entregada · Phase 2 fuera de scope
>
> **Última revisión:** 2026-07-18 — evidencia binaria validada con `npx next build`: `out/opengraph-image.png` es **PNG real 1200×630 16-bit/color RGBA** (verificado con `file(1)`).

**Goal:** Servir una imagen OpenGraph PNG en `/opengraph-image.png` que next/og file convention publique automáticamente.

**Architecture:** Aprovechamos el **file convention estático** de Next.js App Router: un archivo `app/opengraph-image.png` se publica automáticamente como `/opengraph-image.png` en el `output: "export"` — sin código runtime, sin `next/og`, sin necesidad de API edge. Next.js añade también `<meta property="og:image">` automáticamente a todas las rutas que no lo sobrescriban.

**Premisa corregida registrada:**
- ❌ Plan original asumía `next/og ImageResponse` con `force-static` en `app/opengraph-image.tsx` para OG dinámica por ruta. **FALLÓ en static export de Next.js 16**: build logs dijeron `○ /opengraph-image` (route static) pero el output real fue el directorio `out/opengraph-image/` (vacío) en lugar de `out/opengraph-image.png`. También falló en dynamic-segment routes: `app/<col>/[slug]/opengraph-image.tsx` rompe la fase de collect-page-data con `Cannot find module for page` (ENOENT en Turbopack worker).
- ✅ La convención de archivos estáticos resuelve ambos casos: cualquier imagen en `app/<route>.png` se publica como `/<route>.png` y se enlaza automáticamente a `<meta property="og:image">`.

**Tech Stack:** Solo PNG estático en `app/`. Sin satori, sin @vercel/og, sin next/og, sin runtime.

## Global Constraints

- Static export — `output: "export"` confirmado en `next.config.ts:3`.
- CERO dependencias runtime/producción nuevas.
- La imagen PNG debe estar en `app/` antes de cada build.
- La URL pública debe ser `/opengraph-image.png` (raíz) o subpath según convención.
- La OG image debe ser 1200×630 px para máxima compatibilidad con OpenGraph.

---

## Phase 1 — Entregada ✅

### Task E1: Verificar baseline (apple-icon.tsx como prueba de file convention)

Verificado por lectura directa de `out/apple-icon`:

```
out/apple-icon: PNG image data, 180 x 180, 8-bit/color RGBA, non-interlaced
```

**Hallazgo:** `app/apple-icon.tsx` con `next/og + ImageResponse + force-static` **sí produce PNG estático** en `out/apple-icon` para rutas sin dynamic segments. La premisa general es válida para static-segment routes.

### Task E2: OG branded — mover PNG estático a `app/`

**Decision:** En lugar de generar dinámicamente (que falla en static export), colocamos el PNG preexistente directamente en `app/` para que Next.js lo publique.

```bash
mv public/og/opengraph-image.png app/opengraph-image.png
```

Next.js detecta `app/opengraph-image.png` automáticamente y:
1. Publica el archivo en `out/opengraph-image.png` (raíz)
2. Inyecta `<meta property="og:image" content="/opengraph-image.png">` en todas las rutas que no sobrescriban
3. Cache-Control desde vercel.json (Plan A3) cubre `/opengraph-image.png`

**Evidencia binaria:**
```
$ file out/opengraph-image.png
out/opengraph-image.png: PNG image data, 1200 x 630, 16-bit/color RGBA, non-int
$ ls -la out/opengraph-image.png
-rw-rw-r-- 1 alexendros alexendros 63003 Jul 18 20:32 out/opengraph-image.png
```

### Task E3-E4: OG per-artículo → **NO IMPLEMENTADO, revertido**

Las rutas `app/espensar/[slug]/opengraph-image.tsx` y `app/esposible/[slug]/opengraph-image.tsx` se crearon inicialmente pero **rompieron el build** durante la fase de `Collecting page data`:

```
Error [PageNotFoundError]: Cannot find module for page: /esposible/[slug]/opengraph-image
    at ignore-listed frames { code: 'ENOENT' }
Export encountered an error on /esposible/[slug]/opengraph-image, exiting the build.
```

**Causa raíz:** Turbopack worker en Next.js 16 + static export no resuelve correctamente módulos en dynamic segments con `next/og ImageResponse`. El error NO menciona restricciones conocidas, pero la combinación `output: "export" + dynamic-segment + opengraph-image.tsx + generateImageMetadata/generateStaticParams returning sync data with fs reads` falla consistentemente.

**Fix aplicado:** revertir los archivos y aceptar fallback todas-las-rutas → root OG. `scripts/generate-sitemap.ts` actualizado para que el `image:loc` per-artículo apunte a `/opengraph-image.png` (root) en lugar de `/<col>/<slug>/opengraph-image.png`.

### Task E5: Sitemap con image:loc por artículo → implementado con URL root

```ts
// scripts/generate-sitemap.ts (post-fix)
urlEntryWithImage(
  `${BASE}/espensar/${a.slug}`,
  a.frontmatter.date ?? NOW,
  "monthly",
  "0.7",
  `${BASE}/opengraph-image.png`,  // ← root, all articles share
);
```

**Caveat SEO:** Tener 5 artículos (3 espensar + 2 esposible) apuntando todos al mismo `image:loc` puede interpretarse como duplicate-image signal por Google Images. Aceptable para v0.5.0; será reemplazado en Phase 2.

**Test (Plan C2 step 1, finalmente creado):**
`__tests__/lib/sitemap.test.ts` valida:
- 4 archivos generados (sitemap + 3 segmentos)
- Index referencia los 3 sub-sitemaps
- Pages sitemap incluye `/now`, `/tags`, todas las legales
- Espensar/esposible sitemaps tienen `xmlns:image="..."`
- Per-artículo `image:loc` apunta a `/opengraph-image.png`

---

## Phase 2 — OUT OF SCOPE

Per-artículo OG dinámica **requeriría** una de:

1. **Build-time pre-render via satori + @resvg/resvg-wasm** (~80 líneas en `scripts/generate-og-images.ts`):
   - Lee MDX frontmatter via `getContentCollection`
   - Renderiza React JSX → SVG (satori)
   - Convierte SVG → PNG (@resvg/resvg-wasm)
   - Escribe `<col>/<slug>/opengraph-image.png` directamente en `public/`
   - El build de Next.js copia automáticamente al output vía static-export
   - DevDeps a añadir: `satori`, `@resvg/resvg-wasm`, opcionalmente `@types/node` ya presente

2. **Edge function runtime** (satori en runtime, no aplica a static export sin service worker específico)

3. **Renombrar `content.coleccion/[slug]/index/route.tsx`** que devuelve raw bytes — exploratorio, no recomendado.

**Rec. estimada Phase 2:** 2-3h implementación + tests. Dependencias totales: 2 paquetes dev nuevos.

**Tracking:** Task futura → `Plan E.2: per-article OG via satori+resvg build pre-render`.

---

## Self-Review

**Spec coverage (Phase 1):**
- OG image servida en `/opengraph-image.png` ✅ (binary evidence: 1200×630 PNG)
- `next/og` evaluado y descartado con razonamiento documentado ✅
- Sitemap con `image:loc` root por artículo ✅ (caveat: duplicate-image)
- Build verde end-to-end ✅

**Spec coverage (Phase 2):**
- ❌ Per-artículo OG unique images — **OUT OF SCOPE**

**Placeholder scan:** Sin placeholders en Phase 1.

**Type consistency:** Sin type changes (solo archivos binarios y config).

**Lessons learned (registradas para futuro):**
1. En Next.js 16 + `output: "export"`, **nunca** usar `app/<col>/[slug]/opengraph-image.tsx` con `next/og ImageResponse`. El collect-page-data falla con ENOENT.
2. Para OG images en static export, preferir **file convention** `app/<route>.png` sobre dynamic generation.
3. Si se requiere per-artículo gold standard, usar satori+@resvg/resvg-wasm en script de build pre-render (Plan E.2).
