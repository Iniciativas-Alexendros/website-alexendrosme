# Plan Arquitectural: Mejoras 5-8 (ROADMAP v0.3.0 → futuro)

**Fecha:** 2026-07-12  
**Rama base:** `feat/improvements-v0.4.0` (tras tareas 1-4)  
**Objetivo:** Ejecutar mejoras valorables en orden de dependencia y riesgo

---

## Análisis de dependencias

```
5. Banner anti-monetización          ──► Independiente (UI nueva)
6. Tags Git firmados + Releases      ──► Independiente (CI/CD)
7. Modo oscuro (tokens --ax-*)       ──► Base para 5, 8 (tokens light)
8. Link alexendros.dev footer/nav    ──► Usa tokens; si 7 listo, mejor UX
```

**Orden recomendado:** 7 → 5 → 8 → 6  
(7 habilita tokens light para 5 y 8; 6 es CI puro, sin bloqueos)

---

## 7. Modo oscuro / Light mode — **PRIORIDAD 1** (Foundation)

### Decisiones de arquitectura

| Decisión           | Opción elegida                                                             | Rationale                                                   |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Estrategia CSS** | Media query `prefers-color-scheme` + `data-theme` override                 | Nativo, sin JS blocking, respeta preferencia usuario        |
| **Toggle**         | Opcional (localStorage + `data-theme` en `<html>`)                         | Progressive enhancement; dark-first por defecto             |
| **Tokens**         | Duplicar paleta en `:root` (dark) + `@media (prefers-color-scheme: light)` | OKLCH permite cálculo perceptual; no hay "inversión simple" |
| **shadcn layer**   | Actualizar `--color-*` en index.css bajo media query                       | Mantiene API componentes intacta                            |

### Tokens light mode (desde DESIGN.md + cálculo perceptual)

```css
/* En app/styles/tokens/colors.css — AÑADIR al final */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    /* Superficies: hue 85 (dorado cálido) → escala luminosa */
    --ax-surface-0: oklch(0.98 0.004 85);
    --ax-surface-50: oklch(0.96 0.006 85);
    --ax-surface-100: oklch(0.93 0.008 85); /* card base */
    --ax-surface-200: oklch(0.89 0.01 85);
    --ax-surface-300: oklch(0.84 0.012 85); /* border subtle */
    --ax-surface-400: oklch(0.78 0.014 85);
    --ax-surface-500: oklch(0.72 0.016 85); /* border default */
    --ax-surface-600: oklch(0.65 0.018 85);
    --ax-surface-700: oklch(0.58 0.02 85); /* border strong */
    --ax-surface-800: oklch(0.5 0.022 85);
    --ax-surface-900: oklch(0.42 0.024 85);

    /* Acento: mismo hue 85, menor L para contraste AA sobre blanco */
    --ax-accent: oklch(0.55 0.18 85);
    --ax-accent-dim: oklch(0.48 0.16 85);
    --ax-accent-bright: oklch(0.62 0.14 88);
    --ax-accent-fg: oklch(0.98 0.004 85);

    /* Texto: inverso perceptual */
    --ax-text-primary: oklch(0.15 0.014 315);
    --ax-text-secondary: oklch(0.3 0.012 315);
    --ax-text-tertiary: oklch(0.45 0.01 315);
    --ax-text-disabled: oklch(0.55 0.008 315);
    --ax-text-inverse: oklch(0.98 0.004 85);

    /* Glass: más opaco en light */
    --ax-glass-bg: linear-gradient(
      140deg,
      oklch(0 0 0 / 0.04),
      oklch(0 0 0 / 0.02),
      oklch(0 0 0 / 0.03)
    );
    --ax-glass-border: oklch(0 0 0 / 0.12);
  }
}

/* Override explícito via toggle */
[data-theme="dark"] {
  /* tokens dark actuales (ya en :root) */
}

[data-theme="light"] {
  /* duplicar tokens light aquí para override forzado */
}
```

