#!/bin/bash
# =============================================================================
# deploy.sh — Top-level deployment wrapper for the-dev-guy
#
# Thin wrapper that delegates to deployment/deploy.sh.
# Usage mirrors the inner script:
#   ./deploy.sh --env dev --all
#   ./deploy.sh --env prod --service backend
#   ./deploy.sh --env dev --all --dry-run
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

exec "$SCRIPT_DIR/deployment/deploy.sh" "$@"
