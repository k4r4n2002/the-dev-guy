#!/bin/bash
# =============================================================================
# deployment/docker-build-push.sh — Build and push DevLog Docker images
#
# Usage:
#   ./deployment/docker-build-push.sh                    # Build & push all
#   ./deployment/docker-build-push.sh --service backend  # Backend only
#   ./deployment/docker-build-push.sh --service frontend
#   ./deployment/docker-build-push.sh --tag v1.2.3       # Custom tag
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Configurable via env ──────────────────────────────────────────────────────
DOCKER_USER="${DOCKER_USER:-karandh}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
TARGET_SERVICE="all"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --service) TARGET_SERVICE="$2"; shift 2 ;;
    --tag)     IMAGE_TAG="$2"; shift 2 ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

build_and_push() {
  local name="$1"    # e.g., backend
  local ctx="$2"     # e.g., /path/to/backend
  local image="$DOCKER_USER/devlog-$name:$IMAGE_TAG"

  echo ""
  echo "  📦  Building: $image"
  docker build -t "$image" "$ctx"

  echo "  🚀  Pushing:  $image"
  docker push "$image"

  echo "  ✅  $name done"
}

echo ""
echo "============================================================"
echo "  DevLog — Docker Build & Push"
echo "  Docker Hub User : $DOCKER_USER"
echo "  Tag             : $IMAGE_TAG"
echo "============================================================"

if [ "$TARGET_SERVICE" = "all" ] || [ "$TARGET_SERVICE" = "backend" ]; then
  build_and_push "backend" "$PROJECT_ROOT/backend"
fi

if [ "$TARGET_SERVICE" = "all" ] || [ "$TARGET_SERVICE" = "frontend" ]; then
  build_and_push "frontend" "$PROJECT_ROOT/frontend"
fi

echo ""
echo "  All images pushed successfully!"
echo ""
