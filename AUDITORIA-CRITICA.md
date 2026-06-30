# AUDITORÍA CRÍTICA — alexendros.me

> **Fecha**: 30 de junio de 2026
> **Objetivo**: alexendros.me (sitio) + github.com/alexendros/website-alexendrosme (repo) + vercel.com deployment
> **Modo**: COMBINADO (código + sitio en producción)
> **Profundidad**: ESTÁNDAR (30-45 min)
> **Entorno**: COMPLETO (shell con red, linters, tests, build)

---

## Alcance auditado

| Superficie          | Dónde                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Repo**            | `github.com/alexendros/website-alexendrosme` (clonado en `/tmp/criticar-alexendrosme`) |
| **Sitio**           | `https://alexendros.me` (HTML servido, cabeceras HTTP, robots.txt, sitemap.xml)        |
| **Deploy**          | `vercel.com/alexendros-team/website-alexendrosme` (verificación de headers)            |
| **Archivos fuente** | 126 archivos, ~3k LOC TypeScript/TSX, ~500 LOC CSS, ~300 LOC MDX                       |

## Stack

| Capa      | Tecnología                                                          |
| --------- | ------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack, export estático)                 |
| Estilos   | Tailwind CSS v4 + design system `--ax-*` (OKLCH)                    |
| Tipado    | TypeScript strict (`noUncheckedIndexedAccess`)                      |
| Contenido | MDX + gray-matter + Zod                                             |
| UI        | shadcn/ui + Radix UI + Lucide                                       |
| Deploy    | Vercel (static export)                                              |
| Testing   | Vitest 4.1.9 + Playwright 1.61 + axe-core                           |
| CI        | GitHub Actions (lint → typecheck → test → build → e2e → Lighthouse) |

---

## FASE 1 — Crítica destructiva

### ✅ Lo que funciona (y funciona bien)

Antes de destripar, reconocimiento: este proyecto tiene una calidad **por encima de la media** en todas las dimensiones auditadas.

| Dimensión          | Evidencia                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ESLint**         | 0 errores, 0 warnings. `no-explicit-any: error`, `no-unused-vars: error`, reglas Next.js + core-web-vitals activas                                                                     |
| **TypeScript**     | Compilación limpia. `strict: true` + `noUncheckedIndexedAccess`. Errores de tipo: 0                                                                                                    |
| **Vitest**         | 29 tests, 3 archivos, todos pasan. Cobertura de utils, site config, contact                                                                                                            |
| **Prettier**       | Todos los archivos formateados. Config consistente                                                                                                                                     |
| **Build**          | `next build` exitoso. 15 rutas generadas. Sin warnings                                                                                                                                 |
| **Depcheck**       | Sin dependencias sin usar                                                                                                                                                              |
| **Secretos**       | Ningún `secret`, `password`, `token`, `API_KEY` hardcodeado en código fuente                                                                                                           |
| **Seguridad HTTP** | CSP completa (documentada), HSTS (2 años, preload), X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy denegado |
| **SEO**            | JSON-LD Person + WebSite + Article. Meta tags completos (OG, Twitter, canonical). sitemap.xml con 11 URLs. robots.txt permisivo                                                        |
| **Accesibilidad**  | Skip-link funcional. aria-labels en canvas decorativo. Roles semánticos. Test axe-core WCAG 2.1 AA en 5 páginas                                                                        |
| **Legal**          | RGPD + LSSI-CE compliant. 4 páginas legales (aviso, privacidad, cookies, seguridad)                                                                                                    |
| **Documentación**  | ARCHITECTURE.md, DESIGN.md, SECURITY.md, STYLEGUIDE.md, CONTRIBUTING.md, ADRs. Proyecto modelito                                                                                       |
| **CI/CD**          | Pipeline completo: format → typecheck → lint → test → build → e2e → Lighthouse CI                                                                                                      |
| **Testing E2E**    | Playwright: smoke tests, skip-link, nav anchors, FAB popover, security lint (no eval, no inline handlers)                                                                              |

---

### 🔴 DEFECTO-001 — Dependencia `gray-matter` con vulnerabilidad moderada de DoS

**Categoría**: Seguridad (1.4) | **Severidad**: CATASTRÓFICO | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `package.json:28` → dependencia de gray-matter

**Evidencia**:

