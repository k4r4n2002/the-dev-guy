# 10 — Docker: Containerizing Your Application

## What Is Docker?

Docker packages your application and ALL its dependencies into a **container** — an isolated, reproducible unit that runs identically everywhere: your laptop, a CI server, a Kubernetes cluster.

```
Without Docker:
  "It works on my machine" → broken on staging (different Node version, different env)

With Docker:
  Build once → run anywhere
```

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Image** | A snapshot of your app (read-only blueprint) |
| **Container** | A running instance of an image |
| **Dockerfile** | Instructions to build an image |
| **Registry** | Storage for images (Docker Hub, ECR, GCR) |
| **Layer** | Each Dockerfile instruction adds a cached layer |

## The Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine                          # Tiny Alpine base (~5MB vs 800MB)

RUN addgroup -S app && adduser -S app -G app # Non-root user (security)

WORKDIR /app

COPY package.json package-lock.json* ./      # Copy manifests FIRST

RUN npm ci --omit=dev                        # Install ONLY production deps

COPY src/ ./src/                             # Copy source AFTER deps (layer cache)

RUN chown -R app:app /app
USER app                                     # Drop to non-root

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
```

**Why copy `package.json` before `src/`?**
Docker caches layers. If you copy everything at once, ANY source change invalidates the `npm install` cache — even if `package.json` didn't change. Copying manifests first means `npm ci` only reruns when dependencies change.

## The Frontend Dockerfile (Multi-Stage)

```dockerfile
# frontend/Dockerfile
# ── Stage 1: Build ────────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build                            # Produces /app/dist

# ── Stage 2: Serve ────────────────────────────────────────
FROM nginx:1.25-alpine                       # Tiny nginx image
COPY nginx.conf /etc/nginx/conf.d/
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

The final image has **zero Node.js**. Only the compiled static files and nginx. This is a multi-stage build — each `FROM` is a stage, and only the last one becomes the final image.

## Building & Running Locally

```bash
# Build backend image
docker build -t devlog-backend:latest ./backend

# Run it (flags explained below)
docker run \
  -p 5000:5000 \                    # host:container port mapping
  --env-file ./backend/.env \       # load env vars from file
  --name devlog-api \               # give it a name
  devlog-backend:latest

# Build & run frontend
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:5000/api \
  -t devlog-frontend:latest ./frontend

docker run -p 8080:80 devlog-frontend:latest
```

## The nginx.conf for React Router

Without this config, refreshing `/posts/abc123` returns a 404 from nginx (no such file):

```nginx
location / {
  try_files $uri $uri/ /index.html;  # ← Always fall back to index.html
}
```

React Router handles routing in JavaScript — nginx just needs to serve `index.html` for every URL.

## Docker Build & Push Script

```bash
# Build and push both images to Docker Hub
./deployment/docker-build-push.sh

# Only backend, custom tag
DOCKER_USER=karandh IMAGE_TAG=v1.0.0 ./deployment/docker-build-push.sh --service backend
```

The script reads `DOCKER_USER` and `IMAGE_TAG` from your environment — fully configurable without touching the script.

## .dockerignore

Like `.gitignore` but for Docker builds. Without it, `node_modules/` (hundreds of MB) gets sent to the Docker daemon on every build:

```
node_modules/
.env
dist/
*.log
```

## Exercise

1. Run `docker build -t devlog-backend:latest ./backend` in the terminal. Watch the layers being built. Then run it again — which steps are cached?
2. After the multi-stage build, run `docker images devlog-frontend:latest`. How large is the image compared to `node:18`?
3. In the nginx config, what does `try_files $uri $uri/ /index.html` mean? What happens without it when you refresh `/profile`?

---

**Next → [11-k3s-deployment.md](./11-k3s-deployment.md)**