### shadcn semantic layer update (index.css)

```css
/* En @theme inline — añadir media query para light */
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --background: var(--ax-surface-0);
    --foreground: var(--ax-text-primary);
    --card: var(--ax-surface-100);
    --card-foreground: var(--ax-text-primary);
    --popover: var(--ax-surface-200);
    --popover-foreground: var(--ax-text-primary);
    --primary: var(--ax-brand-primary);
    --primary-foreground: var(--ax-brand-primary-fg);
    --secondary: var(--ax-surface-300);
    --secondary-foreground: var(--ax-text-primary);
    --muted: var(--ax-surface-200);
    --muted-foreground: var(--ax-text-tertiary);
    --accent-shadcn: var(--ax-brand-accent);
    --accent-foreground: var(--ax-brand-accent-fg);
    --destructive: var(--ax-error-fg);
    --destructive-foreground: var(--ax-text-primary);
    --border: var(--ax-border-default);
    --input: var(--ax-border-default);
    --ring: var(--ax-brand-primary);
  }
}

[data-theme="light"] {
  /* mismo bloque que arriba */
}

[data-theme="dark"] {
  /* tokens dark actuales (ya por defecto) */
}
```

### Toggle implementation

```tsx
// components/theme-toggle.tsx (nuevo)
"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [resolved, setResolved] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as typeof theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let resolvedTheme: "light" | "dark";

    if (theme === "system") {
      resolvedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.removeAttribute("data-theme");
    } else {
      resolvedTheme = theme;
      root.setAttribute("data-theme", theme);
    }
    setResolved(resolvedTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : t === "light" ? "system" : "dark"))}
      aria-label={`Tema actual: ${theme === "system" ? `sistema (${resolved})` : theme}`}
    >
      {resolved === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
```

### Integración en layout.tsx

```tsx
// app/layout.tsx — añadir script inline ANTES de </head> para evitar flash
<script
  dangerouslySetInnerHTML={{
    __html: `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        var root = document.documentElement;
        if (theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)) {
          root.setAttribute('data-theme', 'light');
        } else {
          root.removeAttribute('data-theme');
        }
      } catch (e) {}
    })();
  `,
  }}
/>
```

### Tests requeridos

| Test                         | Herramienta             | Criterio                            |
| ---------------------------- | ----------------------- | ----------------------------------- |
| Visual regression light/dark | Playwright + pixelmatch | 3 viewports × 2 temas = 6 snapshots |
| Toggle persistence           | Playwright E2E          | localStorage survive reload         |
| System preference            | Playwright E2E          | `emulateMedia` dark/light           |
| Contraste WCAG AA            | axe-core                | ≥ 4.5:1 texto normal, 3:1 large     |

---

## 5. Banner anti-monetización — **PRIORIDAD 2**

### Diseño UX

```tsx
// components/anti-monetization-banner.tsx
"use client";
import { useEffect, useState } from "react";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANNER_KEY = "anti-monetization-dismissed";
const LINK_DEV = "https://alexendros.dev";

export function AntiMonetizationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(BANNER_KEY);
    if (stored === "true") setDismissed(true);
  }, []);

  if (!mounted || dismissed) return null;

  return (
    <div className="anti-monetization-banner" role="status" aria-live="polite">
      <div className="banner-content">
        <Shield className="banner-icon" aria-hidden="true" />
        <div className="banner-text">
          <strong>Este espacio es libre de dinero.</strong>
          <span>
            Sin anuncios, sin afiliados, sin tracking. Lo comercial vive en{" "}
            <a href={LINK_DEV} target="_blank" rel="noopener noreferrer">
              alexendros.dev
            </a>
            .
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          localStorage.setItem(BANNER_KEY, "true");
          setDismissed(true);
        }}
        aria-label="Descartar aviso"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
```

### CSS (components.css)