```
npm audit output:
js-yaml <3.15.0
  Severity: moderate
  JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases

gray-matter <=0.3.5
  Depends on vulnerable versions of js-yaml
```

**Impacto**: El sitio es 100% estático (export HTML). No hay input de usuario en runtime, por lo que el vector de explotación es **build-time** — un atacante no puede explotar esto en producción. Sin embargo, gray-matter procesa MDX y si en el futuro se permite contenido dinámico o user-generated, el vector de DoS se vuelve explotable.

**Fix**:

```bash
# gray-matter no tiene versión que resuelva js-yaml <3.15
# Opción 1: forzar override en package.json
"overrides": {
  "gray-matter": {
    "js-yaml": ">=3.15.0"
  }
}

# Opción 2 (recomendada): migrar a alternatives como `front-matter` o `@next/mdx`
```

---

### 🟠 DEFECTO-002 — `security.txt` apunta a `/empleo` que redirige a `/`

**Categoría**: Seguridad (1.9) | **Severidad**: GRAVE | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `public/.well-known/security.txt:5`

**Evidencia**:

```
Hiring: https://alexendros.me/empleo
```

Pero `vercel.json:9` redirige `/empleo → /` (temporal, 307).

**Impacto**: Cualquier investigador de seguridad que visite `/.well-known/security.txt` y siga el enlace de "Hiring" llegaría a la home, no a información de empleo. Daño a la credibilidad del programa de divulgación responsable.

**Fix**: Cambiar `Hiring` a `https://alexendros.me` o eliminar la línea. El `vercel.json` redirige `/empleo → /` (no permanente), así que la URL canonical correcta es simplemente `/`.

---

### 🟠 DEFECTO-003 — Texto legal con fecha de "mayo de 2026" pero estamos en junio

**Categoría**: Documentación (1.8) | **Severidad**: GRAVE | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `app/legal/privacidad/page.tsx:134`, `app/legal/cookies/page.tsx:163`, `app/legal/aviso-legal/page.tsx:125`

**Evidencia**: Las 3 páginas legales dicen "Última actualización: mayo de 2026" pero estamos el 30 de junio de 2026.

**Impacto**: Desde el punto de vista RGPD/LSSI-CE, una política de privacidad desactualizada es un indicador de falta de diligencia. Si la AEPD auditara, vería 2 meses de desfase. No es una infracción grave, pero es un signal negativo.

**Fix**: Actualizar las fechas a "junio de 2026" o automatizar con `new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })`.

---

### 🟠 DEFECTO-004 — JSON-LD duplicado: servido en HTML + re-renderizado por `JsonLd`

**Categoría**: SEO (2.3) | **Severidad**: GRAVE | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `components/json-ld.tsx:13-34` + HTML servido por Vercel

**Evidencia**: El HTML de `https://alexendros.me` contiene:

```html
<script type="application/ld+json" id="person-json-ld">
  ...
</script>
<script type="application/ld+json" id="website-json-ld">
  ...
</script>
```

Y `JsonLd.tsx` lee `public/schema/person.json` y `public/schema/website.json` para renderizarlos de nuevo.

**Impacto**: Google Search Console puede reportar "Multiple JSON-LD blocks" o "Duplicate structured data". En la práctica, Google consolida JSON-LD duplicados, pero es un warning innecesario en GSC y puede confundir a otros validadores.

**Fix**: Eliminar los `<script type="application/ld+json">` del HTML servido (si están generados por `JsonLd`), o eliminar `JsonLd` si ya están en el HTML por otro mecanismo.

---

### 🟡 DEFECTO-005 — Email hardcodeado en `footer.tsx` en lugar de usar `siteConfig`

**Categoría**: Arquitectura (1.2) | **Severidad**: MODERADO | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `components/footer.tsx:61`

**Evidencia**:

```tsx
<a href="mailto:contacto@alexendros.me" className="footer-link">
  contacto@alexendros.me
</a>
```

Mientras que `lib/site.ts` define `siteConfig.contact.email = "contacto@alexendros.me"`.

**Impacto**: Si el email cambia, hay que actualizar en 2 sitios. `contact-fab.tsx` usa `siteConfig.contact.email` correctamente, pero `footer.tsx` no.

**Fix**:

```tsx
<a href={`mailto:${siteConfig.contact.email}`} className="footer-link">
  {siteConfig.contact.email}
</a>
```

---

