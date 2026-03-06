# ── Backend Dockerfile ────────────────────────────────────────────────────────
# Multi-stage-ready single stage for Node.js API
#
# Stage: production
#   - Uses the official Node 18 Alpine image (tiny, ~5MB vs ~800MB full)
#   - Installs only production dependencies (no nodemon etc.)
#   - Runs as a non-root user for security
#
# Usage:
#   docker build -t devlog-backend:latest .
#   docker run -p 5000:5000 --env-file .env devlog-backend:latest

FROM node:18-alpine

# Add non-root user for security (principle of least privilege)
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy dependency manifests first (layer caching — npm install only reruns when package.json changes)
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY src/ ./src/

# Change ownership of the app directory to the non-root user
RUN chown -R app:app /app

USER app

# Expose the port the server listens on (informational — doesn't publish it)
EXPOSE 5000

# Health check — used by Docker and Kubernetes to determine container health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
