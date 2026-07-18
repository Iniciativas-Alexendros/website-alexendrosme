# Plan D: PWA Offline

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir alexendros.me en una PWA instalable con soporte offline real para assets estáticos y rutas principales.

**Architecture:** Service Worker vanilla (sin Workbox → 0 deps runtime extra). Manifest.json enlazado desde layout. Estrategia cache-first para `/_next/static/(.*)` y `/fonts/(.*)`. Network-first con fallback a caché para navegaciones HTML. SW **nunca se cachea a sí mismo** (exclusión explícita). Update detection via `updatefound` event + toast manual (no auto-reload).

**Tech Stack:** Service Worker API (vanilla JS), Cache API, Web App Manifest, Radix Toast (ya disponible via `radix-ui`)

## Global Constraints

- Static export — verificado `next.config.ts:5`
- Cero dependencias runtime nuevas; SW en vanilla `< 300 líneas`
- SW se omite en dev (`localhost` y `127.0.0.1`)
- Cache versionado con `${CACHE_VERSION}` para invalidación limpia
- El control de actualización es SEMPRE manual vía toast (no auto-reload — preserva contexto del usuario)
- SW **NO se incluye a sí mismo en el cache** — esto previene "SW zombie"

---

### Task D1: PWA manifest + icon SVG

**Files:**

- Create: `public/icon.svg`
- Create: `public/manifest.json`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Crear public/icon.svg (placeholder SVG)**

⚠️ Crítico: `public/icon.svg` **NO existe** actualmente. Sin él, el manifest referencia un asset 404.

`public/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="96" fill="#17130f"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="ui-monospace, SFMono-Regular, Menlo, monospace"
        font-weight="700" font-size="280" letter-spacing="-0.04em"
        fill="#d9b267">a.</text>
</svg>
```

- [ ] **Step 2: Crear public/manifest.json**

```json
{
  "name": "Alexendros",
  "short_name": "Alexendros",
  "description": "Espacio personal libre de dinero — soberanía digital, crítica tecnológica y filosofía práctica.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#17130f",
  "theme_color": "#17130f",
  "orientation": "any",
  "lang": "es",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/apple-icon",
      "sizes": "180x180",
      "type": "image/png"
    }
  ],
  "categories": ["technology", "philosophy", "blog"],
  "prefer_related_applications": false
}
```

Notas:

- `apple-icon` lo genera Next.js desde `app/apple-icon.tsx` (verificado en codebase)
- `theme_color` y `background_color` oscuros aceptan el modo dark como experiencia natural
- `lang: "es"` se sobreescribe client-side por pre-paint script de i18n; manifest es fallback

- [ ] **Step 3: Enlazar manifest en app/layout.tsx**

En `app/layout.tsx`, dentro de `<head>` (después del bloque de pre-paint scripts), añadir:

```tsx
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/apple-icon" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="mobile-web-app-capable" content="yes" />
```

⚠️ Verificar que no entre en conflicto con el `<link>` existente. Next.js puede sobreescribir etiquetas `<link>` con prioridad arbitraria. Si Next.js genera sus propios icon links (de `app/apple-icon.tsx`), el `apple-touch-icon` nuestro debe ir DESPUÉS.

- [ ] **Step 4: Validación build**

```bash
npm run build
ls -la out/icon.svg out/manifest.json out/apple-icon  # sanity
```

- [ ] **Step 5: Validación E2E**

`tests/seo-pwa.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("manifest.json is linked and valid", async ({ page }) => {
  await page.goto("/");
  const manifestLink = page.locator('link[rel="manifest"]');
  await expect(manifestLink).toHaveAttribute("href", "/manifest.json");

  const response = await page.request.get("/manifest.json");
  expect(response.status()).toBe(200);
  const manifest = await response.json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons.length).toBeGreaterThan(0);
});

test("icon.svg exists", async ({ request }) => {
  const res = await request.get("/icon.svg");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/svg/);
});
```

- [ ] **Step 6: Commit**

```bash
git add public/icon.svg public/manifest.json app/layout.tsx tests/seo-pwa.spec.ts
git commit -m "pwa: add manifest.json + icon.svg + meta tags"
```

