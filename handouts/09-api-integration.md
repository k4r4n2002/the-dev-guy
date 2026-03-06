# 09 — API Integration: Axios & Async Patterns

## Why Axios Over fetch?

`fetch` is the browser's built-in HTTP client. It works, but:
- Doesn't throw on 4xx/5xx errors (you must check `response.ok` manually)
- No request/response interceptors
- No automatic JSON parsing

Axios handles all of this elegantly.

## Creating an Axios Instance

```js
// frontend/src/api/client.js
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});
```

By using a shared instance, all API calls go through the same config.

## Request Interceptors

Runs before every outgoing request — perfect for attaching authentication:

```js
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devlog_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // MUST return config
  },
  (error) => Promise.reject(error)
);
```

Every call to `postsApi.getAll()` or `authApi.login()` automatically gets the `Authorization` header — you never write it manually.

## Response Interceptors

Runs after every response — perfect for error normalization:

```js
apiClient.interceptors.response.use(
  (response) => response.data, // ← return only the data, not the full Axios response object
  (error) => {
    if (error.response?.status === 401) {
      // Token expired/invalid → force logout
      localStorage.removeItem('devlog_token');
      window.dispatchEvent(new CustomEvent('auth:logout')); // → AuthContext listens for this
    }
    return Promise.reject(new Error(error.response?.data?.message || error.message));
  }
);
```

This is why in `AuthContext.jsx` we have:
```js
window.addEventListener('auth:logout', handleForceLogout);
```

The Axios interceptor and the React Context communicate via a custom browser event — a clean way to cross the JS/React boundary.

## Typed API Endpoint Helpers

Instead of writing `apiClient.post('/posts', data)` everywhere, we group endpoints:

```js
export const postsApi = {
  getAll: (params) => apiClient.get('/posts', { params }),
  getOne: (id) => apiClient.get(`/posts/${id}`),
  create: (data) => apiClient.post('/posts', data),
  toggleLike: (id) => apiClient.post(`/posts/${id}/like`),
};

// Usage in components:
const res = await postsApi.getAll({ page: 1, search: 'react' });
const post = await postsApi.create({ title, content, tags });
```

## Async Patterns in Components

### Pattern 1: useEffect + useState (manual)
```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  postsApi.getAll().then(res => setData(res.data)).finally(() => setLoading(false));
}, []);
```

### Pattern 2: useFetch (abstracted, preferred)
```jsx
const { data, loading, error, refetch } = useFetch(() => postsApi.getAll({ page }), [page]);
```

### Pattern 3: Parallel requests (fastest)
```jsx
// Fetch post AND comments at the same time — not sequentially
const [postRes, commentsRes] = await Promise.all([
  postsApi.getOne(id),
  commentsApi.getByPost(id),
]);
```

Used in `PostDetailPage.jsx` to avoid waterfall loading.

## Error Handling Strategy

```jsx
// Component level:
try {
  await authApi.login(credentials);
} catch (err) {
  setError(err.message); // the interceptor already normalized this to a string
}

// Or with useFetch, errors surface directly:
const { error } = useFetch(...);
if (error) return <ErrorMessage message={error} />;
```

## Loading States & UX

Always show users what's happening:

```jsx
// Skeleton loading (better UX than a spinner)
{loading ? (
  <div className="skeleton" style={{ height: 200 }} />
) : (
  <PostCard post={post} />
)}

// Button loading state
<button disabled={submitting}>
  {submitting ? 'Saving…' : 'Save Post'}
</button>
```

## Environment Variables in the Frontend

Vite exposes env vars prefixed with `VITE_` to the browser bundle:

```
# .env
VITE_API_BASE_URL=http://localhost:5000/api
```

```js
// In code:
const base = import.meta.env.VITE_API_BASE_URL;
```

**Important**: Never put secrets in frontend env vars — they are compiled into the JS bundle and visible to anyone who inspects the source.

## Exercise

1. Open `frontend/src/api/client.js`. The response interceptor does `return response.data`. What shape does this return? What would `response.data.data` be?
2. In `PostDetailPage.jsx`, find the `Promise.all` call. What happens to performance if you make the two requests sequentially instead (one awaits before the other starts)?
3. The `auth:logout` custom event bridges Axios and React Context. Can you think of another way to achieve the same result?

---

## ⚠️ Dev vs Production: The Vite Proxy

This trips up almost every beginner, so read this carefully.

In development, your Axios client sends requests to `http://localhost:5000/api`. But when you open DevTools → Network, you'll see requests going to **`http://localhost:5173/api`** — the same port as the frontend!

**Why?** Because Vite's dev server acts as a proxy. Look at `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',  // forward to the Express backend
      changeOrigin: true,
    },
  },
},
```

Any request to `localhost:5173/api/*` is silently forwarded by Vite to `localhost:5000/api/*`. The browser never makes a cross-origin request, so **CORS is not involved at all in development**.

```
Browser → localhost:5173/api/posts  (same origin, no CORS)
              ↓
         Vite dev server proxies to:
              ↓
         localhost:5000/api/posts    (Node.js/Express)
```

**In production**, the frontend is served from nginx on port 80 and the backend lives on a different server or pod. Now they ARE different origins, so the `cors()` middleware in `app.js` becomes critical.

**The rule of thumb:**
- CORS config in `app.js` → matters in production
- Vite proxy in `vite.config.js` → only relevant in development

This is also why `VITE_API_BASE_URL` in the dev `.env` is set to `http://localhost:5000/api` but the Vite config proxy intercepts it before it ever leaves the browser.

---

**Next → [10-docker.md](./10-docker.md)**
