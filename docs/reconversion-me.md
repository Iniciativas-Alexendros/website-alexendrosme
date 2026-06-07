# Reconversión de alexendros.me — plan estructural

> Estado: **propuesta** (ronda de estructura). No incluye copy definitivo de cara
> al usuario: eso se redacta en la fase de contenido. Aquí solo se define
> arquitectura, departamentos, purga y posicionamiento.
>
> Última revisión: 2026-06-07.

---

## 0. Tesis

`alexendros.me` y `alexendros.pro` son dos cosas distintas y hoy no lo son:

| | `alexendros.pro` | `alexendros.me` |
| --- | --- | --- |
| Función | venta, contratación, producto, SaaS | espacio personal **libre de dinero** |
| Registro | comercial | ideológico · filosófico · nacional · social |
| Llamada a la acción | "contrátame", "pruébalo" | leer, pensar, discrepar |
| Monetización | sí (es su sentido) | **ninguna** — antidinero |

**Antidinero** aquí no significa "no acepto dinero": significa que este dominio
no existe para ganarlo. Nada de afiliados, nada de captación, nada de tracking,
nada de "convócame".

---

## 1. Diagnóstico del estado actual (con evidencia)

El `.me` es, hoy, una **landing comercial de `.pro` con otro nombre**:

- **Hero de ventas** — `app/page.tsx:103-105`: *"Construyo, opero y cobro en mi
  propio SaaS"*; CTA *"Convócame"* (`:108`) y *"disponibilidad para
  consultoría"* (`:168`).
- **Tabla comparativa de venta** — `app/page.tsx:191-209`: "Alexendros vs Dev
  genérico", con fila "Producto SaaS propio en producción".
- **Afiliados monetizados**:
  - `app/page.tsx:320-363` — sección "Aliados con programa de referidos"
    (Proton, Hostinger con código `G9PALEJANGEG`).
  - `components/referrals-fab.tsx` — botón flotante "Mis aliados" + *"Si
    contratas, recibo comisión"*.
  - `components/footer.tsx:80-90` — disclosure de afiliados.
  - `lib/site.ts:31-53` — array `referrals` (Claude AI referral, Proton).
- **Copyright restrictivo** — `components/footer.tsx:77`: *"Todos los derechos
  reservados"* (incoherente con "contenido libre").
- **Identidad SEO comercial**:
  - `lib/site.ts:4-6` — title "Fullstack Developer", description con `.pro`,
    Supabase.
  - `lib/structured-data.ts:9-11` — `jobTitle: "Fullstack Developer"`,
    `knowsAbout` incluye **Stripe** (pasarela de pago).
- **Documentación falsa** (deuda):
  - `CLAUDE.md §5` y `§2` describen páginas `/about`, `/contact`, `/projects`,
    `/uses` que **no existen**.
  - `TASKS.md:37` declara un smoke test de rutas inexistentes
    (`/about`, `/herramientas`, `/uses`, `/contact`).

Lo que **sí** está bien y se conserva:

- Static export, headers de seguridad (`vercel.json`), Lighthouse ~99.
- **CSS ya departamentado**: `app/styles/{tokens,base,typography,components,utilities,motion,breakpoints,print}.css`.
- Tokens oklch dark-first, fuentes locales, JSON-LD, sitemap/robots.
- **Cero tracking real** (verificado): únicas cookies `__cf_bm` (Cloudflare) y
  `_vercel_no_cache` (Vercel). Esto es un **activo**: permite predicar con el
  ejemplo.

---

## 2. Arquitectura objetivo (departamentos / directorios)

