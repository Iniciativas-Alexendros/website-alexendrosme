# AGENTS.md

### Propósito de este documento

- **Objetivos:** Fijar el contrato operativo para agentes de código y el rol
  Mantenedor: fuentes de verdad, autonomía, comandos y Definition of Done.
- **Estructura:** Destinatarios → fuentes de verdad → unidad de trabajo →
  autonomía → stack y comandos → convenciones → layout → Definition of Done.
- **Contenido a integrar según contexto:** Adapta layout, scripts npm y umbrales
  de cobertura de este sitio. No copies un `AGENTS.md` de CLI/SaaS ni muevas
  stack/devops a este repo (viven en alexendros.dev). No reescribas rutas de
  contenido ni el export estático sin ADR.

**Destinatarios:** agentes de código y el rol Mantenedor que trabajen en este
repositorio.  
**Propósito:** contrato operativo. Homogeneizamos **nombres y contratos**, no
el lenguaje ni la UI del producto.

## Fuentes de verdad (orden)

1. [README.md](./README.md) — qué es el sitio y cómo arrancarlo
2. Este archivo
3. [ARCHITECTURE.md](./ARCHITECTURE.md)
4. [docs/architecture/decisions/](./docs/architecture/decisions/) — ADRs; el
   stub [`DECISIONS.md`](./DECISIONS.md) apunta aquí
5. [CONTRIBUTING.md](./CONTRIBUTING.md)
6. [SECURITY.md](./SECURITY.md)
7. [DESIGN.md](./DESIGN.md) / [STYLEGUIDE.md](./STYLEGUIDE.md) — tokens `--ax-*`

No reinventes requisitos. Si falta ancla, paras y preguntas.

## Hechos de producto

- Sitio personal estático: Next.js 16 (App Router), Tailwind v4, TypeScript
  strict, `output: "export"`, deploy en Vercel.
- Colecciones activas: `proyectos` y `opinion` (sustituyen `ideas` y
  `acciones`). Cambios de ruta **sin** redirecciones de las URLs antiguas.
- Contenido en voz humana y simplificado. Stack, devops y producto comercial
  viven en [alexendros.dev](https://alexendros.dev); aquí solo enlaces en
  banner, nav y footer.
- Espacio libre de monetización (anti-anuncios / anti-afiliados).
- Design system dark-first con tokens `--ax-*` y oklch.

## Unidad de trabajo

```
Objetivo: <resultado verificable>
Traza: <ADR / issue / ruta>
Alcance: <archivos>
Exclusiones: <qué no harás>
Pruebas: npm test / npm run test:e2e / npm run smoke
Criterio de cierre: CI quality + test + build + smoke verdes
```

Una sesión = una unidad cohesiva. PR pequeño. Mensajes al humano y commits en
español (Conventional Commits). Al abrir PRs desde el flujo de commit,
crearlos como **draft**.

## Autonomía

**Puedes sin preguntar**

- Tests que fijan comportamiento ya aceptado
- Corregir lint/format/typecheck causados por tu cambio
- Docs de guía/runbook en español
- Refactors locales que no cambien rutas públicas ni el copy editorial

**Requiere confirmación**

- Cambiar colecciones, slugs o el contrato de export estático → ADR previo
- Dependencia runtime nueva
- Tocar `release.yml`, Lighthouse budgets o branch protection
- Introducir monetización, afiliados o formularios con input de usuario

## Stack y comandos

- Node ≥ 22 (`.nvmrc`), npm, TypeScript strict, Next.js 16, Tailwind v4
- Coverage Vitest (líneas/statements/functions/branches): 63 / 62 / 60 / 49 —
  baseline del producto; mínimo de flota documentado ≥ 70 % (no bajar el gate)

```bash
nvm use && npm ci
npm run typecheck && npm run lint && npm run format:check
npm run test -- --coverage
npm run build && npm run smoke
npm run test:e2e
```

CI principal (`.github/workflows/ci.yml`): jobs `quality`, `test`, `build`,
`smoke`. Los jobs de producto `e2e`, `lhci`, `a11y`, `perf` y `deploy` quedan
en el mismo workflow y no se renombran (branch protection).

## Convenciones

- Ramas `feat/` `fix/` `docs/` `chore/` (los agentes Cloud usan `cursor/…`)
- Hook husky: lint-staged (prettier + eslint) en pre-commit
- Idioma: README/CONTRIBUTING/docs de guía en español
- No commitees `out/`, `.next/`, `coverage/`, `test-results/` ni secretos

## Layout

```
app/            App Router (rutas + layouts + estilos)
components/     UI (shadcn/ui + Radix + Lucide)
content/        MDX: proyectos/ y opinion/
lib/            loader, i18n, seo, feed, theme
public/         sitemaps, feeds, search-index, og/
docs/           architecture/, guides/, runbooks/
```

## Definition of Done

- Criterios de la traza cumplidos
- Jobs `quality`, `test`, `build` y `smoke` verdes
- Docs canónicos actualizados si cambia el contrato
- Sin secretos en el diff
