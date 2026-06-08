# TASKS — alexendros-me

Lista viva de pendientes del repositorio standalone `alexendros-me`.

---

## 1. Infraestructura git ✅ (2026-04-12)

- [x] Repo creado: `github.com/Alexendros/PersonaWeb`.
- [x] `main` pusheado, PR de audit mergeado.
- [ ] Proteger `main` en GitHub (require PR + 1 review).

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
- [ ] **A11y color-contrast** (Lighthouse 2026-04-13): un audit `color-contrast` falla en mobile/desktop. Identificar par color/fondo (probable `text-muted-foreground` sobre `bg-background`) y subir contraste ≥ 4.5:1.
- [x] **SEO**: `curl https://alexendros.me/sitemap.xml` y `/robots.txt` → HTTP/2 200 (2026-04-12).
- [x] **Smoke test** (2026-04-13): 11 rutas → todas 200 (`/`, `/about`, `/projects`, `/herramientas`, `/uses`, `/contact`, 3× `/legal/*`, `/robots.txt`, `/sitemap.xml`).
- [x] **JSON-LD**: Person + WebSite servidos en la home, schema válido (2026-04-12). Pendiente validar vía https://validator.schema.org UI.
- [ ] **OG image**: previsualizar en https://metatags.io.
- [ ] Enviar sitemap a Google Search Console + IndexNow.

## 5. Futuras mejoras (no bloqueantes)

- [ ] Rotar `/projects` con los últimos casos reales (lexactu, afiladocs, argus).
- [ ] Actualizar `sameAs` del JSON-LD Person si cambian handles sociales.
- [ ] Analytics privacy-first (Plausible EU / Umami) con consentimiento explícito.
- [ ] Link real al hub `alexendros.pro` cuando esté deployado.
- [ ] Preload de fuentes Geist (`<link rel="preload">`) para mejorar TTFB percibido.
- [ ] Microanimaciones en hero con `tw-animate-css` (ya instalado).
- [ ] Calendly embed en `/contact` (iframe, compatible con static export).

## 6. Higiene del repo ✅ (2026-04-12)

- [x] GitHub Actions CI: typecheck + lint + build en PRs y push a main (`.github/workflows/ci.yml`).
- [x] `.github/pull_request_template.md`.
- [x] Dependabot npm (weekly, grouped minor/patch) + github-actions (monthly).

## 7. Audit 2026-04-12 (completado)

- [x] Auditoría de estructura canónica Next.js 15 + shadcn.
- [x] Análisis estático: imports no usados (0), componentes UI huérfanos (0), CSS vars muertas (0).
- [x] `docs/history/` sintetizado en `docs/CHANGELOG.md` y eliminado.
- [x] `CLAUDE.md` y `README.md` actualizados (referencias a `docs/history/` → `docs/CHANGELOG.md`).
- [x] `app/error.tsx` creado (error boundary raíz).
- [x] `app/page.tsx` con `metadata` explícita.
- [x] Build verde: typecheck 0 errores, lint 0 warnings, `pnpm build` 11 páginas estáticas.

---

## 8. Reconversión `.me` → espacio libre de dinero (2026-06-07)

> Cambio de rumbo: el `.me` deja de ser landing comercial y pasa a contenido
> personal **antidinero** (ideológico/filosófico/nacional/social). Plan completo
> en `docs/reconversion-me.md`.

**Aviso de estado real** — la estructura actual es un **one-pager**
(`app/page.tsx`) + `app/legal/*`. Las rutas `/about`, `/projects`, `/uses`,
`/contact`, `/herramientas` mencionadas en §4 y §5 **no existen** en el árbol
actual; esos items quedan **obsoletos** y se sustituyen por el plan de
reconversión.

- [x] Plan estructural redactado (`docs/reconversion-me.md`).
- [x] Documentación saneada (CLAUDE.md §5/§8, esta nota).
- [x] Decisiones del autor (§6): afiliados fuera, licencia = sello anticomercial "CE trencada", `knowsAbout` reorientado a soberanía digital + filosofía política.
- [x] Purga de venta/afiliados (Proton, Hostinger, referral Claude): `ReferralsFab`, sección "Aliados con programa de referidos", disclosure del footer y array `referrals` eliminados.
- [ ] Departamento de contenido `/ideas` (MDX) + `content/ideas/`.
- [x] Reorientar `lib/site.ts` y `lib/structured-data.ts` (sin vocabulario pro; la tech se mantiene como materia de crítica).
- [ ] Pieza divulgativa de cookies (capa manifiesto + capa formal).

---

_Última actualización: 2026-06-08 (Fase 2: purga de venta/afiliados ejecutada; footer con sello anticomercial)._
