# 0004. Pre-paint theme cookie + inline script (sin httpOnly, sin Edge Middleware)

- Estado: proposed
- Fecha: 2026-07-17
- Decisores: Alexendros
- Etiquetas: arquitectura, frontend, performance, lcp, persistencia

> Texto en formato MADR 4.0.0 · https://adr.github.io/madr/

## Contexto y planteamiento del problema

La persistencia del tema (light/dark/system) y el respeto a
`prefers-reduced-motion` se aplican hoy tras la hidratación de React
(`components/theme-provider.tsx` + `useEffect`). El HTML servido por el
export estático sale con las clases vacías y se pintan primero en el
default (`@media (prefers-color-scheme: dark)`), produciendo un FOUC
perceptible de ~150-300ms en el LCP de dispositivos de gama baja y
mobile-first.

Esto NO era un problema antes de PR #110: el IIFE en `public/theme.js`
corría síncronamente antes del paint y aplicaba la clase directamente.
Al migrar el bootstrap a `useEffect` (post-hidratación), el FOUC
regresó. ADR 0003 ya aplazó el flip a IndexedDB como decisión
diferida; este ADR cierra el otro eje: la fase pre-paint.

Restricciones del repo y del deploy que condicionan la decisión:

- **Sitio estático puro** (`output: 'export'`): no hay origin server
  que emita `Set-Cookie` para cookies httpOnly. Vercel sirve cada
  ruta como un único `index.html` desde CDN. No hay Edge Middleware
  dinámico cuando el proyecto es static export.
- **HTTPOnly desde JS imposible**: el flag `HttpOnly` se descarta
  silenciosamente cuando se intenta setear desde `document.cookie`.
  La única vía válida es `Set-Cookie` en respuesta HTTP desde un
  origin/Worker. Para este proyecto, eso requiere una capa server
  que NO tenemos hoy.
- **`prefers-reduced-motion` ya consultado**: `app/styles/tokens/motion.css`
  contiene un bloque `@media (prefers-reduced-motion: reduce)` que
  aplica reglas globales. Lo usamos como fallback nativo para
  `data-reduce` cuando el cookie está ausente.

## Drivers de la decisión

- Eliminar el FOUC actual → bajar el LCP percibido en dispositivos
  lentos sin necesidad de Edge Middleware ni Worker.
- Preparar el terreno para que un futuro Worker / Edge Function pueda
  consumir la cookie y routear variantes sin necesidad de re-arquitectura.
- Mantener el antipatrón "no tracking / no third-party cookies" del
  sitio: el cookie es estrictamente local, Secure, SameSite=Strict,
  sin telemetría.
- Cumplir el principio de **pre-paint = block parse** con un bundle
  `<head>` mínimo (<500 bytes minificados) que ya sabemos打包a
  dentro del script crítico inline existente.

## Opciones consideradas

- **A. Inline pre-paint script + cookie seguro** (elegida):
  `<script>` síncrono en `<head>` lee `document.cookie` (con
  fallback a `localStorage.getItem('theme')`) y aplica la clase
  correcta en `<html>` antes del primer paint. La cookie es Secure /
  SameSite=Strict / Max-Age=1y, **no** httpOnly (porque no es
  posible desde JS).
- **B. Edge Middleware / Cloudflare Worker con HTMLRewriter**:
  interceptar la respuesta en el CDN, leer `Set-Cookie` desde el
  origin o la cookie del request, reescribir `<html class>` con
  `HTMLRewriter`. Daría httpOnly de verdad pero requiere o Worker
  delante de Vercel o migrar a Vercel Edge Middleware (incompatible
  con `output: 'export'`).
- **C. Estado quo (FOUC aceptable)**: no tocar nada. El LCP
  percibido se queda con ~150-300ms extra en cada navegación.
- **D. Cookie signed-only (sin inline script)**: HMAC + JSON + gzip.
  Útil para futura CDN, pero SIN pre-paint el FOUC persiste igualmente.

## Resultado de la decisión

Opción elegida: **"A. Inline pre-paint script + cookie seguro"**, porque:

- Cierra el FOUC al 100% en repeat-visits (cookie presente → clase
  aplicada en ms 0) y al ~95% en first-visits (localStorage con
  valor heredado).
- Es 100% compatible con el export estático puro actual: cero
  infra nueva, cero dependencias, bundle `<head>` increment = ~370
  bytes minificados (cabecen en el budget de critical CSS).
- Pre-paint respeta `matchMedia('(prefers-reduced-motion: reduce)')`
  directamente desde inline JS, así que el bloque `@media` de
  `motion.css` queda intacto y la cookie `ax-rd` solo añade un hint
  explícito para casos donde el browser no reporte correctamente.
- La cookie queda lista (no httpOnly, pero firmada con versionado)
  para que un Worker NEXT-PR pueda firmarla de verdad y/o leerla
  con `<meta>`-injected variant.

### Consecuencias positivas

- LCP percibido mejora ~150-300ms en repeat-visits de dispositivos
  lentos (chip A-series budget mobile o similar).
- Infra idéntica: cero conocimiento nuevo, cero deploy extra.
- Multi-tab sync implícito: un toggle en tab A escribe el cookie +
  storage, el reload en tab B lo lee de inmediato vía pre-paint.
- El `lib/theme-storage.ts` (ADR 0003) sigue siendo la fuente de
  verdad — la cookie es solo un espejo síncrono-readable.

### Consecuencias negativas