```css
.anti-monetization-banner {
  @apply fixed top-0 left-0 right-0 z-[1000] border-b border-border-default bg-surface-100/95 backdrop-blur supports-[backdrop-filter]:bg-surface-100/80;
  @apply flex items-center justify-between gap-4 px-4 py-3;
  @apply animate-slide-down; /* keyframe en motion.css */
}

.banner-content {
  @apply flex items-center gap-3 flex-1;
}
.banner-icon {
  @apply text-brand-primary shrink-0;
}
.banner-text {
  @apply text-sm text-text-secondary;
}
.banner-text strong {
  @apply text-text-primary;
}
.banner-text a {
  @apply underline underline-offset-2 hover:text-brand-primary transition-colors;
}
```

### Integración en layout.tsx

```tsx
// app/layout.tsx — dentro de <body>, antes de <main>
import { AntiMonetizationBanner } from "@/components/anti-monetization-banner";

<body className="dark">
  {" "}
  {/* quitar 'dark' hardcoded cuando modo 7 listo */}
  <AntiMonetizationBanner />
  <header>...</header>
  <main>...</main>
</body>;
```

### Tests

- E2E: visible en primera visita, descartable, persistencia localStorage
- Visual: mobile/desktop, light/dark (requiere 7 completado)
- Accesibilidad: role="status", aria-live, focus order

---

## 8. Link a alexendros.dev en footer/nav — **PRIORIDAD 3**

### Cambios mínimos

**lib/site.ts** — ya existe `links.dev`, solo usar

**components/nav.tsx** — añadir item opcional

```tsx
// En nav.tsx, en nav desktop (no mobile sheet)
{
  /* Nuevo item al final */
}
<li>
  <a
    href={siteConfig.links.dev}
    target="_blank"
    rel="noopener noreferrer"
    className="nav-link external"
    aria-label="Hub de productos — alexendros.dev"
  >
    <ExternalLink className="icn-sm mr-1" aria-hidden="true" />
    Productos
  </a>
</li>;
```

**components/footer.tsx** — añadir en flex-row

```tsx
<a
  href={siteConfig.links.dev}
  target="_blank"
  rel="noopener noreferrer"
  className="footer-link external"
  aria-label="Hub de productos — alexendros.dev"
>
  <ExternalLink className="icn-xs mr-1" aria-hidden="true" />
  Hub de productos → alexendros.dev
</a>
```

### Icono ExternalLink (Lucide) — ya disponible

### Tests

- E2E: link presente, target="_blank", rel correcto, aria-label
- Visual: coherente con design system (tokens)

---

## 6. Tags Git firmados + GitHub Releases — **PRIORIDAD 4**

### Arquitectura CI

