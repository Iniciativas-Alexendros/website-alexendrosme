# CLAUDE.md — alexendros-me (standalone)

Landing profesional de marca personal en **alexendros.me**. Repositorio público con vocación promocional: quien llegue aquí debe ver el criterio detrás del código, no solo el código.

---

## 1. PROYECTO

```yaml
name: alexendros-me
type: personal-brand landing (static export)
owner: Alejandro Domingo Agusti
domain: alexendros.me
repo: standalone (separado de alexendros-monorepo el 2026-04-11)
origin_commit: a180d73 (chore: post-audit fixes)
package_manager: pnpm@10+
```

## 2. CONTEXTO

- **Sitio estatico puro** (`output: 'export'` en `next.config.ts`) — SIN backend, sin API routes, sin middleware, sin auth, sin base de datos.
- **Proposito**: campo de pruebas de branding/UI. Valida la identidad visual antes de aplicarla a `alexendros.pro`.
- **Redirige a**: `alexendros.pro` para productos, servicios y dashboards.
- **Fase 3 completa + UX polish** (PRs #21/#22/#23 en 2026-04-14). **En producción en `alexendros.me`** (apex y www vía Vercel).

## 3. STACK

| Capa      | Tecnologia                                                                          |
| --------- | ----------------------------------------------------------------------------------- |
| Framework | Next.js 15 App Router · TypeScript strict                                           |
| UI        | Tailwind CSS v4 CSS-first · shadcn/ui (inline en `components/ui/`)                  |
| Tokens    | oklch dark-first (inline en `app/globals.css`)                                      |
| Fonts     | Geist Sans + Mono (locales en `public/fonts/`)                                      |
| Headers   | Security headers via `vercel.json` (CSP strict, HSTS preload, X-Frame-Options DENY) |
| Build     | `next build` con static export a `out/`                                             |
| Deploy    | Vercel (region mad1) — pendiente                                                    |
| Calidad   | ESLint flat + Prettier 3 + depcheck + ts-prune · TS `noUncheckedIndexedAccess`      |
| Pair dev  | [Claude Code](https://claude.com/claude-code) — asistente CLI / VS Code del autor   |

## 4. REGLAS ABSOLUTAS

### Codigo

- TypeScript `strict: true`. **Prohibido `any`.**
- Server Components por defecto. `"use client"` solo para interactividad browser.
- **NO** API routes, **NO** middleware, **NO** backend de ningun tipo.
- Commits: nunca a `main` directo. Feature branch + PR.
- Repo publico: **nunca** introducir secrets, tokens, `.env*` ni rutas a sistemas internos. El unico dato personal presente es el NIF en `/legal/aviso-legal` (exigido por LSSI-CE Art. 10) y el email publico `contacto@alexendros.me`.

### Seguridad (riesgos aceptados)

- CSP en `vercel.json` usa `'unsafe-inline'` para `script-src` y `style-src`. Motivo: Next.js requiere inline scripts para hydration y JSON-LD (`dangerouslySetInnerHTML` en `layout.tsx`), y Tailwind CSS v4 genera estilos inline. Riesgo mitigado por la ausencia de input de usuario y backend.

### UI

- Componentes shadcn viven en `components/ui/` (inline — antes `@repo/ui`).
- Helper `cn()` en `lib/utils.ts`.
- Iconos: `lucide-react` unicamente.
- Dark-first por defecto (`className="dark"` en `<html>`).
- Colores SOLO via CSS vars definidas en `app/globals.css`. No hardcodear oklch en componentes.

### SEO & Rendimiento

- JSON-LD Person + WebSite en `lib/structured-data.ts` consumido desde `app/layout.tsx`.
- Sitemap estatico en `public/sitemap.xml`, robots en `public/robots.txt`.
- OG image en `public/og/opengraph-image.png`.
- **CWV targets (obligatorios)**: LCP < 2.0s desktop / < 2.5s mobile · INP < 200ms · CLS < 0.1 · Lighthouse > 90.
- Test de 5 segundos: quien es, que construye, para quien — visible sin scroll.

### Legal

- RGPD EU 2016/679, LOPDGDD LO 3/2018, LSSI-CE Art. 10, AEPD Guia Cookies 2023.
- Paginas legales reales en `app/legal/` (aviso-legal, privacidad, cookies).
- **NO activar analytics** (PostHog, GA, etc.) sin consentimiento previo — ahora mismo la app no lleva tracking.

### Tono y comunicacion (repo publico)

- README y docs publicas: tono promocional pero honesto. Mostrar decisiones, no vender. Evitar jerga vacia.
- Al redactar copy en componentes o paginas, optimizar el **test de 5 segundos**: quien es, que construye, para quien.
- No mencionar clientes, proyectos privados ni nombres internos del ecosistema `alexendros.pro` en archivos versionados.

## 5. ESTRUCTURA

```
alexendros-me/
|-- app/
|   |-- globals.css              (importa app/styles/*.css)
|   |-- styles/                  (tokens, base, typography, components, utilities, motion, breakpoints, print)
|   |-- layout.tsx               (metadata, fonts, JSON-LD, nav, footer)
|   |-- page.tsx                 (ONE-PAGER: hero + biografia + misiones + stack + experiencias)
|   |-- error.tsx                (error boundary raiz)
|   |-- not-found.tsx            (404)
|   |-- icon.svg / apple-icon.tsx (favicons)
|   `-- legal/
|       |-- layout.tsx
|       |-- aviso-legal/page.tsx (LSSI-CE Art. 10)
|       |-- privacidad/page.tsx  (RGPD Art. 13)
|       `-- cookies/page.tsx     (AEPD 2023)
|-- components/
|   |-- nav.tsx                  (Sheet mobile + desktop links)
|   |-- footer.tsx
|   |-- atmosphere.tsx · particle-bg.tsx · stack-marquee.tsx (FX/visual)
|   |-- contact-fab.tsx              (FAB flotante de contacto)
|   `-- ui/                      (shadcn inline — 6: badge, button, card, popover, separator, sheet)
|-- lib/
|   |-- utils.ts                 (cn helper)
|   |-- site.ts                  (siteConfig global)
|   `-- structured-data.ts       (JSON-LD factories)
|-- public/
|   |-- fonts/                   (Geist VF + Mono VF woff2)
|   |-- og/                      (opengraph-image.png)
|   |-- robots.txt
|   `-- sitemap.xml
|-- docs/
|   `-- history/
|       `-- phase-03-alexendros-me/  (historial de Fase 3 heredado)
|-- .gitignore
|-- CLAUDE.md
|-- README.md
|-- components.json              (shadcn config — aliases locales)
|-- eslint.config.mjs
|-- next.config.ts               (output: 'export')
|-- next-env.d.ts
|-- package.json
|-- postcss.config.mjs
|-- tsconfig.json
`-- vercel.json                  (security headers)
```

## 6. COMANDOS

```bash
pnpm install
pnpm dev          # next dev --turbopack en http://localhost:3000
pnpm build        # genera out/ (static export)
pnpm typecheck
pnpm lint
```

## 7. LO QUE NO DEBES HACER

```
[x] Reintroducir dependencias de @repo/* — esta app es standalone
[x] Anadir rutas API, middleware o cualquier backend
[x] Activar analytics sin consentimiento del usuario
[x] Hardcodear colores fuera de app/styles/tokens.css
[x] Ignorar errores TypeScript con @ts-ignore o as any
[x] Commits directos a main
[x] Anadir formularios que envien datos a un servidor (usar mailto/Calendly)
[x] Comitear `.env*`, `.claude/settings.local.json`, tokens o API keys — repo es publico
[x] Referenciar proyectos/clientes privados o paths internos del ecosistema `alexendros.pro`
```

## 8. ESTADO

- **Fase 3 cerrada** (3/3 planes completados, ver `docs/CHANGELOG.md`).
- **En producción** en `alexendros.me` (apex + www vía Vercel, preview por PR activo).
- **Reconversión en curso**: el `.me` deja de ser landing comercial y pasa a
  espacio personal **libre de dinero** (ideológico/filosófico/nacional/social).
  Plan estructural en `docs/reconversion-me.md`. Toda venta, afiliación y
  vocabulario "pro" se purga; lo comercial vive en `alexendros.pro`.
- **Pendientes vivos**: ver `TASKS.md`.

## 9. INTEGRACION CON EL RESTO DEL ECOSISTEMA ALEXENDROS

Esta app es independiente pero coordinada:

- **`alexendros-pro`** (`~/Apps/alexendros-pro/`) — hub SaaS multi-kit. Esta landing redirige alli para productos y dashboards.
- **`~/.claude/PROYECTOS.md`** — registro global con el estado de todas las apps. Actualizar cuando haya hitos.

Ver tambien el index de proyectos en `~/.claude/PROYECTOS.md` y las alertas cruzadas en `~/.claude/projects/-var-home-soyalexendros/memory/cross-app-alerts.md`.
