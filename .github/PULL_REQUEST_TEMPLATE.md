<!-- canon-managed: true -->

### Propósito de este documento

- **Objetivos:** Plantilla de PR para describir el cambio y exigir las
  comprobaciones de calidad, tests y jobs `quality` / `test` / `build` /
  `smoke`.
- **Estructura:** Qué cambia → por qué → cómo probar → checklist.
- **Contenido a integrar según contexto:** Adapta el checklist a los
  scripts de este sitio. No copies plantillas de CLI/SaaS.

## Qué

Resume en una o dos frases qué cambia este pull request.

## Por qué

Explica el motivo. Si cierra un issue, indica `Cierra #N`.

## Cómo probar

Pasos verificables para revisar manualmente:

1.
2.
3.

## Capturas (si afecta a UI)

<!-- pega capturas o gifs antes / después -->

## Lista de comprobación

- [ ] `npm run typecheck && npm run lint && npm run format:check`
- [ ] `npm run test -- --coverage`
- [ ] `npm run build && npm run smoke`
- [ ] CI `quality` / `test` / `build` / `smoke` en verde
- [ ] E2E / Lighthouse / a11y / perf cuando el cambio los toca
- [ ] Documentación pertinente actualizada (README, ARCHITECTURE, ADR)
- [ ] Sin secretos/credenciales en el código
- [ ] Sigue [Código de Conducta](../CODE_OF_CONDUCT.md) y
      [contribución](../CONTRIBUTING.md)

## Notas para revisión

<!-- consideraciones especiales para quien revise -->
