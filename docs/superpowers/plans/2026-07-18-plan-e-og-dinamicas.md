# Plan E: OG Dinámicas

> **Estado:** Implementado al 100%
>
> **Última revisión:** 2026-07-21 — `npx next build` genera 5 OG images por artículo
> (3 espensar + 2 esposible) via `next/og` + `force-static` + `generateStaticParams`.

**Goal:** Cada artículo de espensar y esposible tiene su propia OG image (1200×630 PNG) con
título, descripción y fecha, generada en build-time via `next/og ImageResponse`.

**Architecture:** Dos archivos `opengraph-image.tsx` en rutas dinámicas (`[slug]/`) usan
`next/og` + `force-static` + `generateStaticParams` para pre-renderizar las imágenes en build.
Un helper compartido en `lib/og-image.ts` elimina la duplicación de código.

**Tech Stack:** `next/og`, Satori (incluido en next/og), React JSX para diseño.

## Global Constraints

- Static export — `output: "export"` confirmado en `next.config.ts:3`
- Cero dependencias runtime nuevas (next/og ya incluido en Next.js)
- Las imágenes se generan en build-time, no en runtime
- No usar fuentes WOFF2 (Satori no las soporta — solo TTF/OTF)

---

## Implementación ✅

### Archivos creados

| Archivo                                    | Propósito                                                           |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `app/espensar/[slug]/opengraph-image.tsx`  | OG dinámica por artículo espensar                                   |
| `app/esposible/[slug]/opengraph-image.tsx` | OG dinámica por artículo esposible                                  |
| `lib/og-image.ts`                          | Helper compartido (`ogImageResponse`, `OG_SIZE`, temas tipados)     |
| `tests/seo-og-image.spec.ts`               | E2E: verifica que cada artículo tenga `<meta og:image>` per-article |

### Archivos modificados

| Archivo                         | Cambio                                |
| ------------------------------- | ------------------------------------- |
| `app/espensar/[slug]/page.tsx`  | `openGraph.images` → per-article path |
| `app/esposible/[slug]/page.tsx` | Idem                                  |
| `scripts/generate-sitemap.ts`   | Sitemaps referencian OG per-article   |

### Diseño de las OG images

```
┌──────────────────────────────────────┐
│  ALEXENDROS · Es pensar              │ ← branding sección (gold #d9b267)
│                                      │
│  La falsa dicotomía                  │ ← título (56px, bold)
│  entre tradición                     │
│  y modernidad                        │
│                                      │
│  Una exploración sobre cómo          │ ← descripción (24px, muted)
│  el pensamiento binario...           │
│                                      │
│  15 junio 2026                       │ ← fecha, abajo
└──────────────────────────────────────┘
   1200×630px — gradiente oscuro
   Tono distintivo por colección:
     espensar → dorado (#d9b267) sobre fondo cálido
     esposible → teal (#67d9b2) sobre fondo frío
   Sin fuentes custom (Satori no soporta WOFF2)
```

---

## Historial de implementación

### Intento 1: Static PNG en `app/` (2026-07-18)

**Premisa original (incorrecta):** `next/og` con `force-static` NO funciona en dynamic segments
con static export. Se usó un PNG pre-generado en `app/opengraph-image.png` para la OG root.

**Lo que falló:** En la versión de Next.js del 2026-07-18, el build con
`app/<col>/[slug]/opengraph-image.tsx` rompía `collect-page-data` con
`Cannot find module for page` (ENOENT). El plan documentó la restricción
como permanente.

**Evidencia del error (2026-07-18):**

```
Error [PageNotFoundError]: Cannot find module for page: /esposible/[slug]/opengraph-image
```

### Intento 2: next/og con `force-static` en Next.js 16.2.10 (2026-07-21)

**Nuevo intento exitoso:** Al migrar a Next.js 16.2.10, se probó de nuevo y el build
**funcionó correctamente**. Las 5 OG images se generaron sin errores.

