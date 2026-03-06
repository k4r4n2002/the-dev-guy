# 04 — MongoDB & Mongoose

## What Is MongoDB?

MongoDB is a **document database**. Instead of rows in tables (SQL), it stores JSON-like documents in collections. Each document can have different fields — no rigid schema enforced at the DB level (Mongoose adds the schema in app code).

## Mongoose: ODM for MongoDB

Mongoose is an **Object Document Mapper** — it gives MongoDB a schema, validation, hooks, and methods.

```
MongoDB (raw documents) ← Mongoose → JavaScript objects
```

## Defining a Schema

```js
// backend/src/modules/posts/posts.schema.js
const postSchema = new mongoose.Schema({
  title:   { type: String, required: true, maxlength: 150 },
  content: { type: String, required: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ← reference
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ← array of refs
  tags:    [String],
  commentCount: { type: Number, default: 0 },
}, { timestamps: true }); // ← auto adds createdAt, updatedAt
```

`timestamps: true` is a shortcut that adds `createdAt` and `updatedAt` fields automatically.

## ObjectId References (Relationships)

MongoDB has no JOINs. Mongoose simulates them with `populate()`:

```js
// Instead of storing the full user object in each post,
// we store just the user's _id reference:
Post.find().populate('author', 'username avatar')
// ↑ resolves author ObjectId → { username, avatar } from Users collection
```

## CRUD Operations

```js
// Create
const post = new Post({ title, content, author, tags });
await post.save();

// Read (with projection, sorting, pagination)
await Post.find({ tags: 'react' })
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .populate('author', 'username avatar')
  .lean(); // ← returns plain JS objects (faster, no Mongoose methods)

// Update (findByIdAndUpdate returns the NEW document)
await Post.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

// Delete
await Post.findByIdAndDelete(id);
```

## Mongoose Hooks (Middleware)

Hooks run before or after model operations:

```js
// backend/src/modules/auth/auth.schema.js
userSchema.pre('save', async function(next) {
  // `this` = the document being saved
  if (!this.isModified('passwordHash')) return next(); // only hash when changed
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});
```

## Instance Methods

Add custom methods to every document:

```js
userSchema.methods.comparePassword = async function(plaintext) {
  return bcrypt.compare(plaintext, this.passwordHash);
};

// Usage:
const user = await User.findOne({ email }).select('+passwordHash');
const valid = await user.comparePassword('mypassword');
```

## Virtual Fields

Computed fields not stored in DB:

```js
postSchema.virtual('likeCount').get(function() {
  return this.likes.length; // computed from the likes array
});
```

## Atomic Operators

For safe concurrent operations (like toggling a like):

```js
// $addToSet: adds only if not already present
// $pull: removes the element
post.likes.addToSet(userId); // ← thread-safe, no race condition
post.likes.pull(userId);
await post.save();
```

## Indexes

Indexes make queries fast. Without an index, MongoDB scans every document.

```js
postSchema.index({ createdAt: -1 });     // feed queries (newest first)
postSchema.index({ tags: 1 });           // filter by tag
postSchema.index({ title: 'text', content: 'text' }); // full-text search
```

## Exercise

1. Open [`backend/src/modules/posts/posts.repository.js`](../backend/src/modules/posts/posts.repository.js). Find the `toggleLike` method. Why is `$addToSet` better than just pushing to the array?
2. What does `.lean()` do? When should you NOT use it?
3. In the Comment schema, what does `parentComment: { type: ObjectId, ref: 'Comment' }` mean? This is a **self-referential** relationship.

---

**Next → [05-authentication-jwt.md](./05-authentication-jwt.md)**
