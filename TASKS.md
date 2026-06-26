# TASKS — alexendros-me

Lista viva de pendientes del repositorio standalone `alexendros-me`.

---

## 1. Infraestructura git ✅ (2026-04-12)

- [x] Repo creado: `github.com/Alexendros/PersonaWeb`.
- [x] `main` pusheado, PR de audit mergeado.
- [x] Proteger `main` en GitHub (require PR + 1 review, status checks build/e2e/lhci, enforce admins).

## 2. Deploy Vercel ✅ (2026-04-12)

- [x] Proyecto `PersonaWeb` importado (team `alexendros`).
- [x] Next.js preset, `pnpm build`, **Output Directory vacío** (Vercel detecta `output: "export"`).
- [x] Sin variables de entorno.
- [x] Build verde, 11 páginas, first deploy OK.

## 3. DNS alexendros.me ✅ (2026-04-12)

- [x] Dominio custom añadido en Vercel (apex primary, www 308 → apex).
- [x] DNS Hostinger:
  - `@` A → `216.198.79.1`
  - `www` CNAME → `40de9f12f17c018a.vercel-dns-017.com.`
- [x] SSL automático activo, HSTS preload live.
- [x] Validado: HTTP/2 200, CSP + HSTS + X-Frame-Options DENY + Permissions-Policy + Referrer-Policy.
- [x] `/sitemap.xml` y `/robots.txt` sirviendo 200.

## 4. Post-deploy — validaciones

- [x] **Lighthouse audit** (2026-04-13, commit 0beaa9b):
  - Desktop: Perf 99 · A11y 96 · BP 100 · SEO 100 (LCP 0.6s, CLS 0.017, TBT 0)
  - Mobile: Perf 99 · A11y 96 · BP 100 · SEO 100 (LCP 1.8s, CLS 0, TBT 90ms)
- [x] **A11y color-contrast** (verificado 2026-06-13): `pnpm test:e2e a11y` → 12/12 sin violaciones axe WCAG 2.1 AA en las 4 rutas. El fallo de 2026-04-13 ya no reproduce (resuelto o falso positivo de Lighthouse). No requiere cambio.
- [x] **SEO**: `curl https://alexendros.me/sitemap.xml` y `/robots.txt` → HTTP/2 200 (2026-04-12).
- [x] **Smoke test** (2026-06-25): 14 rutas → todas 200 (home, 6× `/espensar`/`/esposible`, 3× `/legal/*`, `/robots.txt`, `/sitemap.xml`).
- [x] **JSON-LD**: Person + WebSite servidos en la home, schema válido (2026-04-12). Pendiente validar vía https://validator.schema.org UI.
- [x] **OG image**: `public/og/opengraph-image.png` (1200×630, 62K, PNG) — configurada en metadata con OpenGraph + Twitter card. Previsualización manual en metatags.io queda como paso opcional pre-deploy.
- [x] IndexNow: key `5046e347-…` generada, key file en `public/{key}.txt`, sitemap enviado a api.indexnow.org (202) y bing.com/indexnow (202). Google Search Console requiere submit manual post-deploy (GSC UI).

## 5. Futuras mejoras (no bloqueantes)

- [x] Preload de fuentes Geist — manejado automáticamente por `next/font/local` (geistSans preload implícito, geistMono con `preload: false` intencional).
- [x] `sameAs` JSON-LD verificado — GitHub, LinkedIn, X/Twitter actuales y correctos.
- [ ] Analytics privacy-first (Plausible EU / Umami) con consentimiento explícito.
- [ ] Link real al hub `alexendros.dev` cuando esté deployado (bloqueado externo).
- [x] Microanimaciones en hero con `tw-animate-css` (2026-06-13): entrada `animate-in fade-in slide-in-from-bottom`, motion-safe.
- [x] **StackMarquee integrado** (2026-06-13): banda "Mi caja de herramientas" entre Misiones y Experiencias (antes huérfano).
- [x] **Subida visual** (2026-06-13, rama feat/visual-craft): shimmer oro en hero, biografía en tarjetas glass, micro-interacciones con `--ease-spring`. Dentro de Vergina Imperial, reduced-motion intacto.

## 6. Higiene del repo ✅ (2026-04-12)

- [x] GitHub Actions CI: typecheck + lint + build en PRs y push a main (`.github/workflows/ci.yml`).
- [x] `.github/pull_request_template.md`.
- [x] Dependabot npm (weekly, grouped minor/patch) + github-actions (monthly).

## 7. Audit 2026-04-12 (completado)

- [x] Auditoría de estructura canónica Next.js 16 + shadcn.
- [x] Análisis estático: imports no usados (0), componentes UI huérfanos (0), CSS vars muertas (0).
- [x] `docs/history/` sintetizado en `docs/CHANGELOG.md` y eliminado.
- [x] `CLAUDE.md` y `README.md` actualizados (referencias a `docs/history/` → `docs/CHANGELOG.md`).
- [x] `app/error.tsx` creado (error boundary raíz).
- [x] `app/page.tsx` con `metadata` explícita.
- [x] Build verde: typecheck 0 errores, lint 0 warnings, `pnpm build` 11 páginas estáticas.

---

## 8. Reconversión `.me` → espacio libre de dinero ✅ (2026-06-25)

> Cambio de rumbo: el `.me` deja de ser landing comercial y pasa a contenido
> personal **antidinero** (ideológico/filosófico/nacional/social). Plan completo
> en `docs/reconversion-me.md`.

- [x] Plan estructural redactado (`docs/reconversion-me.md`).
- [x] Documentación saneada (CLAUDE.md, TASKS.md).
- [x] Decisiones del autor (§6): afiliados fuera, licencia = CC BY-NC-SA 4.0 (sello €Ç anticomercial en el footer), `knowsAbout` reorientado a soberanía digital + filosofía política.
- [x] Purga de venta/afiliados (Proton, Hostinger, referral Claude): `ReferralsFab`, sección "Aliados con programa de referidos", disclosure del footer y array `referrals` eliminados.
- [x] Departamento de contenido `/espensar` + `/esposible` (MDX, reemplazan `/ideas` por ADR §6).
- [x] Reorientar `lib/site.ts` y `lib/structured-data.ts` (sin vocabulario pro; la tech se mantiene como materia de crítica).
- [x] Pieza divulgativa de cookies (capa manifiesto + capa formal) — ver `app/legal/cookies/page.tsx`.

---

_Última actualización: 2026-06-25 — IndexNow key file + API submission completados. Pendiente post-deploy: submit manual a Google Search Console (GSC UI)._
