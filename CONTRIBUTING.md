# Cómo contribuir a website-alexendrosme

### Propósito de este documento

- **Objetivos:** Explicar setup, flujo de rama/PR y reglas locales para
  contribuir sin romper el export estático, las colecciones ni el design
  system.
- **Estructura:** Idioma → setup → flujo de trabajo → comprobaciones antes
  del PR → reglas (ADRs, coverage, artefactos, seguridad).
- **Contenido a integrar según contexto:** Adapta scripts npm, hooks husky y
  umbrales de este repo. No copies un flujo pnpm/monorepo ni el de una CLI.
  No muevas contenido editorial a alexendros.dev desde aquí.

Idioma: este fichero en español, `README.md` y `docs/guides|runbooks` en
español. No re-traducir sin motivo.

Lee también [AGENTS.md](AGENTS.md), [ARCHITECTURE.md](ARCHITECTURE.md) y
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Setup

Usamos las siguientes herramientas:

- Node.js **22** (`.nvmrc` / `engines`) y `npm` como gestor de paquetes.
- Conventional Commits para los mensajes (`feat:`, `fix:`, `chore:`,
  `docs:`, `refactor:`, `test:`, `build:`, `ci:`).

```bash
nvm use && npm ci
npm run test
```

## Flujo de trabajo

- `main` está protegida. No aceptamos pushes directos.
- Las ramas siguen el patrón `<tipo>/<scope>-<slug-corto>`. Tipos válidos:
  `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`.
- Cada PR se mergea con squash. El mensaje del squash respeta Conventional
  Commits y referencia el issue cerrado mediante `Cierra #N` cuando aplique.
- El hook `husky` corre `lint-staged` (prettier + eslint) en pre-commit.

## Antes de un PR

```bash
npm run typecheck && npm run lint && npm run format:check
npm run test -- --coverage
npm run build && npm run smoke
npm run test:e2e
```

Abre el PR con la plantilla (Qué, Por qué, Cómo probar y la lista de
comprobación). El CI debe quedar verde: jobs `quality`, `test`, `build` y
`smoke`. Pide revisión a `@Alexendros` (`.github/CODEOWNERS`).

## Reglas

- Si tu aportación afecta a la arquitectura o a una decisión transversal,
  documenta la decisión en [`docs/architecture/decisions/`](docs/architecture/decisions/)
  siguiendo MADR 4.0.0.
- Coverage: Vitest exige ≥ 63 % lines, ≥ 62 % statements, ≥ 60 % functions
  y ≥ 49 % branches (baseline del producto). El mínimo de flota es ≥ 70 %;
  no bajes el gate. Documentado en
  [`docs/guides/calidad.md`](docs/guides/calidad.md).
- No commitear `out/`, `.next/`, `coverage/`, `test-results/` ni secretos.
- Vulnerabilidades: [SECURITY.md](SECURITY.md), no un issue público.

## Contacto

Para dudas sobre el proceso de contribución escribe a contacto@alexendros.me.
