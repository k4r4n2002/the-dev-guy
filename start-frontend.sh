#!/bin/bash
# =============================================================================
# start-frontend.sh — Start the DevLog frontend in development mode
#
# Loads variables from .env (root), installs deps if needed, then
# launches Vite dev server with hot module replacement.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Load environment ──────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  echo "📦  Loading environment from .env..."
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "⚠️  No .env found — copy .env.example to .env and fill in your values."
  exit 1
fi

# ── Install dependencies if node_modules is missing ──────────────────────────
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "📦  Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

# ── Start frontend ────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  🚀  DevLog Frontend"
echo "  API Base URL : ${VITE_API_BASE_URL:-http://localhost:5000/api}"
echo "  Dev Server   : http://localhost:5173"
echo "============================================================"
echo ""

cd "$FRONTEND_DIR"
exec npm run dev
