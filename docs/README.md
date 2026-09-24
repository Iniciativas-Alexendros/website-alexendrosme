# Documentación de website-alexendrosme

### Propósito de este documento

- **Objetivos:** Indexar la documentación de producto (ADRs, guías y
  runbooks) y apuntar a los contratos de la raíz.
- **Estructura:** Tabla de rutas `docs/` → enlaces a README, AGENTS,
  ARCHITECTURE, CONTRIBUTING y SECURITY.
- **Contenido a integrar según contexto:** Adapta el índice al árbol de
  este repo. No copies guías de CLI/SaaS. El design system se documenta
  en `DESIGN.md` y `guides/design-system.md`.

| Ruta                                                 | Para qué                       |
| ---------------------------------------------------- | ------------------------------ |
| [architecture/decisions/](./architecture/decisions/) | ADRs (MADR 4.0.0)              |
| [guides/desarrollo.md](./guides/desarrollo.md)       | Arranque local y PR            |
| [guides/calidad.md](./guides/calidad.md)             | Coverage y jobs de CI          |
| [guides/design-system.md](./guides/design-system.md) | Tokens `--ax-*` y STYLEGUIDE   |
| [runbooks/ci-deploy.md](./runbooks/ci-deploy.md)     | Fallos de CI y deploy Vercel   |
| [reconversion-me.md](./reconversion-me.md)           | Plan histórico de reconversión |
| [CHANGELOG.md](./CHANGELOG.md)                       | Síntesis cronológica de hitos  |
| [test-infrastructure.md](./test-infrastructure.md)   | Entorno Vitest                 |

En la raíz: [README.md](../README.md), [AGENTS.md](../AGENTS.md),
[ARCHITECTURE.md](../ARCHITECTURE.md), [CONTRIBUTING.md](../CONTRIBUTING.md),
[SECURITY.md](../SECURITY.md).
