# 05 — Authentication & JWT

## Sessions vs Tokens

Traditional auth uses **sessions**: the server stores session data and gives the client a session ID cookie.

Modern REST APIs use **tokens**: the server signs a token and gives it to the client. The client includes the token in every request. The server just verifies the signature — no lookup needed.

```
Sessions: Client → Server checks DB for session → Respond
Tokens:   Client → Server verifies signature (no DB) → Respond
```

Tokens are stateless and work perfectly for APIs that might be called from mobile apps, other services, etc.

## JWT (JSON Web Token)

A JWT has three parts separated by `.`:
```
header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  .eyJpZCI6IjY0YWJjMTIzIiwidXNlcm5hbWUiOiJkZXZndXJ1IiwiZXhwIjoxNjkwMDAwMDAwfQ
  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Header**: algorithm (HS256) + type (JWT)  
**Payload**: your data (user ID, username) + expiry  
**Signature**: HMAC of header+payload using your secret key  

Anyone can decode the payload (it's just base64). But only the server with the secret can **verify** the signature.

## Password Hashing with bcrypt

**Never store passwords in plain text.** bcrypt hashes passwords with a salt (random noise added to prevent rainbow table attacks):

```js
// Hashing (done in the pre-save hook)
const hash = await bcrypt.hash('mypassword', 12); // 12 = salt rounds
// '12 rounds' means 2^12 = 4096 iterations — slow enough to deter brute-force

// Verification
const match = await bcrypt.compare('mypassword', hash); // true or false
```

See this live: [`backend/src/modules/auth/auth.schema.js`](../backend/src/modules/auth/auth.schema.js)

## Register Flow

```
1. User submits { username, email, password }
2. Joi validation (auth.validation.js) checks format
3. auth.service.js checks email/username aren't taken
4. auth.repository.js creates User — pre-save hook hashes password
5. JWT signed with user._id and username
6. Return { user, token }
```

## Login Flow

```
1. User submits { email, password }
2. Find user by email — explicitly select passwordHash (select:false)
3. bcrypt.compare(plaintext, hash)
4. If match: sign JWT → return { user, token }
5. If no match: throw ApiError.unauthorized (same error for both cases!)
```

> **Security**: Never tell the user whether it was the email or password that was wrong. Always say "Invalid email or password". This prevents user enumeration attacks.

## JWT Authentication Middleware

```js
// backend/src/middleware/auth.middleware.js
async function authenticate(req, _res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  if (!token) throw ApiError.unauthorized('No token provided');

  const decoded = jwt.verify(token, config.jwtSecret);
  // ↑ throws JsonWebTokenError if invalid, TokenExpiredError if expired
  // → these are caught by error.middleware.js

  req.user = decoded; // { id, username, email }
  next();
}
```

## The `select: false` trick

The `passwordHash` field is hidden from all queries by default:

```js
passwordHash: { type: String, select: false }
```

To include it (only when verifying login):
```js
User.findOne({ email }).select('+passwordHash')
```

This ensures you can **never accidentally return the password hash** to the client.

## Environment Security

- JWT secret must be long and random: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Different secrets for dev and production
- Short expiry in production (`1d`), longer acceptable in dev (`7d`)

## Exercise

1. In `auth.service.js`, the login method throws `ApiError.unauthorized('Invalid email or password')` for BOTH "user not found" and "wrong password". Why not be more specific?
2. Where is the JWT expiry configured? Find it in both `env.js` and the environment values YAML files.
3. What happens on the frontend when the JWT expires? Trace the flow starting from `frontend/src/api/client.js`.

---

**Next → [06-react-fundamentals.md](./06-react-fundamentals.md)**