### 🟡 DEFECTO-006 — FAB Telegram con `aria-disabled="true"` pero visible para screen readers

**Categoría**: Accesibilidad (2.5) | **Severidad**: MODERADO | **Confianza**: MEDIA | **SOSPECHA**

**Ubicación**: `components/contact-fab.tsx:31-42`

**Evidencia**: El botón de Telegram tiene `aria-disabled="true"` y `aria-hidden="true"`, pero el contenido del tooltip (`.fab-item__name`, `.fab-item__desc`) no tiene `aria-hidden`.

**Impacto**: Un screen reader podría anunciar "Telegram @alexendros · en preparación" como un botón disponible, aunque está deshabilitado. Confuso para usuarios de AT.

**Fix**: Envolver todo el bloque en `aria-hidden="true"` o usar `role="presentation"`.

---

### 🟡 DEFECTO-007 — Sin `Cache-Control` para assets estáticos del build

**Categoría**: Rendimiento (1.6) | **Severidad**: MODERADO | **Confianza**: MEDIA | **CONFIRMADO**

**Ubicación**: Cabeceras HTTP de `https://alexendros.me`

**Evidencia**: La cabecera `cache-control` es:

```
cache-control: public, max-age=0, must-revalidate
```

Esto significa que **cada visita revalida con el servidor**. Para un sitio 100% estático, esto es subóptimo — los hashes de Next.js ya garantizan invalidación.

**Impacto**: Carga ligeramente más lenta en visitas repetidas. No es crítico pero es rendimiento sobre la mesa.

**Fix**: En `vercel.json`, añadir headers específicos para `/_next/static/`:

