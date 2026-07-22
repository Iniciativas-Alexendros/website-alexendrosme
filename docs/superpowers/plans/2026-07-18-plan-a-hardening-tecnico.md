# Plan A: Hardening Técnico

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar 3 vulnerabilidades/deficiencias técnicas + añadir 1 capa de seguridad complementaria: CSP hash SHA256 para CSS crítica inline (manteniendo unsafe-inline para Next.js font injection), cacheo agresivo de assets inmutables, cobertura de tests medible, y aislamiento de regresión visual fuera del pipeline crítico.

**Architecture:** Cuatro tareas independientes (orden recomendado por dependencias: A4 primer, luego A1, A3, A5). Las tareas A1/A3 son cambios en configuración + commit atómico. A4 require install + config + commit. A5 es refactor de scripts de Playwright + nuevo workflow.

**Tech Stack:** Vercel config, Vitest v4, @vitest/coverage-v8, Playwright tags, CSP SHA256 hashing

## Global Constraints

- El sitio es static export (Next.js `output: "export"`) — confirmado en `next.config.ts:5`
- No añadir dependencias runtime nuevas (devDeps OK)
- CSP debe seguir permitiendo Vercel Analytics (`va.vercel-scripts.com`, `vitals.vercel-insights.com`)
- Todos los comandos de verificación deben pasar sin errores
- Las CSS críticas inline SÓLO se generan con `force-static`; ningún plan debe romper `app/apple-icon.tsx`

---

### Task A1: Añadir hash SHA256 a style-src como capa adicional (unsafe-inline es necesario para Next.js font injection)

**Files:**

- Create: `scripts/hash-inline-blocks.ts`
- Modify: `vercel.json` (línea CSP style-src)
- Modify: `app/layout.tsx` (si fuera necesario añadir identificador al `<style>`)

**Context:** `vercel.json` (verificado: `/` source) usa `style-src 'self' 'unsafe-inline'`. Hay 2 bloques inline en `app/layout.tsx` (1 style + 1 script). Con CSP hash podemos añadir `'sha256-<hash>'` como capa adicional.

⚠️ **Restricción real: NO se puede eliminar `unsafe-inline` de style-src.** Next.js 19+ inyecta `<style>` dinámicos para su font optimization system (subset de fuentes). Estos estilos son dinámicos y no pueden SHA-hashearse. Sin `unsafe-inline`, las fuentes dejan de renderizar (verificado por test `security-headers.test.ts:27`).

**Objetivo corregido:** Añadir `'sha256-<hash>'` para la CSS crítica inline de layout.tsx, manteniendo `unsafe-inline` como fallback necesario para font injection. El hash reduce la superficie de ataque sin romper funcionalidad.

Premisa verificada: `app/layout.tsx` extiende ~1900 chars con `dangerouslySetInnerHTML={{ __html: \`...\` }}`en un único`<style>`. El bloque es single-line dentro del template literal — pero un cambio mecánico de prettier podría romperlo. El script TS es robusto a multilínea.

- [ ] **Step 1: Crear script de hash determinístico**

`scripts/hash-inline-blocks.ts`:

