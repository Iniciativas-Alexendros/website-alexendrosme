#!/usr/bin/env bash
# Extrae la sección del CHANGELOG.md correspondiente a una versión.
#
# Uso: ./scripts/extract-changelog.sh <version> [--readme]
#
#   <version>  Versión semver (ej: 0.6.0)
#   --readme   Formatea la salida para insertar en README.md
#              con <details> y marcadores <!-- RELEASE_SECTION_* -->
#
# Salida:
#   Sin --readme: el contenido de la sección del CHANGELOG
#   Con --readme:  bloque formateado con marcadores
#
# Exit code:
#   0 — sección encontrada
#   1 — versión no encontrada en CHANGELOG.md

set -euo pipefail

VERSION="${1:-}"
README_MODE=false

if [ "$VERSION" = "--readme" ]; then
  echo "::error::El primer argumento debe ser la versión, no --readme" >&2
  exit 1
fi

if [ -z "$VERSION" ]; then
  echo "::error::Uso: $0 <version> [--readme]" >&2
  exit 1
fi

shift
if [ "${1:-}" = "--readme" ]; then
  README_MODE=true
fi

CHANGELOG="CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  echo "::error::No se encuentra $CHANGELOG" >&2
  exit 1
fi

# Extraer la sección: desde ## [VERSION] hasta el siguiente ## [ o fin
SECTION=$(awk -v ver="$VERSION" '
  /^## \[/ {
    if (found) exit
    if (match($0, "^## \\[" ver "\\]")) {
      found = 1
      print
      next
    }
  }
  found { print }
' "$CHANGELOG")

if [ -z "$SECTION" ]; then
  echo "::error::No se encontró la versión v$VERSION en $CHANGELOG" >&2
  exit 1
fi

if $README_MODE; then
  # Extraer fecha del header: ## [X.Y.Z] — 2026-07-17 · Descripción
  DATE=$(echo "$SECTION" | head -1 | sed -n 's/.*— \([0-9-]\+\).*/\1/p')
  TITLE_SUFFIX="${DATE:+ (${DATE})}"

  # Usar printf para evitar expansión de ${} dentro del contenido
  {
    printf '%s\n' '<!-- RELEASE_SECTION_START -->'
    printf '%s\n' '<details>'
    printf '%s\n' "<summary><strong>v${VERSION}</strong>${TITLE_SUFFIX}</summary>"
    printf '%s\n' ''
    printf '%s\n' "$SECTION"
    printf '%s\n' ''
    printf '%s\n' '</details>'
    printf '%s\n' '<!-- RELEASE_SECTION_END -->'
  }
else
  printf '%s\n' "$SECTION"
fi
