# 13 — Testing (Jest, Vitest & React Testing Library)

> "The Factory Function and Repository patterns are specifically praised for their testability." — They only pay off if you actually write tests.

---

## Why Test?

Tests catch regressions, document expected behaviour, and give you confidence to refactor. The patterns in this codebase (Repository, Service, Factory) were deliberately chosen to make testing easy.

---

## Backend Testing with Jest

### Install

```bash
cd backend
npm install --save-dev jest @jest/globals supertest
```

Add to `package.json`:
```json
"scripts": {
  "test": "jest --testPathPattern=src",
  "test:watch": "jest --watch"
},
"jest": {
  "testEnvironment": "node"
}
```

### What to Test

| Layer | Test type | Tools |
|-------|-----------|-------|
| Service | Unit (mock repo) | Jest |
| Repository | Integration (real DB) | Jest + mongodb-memory-server |
| Routes | Integration (mock service) | Jest + Supertest |

### Unit Testing a Service

The `PostsService` is pure business logic — easy to test by mocking the repository:

```js
// src/modules/posts/__tests__/posts.service.test.js
import { jest } from '@jest/globals';

// Mock the repository BEFORE importing the service
jest.mock('../posts.repository.js', () => ({
  findById: jest.fn(),
  update: jest.fn(),
}));

import postsRepository from '../posts.repository.js';
import { PostsService } from '../posts.service.js';

const service = new PostsService();

describe('PostsService.updatePost', () => {
  const AUTHOR_ID = 'user-abc';
  const POST_ID = 'post-123';

  it('throws 404 when post does not exist', async () => {
    postsRepository.findById.mockResolvedValueOnce(null);

    await expect(service.updatePost(POST_ID, AUTHOR_ID, { title: 'X' }))
      .rejects
      .toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when user is not the author', async () => {
    postsRepository.findById.mockResolvedValueOnce({
      _id: POST_ID,
      author: { _id: 'other-user' },
    });

    await expect(service.updatePost(POST_ID, AUTHOR_ID, { title: 'X' }))
      .rejects
      .toMatchObject({ statusCode: 403 });
  });

  it('calls repository.update when user is the author', async () => {
    postsRepository.findById.mockResolvedValueOnce({
      _id: POST_ID,
      author: { _id: AUTHOR_ID },
    });
    postsRepository.update.mockResolvedValueOnce({ _id: POST_ID, title: 'New Title' });

    const result = await service.updatePost(POST_ID, AUTHOR_ID, { title: 'New Title' });

    expect(postsRepository.update).toHaveBeenCalledWith(POST_ID, { title: 'New Title' });
    expect(result.title).toBe('New Title');
  });
});
```

**Why this is easy:** The service only depends on the repository interface, not on MongoDB itself. We mock the repository and test only the business logic.

### Integration Testing Routes with Supertest

The `createApp()` factory makes this clean — no real HTTP server needed:

```js
// src/modules/auth/__tests__/auth.routes.test.js
import supertest from 'supertest';
import { createApp } from '../../../app.js';
import { connectDB } from '../../../config/database.js';
import mongoose from 'mongoose';

let app;
let request;

beforeAll(async () => {
  await connectDB(); // uses a test MONGODB_URI from .env.test
  app = createApp();
  request = supertest(app);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('returns 201 and a token for valid data', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when email is already taken', async () => {
    await request.post('/api/auth/register')
      .send({ username: 'user2', email: 'dupe@example.com', password: 'password123' });

    const res = await request.post('/api/auth/register')
      .send({ username: 'user3', email: 'dupe@example.com', password: 'password123' });

    expect(res.status).toBe(409);
  });
});
```

**Add to `backend/.env.test`:**
```
MONGODB_URI=mongodb://localhost:27017/devlog-test
JWT_SECRET=test-secret-key
NODE_ENV=test
PORT=5001
```

---

## Frontend Testing with Vitest + React Testing Library

### Install

```bash
cd frontend
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add to `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
});
```

Create `frontend/src/test-setup.js`:
```js
import '@testing-library/jest-dom';
```

Add to `frontend/package.json`:
```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### Testing a Component: PostCard

```jsx
// src/components/__tests__/PostCard.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PostCard from '../PostCard';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));

const mockPost = {
  _id: 'post-1',
  title: 'My Test Post',
  content: 'This is the content of the test post.',
  author: { username: 'devguru', _id: 'user-1' },
  tags: ['react', 'testing'],
  likes: [],
  commentCount: 2,
  createdAt: new Date().toISOString(),
};

describe('PostCard', () => {
  it('renders the post title', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('My Test Post')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
  });

  it('disables like button when not authenticated', () => {
    render(
      <MemoryRouter>
        <PostCard post={mockPost} />
      </MemoryRouter>
    );
    const likeBtn = screen.getByTitle('Login to like');
    expect(likeBtn).toBeDisabled();
  });
});
```

### Testing a Custom Hook: useDebounce

```js
// src/hooks/__tests__/useDebounce.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 500), {
      initialProps: { v: 'hello' },
    });

    rerender({ v: 'world' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('hello'); // not updated yet
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 500), {
      initialProps: { v: 'hello' },
    });

    rerender({ v: 'world' });
    act(() => vi.advanceTimersByTime(500));

    expect(result.current).toBe('world');
  });
});
```

---

## What to Test (Priority Order)

1. **Custom hooks** — pure logic, easy to test with `renderHook`
2. **Services** — business logic, mock the repository
3. **Route integration** — happy path + sad path for each endpoint (Supertest)
4. **Components** — user interactions (`fireEvent`/`userEvent`), not implementation details

## What NOT to Test (Common Mistakes)

- Don't test the repository interacting with a real production database
- Don't test implementation details (internal state, function calls you don't control)
- Don't snapshot test everything — snapshots break constantly and provide little value

---

## Running the Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

**You're all set there**

Review the concepts by re-reading any handout, then try extending the app: add post categories, image upload, notification system, or a follower/following feature.
