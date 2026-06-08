# Changelog

Todos los cambios destacables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog 1.1.0](https://keepachangelog.com/es/1.1.0/),
y este proyecto se adhiere a [SemVer 2.0.0](https://semver.org/lang/es/).

## [Sin publicar]

### Eliminado

- **Monetización del `.me`** (reconversión a espacio libre de dinero): componente `ReferralsFab` (`components/referrals-fab.tsx`), sección "Aliados con programa de referidos" en `app/page.tsx`, disclosure de afiliados en el footer, array `siteConfig.referrals` y estilos `.referral-item*`. Enlaces de afiliado (Proton, Hostinger, referral de Claude) retirados.
- Tabla comparativa de venta "Alexendros vs Dev genérico" en `app/page.tsx`.

### Cambiado

- `components/footer.tsx`: "Todos los derechos reservados" sustituido por sello anticomercial (CE trencada) + lema "¿De qué sirve el dinero a quien no sabe usarlo? Ya lo tengo yo.".
- `app/page.tsx`: reclamos de venta ("cobro en mi SaaS", "disponibilidad para consultoría") reescritos sin vocabulario comercial; SaaS/Stripe se mantienen como materia técnica.
- `lib/site.ts` y `lib/structured-data.ts`: `title`/`description`/`knowsAbout` reorientados a identidad personal (soberanía digital, filosofía política); lo comercial apunta a `alexendros.pro`.
- Tests E2E actualizados: retirados los asertos del FAB "Mis aliados" y de los enlaces de afiliado.

## [0.3.0] — 2026-05-09 · SPA landing v2

### Añadido

- **SPA one-page**: tres secciones ancla (`#biografia`, `#misiones`, `#experiencias`) con smooth scroll, `scroll-margin-top` e IntersectionObserver para active nav state.
- **Atmósfera Vergina Imperial v0.2.2**: cuatro capas CSS (`haze`, `spark`, `dust`, `vignette`) con animación `atm-drift`, respeta `prefers-reduced-motion`.
- **FAB Convócame**: mailto + Telegram (en preparación) + Matrix (próximamente). Popover Radix, foco-trap nativo, Escape devuelve foco al trigger.
- **FAB Mis aliados**: Claude AI + Proton + Playlist (TBD). Popover Radix con `rel="sponsored nofollow"`.
- **Redirects 308** en `vercel.json` para las 6 rutas legacy (`/autobiografia→/#biografia`, `/proyectos→/#misiones`, `/experiencia→/#experiencias`, `/contacto→/`, `/bitacora→/`, `/uses→/#experiencias`).
- **Legales pedagógicas** (4-bloques: esencial / detalle / derechos / texto formal): aviso-legal, privacidad, cookies. Sin botones de aceptación (no hay cookies de terceros).
- **Tests E2E Playwright** (46 passed, 0 failed): smoke, skip-link, FABs, anchors, responsive, axe-core WCAG 2.1 AA sobre 4 rutas × 3 viewports.
- **CI job `e2e`** en GitHub Actions (pnpm install → playwright install → test, artefacto de fallo).
- `components/ui/popover.tsx`: Popover Radix shadcn-style sobre `radix-ui`.
- `lib/contact.ts`: `buildMailto()` + tipos de estado de contacto.

### Cambiado

- `components/nav.tsx`: eliminadas rutas `/bitacora`, `/uses`, `/contacto`, `/proyectos`, `/autobiografia`, `/experiencia`. Nav reducido a 3 anchors. Logo hace `scrollTo(top:0, smooth)`.
- `lib/site.ts`: `siteConfig.nav` reducido; añadidos `siteConfig.contact` y `siteConfig.referrals`.
- `components/footer.tsx`: enlace de afiliados apunta a `#experiencias` (anchor SPA); eliminado enlace muerto `/experiencia#recomendaciones`.
- `app/layout.tsx`: integra `<Atmosphere />` y `pb-28 md:pb-0` en `<main>` para el FAB.
- `vercel.json`: añadidos 6 redirects permanentes.
- `app/styles/components.css`: añadidos `.mission-card`, `.referral-item`, `.atm*`, `.fab-stack`, `.fab-btn`, `.fab-item*`, `.fab-divider`, `.fab-section-label`.
- `app/styles/motion.css`: añadido `@keyframes atm-drift` + override `prefers-reduced-motion` para `.atm*`.

### Eliminado

- Rutas `/autobiografia`, `/bitacora`, `/contacto`, `/experiencia`, `/proyectos`, `/uses` (seis carpetas `app/<ruta>/`).
- `app/uses/redirect-client.tsx` (client component huérfano).

### Documentación

- `docs/auditoria-tecnica-2026-04-14.md`: renombrado desde `AUDITORÍA TÉCNICA alexendros.md` + nota de snapshot histórico superseded.
- `docs/AUDIT-REPORT.md`: ya existente en main.

### Eliminado

- (pendiente)

### Corregido

- (pendiente)

### Seguridad

- (pendiente)

## [0.1.0] — 2026-MM-DD

### Añadido

- Versión inicial del repositorio con canon de documentación aplicado.

[Sin publicar]: https://github.com/Alexendros/mi-website-personal/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Alexendros/mi-website-personal/releases/tag/v0.1.0