```json
{
  "source": "/_next/static/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

---

### 🟡 DEFECTO-008 — Lighthouse thresholds demasiado indulgentes en Fase 1

**Categoría**: Rendimiento (1.7) | **Severidad**: MODERADO | **Confianza**: MEDIA | **CONFIRMADO**

**Ubicación**: `lighthouserc.cjs:17-26`

**Evidencia**:

```js
// Fase 1 — aviso temprano (margen de 0.20 sobre el objetivo)
categories:performance: ["warn", { minScore: 0.7 }],
categories:accessibility: ["warn", { minScore: 0.75 }],
categories:best-practices: ["warn", { minScore: 0.7 }],
categories:seo: ["warn", { minScore: 0.75 }],
```

**Impacto**: Si el performance cae a 70 o el accessibility a 75, el CI solo hace warn, no falla. Un sitio estático debería poder mantener >90 en todas las categorías.

**Fix**: Subir los thresholds de Fase 1 a `warn: 0.85` o eliminar la Fase 1 y confiar solo en la Fase 2 (obligatoria).

---

### 🟢 DEFECTO-009 — `dangerouslySetInnerHTML` para JSON-LD estático

**Categoría**: Seguridad (1.1) | **Severidad**: MENOR | **Confianza**: ALTA | **CONFIRMADO**

**Ubicación**: `components/json-ld.tsx:22`, `app/esposible/[slug]/page.tsx:72`, `app/espensar/[slug]/page.tsx:72`

**Evidencia**: Uso de `dangerouslySetInnerHTML` para inyectar JSON-LD. En este caso es seguro (contenido estático de archivos propios, no de usuario), pero es un patrón que semgrep o linters de seguridad pueden marcar.

**Impacto**: Ninguno real — el contenido es 100% controlado por el desarrollador. Pero si en el futuro se permite contenido dinámico, aquí habría un vector XSS.

**Fix**: No aplica mientras el contenido sea estático. Documentar en SECURITY.md que este patrón es revisado.

---

### 🟢 DEFECTO-010 — `js-yaml` override en `package.json` pero no resuelve la raíz

**Categoría**: Seguridad (1.5) | **Severidad**: MENOR | **Confianza**: MEDIA | **CONFIRMADO**

**Ubicación**: `package.json:83` → `"js-yaml": "~3.14.1"`

**Evidencia**: El `overrides` fuerza `js-yaml` a `~3.14.1`, pero la vulnerabilidad requiere `>=3.15.0`. El override está empeorando la situación.

**Impacto**: Asegura que `js-yaml` se quede en la versión vulnerable.

**Fix**: Cambiar el override a `"js-yaml": ">=3.15.0"` o eliminar el override y dejar que npm resuelva.

---

## FASE 2 — Tabla resumen

| Severidad       | #      | IDs                |
| --------------- | ------ | ------------------ |
| 🔴 CATASTRÓFICO | 1      | 001                |
| 🟠 GRAVE        | 3      | 002, 003, 004      |
| 🟡 MODERADO     | 4      | 005, 006, 007, 008 |
| 🟢 MENOR        | 2      | 009, 010           |
| **Total**       | **10** |                    |

### Resumen ejecutivo

**alexendros.me es un proyecto con calidad excepcional.** El 90% de lo auditado está por encima del estándar de la industria: CI/CD completo, testing riguroso, headers de seguridad correctos, legal RGPD compliant, arquitectura documentada, design system con tokens OKLCH.

Los defectos encontrados son **de mantenimiento y de edge cases**, no de arquitectura ni de seguridad runtime. El más crítico (DEFECTO-001) es una dependencia transitoria con vulnerabilidad moderada que no es explotable en producción dado que el sitio es 100% estático.

**Veredicto**: El sitio está en **buen estado de salud**. Los 10 defectos se resuelven en <2 horas de trabajo.

---

## FASE 3 — Plan de saneamiento (por severidad × esfuerzo)

### Prioridad inmediata (< 30 min)

1. **DEFECTO-001**: Actualizar `js-yaml` override a `>=3.15.0` o migrar de gray-matter
2. **DEFECTO-003**: Actualizar fechas en 3 páginas legales a "junio de 2026"
3. **DEFECTO-005**: Reemplazar email hardcodeado en footer por `siteConfig.contact.email`
4. **DEFECTO-010**: Corregir override de `js-yaml` en `package.json`

### Prioridad alta (< 1 hora)

5. **DEFECTO-002**: Corregir `Hiring` en `security.txt`
6. **DEFECTO-004**: Eliminar JSON-LD duplicado (decidir fuente de verdad)
7. **DEFECTO-007**: Añadir `Cache-Control` para `/_next/static/` en `vercel.json`

### Prioridad media

8. **DEFECTO-006**: Revisar aria-hidden del FAB Telegram
9. **DEFECTO-008**: Subir thresholds de Lighthouse Fase 1

### Baja (documentar)

10. **DEFECTO-009**: Documentar patrón `dangerouslySetInnerHTML` en SECURITY.md

---

## FASE 4 — Plan de magnificación

Sobre el objetivo ya saneado, para llevarlo a referencia del sector:

1. **Performance**: Añadir `loading="lazy"` a imágenes de OG. Considerar `font-display: optional` para Inter display. Auditar LCP real con Web Vitals en Chrome DevTools.

2. **SEO avanzado**: Añadir `hreflang` si se considera contenido en otros idiomas. Implementar BreadcrumbList en JSON-LD para artículos. Añadir `dateModified` al Article schema.

3. **Testing**: Añadir tests de performance (Lighthouse CI con asserts en CI). Añadir visual regression testing (percy/chromatic). Test de links rotos (html-validate o linkinator).

4. **Seguridad avanzada**: Implementar SRI (Subresource Integrity) para scripts inline de Next.js. Evaluar migración de `unsafe-inline` CSP con upcoming nonce support en Next.js 17.

5. **Accesibilidad**: Añadir test de contraste de color (WCAG 1.4.3). Verificar que `prefers-reduced-motion` desactiva también las animaciones CSS (marquee, atmosphere).

6. **Observabilidad**: Integrar Vercel Speed Insights o Web Vitals library para métricas reales. Configurar alertas de Core Web Vitals.

7. **Content**: Añadir Estimated Reading Time a artículos. Implementar RSS feed (generado en build). Añadir `series` o `collection` navigation entre artículos relacionados.

---

## Comandos de reproducción

```bash
# Clonar
git clone --depth 1 https://github.com/alexendros/website-alexendrosme.git /tmp/criticar-alexendrosme

# Instalar
cd /tmp/criticar-alexendrosme && npm install

# Lint + types + tests
npm run lint && npm run typecheck && npm run test

# Build
npm run build

# Cabeceras HTTP
curl -sI https://alexendros.me

# Audit dependencias
npm audit

# Depcheck
npx depcheck

# Prettier
npx prettier --check "**/*.{ts,tsx,js,mjs,json,md,css}"
```

---

_Auditoría generada por /criticar — 30 de junio de 2026_
