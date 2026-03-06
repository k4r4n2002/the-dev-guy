# 08 — React Advanced: Context, Custom Hooks & Performance

## Custom Hooks

The real power of hooks: you can **compose** them into your own reusable logic. A custom hook is just a function that starts with `use` and calls other hooks.

```jsx
// Bad: copy-paste this data-fetching logic in 5 components
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => { fetchData().then(setData).finally(() => setLoading(false)); }, []);

// Good: extract once, reuse everywhere
const { data, loading, error } = useFetch(() => postsApi.getAll({ page }), [page]);
```

All custom hooks in this project live in `frontend/src/hooks/`:

| Hook | Composes | Purpose |
|------|---------|---------|
| `useFetch` | useState, useEffect, useCallback, useRef | Data fetching + abort |
| `useDebounce` | useState, useEffect | Delayed input handling |
| `useLocalStorage` | useState, useCallback | Persistent state |
| `usePagination` | useState, useMemo | Page controls |
| `useToast` | useReducer, useCallback, useRef | Notification queue |
| `useIntersectionObserver` | useRef, useEffect, useState | Viewport detection |

---

## React Context API

Context solves "prop drilling" — passing props through many layers just to get data to a deeply nested component.

```
Without Context (prop drilling):
App → Layout → Sidebar → UserMenu → Avatar (needs user)
                  ↑ every component passes user prop even if it doesn't use it

With Context:
App (AuthProvider)
  └── Avatar → useAuth() → gets user directly
```

**Creating a full Context:**

```jsx
// 1. Create
const AuthContext = createContext(null);

// 2. Provider (in AuthContext.jsx)
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const value = { user: state.user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Consumer custom hook (guards against usage outside provider)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

See the full implementation: [`frontend/src/context/AuthContext.jsx`](../frontend/src/context/AuthContext.jsx)

---

## useReducer for State Machines

When a piece of state has multiple related sub-values and defined transitions, `useReducer` beats multiple `useState`:

```jsx
// Auth state has 4 possible statuses: idle, loading, authenticated, unauthenticated
// useState version (messy, can have invalid combinations):
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
const [authenticated, setAuthenticated] = useState(false);

// useReducer version (valid states only):
const [state, dispatch] = useReducer(authReducer, { status: 'idle', user: null });
// state.status is ALWAYS one of the 4 valid values — impossible to be
// { loading: true, authenticated: true } simultaneously
```

---

## AbortController — Preventing Memory Leaks

When a component unmounts before a fetch completes, updating its state causes a React warning (and can be a memory leak).

```jsx
// useFetch.js — the RIGHT way
useEffect(() => {
  const controller = new AbortController();

  fetchFn({ signal: controller.signal })  // pass signal to axios
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err.message);
    });

  return () => controller.abort(); // ← cleanup: cancel on unmount
}, [fetchFn]);
```

---

## Performance Patterns

### When to use useMemo
- Expensive computations (sort, filter, aggregate large arrays)
- Object created in render passed to children (prevents reference change → no re-render)

```jsx
// Without useMemo: new array created every render → child re-renders even if posts hasn't changed
const filtered = posts.filter(p => p.tags.includes(selectedTag));

// With useMemo: stable reference, only recomputes when posts or selectedTag changes
const filtered = useMemo(() => posts.filter(p => p.tags.includes(selectedTag)), [posts, selectedTag]);
```

### When to use useCallback
- Function passed as prop to a memoized child component
- Function used as a `useEffect` dependency

```jsx
// Without useCallback: new function reference every render → useEffect reruns every render
useEffect(() => { fetchPosts(); }, [fetchPosts]); // BAD if fetchPosts is not memoized

// With useCallback: stable reference → useEffect only reruns when deps change
const fetchPosts = useCallback(() => { ... }, [page, debouncedSearch]);
useEffect(() => { fetchPosts(); }, [fetchPosts]); // GOOD
```

### Common Mistake: Stale Closures
```jsx
// BAD: setCount refers to `count` at the time the function was created
const increment = () => setCount(count + 1);

// GOOD: functional update always has the latest state
const increment = () => setCount(prev => prev + 1);
```

---

## Protected Routes (React Router v6)

```jsx
// ProtectedRoute.jsx
function ProtectedRoute() {
  const { isAuthenticated, status } = useAuth();
  if (status === 'idle') return null; // Wait for session restore from localStorage
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// In App.jsx:
<Route element={<ProtectedRoute />}>
  <Route path="/create" element={<CreatePostPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>
```

`<Outlet />` renders the matched child route. If not authenticated, `<Navigate replace>` redirects without adding to history.

---

## Exercise

1. In `useFetch.js`, what is `abortControllerRef.current`? Why a `ref` and not a `state`?
2. Open `AuthContext.jsx`. The `login` function dispatches `AUTH_ACTIONS.LOADING` before calling the API. Why? What would the user see if we removed that dispatch?
3. In `ProtectedRoute.jsx`, why do we return `null` when `status === 'idle'`? What would happen if we returned `<Navigate to="/login" />` instead?

---

**Next → [09-api-integration.md](./09-api-integration.md)**