**Lecciones:**

1. **WOFF2 no soportado por Satori**: El primer build falló con
   `Unsupported OpenType signature wOF2`. La solución fue eliminar la carga de fuentes
   custom y usar la fuente default que incluye `next/og`.
2. **CSS Satori-compatible**: Satori no soporta `WebkitLineClamp`, `WebkitBoxOrient`
   ni `textOverflow: "ellipsis"`. El diseño usa wrapping natural.
3. **Metadata desactualizado**: El `generateMetadata` en las páginas de artículo seguía
   apuntando a la OG root. Hubo que actualizar `images` al per-article path.

### Refactor (2026-07-21)

Extracción del helper compartido `lib/og-image.ts` con:

- `ogImageResponse()` — función generadora única
- `OG_SIZE`, `CONTENT_TYPE` — constantes compartidas
- `OGTheme` interface — tema tipado (background, accent, title, description, muted)
- `ESPENSAR_THEME`, `ESPOSIBLE_THEME` — temas concretos

Cada archivo de ruta se redujo de ~85 líneas a ~16.

---

## Verificación

| Check               | Método                         | Resultado                  |
| ------------------- | ------------------------------ | -------------------------- |
| **Build**           | `npm run build`                | ✅ 5 OG images (3+2)       |
| **Typecheck**       | `tsc --noEmit`                 | ✅ 0 errores               |
| **Tests unitarios** | `vitest run`                   | ✅ 180/180                 |
| **E2E OG metadata** | `playwright test seo-og-image` | ✅ 15/15                   |
| **Sitemap**         | `scripts/generate-sitemap.ts`  | ✅ per-article `image:loc` |

### OG images generadas

```
espensar/
  critica-tecnologica/opengraph-image ✓
  manifiesto-eligete-a-ti/opengraph-image ✓
  soberania-digital/opengraph-image ✓
esposible/
  protocolos-vs-plataformas/opengraph-image ✓
  escape-del-feudo-algoritmico/opengraph-image ✓
```

### Todos los meta tags verificados

| Meta            | Antes             | Ahora                    |
| --------------- | ----------------- | ------------------------ |
| `og:image`      | ✅ per-article    | ✅ per-article           |
| `twitter:image` | ❌ root           | ✅ per-article           |
| `twitter:card`  | ❌ no se generaba | ✅ `summary_large_image` |

---

## Self-Review

**Spec coverage:**

- OG image por artículo ✅
- Título + descripción + fecha dinámicos ✅
- Build-time pre-render sin runtime ✅
- Sitemap con `image:loc` per-article ✅
- Sin dependencias nuevas ✅
- Helper compartido eliminando duplicación ✅
- Test E2E que verifica el metadata HTML ✅

**Type consistency:**

- `OGTheme` interface tipa todos los valores de color (5 campos)
- `OGImageProps` usa union type `"espensar" | "esposible"` para collection
- `ogImageResponse` devuelve `Promise<ImageResponse>` — compatible con route handler de Next.js
- `generateStaticParams` exportado por archivo (necesario por ruta)

**Lessons learned (registradas para futuro):**

1. En Next.js 16.2.10 + `output: "export"`, `app/<col>/[slug]/opengraph-image.tsx`
   con `next/og ImageResponse` + `force-static` **SÍ funciona**.
2. Satori **no soporta WOFF2**. Usar solo TTF/OTF vía `fonts` option de ImageResponse,
   o no cargar fuentes custom y usar las defaults de `next/og`.
3. Satori no soporta `textOverflow: "ellipsis"` ni propiedades prefijadas WebKit.
   Usar wrapping natural.
4. El `generateMetadata` en la página de artículo debe actualizarse explícitamente
   al per-article path — Next.js no lo infiere automáticamente del route handler OG.
5. `twitter:image` no se deriva automáticamente de `openGraph.images` — hay que
   definirlo explícitamente en `generateMetadata`.