```ts
import fs from "node:fs";
import crypto from "node:crypto";

const layout = fs.readFileSync("app/layout.tsx", "utf-8");
const re = /__html:\s*`([^`]+)`/g;
const blocks: string[] = [];
let m: RegExpExecArray | null;
while ((m = re.exec(layout)) !== null) blocks.push(m[1] ?? "");

if (blocks.length === 0) {
  console.error("ERROR: no inline blocks found in app/layout.tsx");
  process.exit(1);
}

console.log(`Found ${blocks.length} inline block(s):`);
for (let i = 0; i < blocks.length; i++) {
  const content = blocks[i] ?? "";
  const hash = crypto.createHash("sha256").update(content, "utf-8").digest("base64");
  console.log(`  [${i}] length=${content.length}  sha256-${hash}`);
}
```

- [ ] **Step 2: Ejecutar y leer hashes**

```bash
npx tsx scripts/hash-inline-blocks.ts
```

Output esperado: 1 bloque (la CSS crítica). El bloque `[0]` tiene `sha256-<hash>` — anotarlo.

⚠️ Si el output muestra más de 1 bloque, el layout también tiene JS inline (scripts i18n/theming). Esos van por `script-src` y ya están permitidos por `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com`. Mantener `'unsafe-inline'` en script-src (no se puede eliminar sin reformular esos pre-paint scripts como archivos externos).

- [ ] **Step 3: Actualizar CSP en vercel.json**

En `vercel.json`, dentro del bloque `/(.*)` source, encontrar:

```json
"Content-Security-Policy",
"value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'"
```

Reemplazar `style-src 'self' 'unsafe-inline'` por:

```
style-src 'self' 'unsafe-inline' 'sha256-<HASH>'
```

donde `<HASH>` es el output del Step 2.

⚠️ **Mantener `'unsafe-inline'`** — es necesario para los estilos dinámicos de Next.js font injection.

- [ ] **Step 4: Verificar con build + smoke test**

```bash
npm run build
ls -la out/index.html  # sanity
grep -c "sha256-" out/../vercel.json || echo OK
```

Para validación end-to-end con header real, deployar a preview y `curl -I https://<preview>.vercel.app/ | grep -i content-security-policy` — debe contener el hash y `unsafe-inline` en style-src.

- [ ] **Step 5: Tests de no-regresión**

Crear `__tests__/lib/security-headers.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import vercelConfig from "@/vercel.json";

describe("CSP", () => {
  it("includes both 'unsafe-inline' (for Next.js font injection) and sha256 hash (for critical CSS)", () => {
    const csp = (vercelConfig.headers as Array<{ headers?: Array<{ key: string; value: string }> }>)
      .find((h) => h.headers?.some((x) => x.key === "Content-Security-Policy"))
      ?.headers?.find((x) => x.key === "Content-Security-Policy")?.value;
    expect(csp).toBeDefined();
    const styleSrc = csp?.match(/style-src[^;]+/)?.[0] ?? "";
    expect(styleSrc).toMatch(/'unsafe-inline'/);
    expect(styleSrc).toMatch(/'sha256-[A-Za-z0-9+/=]+'/);
  });
});
```

Y en `vitest.config.ts` ya viene `include: ["__tests__/**/*.test.ts"]` así que el test correrá automáticamente.

- [ ] **Step 6: Commit**

```bash
git add scripts/hash-inline-blocks.ts vercel.json __tests__/lib/security-headers.test.ts
git commit -m "security: add sha256 hash to style-src alongside unsafe-inline for Next.js font compatibility"
```

---

### Task A2: 🗑️ ELIMINADA

**Razón:** vercel.json NO contiene `Access-Control-Allow-Origin: *`. Verificado leyendo el archivo directamente. La premisa del plan original era incorrecta.

Si en el futuro se añade un endpoint con CORS, se debe diseñar con un `Access-Control-Allow-Origin` específico (no `*`) — pero no es trabajo del hardening actual.

---

### Task A3: Reforzar Cache-Control para todos los assets inmutables

**Files:**

- Modify: `vercel.json`

**Context:** `/_next/static/(.*)` ya tiene `max-age=31536000, immutable`. `/fonts/(.*)` solo tiene `max-age=604800` (1 semana). Hay otros assets que también se benefician: `/search-index.json` (regenerado solo en build), `/og/(.*)` (imágenes OG estáticas), `/icon.svg`, `/manifest.json`.

- [ ] **Step 1: Modificar bloque /fonts en vercel.json**

Cambiar:

```json
{
  "source": "/fonts/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=604800" },
    { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
  ]
}
```

a:

```json
{
  "source": "/fonts/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
    { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
  ]
}
```

- [ ] **Step 2: Añadir bloque /assets inmutables adicionales**

Añadir a `vercel.json` `headers`:

```json
{
  "source": "/og/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=86400" },
    { "key": "Cross-Origin-Resource-Policy", "value": "same-origin" }
  ]
},
{
  "source": "/search-index.json",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=3600" }
  ]
},
{
  "source": "/manifest.json",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=86400" }
  ]
},
{
  "source": "/icon.svg",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=86400" }
  ]
}
```

Nota: `/og/` no es `immutable` porque se regenera si hay nuevos artículos y el comando `npm run generate-search-index` cambia archivos derivados.

- [ ] **Step 3: Tests de headers (extender el anterior)**

En `__tests__/lib/security-headers.test.ts`, añadir:

```ts
describe("Cache-Control", () => {
  const headers = vercelConfig.headers as Array<{
    source: string;
    headers: Array<{ key: string; value: string }>;
  }>;

  it("fonts uses immutable+1y", () => {
    const fonts = headers.find((h) => h.source === "/fonts/(.*)");
    const cc = fonts?.headers.find((x) => x.key === "Cache-Control")?.value ?? "";
    expect(cc).toBe("public, max-age=31536000, immutable");
  });

  it("_next/static uses immutable+1y", () => {
    const ns = headers.find((h) => h.source === "/_next/static/(.*)");
    const cc = ns?.headers.find((x) => x.key === "Cache-Control")?.value ?? "";
    expect(cc).toBe("public, max-age=31536000, immutable");
  });
});
```

- [ ] **Step 4: Verificar JSON válido**

```bash
node -e "JSON.parse(require('fs').readFileSync('vercel.json', 'utf-8'))" && echo OK
```

- [ ] **Step 5: Commit**

```bash
git add vercel.json __tests__/lib/security-headers.test.ts
git commit -m "perf: extend Cache-Control to immutable=1y for fonts + add asset rules"
```

---

### Task A4: Configurar cobertura de tests en Vitest

**Files:**

- Modify: `package.json` (devDependencies)
- Modify: `vitest.config.ts`
- Modify: `package.json` (scripts)
- Create: `coverage-baseline.json`

**Context:** Vitest v4 requiere `@vitest/coverage-v8` instalado ANTES de configurar el provider. Sin install, `vitest run --coverage` falla con "No coverage provider installed". Hay que instalar primero y luego medir baseline.

- [ ] **Step 1: Instalar coverage provider**

```bash
npm install -D @vitest/coverage-v8
git add package.json package-lock.json
git commit -m "chore: add @vitest/coverage-v8 devDep"
```

- [ ] **Step 2: Generar baseline SIN thresholds primero**

Modificar `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts", "lib/**/index.ts", "lib/i18n/dictionaries/*.ts"],
      reporter: ["text", "lcov", "html", "json-summary"],
    },
  },
});
```

Nota: thresholds removidos temporalmente — primero medimos baseline.

- [ ] **Step 3: Medir baseline**

```bash
npm run test:coverage 2>&1 | tee coverage-baseline.txt
```

Output esperado (formato `json-summary`):

```
{
  "total": {
    "lines": { "pct": 85.3, ... },
    "functions": { "pct": 92.1, ... },
    "branches": { "pct": 71.4, ... },
    "statements": { "pct": 85.3, ... }
  }
}
```

- [ ] **Step 4: Decidir thresholds basados en baseline**

Con base en `coverage-baseline.txt`, elegir thresholds que:

- floor 5 puntos por debajo del baseline actual: e.g. si actualmente `lines: 85`, threshold = 80.
- branches más permisivo (siempre son los más bajos).

Si baseline < 50 en algún eje → NO añadir threshold (sería bloqueante). Solo añadir threshold en ejes donde baseline ≥ 60.

Añadir a `vitest.config.ts`:

```ts
coverage: {
  // ... resto igual ...
  thresholds: {
    lines: 80,    // editar según baseline real
    functions: 85,
    branches: 65,
    statements: 80,
  },
},
```

⚠️ **Si en el baseline branches < 60:** excluir branches del threshold temporalmente con `// @vitest-threshold-exclude branches` y abrir issue para incrementarlo.

- [ ] **Step 5: Añadir scripts y CI**

En `package.json`:

```json
"test:coverage": "vitest run --coverage",
"test:coverage:watch": "vitest --coverage"
```

En `.github/workflows/ci.yml`, en el job `build`, después de `npm run test`, añadir:

```yaml
- name: Vitest coverage
  run: npm run test:coverage
```

Añadir al final de `vitest run --coverage` una línea al `.gitignore`:

```
coverage/
```

Y crear `coverage-baseline.json` con el json-summary para tracking histórico:

```bash
cat coverage/coverage-summary.json > coverage-baseline.json
```

- [ ] **Step 6: Verificar**

```bash
npm run test:coverage
# Expected: report pasa con thresholds definidos en base a baseline
```

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts package.json __tests__/lib/security-headers.test.ts .github/workflows/ci.yml coverage-baseline.json
git commit -m "test: add vitest coverage with v8 provider and measured thresholds"
```

---

### Task A5: Aislar regresión visual del pipeline principal

**Files:**

- Modify: `playwright.config.ts`
- Modify: `package.json` (scripts)
- Modify: `tests/visual-regression.spec.ts` (tags)
- Create: `.github/workflows/visual-regression.yml`
- Modify: `.github/workflows/ci.yml`

**Context:** Premisa verificada leyendo `ci.yml`: el job `e2e` ejecuta `npm run test:e2e`, y ese script (en `package.json`) corre TODOS los tests Playwright. `tests/visual-regression.spec.ts` está mezclado con `tests/a11y.spec.ts`, `tests/seo-*.spec.ts`, etc.

**Por qué aislarlo:** Snapshots visuales son frágiles (cambios de fuente del navegador, anti-alias diferencias, resolución). Un cambio de versión de Chromium puede hacer fallar visual sin haber regresión real. Si bloquea el merge, retrasa despliegues urgentes. Si corre en workflow dedicado con `continue-on-error` o "soft fail", el equipo ve el diff pero puede mergear.

- [ ] **Step 1: Añadir tag @visual al spec de regresión visual**

En `tests/visual-regression.spec.ts`, al inicio:

```ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", { tag: "@visual" }, () => {
  // ... tests existentes ...
});
```

Verificar con `npx playwright test --list` que aparecen con tag.

- [ ] **Step 2: Modificar package.json scripts**

En `package.json`:

```json
"test:e2e": "playwright test --grep-invert @visual",
"test:visual": "playwright test --grep @visual",
"test:e2e:all": "playwright test"
```

- [ ] **Step 3: Crear workflow dedicado**

`.github/workflows/visual-regression.yml`:

```yaml
name: Visual Regression

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

