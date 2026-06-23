---
name: ecosystem-conventions
description: >
  Convenciones del ecosistema Alexendros y guía de desarrollo específica para
  mi-website-personal (alexendros.me). Activar al trabajar en este repo o al
  necesitar contexto sobre convenciones compartidas del ecosistema.
---

# Convenciones Ecosistema Alexendros — alexendros.me

## Repo Profile

- **Tipo**: web-nextjs (static export)
- **Stack**: Next.js 16, React 19, TypeScript strict, Tailwind CSS v4, Vergina Imperial
- **Deploy**: Vercel (region mad1), static export (`output: 'export'`)
- **Gestor**: pnpm (nunca npm ni yarn)

## Comandos esenciales

```bash
pnpm install          # instalar dependencias
pnpm dev              # dev server (turbopack) en localhost:3000
pnpm build            # static export a out/
pnpm lint             # ESLint flat + Prettier
pnpm typecheck        # tsc --noEmit
```

## Pre-PR Checklist

1. `pnpm lint` — sin errores
2. `pnpm typecheck` — sin errores
3. `pnpm build` — genera out/ sin errores
4. Lighthouse >= 90 Perf, >= 95 A11y, >= 90 BP, >= 95 SEO
5. CWV: LCP < 2.0s desktop, INP < 200ms, CLS < 0.1

## Reglas de código

- TypeScript `strict: true`. Prohibido `any`, `@ts-ignore`, `as any`
- Server Components por defecto. `"use client"` solo para interactividad browser
- NO API routes, NO middleware, NO backend de ningún tipo (static export)
- Colores SOLO vía CSS vars oklch en `app/styles/tokens.css`. No hardcodear
- Iconos: `lucide-react` únicamente
- shadcn/ui inline en `components/ui/`, helper `cn()` en `lib/utils.ts`
- Dark-first por defecto (`className="dark"` en `<html>`)
- NO usar `next/image` — no funciona en static export. Usar `<img>` con dimensiones

## Git

- Branch: `devin/<timestamp>-<descripcion>`
- Commits: Conventional Commits (feat|fix|docs|ci|chore|refactor|test|style)
- Nunca push directo a `main`. Siempre feature branch + PR
- Repo PÚBLICO: nunca introducir secrets, tokens, `.env*` ni rutas internas

## Seguridad

- CSP usa `unsafe-inline` (riesgo aceptado y documentado: static export sin inputs)
- NO activar analytics sin consentimiento del usuario
- Páginas legales en `app/legal/` (RGPD, LSSI-CE, AEPD)

## Estructura clave

```
app/styles/tokens.css    → design tokens Vergina Imperial
app/styles/globals.css   → índice de imports CSS
lib/structured-data.ts   → JSON-LD (Person + WebSite)
public/fonts/            → Geist Sans + Mono (woff2 locales)
vercel.json              → security headers (CSP, HSTS, X-Frame)
```

## Anti-patrones

- NO reintroducir deps de `@repo/*` (app es standalone)
- NO añadir formularios que envíen datos a servidor (usar mailto/Calendly)
- NO hardcodear colores fuera de tokens.css
- NO referenciar proyectos/clientes privados (repo público)