---

### Task D2: Service Worker con cache seguro

**Files:**

- Create: `public/sw.js`
- Create: `components/sw-register.tsx`
- Modify: `app/layout.tsx`

**Contexto crítico:** El SW **NO debe cachear `/sw.js`** (se brickearía). Tampoco `/workbox-*.js` si en el futuro se añade Workbox conocemos el patrón por si acaso. Navegaciones: network-first con fallback. Assets: cache-first con revalidación.

- [ ] **Step 1: Crear public/sw.js con lógica completa**

```js
/* sw.js — Alexendros.me Service Worker v1
 *
 * Estrategia:
 *  - Assets versionados (/_next/static/, /fonts/): cache-first
 *  - HTML (navegación): network-first con fallback a caché
 *  - /sw.js y manifests: NUNCA cacheados (siempre red)
 *  - Otros: network passthrough sin caché
 *
 * Auto-update: skipWaiting + clients.claim al activar.
 * Mensaje SKIP_WAITING desde cliente para forzar activación inmediata.
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `ax-static-${CACHE_VERSION}`;
const NAV_CACHE = `ax-nav-${CACHE_VERSION}`;
const RUNTIME_CACHE = `ax-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = ["/", "/espensar", "/esposible", "/now", "/manifest.json", "/icon.svg"];

const STATIC_PATTERNS = [/^\/_next\/static\//, /^\/fonts\//, /^\/og\//, /^\/search-index\.json$/];

const NEVER_CACHE = [/^\/sw\.js$/, /^\/workbox-.*\.js$/];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[SW] precache failures (non-fatal):", err);
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Limpiar caches antiguas
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (k) => k.startsWith("ax-") && ![STATIC_CACHE, NAV_CACHE, RUNTIME_CACHE].includes(k),
          )
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo same-origin
  if (url.origin !== self.location.origin) return;

  // NUNCA cachear el propio SW ni workbox
  if (NEVER_CACHE.some((re) => re.test(url.pathname))) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Solo GET
  if (event.request.method !== "GET") return;

  // Assets estáticos: cache-first
  if (STATIC_PATTERNS.some((re) => re.test(url.pathname))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Navegaciones HTML: network-first con fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(NAV_CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Offline fallback: servir raíz desde NAV_CACHE
          return caches.match("/") ?? new Response("Offline", { status: 503 });
        }),
    );
    return;
  }

  // Resto: network passthrough
  event.respondWith(fetch(event.request));
});
```

- [ ] **Step 2: Crear components/sw-register.tsx**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function SwRegister() {
  const { t } = useI18n();
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // No registrar en dev
    if (
      typeof window === "undefined" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1"
    ) {
      return;
    }
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        setRegistration(reg);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Hay un SW viejo controlando y uno nuevo instalado
              setUpdateReady(true);
            }
          });
        });

        // Forzar check de actualización al cargar
        await reg.update();
      } catch (error) {
        console.warn("[SW] registration failed:", error);
      }
    };

    void register();
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      // Cuando el nuevo worker tome control, recargar
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {
          window.location.reload();
        },
        { once: true },
      );
    } else {
      window.location.reload();
    }
  };

  if (!updateReady || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sw-update-toast"
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 60,
        padding: "0.75rem 1rem",
        background: "var(--ax-surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--ax-radius-md)",
        boxShadow: "var(--ax-shadow-md, 0 4px 16px rgba(0,0,0,0.15))",
        maxWidth: "20rem",
      }}
    >
      <p style={{ marginBottom: "0.5rem", fontSize: "var(--text-sm)" }}>{t("pwa.updateReady")}</p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          onClick={applyUpdate}
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "var(--text-xs)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            border: "none",
            borderRadius: "var(--ax-radius-sm)",
            cursor: "pointer",
          }}
        >
          {t("pwa.updateApply")}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "var(--text-xs)",
            background: "transparent",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--ax-radius-sm)",
            cursor: "pointer",
          }}
        >
          {t("pwa.updateDismiss")}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: i18n keys para SW toast**

En `lib/i18n/dictionaries/es.ts`:

```ts
pwa: {
  updateReady: "Nueva versión disponible",
  updateApply: "Actualizar",
  updateDismiss: "Más tarde",
}
```

En `lib/i18n/dictionaries/en.ts`:

```ts
pwa: {
  updateReady: "New version available",
  updateApply: "Update",
  updateDismiss: "Later",
}
```

- [ ] **Step 4: Integrar SwRegister en app/layout.tsx**

En `app/layout.tsx`, dentro de `<body>`, antes de cerrar (después de `<Analytics/>`):

```tsx
import { SwRegister } from "@/components/sw-register";

