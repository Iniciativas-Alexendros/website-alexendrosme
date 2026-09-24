# Guía: design system

### Propósito de este documento

- **Objetivos:** Apuntar al sistema de diseño del sitio (tokens `--ax-*`,
  dark-first, oklch) sin duplicar `DESIGN.md`.
- **Estructura:** Fuente canónica → qué no copiar → dónde cambiar tokens.
- **Contenido a integrar según contexto:** No copies tokens ni catálogos de
  otro paquete público. El DS de webconfig/Showcase no aplica aquí.

## Fuente canónica

- [DESIGN.md](../../DESIGN.md) — tokens, componentes y principios
- [STYLEGUIDE.md](../../STYLEGUIDE.md) — voz y atmósfera

Prefijo `--ax-*` para color, motion, spacing y layout. Triple cadena de
aliases compatible con shadcn/ui. Dark-first.

## Qué no hacer

- No importar `tokens/*.tokens.json` ni el Showcase de `webconfig`.
- No introducir hex legacy si el token ya existe en oklch.
- No cambiar la paleta en un PR de plataforma.

## Dónde cambiar

Tokens en `app/styles/tokens/`. Si el cambio es de contrato (nuevo alias,
retirada de token), documenta en `DESIGN.md` y, si es transversal, un ADR.
