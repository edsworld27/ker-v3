#!/bin/bash
# AQUA Portal — Database Initialization Script
# Initializes the SQLite databases for all 7 micro-frontend apps via Prisma.
# Idempotent — safe to re-run.

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APPS=(aqua-host-shell aqua-client aqua-crm aqua-operations aqua-ops-finance aqua-ops-people aqua-ops-revenue)

echo "🚀 Initializing AQUA Portal databases (7 apps)..."
echo ""

for app in "${APPS[@]}"; do
  app_dir="$ROOT_DIR/apps/$app"
  if [ ! -d "$app_dir" ]; then
    echo "⚠️  Skipping $app (folder not found at $app_dir)"
    continue
  fi
  if [ ! -f "$app_dir/prisma/schema.prisma" ]; then
    echo "⚠️  Skipping $app (no prisma/schema.prisma)"
    continue
  fi

  echo "📦 [$app] Generating Prisma client..."
  cd "$app_dir"
  npx prisma generate 2>&1 | tail -2
  echo "📦 [$app] Pushing schema to SQLite..."
  npx prisma db push --accept-data-loss --skip-generate 2>&1 | tail -3
  cd "$ROOT_DIR"
  echo ""
done

echo "✅ All databases initialized."
