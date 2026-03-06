# 00 — Introduction & Learning Path

Welcome to **The Dev Guy** — a beginner-to-advanced full-stack learning project.

## What Is This?

This isn't a hello-world tutorial. It's a real application — **DevLog**, a developer blog platform — where every feature deliberately teaches an essential software concept. You learn by reading the code and the handouts together.

## The Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 18 | Non-blocking I/O, npm ecosystem |
| API | Express.js | Most widely-used Node web framework |
| Database | MongoDB + Mongoose | Document model, flexible schema |
| Auth | JWT + bcryptjs | Industry-standard stateless auth |
| Frontend | React 18 + Vite | Modern component model, huge ecosystem |
| Container | Docker | Reproducible environments |
| Orchestration | k3s + Helm | Production-grade Kubernetes (lightweight) |

## Learning Path

Follow the handouts in order. Each one references actual files in `backend/` and `frontend/` so you can read the code alongside the explanation.

| # | Handout | What You Learn |
|---|---------|----------------|
| 01 | Node Fundamentals | Event loop, modules, async |
| 02 | Express Basics | Routing, middleware, REST |
| 03 | Design Patterns | Repository, Service, Factory, Singleton |
| 04 | MongoDB & Mongoose | Schemas, CRUD, hooks |
| 05 | Authentication & JWT | Sessions vs tokens, bcrypt |
| 06 | React Fundamentals | JSX, props, state |
| 07 | React Hooks | All 8 built-in + custom hooks |
| 08 | React Advanced | Context, reducers, Error Boundaries |
| 09 | API Integration | Axios, interceptors, async patterns |
| 10 | Docker | Containerizing Node + React |
| 11 | K3s Deployment | Helm, k3s, deploy scripts |
| 12 | MongoDB Atlas Setup | Cloud DB from scratch |

## Setup (Do This First)

### 1. Set up MongoDB Atlas
→ Follow [12-mongodb-atlas-setup.md](./12-mongodb-atlas-setup.md) completely before anything else.

### 2. Configure environment
```bash
# In the project root:
cp .env.example .env
# Edit .env and paste your MONGODB_URI
```

### 3. Start the backend
```bash
./start-backend.sh
```

### 4. Start the frontend (in another terminal)
```bash
./start-frontend.sh
```

### 5. Open the app
```
http://localhost:5173
```

## Project Structure

```
the-dev-guy/
├── backend/      # Node.js + Express API (start here)
├── frontend/     # React + Vite SPA
├── deployment/   # K3s + Helm (read last)
└── handouts/     # You are here
```

---

**Next → [01-node-fundamentals.md](./01-node-fundamentals.md)**
