# Guía: calidad y cobertura

### Propósito de este documento

- **Objetivos:** Fijar umbrales de cobertura y el significado de los jobs
  `quality` / `test` / `build` / `smoke`.
- **Estructura:** Gate de cobertura → tabla de jobs del pipeline principal
  (release, Lighthouse y visual quedan aparte).
- **Contenido a integrar según contexto:** Adapta umbrales (este repo
  63/62/60/49; flota ≥ 70 %). No copies gates de otro paquete. No bajes el
  gate por debajo del baseline del producto.

## Gate de cobertura

Vitest (`vitest.config.ts`) exige el baseline medido del producto:

| Métrica    | Umbral en repo | Mínimo de flota |
| ---------- | -------------- | --------------- |
| statements | 62 %           | 70 %            |
| branches   | 49 %           | 70 %            |
| functions  | 60 %           | 70 %            |
| lines      | 63 %           | 70 %            |

`npm test -- --coverage` (job `test`) falla si bajas de esos umbrales. No
bajes el gate. Subir hacia el 70 % de flota es un objetivo, no un recorte
en este PR.

## Jobs del pipeline principal

| Job       | Qué hace                                                                            |
| --------- | ----------------------------------------------------------------------------------- |
| `quality` | format, typecheck, lint, verify (SHAs + vercel), `npm audit` (informativo; no gate) |
| `test`    | Vitest + coverage (Node 22)                                                         |
| `build`   | `next build` (export `out/`); sube artefacto `static-export`                        |
| `smoke`   | sirve el export y comprueba `/`, `/proyectos`, `/opinion`, `/en`                    |

Jobs de producto que **no se renombran** (branch protection): `e2e`,
`lhci`, `a11y`, `perf`, `deploy`.

`release.yml`, `lighthouse-scores.yml` y `visual-regression.yml` siguen
aparte.
