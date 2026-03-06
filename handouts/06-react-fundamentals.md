# 06 — React Fundamentals

## What Is React?

React is a **JavaScript library for building UIs**. Its core idea: describe your UI as a function of your state, and React will efficiently update the DOM when state changes.

```
UI = f(state)
```

## Components

Everything in React is a **component** — a function that returns JSX (HTML-like syntax).

```jsx
// A simple component
function PostCard({ post }) {  // ← props destructured
  return (
    <article className="card">
      <h2>{post.title}</h2>
      <p>{post.author.username}</p>
    </article>
  );
}

// Usage:
<PostCard post={somePost} />
```

## JSX Rules

- `className` not `class` (class is a reserved JS keyword)
- `htmlFor` not `for`
- Self-close empty tags: `<img />`, `<br />`
- One root element (or `<>` Fragment)
- JavaScript inside JSX goes in `{}`

## Props

Props are the inputs to a component — passed like HTML attributes, received as a function parameter:

```jsx
// Parent passes data:
<PostCard post={post} onLikeToggle={handleLike} />

// Child receives:
function PostCard({ post, onLikeToggle }) { ... }
```

Props flow **downward** (parent → child). This is called "one-way data flow".

## State (useState)

State is data that, when changed, causes the component to re-render:

```jsx
import { useState } from 'react';

function LoginPage() {
  const [email, setEmail] = useState('');     // initial value: ''
  const [loading, setLoading] = useState(false);

  return (
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)} // controlled input
    />
  );
}
```

**Controlled vs uncontrolled inputs:**
- Controlled: value is in React state → React is the source of truth
- Uncontrolled: value is in the DOM → accessed via `ref`

This project uses controlled inputs everywhere. See `LoginPage.jsx`, `RegisterPage.jsx`, `CreatePostPage.jsx`.

## Lists & Keys

When rendering arrays, React needs a unique `key` for each item:

```jsx
{posts.map((post) => (
  <PostCard key={post._id} post={post} /> // ← key must be unique and stable
))}
```

The `key` helps React identify which items changed. Never use the array index as a key if the list can be reordered.

## Conditional Rendering

```jsx
// If/else
{isAuthenticated ? <LogoutButton /> : <LoginButton />}

// Only show if true
{error && <p className="error">{error}</p>}

// Early return
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <PostDetail post={post} />;
```

## Component Hierarchy in DevLog

```
App.jsx (BrowserRouter + AuthProvider)
└── Navbar.jsx
└── Routes
    ├── FeedPage.jsx
    │   └── PostCard.jsx (× many)
    ├── PostDetailPage.jsx
    │   └── CommentThread
    ├── CreatePostPage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    └── ProfilePage.jsx
        └── PostCard.jsx (× many)
```

## Exercise

1. Open `frontend/src/components/PostCard.jsx`. What props does it receive? What does `onLikeToggle` do?
2. Find all the places in the app where conditional rendering (`&&` or ternary `?:`) is used.
3. In `FeedPage.jsx`, posts are mapped with `key={post._id}`. Why is `_id` a better key than the array index?

---

**Next → [07-react-hooks.md](./07-react-hooks.md)**
