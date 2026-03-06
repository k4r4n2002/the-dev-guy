# ── Frontend Dockerfile (Multi-stage) ─────────────────────────────────────────
#
# Stage 1: BUILD — uses Node 18 to install deps and run `npm run build`
# Stage 2: SERVE — copies compiled assets to nginx:alpine (~25MB)
#
# Multi-stage build benefits:
#   - Final image contains ZERO Node.js / npm — tiny attack surface
#   - Only static HTML/JS/CSS files served by nginx
#
# Usage:
#   docker build -t devlog-frontend:latest .
#   docker run -p 80:80 devlog-frontend:latest

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Layer cache: install dependencies before copying source
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .

# Vite reads VITE_ env vars at BUILD TIME.
# Pass them via --build-arg in docker build
ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_APP_NAME=DevLog
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine

# Remove default nginx page
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
