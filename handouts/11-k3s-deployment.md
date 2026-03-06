# 11 — K3s Deployment (Kubernetes + Helm)

## What Is Kubernetes?

Kubernetes (K8s) is an **orchestrator** — it manages containers at scale:
- Restarts crashed containers
- Scales pods up and down based on CPU load (HPA)
- Routes traffic (Services, Ingress)
- Manages configuration and secrets

**k3s** is a lightweight Kubernetes distribution by Rancher. It has the full K8s API but is packaged in a single ~60MB binary — perfect for learning, edge, and local dev.

## Core K8s Objects

| Object | Purpose |
|--------|---------|
| **Pod** | Smallest unit — one or more containers |
| **Deployment** | Manages pod replicas, rolling updates |
| **Service** | Stable network endpoint for a set of pods |
| **ConfigMap** | Non-sensitive config data (env vars) |
| **Secret** | Sensitive data (base64-encoded) |
| **Ingress** | HTTP routing rules (Traefik for k3s) |
| **HPA** | Auto-scales deployments based on CPU/memory |

## What Is Helm?

Helm is the **package manager for Kubernetes**. Instead of writing raw YAML for every environment, you write a template chart and supply different `values.yaml` per environment.

```
Helm Chart (template) + values.yaml → K8s YAML manifests
```

## Our Chart: tdg-service

Located at `deployment/helm/tdg-service/`. It can deploy EITHER the backend OR the frontend — just pass different values:

```
deployment/
├── helm/tdg-service/
│   ├── Chart.yaml            # chart metadata
│   ├── values.yaml           # defaults
│   └── templates/
│       ├── deployment.yaml   # K8s Deployment
│       ├── service.yaml      # K8s Service
│       ├── configmap.yaml    # env vars
│       ├── secret.yaml       # secrets
│       ├── ingress.yaml      # Traefik ingress (optional)
│       └── hpa.yaml          # Auto-scaling (optional)
└── environments/
    ├── dev/
    │   ├── backend.values.yaml
    │   └── frontend.values.yaml
    └── prod/
        ├── backend.values.yaml
        └── frontend.values.yaml
```

## How the Helm Templates Work

The `deployment.yaml` template uses Go templating syntax:

```yaml
# deployment.yaml
spec:
  replicas: {{ .Values.service.replicas }}   # ← from values.yaml
  template:
    spec:
      containers:
        - name: {{ include "tdg-service.name" . }}
          image: {{ .Values.service.image }}
          envFrom:
            - configMapRef:
                name: {{ include "tdg-service.name" . }}-config
            - secretRef:
                name: {{ include "tdg-service.name" . }}-secret
```

When you run `helm upgrade --install ... -f backend.values.yaml`, Helm injects the values and produces valid K8s YAML.

## Deploying Step by Step

### Prerequisites
1. k3s installed: `curl -sfL https://get.k3s.io | sh -`
2. Docker installed and images pushed to Docker Hub
3. `kubectl` and `helm` available

### Step 1: Push Docker images
```bash
export DOCKER_USER=your-dockerhub-username
./deployment/docker-build-push.sh
```

### Step 2: Encode your secrets (base64)
```bash
echo -n "mongodb+srv://..." | base64   # ← paste this into backend.values.yaml
echo -n "your-jwt-secret" | base64
```

### Step 3: Update values files
Edit `deployment/environments/dev/backend.values.yaml`:
```yaml
service:
  image: "your-dockerhub-username/devlog-backend:latest"
secretData:
  MONGODB_URI: "<your-base64-encoded-uri>"
  JWT_SECRET: "<your-base64-encoded-secret>"
```

### Step 4: Deploy
```bash
# From project root:
./deploy.sh --env dev --all          # deploy backend + frontend
./deploy.sh --env dev --service backend  # backend only
./deploy.sh --env dev --all --dry-run   # preview without applying
```

### Step 5: Monitor
```bash
kubectl get pods -n tdg-dev -w
kubectl logs -n tdg-dev deployment/tdg-backend -f
kubectl describe pod <pod-name> -n tdg-dev
```

### Step 6: Access the services
```bash
# For dev (NodePort):
http://<node-ip>:30050  # backend API
http://<node-ip>:30080  # frontend

# Port-forward for local access:
kubectl port-forward svc/tdg-backend 5000:5000 -n tdg-dev &
kubectl port-forward svc/tdg-frontend 8080:80 -n tdg-dev &
```

## Namespaces

Each environment gets its own namespace: `tdg-dev`, `tdg-prod`. Resources are isolated between namespaces:

```bash
kubectl get all -n tdg-dev   # all dev resources
kubectl get all -n tdg-prod  # all prod resources
```

## Horizontal Pod Autoscaler (HPA)

The prod values files enable HPA:

```yaml
# prod/backend.values.yaml
hpa:
  enabled: true
  minReplicas: 2
  maxReplicas: 8
  cpuThreshold: 70   # scale up when CPU > 70%
```

K8s will automatically add pods when load increases and remove them when it drops.

## Health Checks

The Deployment template includes liveness and readiness probes:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 5000
readinessProbe:
  httpGet:
    path: /api/health
    port: 5000
```

Kubernetes calls `GET /api/health` periodically:
- **Liveness**: if it fails, restart the pod
- **Readiness**: if it fails, remove the pod from the load balancer (don't send traffic)

## Tearing Down

```bash
./deployment/teardown.sh --env dev --all    # delete entire tdg-dev namespace
./deployment/teardown.sh --env dev --service backend  # remove just backend
```

## Exercise

1. Run `./deploy.sh --env dev --all --dry-run`. Examine the output. What YAML would be applied?
2. What is the difference between a `ConfigMap` and a `Secret` in Kubernetes? Why can't you just use ConfigMaps for everything?
3. In `deployment/environments/prod/backend.values.yaml`, the service type is `ClusterIP` (not `NodePort`). Why? How does Ingress expose it externally instead?

---

**Next → [12-mongodb-atlas-setup.md](./12-mongodb-atlas-setup.md)**
