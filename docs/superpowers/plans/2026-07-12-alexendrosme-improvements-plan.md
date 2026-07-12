# Plan de mejoras website-alexendrosme

**Fecha:** 2026-07-12  
**Repositorio:** Iniciativas-Alexendros/website-alexendrosme (~/projects/website-alexendrosme)  
**Rama base recomendada:** `main` (limpia, en producción)  
**Stack:** Next.js 16 (static export), Tailwind CSS v4, shadcn/ui, TypeScript strict, npm@10  
**CI:** Self-hosted runner `infra-01` (label `ts`)  
**Tests:** 38 tests (Vitest + Playwright + axe-core) — **verde completo**

---

## Estado actual de ramas

| Rama                     | Commit  | Estado                                    | Acción recomendada                            |
| ------------------------ | ------- | ----------------------------------------- | --------------------------------------------- |
| `main`                   | de378b1 | Limpia, en producción (apex + www Vercel) | **Base para nueva rama**                      |
| `ci/self-hosted-runners` | 1520be4 | 17 archivos modificados sin commitear     | **Descartar** (WIP sucio)                     |
| `feat/design-system-v1`  | 1520be4 | Igual que arriba                          | **Descartar**                                 |
| `fix/vercel-npm`         | ac371bb | 3 commits ahead, 2 behind origin          | Revisar si hay commits útiles, sino descartar |

**Decisión:** Crear rama `feat/improvements-v0.4.0` desde `main` (limpia). Las ramas `ci/self-hosted-runners` y `feat/design-system-v1` se eliminan tras confirmar que no hay trabajo único. `fix/vercel-npm` se inspecciona y se descarta o se cherry-picka si aplica.

---

## Tareas atómicas (prioridad alta → baja)

### 1. CHANGELOG.md: corregir URLs del repo antiguo

- **Archivo:** `CHANGELOG.md`
- **Cambio:** Reemplazar `https://github.com/Alexendros/website-alexendrosme` → `https://github.com/Iniciativas-Alexendros/website-alexendrosme` en líneas 98-101 (links de comparación y release)
- **Verificación:** `grep -n "Alexendros/website-alexendrosme" CHANGELOG.md` → 0 resultados

### 2. CI: unificar actions a v4 + node-version-file + concurrency + cancel-in-progress

- **Archivo:** `.github/workflows/ci.yml`
- **Cambios:**
  - `actions/checkout@v7` → `actions/checkout@v4`
  - `actions/setup-node@v6` → `actions/setup-node@v4` con `node-version-file: '.nvmrc'`
  - `actions/upload-artifact@v7` → `actions/upload-artifact@v4`
  - Añadir bloque `concurrency:` global: `group: ci-${{ github.ref }}`, `cancel-in-progress: true`
  - Añadir `workflow_dispatch:` con `inputs.runner` (choice: `ubuntu-latest`, `self-hosted`)
  - Añadir job `runner-health` (condicional a `workflow_dispatch` + `inputs.runner == 'self-hosted'`) — copiar de `website-alexendrosdev/.github/workflows/ci.yml` líneas 26-60
  - Añadir job `smoke` (schedule `*/30 * * * *`, `runs-on: self-hosted`, timeout 2min, step `echo ok`) — copiar de referencia líneas 62-68
  - Jobs `build`, `e2e`, `lhci`: `runs-on` dinámico `${{ (github.event_name == 'workflow_dispatch' && inputs.runner) || 'self-hosted' }}` (o `ubuntu-latest` para PRs)
  - Unificar `node-version: 24` → quitar, usar `node-version-file: '.nvmrc'` en setup-node
- **Verificación:** `yamllint .github/workflows/ci.yml` + dry-run mental del YAML

### 3. package.json: alinear engines.node con .nvmrc (22)

- **Archivo:** `package.json` línea 61
- **Cambio:** `"node": ">=24"` → `"node": ">=22"` (o `"node": "22.x"` para exacto)
- **Verificación:** `cat .nvmrc` (22) == `jq -r '.engines.node' package.json` (22.x)

