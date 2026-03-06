# 02 — Express.js Basics

## What Is Express?

Express is a minimal, _unopinionated_ web framework for Node.js. It wraps Node's built-in `http` module and adds:
- **Routing** — match HTTP methods and paths to handlers
- **Middleware** — modify requests/responses in a pipeline
- **Error handling** — centralised 4-argument handler

## The Middleware Pipeline

Every incoming request flows through a chain of middleware functions. Each middleware receives `(req, res, next)` and either:
- Calls `next()` to pass control downstream
- Calls `res.json(...)` to send a response and end the chain

```
Request → helmet → cors → morgan → routes → controller → response
                                         ↘ error middleware (if thrown)
```

See this configured in: [`backend/src/app.js`](../backend/src/app.js) — the **Factory Function** that builds the Express app.

## Routing

```js
const router = express.Router();

// HTTP method + path + handler(s)
router.get('/posts',    controller.getAll);
router.post('/posts',   authenticate, validate(schema), controller.create);
router.put('/posts/:id', authenticate, controller.update);
router.delete('/posts/:id', authenticate, controller.remove);
```

Route parameters (`:id`) are accessed via `req.params.id`.
Query strings (`?page=2&limit=10`) are at `req.query.page`.
Request body JSON is at `req.body` (after `express.json()` middleware).

## Writing Middleware

```js
// A middleware function:
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next(); // MUST call next() or the request hangs!
}

app.use(logger); // apply globally
router.get('/me', authenticate, handler); // apply per-route
```

**Our middleware files:**
- [`backend/src/middleware/auth.middleware.js`](../backend/src/middleware/auth.middleware.js) — JWT verify
- [`backend/src/middleware/validate.middleware.js`](../backend/src/middleware/validate.middleware.js) — Joi validation factory
- [`backend/src/middleware/error.middleware.js`](../backend/src/middleware/error.middleware.js) — Centralised error handler

## Error Handling

Express has a special 4-argument middleware that catches errors:

```js
// Error middleware — MUST be registered LAST
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, message: err.message });
});
```

We throw errors anywhere and Express routes them to this handler:
```js
// In any route or service:
throw new ApiError(404, 'Post not found');
```

The `express-async-errors` package patches async routes so thrown errors are automatically forwarded — no try/catch needed in controllers.

## REST API Design

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/posts` | List all posts (paginated) |
| GET | `/api/posts/:id` | Get one post |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post (full replace) |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/posts/:id/like` | Toggle like (action endpoint) |
| GET | `/api/health` | Health check (for Kubernetes probes) |

## Security Headers

The `helmet` package sets security headers with one line:
```js
app.use(helmet()); // Sets X-Content-Type-Options, X-Frame-Options, CSP, etc.
```

## CORS

CORS (Cross-Origin Resource Sharing) controls which frontends can call the API:
```js
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));
```

Without this, the browser blocks calls from `localhost:5173` to `localhost:5000`.

## Exercise

1. Open [`backend/src/app.js`](../backend/src/app.js) — in what order are the middleware applied? Why does the error middleware go last?
2. In [`backend/src/modules/posts/posts.routes.js`](../backend/src/modules/posts/posts.routes.js), which routes require authentication? Which don't?
3. What happens if you remove `express-async-errors` from `app.js`? Try throwing an error in a route and see what happens.

---

**Next → [03-design-patterns.md](./03-design-patterns.md)**