```yaml
# .github/workflows/release.yml (nuevo)
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: "Versión (semver: major/minor/patch o X.Y.Z)"
        required: true
        type: string
      tag_message:
        description: "Mensaje del tag firmado"
        required: false
        type: string

permissions:
  contents: write # para crear tag y release
  id-token: write # para cosign/sigstore si se usa keyless

jobs:
  release:
    runs-on: [self-hosted, ts] # runner con GPG key configurada
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
          cache: npm

      - run: npm ci

      - name: Build
        run: npm run build

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreferrer.github.com"

      - name: Sign tag
        env:
          GPG_PRIVATE_KEY: ${{ secrets.GPG_PRIVATE_KEY }}
          PASSPHRASE: ${{ secrets.GPG_PASSPHRASE }}
        run: |
          echo "$GPG_PRIVATE_KEY" | gpg --import --batch --yes
          VERSION="${{ inputs.version }}"
          TAG="v$VERSION"
          MSG="${{ inputs.tag_message || 'Release ' }}$TAG"
          git tag -s "$TAG" -m "$MSG"

      - name: Push tag
        run: git push origin "${{ github.ref_name }}"

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ inputs.version }}
          generate_release_notes: true
          files: |
            out/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Requisitos runner `infra-01`

1. GPG key importada en keyring del usuario runner
2. `GPG_PRIVATE_KEY` + `PASSPHRASE` en GitHub Secrets (org Iniciativas-Alexendros)
3. `git config --global commit.gpgsign true` en runner

### Documentación

- `RELEASE.md` o sección en `CONTRIBUTING.md`: proceso, versionado semver, firmado
- `CHANGELOG.md` actualizado manualmente antes del release (Keep a Changelog)

---

## Orquestación de agentes (subagent-driven)

### Fase 1: Foundation — Modo oscuro (Tarea 7)

| Subagente         | Responsabilidad                             | Entregable                                            |
| ----------------- | ------------------------------------------- | ----------------------------------------------------- |
| `frontend-design` | Diseño tokens light mode (OKLCH perceptual) | `colors.css` patch + `index.css` media queries        |
| `frontend-design` | ThemeToggle component + integración layout  | `components/theme-toggle.tsx`, `app/layout.tsx` patch |
| `review`          | Auditoría contraste WCAG AA light/dark      | Informe + fixes                                       |
| `perf-optimizer`  | Visual regression Playwright (6 snapshots)  | Baseline images + CI job                              |

**Comando orquestado:**

```bash
# En worktree feat/dark-mode-v0.4.0
opencode build "implement dark/light mode with OKLCH tokens, ThemeToggle, visual regression tests"
```

### Fase 2: Banner anti-monetización (Tarea 5)

| Subagente            | Responsabilidad                                      |
| -------------------- | ---------------------------------------------------- |
| `frontend-design`    | Componente + CSS + animación slide-down              |
| `interaction-design` | Microinteracción dismiss, focus trap, reduced-motion |
| `review`             | Accesibilidad (role, aria-live, keyboard)            |

### Fase 3: Link alexendros.dev (Tarea 8)

| Subagente         | Responsabilidad                      |
| ----------------- | ------------------------------------ |
| `frontend-design` | Nav/footer updates, icon consistency |
| `review`          | SEO (rel noopener), UX external link |

### Fase 4: Release automation (Tarea 6)

| Subagente                                  | Responsabilidad                                |
| ------------------------------------------ | ---------------------------------------------- |
| `mcp-builder` / `api-and-interface-design` | Workflow release.yml + GPG runner setup doc    |
| `review`                                   | Security: secret handling, permissions minimal |

---

## Definition of Done global

```bash
# En rama feat/improvements-v0.4.0 (tras merge de todas las fases)
npm ci
npm run typecheck      # 0 errores
npm run lint           # 0 warnings
npm run format:check   # clean
npm run build          # out/ OK
npm run test           # 38 passed
npm run test:e2e       # Playwright green (incl. visual regression)
# Manual: workflow_dispatch release.yml en infra-01 → tag firmado + release GH
```

---

## Riesgos y mitigaciones

| Riesgo                            | Impacto                  | Mitigación                                                      |
| --------------------------------- | ------------------------ | --------------------------------------------------------------- |
| Contraste light mode insuficiente | Alto (accesibilidad)     | Calcular OKLCH perceptual; testear con axe-core + manual        |
| Flash of wrong theme (FOUC)       | Medio                    | Script inline en `<head>` antes de body                         |
| GPG key no disponible en runner   | Alto (release bloqueado) | Documentar setup runner; testear con `workflow_dispatch` previo |
| Visual regression flaky           | Medio                    | Threshold pixelmatch 0.1%; retry 2x; baseline en repo           |
| Banner dismiss UX confuso         | Bajo                     | Test E2E + observación real; iterar si needed                   |

---

## Timeline estimado

| Fase                  | Duración      | Paralelizable                          |
| --------------------- | ------------- | -------------------------------------- |
| 7. Modo oscuro        | 2-3 días      | Subagentes design + review en paralelo |
| 5. Banner             | 0.5 día       | Tras 7 (usa tokens light)              |
| 8. Link dev           | 0.5 día       | Independiente, tras 7                  |
| 6. Release automation | 1 día         | Independiente (CI only)                |
| **Total**             | **~4-5 días** | **2-3 con paralelismo**                |