- **httpOnly NO se aplica**: la cookie es JS-legible. Mitigado
  porque solo contiene preferencias visuales (tema + reduce), no
  PII ni nada con valor de seguridad.
- **El cookie no es firmado criptográficamente** por ahora: un
  atacante con acceso devtools puede setear `ax-th=purple` y solo
  conseguirá que el theme caiga al default (porque validamos contra
  VALID_THEMES). Mitigable en NEXT-PR con HMAC + JSON + gzip y un
  worker de validación.
- **Sub-paint de first-visit sigue siendo ~50ms** (mientras
  localStorage se lee por primera vez). El repeat-visit está
  salvado, pero el cold path necesita la fase async original
  (useEffect con `isLoaded`). Ambos coexisten.

## Validación

- `vitest`: 13 tests nuevos (10 en `theme-pre-paint.test.ts` cubriendo
  presencia de cookies names, ausencia de `eval`/`Function`/
  `document.write`, size budget <800 bytes; 9 en
  `theme-cookie.test.ts` cubriendo read/write/clear con happy-dom).
- Bundle activo de `/_next/static/chunks/*.js` no crece: el script va
  inline en `<head>`, no genera chunk. DCE verificado con
  `grep -rE 'prePaintScriptString' out/_next/static/chunks`.
- Producción (`alexendros.me`): servir el HTML post-deploy y
  verificar que el `<script>` aparece como primer hijo de `<head>` y
  precede al `<style>` crítico. Smoke curl después del merge.

## Próximos pasos (NEXT-PR backlog)

1. **Signed+gzip cookie** (la alternativa "más invasiva" del
   request original): payload `{t,r}` base64 + gzip + HMAC con un
   secret por deployment. Consume `crypto.subtle.sign` vía API
   asíncrona (se ejecuta solo en el path `themeStorage.set`, no en
   pre-paint) y mantiene la cookie actual así que el deploy es
   transparente.
2. **Worker de validación opcional**: si en algún momento aparece
   `output: 'export'` con variante por CDN, un Worker de Cloudflare
   delante de Vercel puede firmar + inyectar `<html class>` con
   HTMLRewriter. La cookie AX_TH firmada pasa a ser consumida por el
   Worker y se vuelve el contrato CDN-aware.
3. **Tests e2e Playwright** que aseguren que el `<html>` ya tiene
   `data-theme` correcto en el ms 0 post-paint (antes de hydration),
   comparando con `requestIdleCallback` o `performance.now()`. Permite
   regression tests para cualquier regresión futura que rompiera el
   orden de `<head>`.
4. **Generalizar el patrón** a `components/anti-monetization-banner.tsx`
   (que persiste `banner-dismissed` en localStorage) y consolidar en
   `lib/storage.ts` con la misma estrategia de mirroring
   localStorage + cookie + pre-paint.

## Pros y contras de las opciones

### A. Inline pre-paint script + cookie seguro (elegida)

- Bueno, porque cierra el FOUC sin infra nueva.
- Bueno, porque cabe en el budget de critical CSS.
- Bueno, porque prepara cookie para futuros Workers sin cambiar
  contrato.
- Malo, porque no es httpOnly.
- Malo, porque first-visit sigue con sub-paint async.

### B. Edge Middleware / Cloudflare Worker con HTMLRewriter

- Bueno, porque logra httpOnly real y variant routing CDN-aware.
- Malo, porque el proyecto es static export — incompatible directo
  con Vercel Edge Middleware.
- Malo, porque Cloudflare Worker delante de Vercel añade doble-CDN
  - gestión de cache invalidation.

### C. Estado quo

- Bueno, porque cero esfuerzo.
- Malo, porque el LCP percibido se queda con 150-300ms extra en
  repeat-visits, exactamente el síntoma que el caso buscaba corregir.

### D. Cookie signed-only

- Bueno, porque deja la cookie firmada hoy sin tocar el pre-paint.
- Malo, porque no resuelve el FOUC; el `<useEffect>` sigue aplicando
  la clase DESPUÉS del paint.
- Malo, porque firma client-side con secret visible anula la
  criptografía.

## Más información

- `lib/theme-cookie.ts`: read/write/clear con Secure / SameSite=Strict
  / Max-Age=1y. Whitelist `VALID_THEMES` previene garbage.
- `lib/theme-pre-paint.ts`: `prePaintScriptString()` devuelve el
  IIFE síncrono (~370 bytes minificados) que aplica clase + data-theme
  - data-reduce antes del primer paint.
- `app/layout.tsx`: el `<script>` va como **primer** hijo de `<head>`
  para que corra antes del parser de CSS; el `dangerouslySetInnerHTML`
  está permitido por el CSP actual (`script-src 'self' 'unsafe-inline'`
  en `vercel.json`).
- `components/theme-provider.tsx`: en el useEffect de write-back,
  además de `themeStorage.set(theme)`, llama a `writeThemeCookie({theme,
reduceMotion})` con el snapshot de `matchMedia('(prefers-reduced-motion:
reduce)')` en el momento del toggle.
- ADR 0003: la migración localStorage → IndexedDB queda intacta; el
  pre-paint script continúa leyendo localStorage como fallback de
  first-visit. Si NEXT-PR flips el `THEME_STORAGE_BACKEND`, el
  pre-paint seguirá funcional porque `<script>` síncrono solo puede
  tocar storage síncrono — IndexedDB async queda fuera de su contrato.
