#!/bin/bash
# =============================================================================
# deployment/deploy.sh — Master Deployment Script for DevLog (The Dev Guy)
#
# Usage:
#   ./deployment/deploy.sh --env dev --all            # Deploy all services
#   ./deployment/deploy.sh --env dev --service backend  # Deploy backend only
#   ./deployment/deploy.sh --env prod --service frontend
#   ./deployment/deploy.sh --env dev --all --dry-run  # Dry run
#
# Namespace strategy: tdg-<env> (e.g., tdg-dev, tdg-prod)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELM_CHART="$SCRIPT_DIR/helm/tdg-service"

ALL_SERVICES=(backend frontend)

# ── Argument parsing ──────────────────────────────────────────────────────────
TARGET_ENV=""
TARGET_SERVICE=""
DEPLOY_ALL=false
DRY_RUN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)       TARGET_ENV="$2"; shift 2 ;;
    --service)   TARGET_SERVICE="$2"; shift 2 ;;
    --all)       DEPLOY_ALL=true; shift ;;
    --dry-run)   DRY_RUN="--dry-run"; shift ;;
    -h|--help)
      echo "Usage: $0 --env <env> [--service <name> | --all] [--dry-run]"
      echo ""
      echo "Services: backend, frontend"
      echo "Envs:     dev, prod"
      echo ""
      echo "Examples:"
      echo "  $0 --env dev --all"
      echo "  $0 --env prod --service backend"
      echo "  $0 --env dev --all --dry-run"
      exit 0
      ;;
    *) echo "Unknown argument: $1"; exit 1 ;;
  esac
done

if [ -z "$TARGET_ENV" ]; then
  echo "Error: --env is required"; exit 1
fi

if [ "$DEPLOY_ALL" = false ] && [ -z "$TARGET_SERVICE" ]; then
  echo "Error: specify --all or --service <name>"; exit 1
fi

# ── Config ────────────────────────────────────────────────────────────────────
NAMESPACE="tdg-$TARGET_ENV"
ENV_DIR="$SCRIPT_DIR/environments/$TARGET_ENV"

if [ ! -d "$ENV_DIR" ]; then
  echo "Error: Environment directory not found: $ENV_DIR"; exit 1
fi

echo ""
echo "============================================================"
echo "  The Dev Guy — K3s Helm Deployment"
echo "  Environment  : $TARGET_ENV"
echo "  Namespace    : $NAMESPACE"
if [ "$DEPLOY_ALL" = true ]; then
  echo "  Target       : ALL SERVICES (${ALL_SERVICES[*]})"
else
  echo "  Target       : $TARGET_SERVICE"
fi
[ -n "$DRY_RUN" ] && echo "  Mode         : DRY RUN (no changes)"
echo "============================================================"
echo ""

# ── Create namespace ──────────────────────────────────────────────────────────
if [ -z "$DRY_RUN" ]; then
  if ! kubectl get namespace "$NAMESPACE" &>/dev/null; then
    echo "Creating namespace: $NAMESPACE"
    kubectl create namespace "$NAMESPACE"
  fi
fi

# ── Deploy a single service ───────────────────────────────────────────────────
deploy_service() {
  local svc="$1"
  local values_file="$ENV_DIR/$svc.values.yaml"

  if [ ! -f "$values_file" ]; then
    echo "  ✗ Skipping $svc — no values file at $values_file"
    return 1
  fi

  echo "  Deploying: $svc"
  echo "  Values:    $values_file"

  helm upgrade --install "$svc" "$HELM_CHART" \
    --namespace "$NAMESPACE" \
    --create-namespace \
    -f "$values_file" \
    --timeout 300s \
    $DRY_RUN

  echo "  ✅  $svc deployed"
  echo ""
}

# ── Execution ────────────────────────────────────────────────────────────────
if [ "$DEPLOY_ALL" = true ]; then
  for svc in "${ALL_SERVICES[@]}"; do
    deploy_service "$svc"
  done
else
  deploy_service "$TARGET_SERVICE"
fi

echo "============================================================"
if [ -z "$DRY_RUN" ]; then
  echo "  ✅  Deployment initiated!"
  echo "  Monitor with:"
  echo "    kubectl get pods -n $NAMESPACE -w"
  echo "  Access backend (dev):"
  echo "    kubectl port-forward svc/tdg-backend 5000:5000 -n $NAMESPACE"
  echo "  Access frontend (dev):"
  echo "    kubectl port-forward svc/tdg-frontend 8080:80 -n $NAMESPACE"
else
  echo "  Dry run completed. No changes were made."
fi
echo "============================================================"
echo ""
