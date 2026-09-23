#!/usr/bin/env bash
# Determina la próxima versión semver a partir de conventional commits
# desde el último tag v* hasta HEAD.
#
# Uso: ./scripts/get-next-version.sh
#
# Comportamiento:
#   - Busca el último tag vX.Y.Z en la rama actual
#   - Analiza commits desde ese tag con conventional-commit parsing
#   - BREAKING CHANGE / ! → major | feat → minor | fix/refactor/perf → patch
#   - Si no hay cambios relevantes → no emite nada (exit 1)
#
# Salida: vX.Y.Z (próxima versión)

set -euo pipefail

# En CI el checkout puede ser shallow — asegurar tags
git fetch --tags --force 2>/dev/null || true

LAST_TAG=$(git tag --list 'v*' --sort=-v:refname | head -1)

if [ -z "$LAST_TAG" ]; then
  echo "::error::No se encontró ningún tag v* en el historial"
  exit 1
fi

# Extraer componentes semver
BASE="${LAST_TAG#v}"
MAJOR="${BASE%%.*}"
REST="${BASE#*.}"
MINOR="${REST%%.*}"
PATCH="${REST#*.}"

# Analizar commits desde el último tag hasta HEAD
MAJOR_BUMP=0
MINOR_BUMP=0
PATCH_BUMP=0

while IFS= read -r line; do
  # BREAKING: "BREAKING CHANGE:", "BREAKING:", o "feat!:", "fix!:"
  case "$line" in
    *BREAKING\ CHANGE:*|*BREAKING:*|*!:*)
      MAJOR_BUMP=1
      ;;
    *feat\(*\):*|*feat:*)
      [ "$MAJOR_BUMP" -eq 0 ] && MINOR_BUMP=1
      ;;
    *fix\(*\):*|*fix:*|*refactor\(*\):*|*refactor:*|*perf\(*\):*|*perf:*)
      [ "$MAJOR_BUMP" -eq 0 ] && [ "$MINOR_BUMP" -eq 0 ] && PATCH_BUMP=1
      ;;
  esac
done < <(git log "$LAST_TAG..HEAD" --format="%s%n%b" 2>/dev/null || echo "")

if [ "$MAJOR_BUMP" -eq 0 ] && [ "$MINOR_BUMP" -eq 0 ] && [ "$PATCH_BUMP" -eq 0 ]; then
  echo "::notice::No se detectaron cambios que requieran release (solo chore/docs/ci/style)" >&2
  exit 1
fi

if [ "$MAJOR_BUMP" -eq 1 ]; then
  NEXT_MAJOR=$((MAJOR + 1))
  echo "v${NEXT_MAJOR}.0.0"
elif [ "$MINOR_BUMP" -eq 1 ]; then
  NEXT_MINOR=$((MINOR + 1))
  echo "v${MAJOR}.${NEXT_MINOR}.0"
else
  NEXT_PATCH=$((PATCH + 1))
  echo "v${MAJOR}.${MINOR}.${NEXT_PATCH}"
fi
