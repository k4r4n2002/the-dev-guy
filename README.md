# 🧑‍💻 The Dev Guy — Full-Stack Learning Project

A **beginner-to-advanced** guide to building real-world software with **Node.js**, **Express**, **React**, **MongoDB**, **Docker**, and **k3s (Kubernetes)**.

---

## 🎯 What You're Building

**DevLog** — a developer blog platform where users can:
- Register & log in (JWT authentication)
- Write, edit, and delete posts (with tags & markdown)
- Comment on posts
- Like and unlike posts

This isn't a toy app. It's a production-ready codebase that deliberately uses real-world patterns so you learn **how** and **why** things are done.

---

## 📚 Learning Path (Read Handouts in Order)

| Step | Handout | Topic |
|------|---------|-------|
| 0 | [Introduction](./handouts/00-introduction.md) | Project overview & setup |
| 1 | [Node Fundamentals](./handouts/01-node-fundamentals.md) | Event loop, modules, async/await |
| 2 | [Express Basics](./handouts/02-express-basics.md) | Routing, middleware, REST APIs |
| 3 | [Design Patterns](./handouts/03-design-patterns.md) | Repository, Service Layer, Factory, Singleton |
| 4 | [MongoDB & Mongoose](./handouts/04-mongodb-mongoose.md) | Schemas, CRUD, hooks, aggregation |
| 5 | [Authentication & JWT](./handouts/05-authentication-jwt.md) | JWT, bcrypt, protected routes |
| 6 | [React Fundamentals](./handouts/06-react-fundamentals.md) | JSX, components, props, state |
| 7 | [React Hooks](./handouts/07-react-hooks.md) | All built-in hooks + custom hooks |
| 8 | [React Advanced](./handouts/08-react-advanced.md) | Context, reducers, performance |
| 9 | [API Integration](./handouts/09-api-integration.md) | Axios, interceptors, async patterns |
| 10 | [Docker](./handouts/10-docker.md) | Containerizing Node & React apps |
| 11 | [K3s Deployment](./handouts/11-k3s-deployment.md) | Helm charts, k3s, CI/CD |
| 12 | [MongoDB Atlas Setup](./handouts/12-mongodb-atlas-setup.md) | Cloud MongoDB setup guide |

---

## 📁 Project Structure

```
the-dev-guy/
├── backend/        # Node.js + Express REST API
├── frontend/       # React + Vite SPA
├── deployment/     # K3s + Helm charts
├── handouts/       # Markdown learning guides
├── start-backend.sh
├── start-frontend.sh
├── deploy.sh
└── .env.example
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Docker (optional, for containerized run)
- k3s (optional, for Kubernetes deployment)

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env — at minimum, set MONGODB_URI to your MongoDB Atlas URL
# See handouts/12-mongodb-atlas-setup.md for the Atlas setup guide
```

### 2. Start Backend
```bash
./start-backend.sh
# API available at http://localhost:5000
```

### 3. Start Frontend
```bash
./start-frontend.sh
# App available at http://localhost:5173
```

### 4. Deploy to K3s
```bash
./deploy.sh --env dev --all
```

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| API Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Authentication | JWT + bcryptjs |
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (Design tokens) |
| Containerization | Docker |
| Orchestration | k3s + Helm |

---

## 📖 Best Practices Demonstrated

- **Repository Pattern** — database queries abstracted from business logic
- **Service Layer** — business logic separated from HTTP handling
- **Factory Function** — Express app created via `createApp()` (testable)
- **Singleton** — config and DB connection instantiated once
- **Custom Error Classes** — typed errors with HTTP status codes
- **Standardized API Responses** — consistent `{ success, data, message }` shape
- **React Error Boundaries** — graceful UI error handling
- **Abort Controllers** — proper `useEffect` cleanup preventing memory leaks

---

## 🌐 Environment Variables

See [`.env.example`](./.env.example) for the full list of configurable variables.

---

*Happy learning! 🎉*
