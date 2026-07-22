#!/usr/bin/env bash
# Lista worktrees cuya rama ya está mergeada en origin/main y sugiere limpieza.
#
# Uso: ./scripts/list-stale-worktrees.sh [--dry-run] [--prune]
#
#   --dry-run  (default) Solo listar, no borrar
#   --prune    Borrar las worktrees stale (pide confirmación por trabajo)
#
# Criterio: una worktree es "stale" si su HEAD está alcanzable desde
# origin/main (rama mergeada) y no está en la lista de exclusiones.
#
# Nota: worktrees en detached HEAD se omiten (no tienen rama que
# comparar). Revisa manualmente si hay detached worktrees.
#
# Exclusiones por defecto (no se consideran stale):
#   - main
#   - La worktree donde se ejecuta el script
#   - Ramas con cambios sin commit (dirty)

set -euo pipefail

MODE="${1:-dry-run}"
SCRIPT_WT=$(git rev-parse --show-toplevel 2>/dev/null || echo "")

if [ "$MODE" = "--prune" ]; then
  echo ""
  echo "⚠️  MODO PRUNE — se borrarán worktrees stale"
  echo ""
elif [ "$MODE" != "--dry-run" ]; then
  echo "::error::Uso: $0 [--dry-run|--prune]"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Worktrees stale — $(date '+%Y-%m-%d %H:%M')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git fetch --prune origin 2>/dev/null || true

STALE=false
TOTAL=0
STALE_COUNT=0

while IFS=$'\t' read -r wt_path wt_ref branch; do
  TOTAL=$((TOTAL + 1))

  # Saltar main
  if [ "$branch" = "main" ]; then
    echo "  ⏭️  [SKIP] $branch  → main branch (excluida)"
    continue
  fi

  # Saltar la worktree actual
  if [ "$wt_path" = "$SCRIPT_WT" ]; then
    echo "  ⏭️  [SKIP] $branch  → worktree activa del script"
    continue
  fi

  # Comprobar si la rama tiene cambios sin commit (dirty)
  if ! git -C "$wt_path" diff --quiet HEAD 2>/dev/null; then
    echo "  ⏭️  [DIRTY] $branch  → cambios sin commit en $wt_path"
    continue
  fi

  # Comprobar si el commit HEAD está en origin/main
  if git merge-base --is-ancestor "$wt_ref" origin/main 2>/dev/null; then
    echo "  🗑️  [STALE] $branch"
    echo "      path: $wt_path"
    echo "      head: $(git log --oneline "$wt_ref" -1 2>/dev/null || echo 'N/A')"
    echo "      ref:  $wt_ref"
    STALE=true
    STALE_COUNT=$((STALE_COUNT + 1))

    if [ "$MODE" = "--prune" ]; then
      echo ""
      echo "      ── ¿Eliminar worktree? ──"
      read -r -p "      rm -rf '$wt_path' && git worktree prune? [y/N] " CONFIRM
      if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
        rm -rf "$wt_path"
        git worktree prune 2>/dev/null || true
        echo "      ✅ Eliminada: $wt_path"
        # También borrar rama remota si ya no existe localmente activa
        if ! git worktree list --porcelain | grep -q "refs/heads/$branch"; then
          git branch -D "$branch" 2>/dev/null && echo "      ✅ Rama local '$branch' eliminada" || true
        fi
      else
        echo "      ⏭️  Omitida"
      fi
      echo ""
    fi
  else
    echo "  ✅ [ACTIVE] $branch"
    echo "      path: $wt_path"
  fi

done < <(git worktree list --porcelain | awk '/^worktree /{path=$2} /^HEAD /{head=$2} /^branch /{sub("refs/heads/","",$2); print path"\t"head"\t"$2}' 2>/dev/null)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Resumen: $TOTAL worktrees, $STALE_COUNT stale"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if $STALE; then
  echo ""
  echo "  Para limpiar:  bash $0 --prune"
  echo ""
fi