### 4. Error pages (404 + 500) — **YA EXISTEN** ✓

- `app/not-found.tsx` (404) — existe, válido
- `app/error.tsx` (500) — existe, válido
- **Acción:** Ninguna. Marcar como completada.

---

## Mejoras valorables (ROADMAP v0.3.0 → futuro) — tareas separadas

### 5. Banner anti-monetización visible

- **Alcance:** Componente nuevo `components/anti-monetization-banner.tsx` + integración en `app/layout.tsx` (arriba de `<main>`) o `app/page.tsx` (hero)
- **Contenido:** "Este espacio es libre de dinero. Sin anuncios, sin afiliados, sin tracking. Lo comercial vive en [alexendros.dev](https://alexendros.dev)."
- **Estilo:** Tokens `--ax-*` (ver `DESIGN.md`), responsive, dismissible (localStorage)
- **Tests:** E2E Playwright — visibilidad, dismiss, persistencia

### 6. Tags Git firmados + GitHub Releases

- **CI:** Añadir job `release` (manual `workflow_dispatch`) que:
  - `git tag -s vX.Y.Z -m "Release vX.Y.Z"` (requiere `GITHUB_TOKEN` con `contents: write` + GPG key configurada en runner)
  - `gh release create vX.Y.Z --generate-notes`
  - Publicar artifacts de build (`out/`) como release assets
- **Doc:** Añadir `RELEASE.md` o sección en `CONTRIBUTING.md`

### 7. Modo oscuro (tokens `--ax-*` ya preparados en `DESIGN.md`)

- **Alcance:**
  - `app/styles/tokens.css`: asegurar pares `--ax-color-bg` / `--ax-color-fg` para `light` y `dark` (media query `prefers-color-scheme`)
  - `components/ui/*`: migrar `className="dark"` hardcodeado → tokens CSS
  - `app/layout.tsx`: eliminar `className="dark"` en `<html>`, dejar que CSS decida
  - Toggle opcional en nav/footer (localStorage + `data-theme` en `<html>`)
- **Tests:** Visual regression (Playwright + pixelmatch) light/dark en 3 viewports

### 8. Link a alexendros.dev en footer/nav

- **Archivos:** `components/footer.tsx` + `components/nav.tsx`
- **Cambio:** Añadir enlace "Hub de productos → alexendros.dev" (footer) y/o item nav "Productos" → `https://alexendros.dev`
- **Estilo:** Coherente con design system, `rel="noopener noreferrer"`

---

## Plan de ejecución sugerido (orden)

1. **Limpieza de ramas** (10 min)
   - `git checkout main && git pull`
   - `git branch -D ci/self-hosted-runners feat/design-system-v1` (tras confirmar sin commits únicos)
   - `git log fix/vercel-npm..main --oneline` → decidir cherry-pick o delete

2. **Crear rama de trabajo**
   - `git checkout -b feat/improvements-v0.4.0`

3. **Tareas 1-3** (CI + CHANGELOG + engines) — **bloque crítico, ~30 min**
   - Commit atómico por tarea

4. **Tarea 4** — verificar y marcar done (0 min)

5. **Tareas 5-8** — una por commit/PR separada (scope mayor, requieren diseño/review)

---

## Verificación final (Definition of Done)

```bash
# En rama feat/improvements-v0.4.0
pnpm install          # o npm ci
pnpm typecheck        # 0 errores
pnpm lint             # 0 warnings
pnpm build            # out/ generado OK
pnpm test             # 38 passed
pnpm test:e2e         # Playwright green
```

**CI:** Workflow dispatch manual en `infra-01` (self-hosted) + PR a `main` → verde completo.

---

## Referencias

- CI plantilla: `~/projects/website-alexendrosdev/.github/workflows/ci.yml`
- Design tokens: `~/projects/website-alexendrosme/DESIGN.md` (sección `--ax-*` dark mode)
- CHANGELOG format: Keep a Changelog 1.1.0 + SemVer 2.0.0
- Repo canónico: `https://github.com/Iniciativas-Alexendros/website-alexendrosme`
