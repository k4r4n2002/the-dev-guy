#!/bin/bash
# =============================================================================
# start-backend.sh — Start the DevLog backend in development mode
#
# Loads variables from .env (root), installs deps if needed, then
# launches the Express server via nodemon for hot-reload.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
ENV_FILE="$SCRIPT_DIR/.env"

# ── Load environment ──────────────────────────────────────────────────────────
if [ -f "$ENV_FILE" ]; then
  echo "📦  Loading environment from .env..."
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
else
  echo "⚠️  No .env found — copy .env.example to .env and fill in your values."
  echo "   See handouts/12-mongodb-atlas-setup.md for MongoDB Atlas setup."
  exit 1
fi

# ── Install dependencies if node_modules is missing ──────────────────────────
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "📦  Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install)
fi

# ── Start backend ─────────────────────────────────────────────────────────────
echo ""
echo "============================================================"
echo "  🚀  DevLog Backend"
echo "  Environment  : ${NODE_ENV:-development}"
echo "  Port         : ${PORT:-5000}"
echo "  API Base URL : http://localhost:${PORT:-5000}/api"
echo "============================================================"
echo ""

cd "$BACKEND_DIR"
exec npm run dev