```
alexendros-me/
├── app/
│   ├── page.tsx                 # Portada: tesis + índice de secciones (sin venta)
│   ├── ideas/                   # DEPARTAMENTO de contenido (MDX)
│   │   ├── page.tsx             # Índice de ensayos (lee content/ideas en build)
│   │   └── [slug]/page.tsx      # Render de cada ensayo · generateStaticParams
│   ├── sobre/                   # (antes "biografía") narrativa personal, no CV
│   │   └── page.tsx
│   ├── legal/
│   │   ├── aviso-legal/         # se mantiene (LSSI-CE)
│   │   ├── privacidad/          # capa manifiesto + capa formal
│   │   └── cookies/             # PIEZA DIVULGATIVA (ver §5)
│   └── styles/                  # (sin cambios: ya departamentado)
├── content/                     # NUEVO — fuente de verdad del contenido
│   └── ideas/
│       └── *.mdx                # un archivo por ensayo (frontmatter + cuerpo)
├── lib/
│   ├── site.ts                  # purgado de afiliados y vocabulario pro
│   ├── content.ts               # NUEVO — loader de MDX (fs en build)
│   └── structured-data.ts       # Person/WebSite reorientado + Article para ideas
└── components/
    ├── nav.tsx                  # rutas reales (no solo anclas)
    ├── footer.tsx               # sin afiliados; licencia abierta
    └── ui/                      # se conserva lo usado; se poda lo muerto
```

### Decisiones de ruteo

- El one-pager con anclas (`#biografia`, `#misiones`, `#experiencias`) se
  reemplaza por **rutas reales** indexables: mejor SEO natural y mejor encaje
  con un sitio de contenido.
- `nav` en `lib/site.ts:16-20` pasa de anclas a rutas (`/`, `/ideas`, `/sobre`).

---

## 3. Sistema de contenido `/ideas` (MDX, compatible static export)

Objetivo: escribir ensayos en Markdown sin tocar React.

- **Fuente**: `content/ideas/*.mdx` con frontmatter
  (`title`, `date`, `summary`, `tags`, `lang`, `draft`).
- **Loader**: `lib/content.ts` lee el filesystem en build (Server Component) →
  100% compatible con `output: 'export'`.
- **Rutas**: `app/ideas/[slug]/page.tsx` + `generateStaticParams()` deriva los
  slugs de los archivos. `draft: true` se excluye del build de producción.
- **Render MDX**: vía `@next/mdx` o `next-mdx-remote/rsc` (a decidir en
  implementación; ambos válidos en export estático).
- **Sin base de datos, sin API** (regla dura del repo: se respeta).

> Esta ronda deja la **estructura** lista; los ensayos los escribe el autor en
> la fase de contenido. No se inventa ningún ensayo.

---

## 4. Inventario de purga (qué sale y de dónde)

| Elemento | Ubicación | Acción |
| --- | --- | --- |
| Hero "cobro en mi SaaS" / "Convócame" / consultoría | `app/page.tsx:90-113,156-169` | Reescribir (fase contenido) |
| Tabla "Alexendros vs Dev genérico" | `app/page.tsx:181-210` | Eliminar |
| Sección "Aliados con programa de referidos" | `app/page.tsx:320-363` | **Eliminar** |
| `ReferralsFab` (botón flotante afiliados) | `components/referrals-fab.tsx`, usado en `app/page.tsx:395` | **Eliminar** |
| Disclosure de afiliados en footer | `components/footer.tsx:80-90` | **Eliminar** |
| Array `referrals` | `lib/site.ts:31-53` | **Eliminar** |
| `StackMarquee` (escaparate de stack) | `components/stack-marquee.tsx`, `app/page.tsx:282` | Revisar / eliminar |
| "Todos los derechos reservados" | `components/footer.tsx:77` | Sustituir por licencia abierta (ver §6) |
| Title/description comerciales | `lib/site.ts:4-6` | Reorientar |
| `jobTitle` / `knowsAbout: Stripe` | `lib/structured-data.ts:9-11` | Reorientar a intereses reales |
| Estructura falsa | `CLAUDE.md §2,§5` · `TASKS.md:37,44` | **Corregir ya** (saneado) |

> "Eliminar" sobre elementos monetizados queda **pendiente de confirmación
> explícita** del autor por afectar a ingresos reales (ver §6, decisiones
> abiertas). En esta ronda solo se corrige la documentación falsa.

---

## 5. Pieza divulgativa de cookies / privacidad

La oportunidad central. El sitio **de verdad no rastrea**, así que puede
denunciar el teatro de las cookies sin hipocresía.

