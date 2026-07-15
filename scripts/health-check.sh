#!/usr/bin/env bash
# Health check para monitorización sintética externa.
# Compatible con cron-job.org, UptimeRobot, Healthchecks.io, o curl manual.
#
# Uso: ./scripts/health-check.sh [url]
#      ./scripts/health-check.sh                  # usa https://alexendros.me por defecto
#
# Exit 0 si todo OK, exit 1 si algo falla.
set -euo pipefail

URL="${1:-https://alexendros.me}"
TIMEOUT=10

# ─── 1. HTTP 200 ──────────────────────────────────────────────
STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$URL")
if [ "$STATUS" != "200" ]; then
  echo "FAIL: HTTP $STATUS en $URL"
  exit 1
fi

# ─── 2. Feed RSS accesible ───────────────────────────────────
RSS_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "${URL}/feed.xml")
if [ "$RSS_STATUS" != "200" ]; then
  echo "WARN: RSS feed devuelve HTTP $RSS_STATUS"
fi

# ─── 3. Sitemap accesible ────────────────────────────────────
SITEMAP_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "${URL}/sitemap.xml")
if [ "$SITEMAP_STATUS" != "200" ]; then
  echo "WARN: Sitemap devuelve HTTP $SITEMAP_STATUS"
fi

# ─── 4. Cabeceras de seguridad críticas ──────────────────────
HEADERS=$(curl -sI --max-time "$TIMEOUT" "$URL")

check_header() {
  local header="$1"
  printf '%s\n' "$HEADERS" | grep -qi "$header" || echo "WARN: $header ausente"
}

check_header "strict-transport-security"
check_header "x-content-type-options: nosniff"
check_header "x-frame-options: DENY"
check_header "content-security-policy"

echo "OK: $URL responde 200, cabeceras de seguridad presentes"