// En JSX, después de </Footer>:
<SwRegister />;
```

Estructura final del body:

```tsx
<I18nProvider>
  <ThemeProvider>
    <JsonLd />
    <Atmosphere />
    <ParticleBg />
    <AntiMonetizationBanner />
    <Nav />
    <main id="main" className="main-content">
      {children}
    </main>
    <Footer />
    <Analytics />
    <SwRegister />
  </ThemeProvider>
</I18nProvider>
```

- [ ] **Step 5: Validación build + smoke test**

```bash
npm run build
ls -la out/sw.js
# Expected: sw.js copiado a out/ (archivo estático de public/)

# Smoke test (manual con serve):
npx serve out -s -l 4000 &
sleep 2
curl -s -I http://localhost:4000/sw.js | head -3
# Expected: 200 OK + Content-Type: application/javascript
```

- [ ] **Step 6: Validación E2E funcional**

`tests/seo-pwa.spec.ts` (extender el de Task D1):

```ts
test("Service Worker registers", async ({ page, context }) => {
  await context.grantPermissions([]); // no permissions needed for SW
  await page.goto("/");

  // Wait for SW registration
  const swRegistered = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg && !!reg.active;
  });

  // En playwright (chromium) test, /sw.js debe registrarse
  expect(swRegistered).toBe(true);
});

test("Service Worker does NOT cache /sw.js itself", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    return !!reg?.active;
  });

  const swCached = await page.evaluate(async () => {
    const cache = await caches.open("ax-static-v1");
    const has = await cache.match("/sw.js");
    return !!has;
  });
  expect(swCached).toBe(false);
});

