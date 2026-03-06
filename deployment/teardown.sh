#!/bin/bash
# =============================================================================
# deployment/teardown.sh — Remove all DevLog K3s resources
#
# Usage:
#   ./deployment/teardown.sh --env dev
#   ./deployment/teardown.sh --env dev --service backend
#   ./deployment/teardown.sh --env dev --all   (removes entire namespace)
# =============================================================================

set -euo pipefail

TARGET_ENV=""
TARGET_SERVICE=""
REMOVE_ALL=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)     TARGET_ENV="$2"; shift 2 ;;
    --service) TARGET_SERVICE="$2"; shift 2 ;;
    --all)     REMOVE_ALL=true; shift ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

if [ -z "$TARGET_ENV" ]; then echo "Error: --env required"; exit 1; fi

NAMESPACE="tdg-$TARGET_ENV"

echo ""
echo "============================================================"
echo "  ⚠️  TEARDOWN — The Dev Guy"
echo "  Environment : $TARGET_ENV"
echo "  Namespace   : $NAMESPACE"
echo "============================================================"

if [ "$REMOVE_ALL" = true ]; then
  read -r -p "Delete entire namespace '$NAMESPACE'? This is irreversible. (yes/no) " confirm
  if [ "$confirm" = "yes" ]; then
    kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
    echo "  ✅  Namespace '$NAMESPACE' deleted."
  else
    echo "  Aborted."
  fi
elif [ -n "$TARGET_SERVICE" ]; then
  echo "  Uninstalling Helm release: $TARGET_SERVICE"
  helm uninstall "$TARGET_SERVICE" --namespace "$NAMESPACE" 2>/dev/null || echo "  (Release not found — skipping)"
  echo "  ✅  $TARGET_SERVICE removed."
else
  echo "Error: specify --all or --service <name>"
  exit 1
fi
echo ""
