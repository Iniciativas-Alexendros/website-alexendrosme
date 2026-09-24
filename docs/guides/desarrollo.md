# Guía: desarrollo local

### Propósito de este documento

- **Objetivos:** Arrancar el repo en local (npm, no pnpm), servir el sitio
  y saber qué documento actualizar según el tipo de cambio.
- **Estructura:** Requisitos → arranque → comprobaciones antes del PR →
  tabla «dónde documentar».
- **Contenido a integrar según contexto:** Adapta Node, lockfile y scripts
  de este sitio. No copies un setup pnpm/monorepo ni el de una CLI.

## Requisitos

- Node.js ≥ 22 (`nvm use` lee `.nvmrc`)
- npm (el lockfile es `package-lock.json`; no uses pnpm en este repo)

## Arranque

```bash
nvm use
npm ci
npm run dev          # localhost:3000 (Turbopack)
```

El sitio es un export estático. No hay variables de entorno obligatorias.
Vercel Analytics, si aplica, se configura en el dashboard.

## Antes de abrir un PR

```bash
npm run typecheck && npm run lint && npm run format:check
npm run test -- --coverage
npm run build && npm run smoke
npm run test:e2e
```

Hook husky: lint-staged (prettier + eslint) en pre-commit.

## Dónde documentar

| Cambio                             | Documento                                    |
| ---------------------------------- | -------------------------------------------- |
| Ruta, colección o copy de producto | `README.md` + contenido MDX                  |
| Export, Vercel, frontera .dev      | ADR en `docs/architecture/decisions/`        |
| Tokens / atmósfera                 | `DESIGN.md` y `docs/guides/design-system.md` |
| Fallo operativo de CI/deploy       | runbook en `docs/runbooks/`                  |