### Estructura de dos capas (el código ya la soporta)

1. **Capa manifiesto** (arriba, para el humano): qué son las cookies de verdad,
   para qué se usan, qué se hace con los datos. Tono *sobrio con filo*: dato y
   argumento, el cabreo se intuye.
2. **Capa formal** (abajo, blindaje AEPD): el texto legal seco actual, intacto.

Así se **informa y se cumple la ley** a la vez.

### Hechos verificables sobre los que construir (no inventar)

Todo lo que se afirme debe ser contrastable. Material base:

- **Tipos de cookie**: técnicas/necesarias vs. de terceros / publicitarias.
  Solo las no necesarias requieren consentimiento (Art. 22.2 LSSI-CE; Guía
  AEPD 2023 — ya citada en `app/legal/cookies/page.tsx`).
- **Real-time bidding (RTB)**: subasta del perfil del usuario en milisegundos
  durante la carga. Documentado por la autoridad belga (APD/GBA) que declaró
  ilegal el *TCF* de IAB Europe en 2022. → *verificar y citar fuente al redactar.*
- **Fingerprinting**: identificación sin cookies (canvas, fuentes, user-agent).
- **Qué hace ESTE sitio** (verificable en repo + cabeceras HTTP):
  únicamente `__cf_bm` y `_vercel_no_cache`, ambas técnicas. Sin analytics,
  sin pixel, sin banner.
- **Cómo comprobarlo el propio usuario**: DevTools → Application → Cookies.

> Regla: cualquier cifra o caso concreto se cita con fuente al escribir el copy.
> En esta ronda no se fija el texto final.

---

## 6. Decisiones abiertas (requieren al autor)

1. **Afiliados** — ¿se eliminan del `.me` por completo (Proton, Hostinger,
   referral de Claude)? Coherente con "antidinero", pero afecta ingresos reales.
   _Recomendación: eliminar del `.me`; si interesan, viven en `.pro`._
2. **Licencia / copyright** — sustituir "Todos los derechos reservados" por una
   licencia abierta (p. ej. CC BY-SA o CC BY-NC) coherente con "contenido
   libre". _Decidir cuál._
3. **`knowsAbout` / identidad SEO** — reorientar a intereses **reales y
   verificables** (filosofía política, soberanía digital, etc.). El autor aporta
   la lista; no se inventa.
4. **`StackMarquee` y FABs** — ¿se conservan como estética o se retiran por
   sabor "tech-influencer"?

---

## 7. Posicionamiento natural (SEO honesto, sin tracking)

- Rutas reales indexables (`/ideas`, `/ideas/[slug]`, `/sobre`) en vez de anclas.
- `Article` / `BlogPosting` JSON-LD por ensayo (`lib/structured-data.ts`).
- `sitemap.xml` generado desde `content/ideas` (hoy es estático).
- `description` por página = tesis, no claim de venta.
- Rendimiento y ausencia de tracking como **argumento**, no solo como métrica.

---

## 8. Saneado de código y enforcing

- **Documentación veraz**: `CLAUDE.md` y `TASKS.md` deben describir el repo real.
- **Dead code**: pasar `pnpm deadcode:deps` (depcheck) y `pnpm deadcode:exports`
  (ts-prune) tras la purga; retirar componentes UI huérfanos.
- **Convención de contenido**: todo ensayo en `content/`, nunca hardcodeado en
  `.tsx`.
- **Colores**: se mantiene la regla — solo CSS vars de `app/styles/tokens.css`.

---

## 9. Fases

1. **Estructura + saneado** (esta ronda): plan + corrección de documentación
   falsa. Sin tocar copy de usuario.
2. **Purga**: eliminar afiliados/venta (tras confirmar §6), montar `/ideas`
   (MDX), reorientar `site.ts` y `structured-data.ts`.
3. **Contenido**: redactar portada, `/sobre`, pieza de cookies y primeros
   ensayos (tono *sobrio con filo*).
4. **Cierre**: SEO (Article schema, sitemap dinámico), Lighthouse, deploy.