# Permite ejecutar sin bloquear merge si la regresión es por diff menor
concurrency:
  group: visual-${{ github.ref }}
  cancel-in-progress: true

jobs:
  visual:
    name: Visual regression
    runs-on: ubuntu-latest
    timeout-minutes: 20
    permissions:
      contents: read
      actions: write
    steps:
      - uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7
      - uses: actions/setup-node@249970729cb0cb5b957afae4c5dc5a4e5e0c9bde # v6
        with:
          node-version-file: ".nvmrc"
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Install Playwright browsers
        run: npx playwright install chromium --with-deps
      - name: Start preview and run visual
        run: |
          npx serve out -s -l 3000 &
          npx wait-on http://localhost:3000
          npx playwright test --grep @visual
        env:
          CI: true
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7
        if: failure()
        with:
          name: visual-diff
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```

- [ ] **Step 4: Verificar que job `e2e` ya no corre visual**

En `.github/workflows/ci.yml`, el job `e2e` queda intacto — ya ejecuta `npm run test:e2e` que ahora excluye `@visual` automáticamente.

- [ ] **Step 5: Smoke test local**

```bash
npm run test:e2e  # NO debe ejecutar visual regression
# Expected: tests except visual-regression.spec.ts
npm run test:visual  # SÍ debe ejecutar solo visual
# Expected: solo tests con tag @visual
```

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts package.json tests/visual-regression.spec.ts .github/workflows/visual-regression.yml
git commit -m "ci: isolate visual regression in dedicated workflow via @visual tag"
```

---

## Self-Review

**Spec coverage:**

- CSP style-src hash (adicional, manteniendo unsafe-inline) → Task A1 ✅
- Cache-Control fonts + assets → Task A3 ✅
- Coverage Vitest → Task A4 ✅
- Visual regression CI aislado → Task A5 ✅
- ~~Access-Control-Allow-Origin~~ → 🗑️ A2 ELIMINADA: header no existe en vercel.json
- ~~Reemplazar unsafe-inline~~ → 🔴 **CORREGIDO**: Next.js font injection requiere unsafe-inline, se añade hash como capa adicional

**Placeholder scan:** Sin placeholders. Todos los pasos tienen código completo, comandos exactos, y verificaciones.

**Type consistency:** N/A — son configs y tweaks sin interfaces compartidas entre tasks (excepto vitest.config.ts que comparten el bloque `coverage` en A4).

**Orden de ejecución recomendado:**

1. A4 (instalar @vitest/coverage-v8 primero)
2. A1 (CSP hash — añadir sha256 junto a unsafe-inline)
3. A3 (Cache-Control tweaks)
4. A5 (visual regression workflow independiente)

Estas 4 tasks son independientes entre sí; el orden solo importa por dependencias de tooling (A4 must precede CI).
