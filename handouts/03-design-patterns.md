# 03 — Design Patterns in This Codebase

## Why Design Patterns?

Design patterns are **proven solutions to recurring software problems**. They don't tell you what to code — they tell you *how to structure* your code so it stays maintainable as it grows.

This project uses four key patterns:

---

## 1. Singleton Pattern

> Ensure a class has only ONE instance and provide a global point of access to it.

Used for: database connection, config object.

```js
// backend/src/config/env.js
const config = Object.freeze({
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: require_env('MONGODB_URI'),
  // ...
});

module.exports = config; // ← same object every time it's require()'d
```

When `require('./config/env')` is called anywhere in the app, Node.js returns the **same cached module export** — that's Node's module system making the Singleton automatic.

The `Object.freeze()` makes it immutable — config can't be accidentally modified.

---

## 2. Factory Function Pattern

> Create objects without using `new` — a function that returns a configured instance.

Used for: creating the Express app.

```js
// backend/src/app.js
function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use('/api/posts', postsRoutes);
  app.use(errorMiddleware);
  return app; // ← Returns a fresh, configured app
}

module.exports = { createApp };
```

**Why not just do `const app = express()` at module level?**
Because then tests can't create a fresh app without side effects. The factory allows creating new instances on demand.

---

## 3. Repository Pattern

> Separate the data access code from the business logic code.

Every module has a `*.repository.js` that **only** talks to MongoDB. Nothing else should ever call `Model.find()` or `Model.save()` directly.

```
Controller → Service → Repository → MongoDB
```

```js
// backend/src/modules/posts/posts.repository.js
class PostsRepository {
  async findAll({ page, limit, tag, search }) {
    // All Mongoose calls live here
    return Post.find(query).sort(...).skip(...).limit(...).populate(...);
  }
  async create({ title, content, author, tags }) {
    const post = new Post({ title, content, author, tags });
    await post.save();
    return post;
  }
}
module.exports = new PostsRepository(); // ← exported as singleton
```

**Benefits:**
- Want to switch from MongoDB to PostgreSQL? Only change the repository.
- Want to test the service? Mock the repository — no real DB needed.

---

## 4. Service Layer Pattern

> Business logic lives in the service; HTTP handling lives in the controller; DB queries live in the repository.

```js
// backend/src/modules/posts/posts.service.js
class PostsService {
  async updatePost(postId, requestingUserId, updates) {
    const post = await postsRepository.findById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    // ← Business rule: only the author can edit
    if (post.author._id.toString() !== requestingUserId.toString()) {
      throw ApiError.forbidden('You can only edit your own posts');
    }

    return postsRepository.update(postId, updates);
  }
}
```

The controller just calls `postsService.updatePost(...)` and sends the response. It never checks authorization. That's the service's job.

---

## The Full Request Flow

```
1. Request arrives: PUT /api/posts/abc123
2. auth.middleware.js   → verifies JWT, attaches req.user
3. validate.middleware  → validates req.body against Joi schema
4. posts.controller.js  → extracts (req.params.id, req.user.id, req.body)
5. posts.service.js     → checks authorization, applies business rules
6. posts.repository.js  → runs Mongoose update query
7. posts.service.js     → returns result
8. posts.controller.js  → res.json(ApiResponse.success(result))
```

---

## Bonus: Custom Error Pattern

```js
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
  static notFound(message) { return new ApiError(404, message); }
  static unauthorized(message) { return new ApiError(401, message); }
}

// Anywhere in the codebase:
throw ApiError.notFound('Post not found');
// → Caught by error.middleware.js → res.status(404).json(...)
```

## Exercise

1. Find the three files for the Posts module: `posts.repository.js`, `posts.service.js`, `posts.controller.js`. Trace what happens when `DELETE /api/posts/:id` is called.
2. The repositories are exported as singletons (`module.exports = new PostsRepository()`). What would break if they were exported as classes instead?
3. Can you find the Factory Function in `validate.middleware.js`? What does it produce?

---

**Next → [04-mongodb-mongoose.md](./04-mongodb-mongoose.md)**
