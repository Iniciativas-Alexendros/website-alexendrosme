---
version: "1.0"
name: "Alexendros.me Design System"
description: >
  Design system propio para alexendros.me. Atmósfera violeta profunda con
  acento dorado. Dark-first, oklch exclusivo, tokens CSS custom properties
  con namespace --ax-*. Light mode documentado como planned.

colors:
  # --- Surface scale (elevation via luminosity, hue 315) ---
  surface-0: oklch(0.1 0.014 315)
  surface-50: oklch(0.12 0.016 315)
  surface-100: oklch(0.14 0.018 315)
  surface-200: oklch(0.17 0.02 315)
  surface-300: oklch(0.2 0.022 315)
  surface-400: oklch(0.23 0.024 315)
  surface-500: oklch(0.26 0.026 315)
  surface-600: oklch(0.29 0.028 315)
  surface-700: oklch(0.33 0.03 315)
  surface-800: oklch(0.37 0.032 315)
  surface-900: oklch(0.42 0.034 315)

  # --- Text ---
  text-primary: oklch(0.97 0.008 310)
  text-secondary: oklch(0.8 0.01 310)
  text-tertiary: oklch(0.62 0.012 310)
  text-disabled: oklch(0.46 0.014 310)
  text-inverse: oklch(0.07 0.012 315)

  # --- Border ---
  border-subtle: "{colors.surface-300}"
  border-default: "{colors.surface-500}"
  border-strong: "{colors.surface-700}"
  border-focus: "{colors.accent}"

  # --- Accent (brand) ---
  accent: oklch(0.78 0.165 85)
  accent-dim: oklch(0.62 0.13 85)
  accent-bright: oklch(0.92 0.1 88)
  accent-fg: oklch(0.12 0.014 50)

  brand-primary: "{colors.accent}"
  brand-primary-hc: "{colors.accent}"
  brand-primary-fg: "{colors.accent-fg}"
  brand-accent: "{colors.accent-dim}"
  brand-accent-fg: "{colors.accent-fg}"

  Los tokens canónicos viven en el sistema de diseño Vergina Imperial (repositorio privado en preparación).

  # --- Semantic states ---
  success-fg: oklch(0.78 0.16 130)
  success-bg: oklch(0.2 0.06 130)
  success-border: oklch(0.4 0.12 130)
  warning-fg: oklch(0.82 0.16 82)
  warning-bg: oklch(0.22 0.06 82)
  warning-border: oklch(0.42 0.12 82)
  error-fg: oklch(0.72 0.22 25)
  error-bg: oklch(0.22 0.07 25)
  error-border: oklch(0.42 0.16 25)
  info-fg: oklch(0.78 0.14 230)
  info-bg: oklch(0.2 0.05 230)
  info-border: oklch(0.4 0.1 230)

  # --- Atmosphere (radial, hero/landing) ---
  atmo-haze: oklch(0.32 0.09 318)
  atmo-velvet: oklch(0.18 0.06 315)
  atmo-vignette: oklch(0.04 0.02 315)

  # --- Glass (translucent panels) ---
  glass-bg: "linear-gradient(140deg, oklch(1 0 0 / 0.06), oklch(1 0 0 / 0.02), oklch(1 0 0 / 0.04))"
  glass-border: oklch(1 0 0 / 0.08)

  # --- Shadows (overlays only) ---
  shadow-overlay: "0 1px 2px oklch(0 0 0 / 0.3), 0 12px 32px -8px oklch(0 0 0 / 0.5), 0 0 0 1px {colors.border-default}"
  shadow-popover: "0 1px 2px oklch(0 0 0 / 0.2), 0 8px 24px -6px oklch(0 0 0 / 0.4), 0 0 0 1px {colors.border-default}"
  shadow-toast: "0 1px 2px oklch(0 0 0 / 0.25), 0 10px 28px -6px oklch(0 0 0 / 0.45), 0 0 0 1px {colors.border-default}"
  shadow-glow-brand: "0 0 56px color-mix(in oklch, {colors.accent} 32%, transparent)"

  # --- Focus ---
  ring-focus: "0 0 0 2px {colors.surface-0}, 0 0 0 4px {colors.accent}"

  # --- Special ---
  accent-shimmer: "linear-gradient(180deg, oklch(0.92 0.1 88) 0%, oklch(0.82 0.165 85) 38%, oklch(0.62 0.13 85) 70%, oklch(0.78 0.155 85) 100%)"

  # --- Light mode (planned, not active) ---
  light:
    surface-0: oklch(0.98 0.004 85)
    surface-100: oklch(0.95 0.006 85)
    text-primary: oklch(0.15 0.014 315)
    accent: oklch(0.55 0.18 85)

