# 07 — React Hooks (Deep Dive)

## What Are Hooks?

Hooks are functions that "hook into" React's internal state and lifecycle. They always start with `use`. They can only be called at the **top level** of a function component (never inside ifs, loops, or nested functions).

---

## useState — Local Component State

```jsx
const [value, setValue] = useState(initialValue);
setValue('new value');           // triggers re-render
setValue(prev => prev + 1);      // functional update (safe for async)
```

**Where used:** Every form page, `PostCard` (like loading state), `FeedPage` (posts, loading, error).

---

## useEffect — Side Effects & Synchronization

Runs after render. Used for: data fetching, subscriptions, DOM mutations.

```jsx
useEffect(() => {
  // Runs after every render where [deps] changed
  fetchPosts();

  return () => {
    // Cleanup: runs before next effect OR on unmount
    cancelRequest();
  };
}, [page, search]); // ← dependency array
```

**Dependency array rules:**
- `[]` — run once on mount
- `[value]` — run when `value` changes
- No array — run after every render (usually wrong)

**Where used:** `FeedPage`, `PostDetailPage`, `useFetch`, `useDebounce`.

---

## useRef — Mutable Reference Without Re-renders

`useRef` gives you a box (`{ current: value }`) that persists across renders without causing them.

```jsx
const inputRef = useRef(null);

// Access DOM element directly
inputRef.current.focus();

// Store mutable values without triggering re-renders
const countRef = useRef(0);
countRef.current += 1; // doesn't re-render
```

**Where used:**
- `PostDetailPage`: `commentsRef` for scroll-to-comments anchor
- `useFetch`: `abortControllerRef` for the AbortController (no renders)
- `useToast`: `timerRef` for auto-dismiss setTimeout IDs

---

## useContext — Global State Without Prop Drilling

```jsx
// 1. Create the context
const AuthContext = createContext(null);

// 2. Wrap your tree with Provider
<AuthContext.Provider value={{ user, login, logout }}>
  {children}
</AuthContext.Provider>

// 3. Consume anywhere in the tree
const { user, isAuthenticated } = useContext(AuthContext);
```

**Where used:** `AuthContext.jsx` wraps the entire app. `Navbar`, `PostCard`, `ProtectedRoute`, and all pages consume it via the `useAuth()` custom hook.

---

## useReducer — Complex State Machines

When state has multiple sub-states and transitions, `useReducer` is clearer than multiple `useState` calls:

```jsx
function authReducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { ...state, status: 'loading' };
    case 'LOGIN_SUCCESS': return { status: 'authenticated', user: action.payload };
    case 'LOGOUT': return { status: 'unauthenticated', user: null };
    default: return state;
  }
}

const [state, dispatch] = useReducer(authReducer, initialState);
dispatch({ type: 'LOGIN_SUCCESS', payload: user });
```

**Where used:** `AuthContext.jsx` (auth state machine), `useToast.js` (toast queue).

---

## useCallback — Memoize Functions

Returns a memoized function that only changes when its dependencies change. Prevents unnecessary re-renders of children that receive the function as a prop.

```jsx
const handleLike = useCallback(async () => {
  await postsApi.toggleLike(post._id);
  onLikeToggle?.(post._id);
}, [post._id, onLikeToggle]); // only recreated when these change
```

**Where used:** `PostCard` (like handler), `FeedPage` (fetchPosts), `CreatePostPage` (handleSubmit), `AuthContext` (login, register, logout).

---

## useMemo — Memoize Computed Values

Returns a memoized value that only recomputes when dependencies change. Avoids expensive recalculation on every render.

```jsx
// Only recomputes when posts changes
const stats = useMemo(() => ({
  totalLikes: posts.reduce((sum, p) => sum + p.likeCount, 0),
}), [posts]);

// Only recomputes when formData.title changes
const titleRemaining = useMemo(() => 150 - formData.title.length, [formData.title]);
```

**Where used:** `FeedPage` (stats), `usePagination` (derived pagination values), `CreatePostPage` (character count).

---

## useLayoutEffect — Synchronous DOM reads

Like `useEffect` but fires **synchronously** after DOM updates and **before** the browser paints. Use when you need to read layout/size to avoid visual flicker.

```jsx
const avatarRef = useRef(null);
const [size, setSize] = useState({ width: 0, height: 0 });

useLayoutEffect(() => {
  if (avatarRef.current) {
    // Read immediately after DOM mutation, before paint
    setSize({ width: avatarRef.current.offsetWidth });
  }
}, [user]);
```

**Where used:** `ProfilePage.jsx` — measures the avatar element size.

---

## Hook Summary Table

| Hook | Purpose | Key File |
|------|---------|----------|
| `useState` | Local state | Every page |
| `useEffect` | Side effects, cleanup | `useFetch.js`, `FeedPage.jsx` |
| `useContext` | Global state | `AuthContext.jsx`, `Navbar.jsx` |
| `useReducer` | State machines | `AuthContext.jsx`, `useToast.js` |
| `useCallback` | Memoize functions | `PostCard.jsx`, `FeedPage.jsx` |
| `useMemo` | Memoize values | `usePagination.js`, `CreatePostPage.jsx` |
| `useRef` | DOM refs, mutable storage | `PostDetailPage.jsx`, `useFetch.js` |
| `useLayoutEffect` | Sync DOM reads | `ProfilePage.jsx` |

---

## Exercise

1. In `useFetch.js`, what happens if you remove the AbortController cleanup? Trigger a fast navigation and check the browser console.
2. Why is `useCallback` used in `AuthContext.jsx` for `login` and `logout`? What would happen without it?
3. Explain the difference between `useMemo` and `useCallback`. When would you use each?

---

**Next → [08-react-advanced.md](./08-react-advanced.md)**
