# 01 — Node.js Fundamentals

## What Is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's V8 engine. It lets you run JavaScript outside the browser — on servers, CLIs, scripts.

**Key insight**: Node.js is single-threaded but non-blocking. It handles thousands of concurrent connections not by spawning threads, but by using an **event loop**.

## The Event Loop

```
   ┌─────────────────────────────┐
   │         Event Loop          │
   │                             │
   │  timers   → setTimeout      │
   │  poll     → I/O callbacks   │
   │  check    → setImmediate    │
   │  close    → socket.close    │
   └─────────────────────────────┘
```

When Node.js reads a file or queries MongoDB, it **does not wait**. It registers a callback and moves on. When the I/O completes, the callback is placed on the queue and executed.

## Modules: CommonJS vs ESM

This project uses **CommonJS** (the default in Node.js):

```js
// CommonJS — require/module.exports
const express = require('express');
module.exports = { createApp };
```

The frontend uses **ES Modules** (Vite/React):
```js
// ESM — import/export
import axios from 'axios';
export function useFetch() { ... }
```

## Async Patterns

### 1. Callbacks (legacy, avoid in new code)
```js
fs.readFile('config.json', (err, data) => {
  if (err) throw err;
  console.log(data.toString());
});
```

### 2. Promises
```js
fetch('http://api.example.com')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### 3. async/await (use this — clearest syntax)
```js
async function getUser() {
  try {
    const res = await fetch('http://api.example.com/user');
    const user = await res.json();
    return user;
  } catch (err) {
    console.error(err);
  }
}
```

In this project, **every service and repository method is async/await**. Look at:
- [`backend/src/modules/auth/auth.service.js`](../backend/src/modules/auth/auth.service.js)
- [`backend/src/modules/posts/posts.repository.js`](../backend/src/modules/posts/posts.repository.js)

## Environment Variables

Never hardcode secrets. Use `process.env`:

```js
const port = process.env.PORT || 5000;
const secret = process.env.JWT_SECRET; // reads from .env via dotenv
```

In this project, all env vars are centralized in:
- [`backend/src/config/env.js`](../backend/src/config/env.js) — Singleton that validates ALL vars at startup

## process Object

Node.js exposes a global `process` object:
```js
process.env.NODE_ENV   // 'development' | 'production'
process.exit(1)        // exit with error code
process.on('SIGINT', cleanup) // Ctrl+C handler
```

See this in action in [`backend/src/config/database.js`](../backend/src/config/database.js).

## package.json & npm

`package.json` is the manifest for your Node project:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"   ← hot reload in development
  },
  "dependencies": { ... },         ← production packages
  "devDependencies": { ... }       ← only for development
}
```

## Exercise

1. Open `backend/src/server.js` — find where `process.on('unhandledRejection', ...)` is used. Why is this important?
2. In `backend/src/config/env.js`, what happens if `MONGODB_URI` is not set?
3. Can you find an example of `process.exit(1)` in the codebase? In what situation does it run?

---

**Next → [02-express-basics.md](./02-express-basics.md)**