motion:
  duration-instant: 80ms
  duration-fast: 120ms
  duration-base: 180ms
  duration-slow: 240ms
  duration-slower: 400ms
  ease-out-expo: "cubic-bezier(0.16, 1, 0.3, 1)"
  ease-out-quart: "cubic-bezier(0.25, 1, 0.5, 1)"
  ease-in-quart: "cubic-bezier(0.5, 0, 0.75, 0)"
  ease-in-out: "cubic-bezier(0.65, 0, 0.35, 1)"
  ease-spring: "linear(0, 0.009, 0.035 2.1%, 0.141, 0.292, 0.468, 0.653, 0.831, 0.945 38.7%, 0.987, 1.003, 1.008, 1.008, 1.004, 0.999, 0.994, 0.992, 0.996, 1)"

rounded:
  none: 0
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  "2xl": 24px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
  xl: 64px
  "2xl": 96px
  gutter: 24px
  measure: 65ch
  tap-target: 44px
  safe-inset: "max(1rem, env(safe-area-inset-left))"

z-index:
  base: 0
  dropdown: 1000
  sticky: 1100
  overlay: 1200
  modal: 1300
  popover: 1400
  toast: 1500
  tooltip: 1600

typography:
  display:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(3rem, 2.5rem + 2.4vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: -0.035em
  h1:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(2.25rem, 2rem + 1.2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.022em
  h2:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(1.75rem, 1.6rem + 0.7vw, 2.125rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.022em
  h3:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(1.438rem, 1.35rem + 0.4vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: -0.022em
  body:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(0.938rem, 0.9rem + 0.18vw, 1rem)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -0.005em
  body-sm:
    fontFamily: "Geist Sans, Inter, sans-serif"
    fontSize: "clamp(0.813rem, 0.79rem + 0.14vw, 0.875rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "clamp(0.8rem, 0.77rem + 0.12vw, 0.813rem)"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.08em
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: 0.92em
    letterSpacing: 0

components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-0}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  button-secondary:
    backgroundColor: "{colors.surface-300}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 12px 24px
  card:
    backgroundColor: "{colors.surface-100}"
    rounded: "{rounded.lg}"
    padding: 24px
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface-0}"
    rounded: "{rounded.full}"
---

# Alexendros.me Design System

Sistema de diseño propio para alexendros.me. Este documento sirve como fuente
de verdad tanto para humanos como para agentes IA.

## Overview

La interfaz transmite una atmósfera **violeta profunda** con acentos
**dorados**. El resultado evoca un acabado mate premium — una publicación de
alta gama o una galería contemporánea.

- **Dark-first** — el sitio es nativamente oscuro. Light mode documentado
  como "planned" pero no implementado.
- **Tokens OKLCH** — todos los colores usan oklch para contraste consistente
  y manipulación perceptual uniforme.
- **Elevación por luminosidad** — no se usan box-shadows en cards/inputs;
  la profundidad se comunica variando la luminosidad de las superficies.
- **Geist Sans + Mono** — tipografía principal. Inter para display hero.
- **Lucide** — iconografía unificada (20px por defecto).

## Colors

La paleta se basa en neutros de alto contraste con un único acento cálido.

### Superficies (escala de elevación)

La atmósfera se construye sobre una escala de 11 superficies violetas (hue 315),
donde la elevación se comunica exclusivamente por diferencias de luminosidad:

- **surface-0** (`oklch(0.1 0.014 315)`): fondo principal — noche profunda.
- **surface-100** (`oklch(0.14 0.018 315)`): base de cards.
- **surface-500** (`oklch(0.26 0.026 315)`): bordes por defecto.
- **surface-900** (`oklch(0.42 0.034 315)`): elementos flotantes.

### Acento (marca)

El acento dorado (hue 85) es el único motor de interacción:

- **accent** (`oklch(0.78 0.165 85)`): dorado batido —CTAs, links activos,
  badges destacados.
- **accent-dim** (`oklch(0.62 0.13 85)`): dorado grave — variante secundaria.
- **accent-bright** (`oklch(0.92 0.1 88)`): brillo alto — hover states.

### Texto

Neutro tintado violeta mínimo (hue 310):

- **text-primary** (`oklch(0.97 0.008 310)`): casi blanco — texto principal.
- **text-tertiary** (`oklch(0.62 0.012 310)`): muted — captions, metadata.

### Estados semánticos

- **success**: oliva (hue 130) — distinto del acento para no confundir "marca"
  con "éxito".
- **warning**: ámbar (hue 82).
- **error**: rojo (hue 25).
- **info**: azul (hue 230).

### Atmósfera

Gradientes radiales opcionales para hero/landing:

- **atmo-haze**: halo púrpura cálido sobre el hero.
- **atmo-vignette**: viñeta oscura en los bordes.

### Glass

Paneles translúcidos con backdrop-blur para cards flotantes (mission cards):

- **glass-bg**: gradiente semi-transparente sutil.
- **glass-blur**: `blur(20px) saturate(140%)`.

## Typography

La estrategia tipográfica usa **Geist Sans** para narrativa y **Geist Mono**
para datos técnicos.

- **Display**: Geist Sans Bold a 700, clamp fluido 3rem→4.75rem.
  Line-height 0.98, tracking -0.035em. Solo para hero principal.
- **Headlines** (h1-h3): Geist Sans Semi-Bold 600, tracking -0.022em.
  Tamaños fluidos con clamp.
- **Body**: Geist Sans Regular 400, 16px base, line-height 1.6,
  tracking -0.005em.
- **Label**: Geist Mono Medium 500, uppercase, letter-spacing 0.08em.
  Para kickers, secciones, metadata técnica.
- **Mono**: Geist Mono, tabular-nums para cifras alineadas.

Los tokens tipográficos `--text-*` y `--tracking-*` se definen en el
`@theme` block de Tailwind v4 y NO se renombran bajo `--ax-*` porque
son la API de utility classes (`text-sm`, `tracking-heading`).

## Layout

- **Grid**: contenedor centrado con `max-width` y padding lateral.
- **Spacing scale**: escala de 8px base (4px, 8px, 16px, 32px, 64px, 96px).
- **Measure**: `65ch` máximo para prosa legible.
- **Tap target**: 44px mínimo (WCAG 2.1 AA).
- **Safe inset**: `max(1rem, env(safe-area-inset-left))` para notch.

## Elevation & Depth

La profundidad se comunica mediante **capas tonales** (luminosidad), nunca
mediante box-shadows pesadas:

- Cards usan `surface-100` sobre `surface-0` — la diferencia de luminosidad
  crea la separación visual.
- Un sutil `inner-highlight` (`inset 0 1px 0 oklch(1 0 0 / 0.04)`),
  simula un pixel superior iluminado.
- **Sombras solo para overlays**: Dialog, Popover, Toast, Tooltip.
  Cards, inputs, nav items NUNCA llevan box-shadow.

## Shapes

El lenguaje de formas es de **precisión arquitectónica**:

- Todos los elementos interactivos, contenedores e inputs usan
  **radio de 8px** (`--ax-radius-md`).
- Bordes redondeados mínimos: suficiente suavidad para sentirse moderno
  manteniendo una estética rígida e ingenieril.
- `--ax-radius-full` (9999px) reservado para badges y FABs circulares.

## Components

- **Botones**: variantes primary (dorado), secondary (superficie), y ghost.
  Padding 12px 24px, radio md. El primary es el único con color de marca.
- **Cards**: `surface-100` background, radio lg, padding 24px.
  Sin box-shadow; elevación por contraste de superficie.
- **Badges**: fondo dorado, texto surface-0, radio full.
- **Nav**: header pegajoso con backdrop-blur glass. Links con underline
  animado vía `--ax-ease-spring`.
- **FAB Contacto**: flotante con popover Radix. Foco-trap nativo.
- **Atmosphere**: capas CSS con animación `atm-drift`, respeta
  `prefers-reduced-motion`.
- **Iconos**: Lucide, tamaño por defecto 20px.

## Do's and Don'ts

### Do

- Usar `--ax-*` tokens para todos los colores, nunca hardcodear oklch.
- Mantener contraste ≥ 4.5:1 en texto normal (WCAG AA).
- Usar `--ax-ease-out-expo` como easing principal para transiciones.
- Respetar `prefers-reduced-motion: reduce` — desactivar animaciones.
- Aplicar el modo oscuro antes del primer paint (script inlined en head).

### Don't

- Mezclar radios redondeados y agudos en la misma vista.
- Usar más de 2 pesos de fuente en una misma pantalla.
- Aplicar box-shadow a cards, inputs o nav items.
- Usar colores del acento para mensajes de estado (success/error).
- Hardcodear valores de color en componentes — siempre vía tokens.
