<!-- canon-managed: true -->

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

- [ ] **CI build passes** — `npm run build` sin errores.
- [ ] **Tests unitarios** — `npm run test` (vitest) pasa.
- [ ] **TypeScript** — `npm run typecheck` (`tsc --noEmit`) sin errores.
- [ ] **Lint** — `npm run lint` (eslint) sin errores.
- [ ] **E2E tests** — `npm run test:e2e` (Playwright) pasa.
- [ ] **Lighthouse scores ≥ threshold** — rendimiento ≥85, accesibilidad ≥95, buenas prácticas ≥90, SEO ≥90.
- [ ] **Format** — `npm run format:check` (prettier) sin diferencias.
- [ ] **Configuración Vercel** — `npm run verify:vercel` pasa (vercel.json sincronizado con dashboard).
- [ ] Tests nuevos o actualizados cuando aplica.
- [ ] Documentación pertinente actualizada (README, ARCHITECTURE, ADR, CHANGELOG).
- [ ] Sin secretos/credenciales en el código.
- [ ] Sigue [Código de Conducta](../CODE_OF_CONDUCT.md) y guía de [contribución](../CONTRIBUTING.md).

## Notas para revisión

<!-- consideraciones especiales para quien revise -->
