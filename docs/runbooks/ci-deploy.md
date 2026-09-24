# Runbook: CI y deploy

### Propósito de este documento

- **Objetivos:** Diagnosticar jobs rojos del pipeline principal y el
  deploy a Vercel sin tocar branch protection ni org settings.
- **Estructura:** Fallos `quality` / `test` / `build` / `smoke` → jobs de
  producto → deploy → Renovate.
- **Contenido a integrar según contexto:** Adapta comandos y secretos de
  este repo (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). No
  copies un pipeline de CLI. No hagas force-push.

## Jobs `quality` / `test` / `build` / `smoke` en rojo

1. Reproduce en local los comandos del [job](../guides/calidad.md).
2. `quality` + format: `npm run format` y vuelve a `format:check`.
3. `quality` + vercel: `npm run verify:vercel`.
4. `test` + coverage: no bajes umbrales; añade tests o reduce código
   muerto.
5. `build`: `npm run build` debe dejar `out/` con HTML.
6. `smoke`: `npm run build && npm run smoke`. Si una ruta canónica no
   es 200, revisa el App Router y el export.

No hagas force-push para “arreglar” CI. No toques org settings ni branch
protection en un PR de plataforma.

## Jobs de producto (`e2e`, `lhci`, `a11y`, `perf`, `deploy`)

- `e2e` / `a11y`: Playwright; artefactos en `test-results/` si fallan.
- `lhci`: budgets en `lighthouserc.cjs`. Token opcional
  `LHCI_GITHUB_APP_TOKEN`.
- `perf`: `scripts/perf-audit.mjs` → `perf-reports/`.
- `deploy`: no-op en PRs (el check debe seguir existiendo). En `main`,
  `vercel deploy --prod` si hay `VERCEL_TOKEN`.

## Renovate

Configuración en `.github/renovate.json` (managers `npm` y
`github-actions`). No hay Dependabot de version-updates. PRs de major van
con label `breaking-change` y sin automerge.