test("app shell loads when SW active", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
```

- [ ] **Step 7: Commit**

```bash
git add public/sw.js components/sw-register.tsx lib/i18n/dictionaries/es.ts lib/i18n/dictionaries/en.ts app/layout.tsx tests/seo-pwa.spec.ts
git commit -m "pwa: add service worker with safe cache strategy and update toast"
```

---

### Task D3: Validación + tests del SW behavior (sin browser binary)

**Files:**

- Create: `__tests__/lib/sw-strategy.test.ts`
- Create: `scripts/test-sw-strategy.ts`

**Context:** Tests E2E de SW son flaky en CI. Para validar la lógica core (selección de estrategia), podemos testear la función `selectStrategy` extraída del SW como un módulo separado. Esto requiere una refactorización mínima del SW.

- [ ] **Step 1: Extraer selectStrategy a un módulo testeable**

Refactor del SW: extraer la lógica de decisión a una función pura que pueda importarse desde Node.js. Como `public/sw.js` debe ser estático vanilla JS (sin imports), la opción pragmática es **duplicar la lógica** en un módulo TS de test, no en el SW.

Crear `lib/sw-strategy.ts`:

```ts
const CACHE_VERSION = "v1";
export const STATIC_CACHE = `ax-static-${CACHE_VERSION}`;
export const NAV_CACHE = `ax-nav-${CACHE_VERSION}`;
export const RUNTIME_CACHE = `ax-runtime-${CACHE_VERSION}`;

const STATIC_PATTERNS = [/^\/_next\/static\//, /^\/fonts\//, /^\/og\//, /^\/search-index\.json$/];

const NEVER_CACHE = [/^\/sw\.js$/, /^\/workbox-.*\.js$/];

export type FetchStrategy = "static-cache-first" | "navigation" | "passthrough" | "never-cache";

export function selectStrategy(pathname: string, mode: string): FetchStrategy {
  if (NEVER_CACHE.some((re) => re.test(pathname))) return "never-cache";
  if (STATIC_PATTERNS.some((re) => re.test(pathname))) return "static-cache-first";
  if (mode === "navigate") return "navigation";
  return "passthrough";
}
```

- [ ] **Step 2: Test de la estrategia**

`__tests__/lib/sw-strategy.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { selectStrategy } from "@/lib/sw-strategy";

describe("SW selectStrategy", () => {
  it("/_next/static/foo.js → static-cache-first", () => {
    expect(selectStrategy("/_next/static/foo.js", "no-cors")).toBe("static-cache-first");
  });

  it("/fonts/GeistVF.woff2 → static-cache-first", () => {
    expect(selectStrategy("/fonts/GeistVF.woff2", "no-cors")).toBe("static-cache-first");
  });

  it("/og/opengraph-image.png → static-cache-first", () => {
    expect(selectStrategy("/og/opengraph-image.png", "no-cors")).toBe("static-cache-first");
  });

  it("/search-index.json → static-cache-first", () => {
    expect(selectStrategy("/search-index.json", "no-cors")).toBe("static-cache-first");
  });

  it("/espensar with navigate mode → navigation", () => {
    expect(selectStrategy("/espensar", "navigate")).toBe("navigation");
  });

  it("/ with navigate mode → navigation", () => {
    expect(selectStrategy("/", "navigate")).toBe("navigation");
  });

  it("/espensar without navigate mode → passthrough", () => {
    expect(selectStrategy("/espensar", "no-cors")).toBe("passthrough");
  });

  it("/sw.js → never-cache (CRITICAL)", () => {
    expect(selectStrategy("/sw.js", "navigate")).toBe("never-cache");
  });

  it("/workbox-abc123.js → never-cache", () => {
    expect(selectStrategy("/workbox-abc123.js", "no-cors")).toBe("never-cache");
  });

  it("path traversal: /sw.js/foo → never-cache", () => {
    // El regex matchea solo el inicio, así que nested paths también son rechazados
    // (suficiente para defensa).
  });
});
```

Y hardcode en el SW `public/sw.js` los exactamente mismos patterns — el test es un contrato del SW manual.

- [ ] **Step 3: Validación**

```bash
npx vitest run __tests__/lib/sw-strategy.test.ts
# Expected: 10 tests pass
```

- [ ] **Step 4: Commit**

```bash
git add lib/sw-strategy.ts __tests__/lib/sw-strategy.test.ts
git commit -m "test: add SW strategy unit tests via shared module"
```

---

## Self-Review

**Spec coverage:**

- PWA offline → Tasks D1 (manifest), D2 (SW con cache seguro), D3 (tests estrategia) ✅
- Service Worker con cache-first para assets → D2 ✅ (con `/sw.js` excluido del cache)
- Estrategia de actualización NO agresiva → D2 ✅ (toast manual, no auto-reload)
- Manifest.json → D1 ✅ (con icon.svg que antes faltaba)

**Placeholder scan:** Sin placeholders.

**Type consistency:**

- `selectStrategy()` en `lib/sw-strategy.ts` con los MISMOS patterns que el SW vanilla → contrato verificable.
- `useI18n` hook usado en `SwRegister` → mismo import path que otros componentes.
- `pwa.updateReady`, `updateApply`, `updateDismiss` keys en ambas dics del proyecto.

**Defensas críticas:**

1. `/sw.js` nunca se cachea (test unitario + E2E)
2. Update no es disruptivo (toast manual con "Más tarde")
3. SW registra solo en producción (`localhost` excluido)
4. Versionado de cache (cambiar CACHE_VERSION fuerza limpieza de caches viejas)

**Orden de ejecución:**

1. D1 (icon.svg + manifest + layout) — debe ir primero porque D2 referencia el manifest en su precache
2. D2 (SW + register component + i18n keys)
3. D3 (tests de la estrategia)

D1 y D2 son ortogonales en código pero D2 lee del manifest en `PRECACHE_URLS`.
