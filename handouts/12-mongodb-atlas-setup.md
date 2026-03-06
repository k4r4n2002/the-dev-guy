# 12 — MongoDB Atlas Setup (Cloud Database)

**Do this before starting the backend.** The application cannot connect to MongoDB without a valid `MONGODB_URI`.

MongoDB Atlas is MongoDB's managed cloud service. The free tier (M0) is more than enough for learning and development.

---

## Step 1: Create an Atlas Account

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **"Try Free"** and sign up (Google/GitHub sign-in works)
3. You'll be taken to the Atlas dashboard

---

## Step 2: Create a Free Cluster

1. Click **"Build a Database"**
2. Select **M0 Free** tier
3. Choose a cloud provider (AWS/GCP/Azure — any works)
4. Choose a region close to you (e.g., Mumbai, Singapore, Frankfurt)
5. Name your cluster (default `Cluster0` is fine)
6. Click **"Create Deployment"**

> Creation takes 1–3 minutes.

---

## Step 3: Create a Database User

When the "Security Quickstart" dialog appears:

1. Select **"Username and Password"**
2. Enter a username (e.g., `devlog-user`)
3. Click **"Autogenerate Secure Password"** and **copy it immediately**
4. Click **"Create User"**

> **Save your password now** — Atlas won't show it again.

---

## Step 4: Whitelist Your IP Address

Still in "Security Quickstart":

1. Select **"My Local Environment"** (or "Cloud Environment" if you'll deploy)
2. Click **"Add My Current IP Address"**
   - For development: you can also use `0.0.0.0/0` to allow all IPs (not recommended for production!)
3. Click **"Finish and Close"**

For K3s deployment in production, whitelist your cluster's public IP instead of `0.0.0.0/0`.

---

## Step 5: Get the Connection String

1. From the Atlas dashboard, click **"Connect"** on your cluster
2. Select **"Drivers"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string — it looks like:

```
mongodb+srv://devlog-user:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

5. Replace `<password>` with the password you saved in Step 3
6. Add your database name after the hostname:

```
mongodb+srv://devlog-user:YourPassword@cluster0.abcde.mongodb.net/devlog?retryWrites=true&w=majority
```

> The `/devlog` part names the MongoDB database. Mongoose will create it automatically on first write.

---

## Step 6: Add to Your .env File

```bash
# In the project root:
cp .env.example .env
```

Open `.env` and set:

```bash
MONGODB_URI=mongodb+srv://devlog-user:YourPassword@cluster0.abcde.mongodb.net/devlog?retryWrites=true&w=majority
```

---

## Step 7: Verify the Connection

```bash
./start-backend.sh
```

You should see:
```
✅  MongoDB connected successfully.
🚀  DevLog API is running!
```

If you see `MongoDB connection failed`, double-check:
- IP address is whitelisted in Atlas
- Username and password are correct in the connection string
- The connection string format is correct (no extra spaces)

---

## Step 8: For K3s Deployment — Encode as base64

The Helm chart uses Kubernetes Secrets, which require base64-encoded values.

**On Linux/Mac:**
```bash
echo -n "mongodb+srv://devlog-user:YourPassword@cluster0.abcde.mongodb.net/devlog?retryWrites=true&w=majority" | base64
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("mongodb+srv://devlog-user:YourPassword@cluster0.abcde.mongodb.net/devlog?retryWrites=true&w=majority"))
```

Paste the output into `deployment/environments/dev/backend.values.yaml`:
```yaml
secretData:
  MONGODB_URI: "<base64-output-here>"
```

---

## Monitoring Your Database

From the Atlas dashboard:
- **Collections** tab → browse your documents (users, posts, comments)
- **Metrics** tab → CPU, connections, query execution time
- **Indexes** tab → see what indexes exist (our schemas create them)

---

## Security Checklist

| Action | Dev | Prod |
|--------|-----|------|
| IP whitelist: specific addresses | Recommended | **Required** |
| IP whitelist: 0.0.0.0/0 | Acceptable | **Never** |
| Password strength | Any | Strong (20+ chars) |
| Database user role | Read/Write on devlog | Read/Write on devlog only |
| Connection string in `.env` | ✅ | Use K8s Secret (never .env) |
| `.env` committed to git | **Never** | **Never** |

---

## Troubleshooting

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `connection timed out` | IP not whitelisted | Add IP in Atlas → Network Access |
| `Authentication failed` | Wrong password | Re-check password in connection string |
| `ENOTFOUND cluster0.abcde.mongodb.net` | Wrong hostname | Re-copy connection string from Atlas |
| `MongoDB connection failed` at startup | Any of the above | Check logs for specific message |

---

**You're done! Go back to [00-introduction.md](./00-introduction.md) and start the servers.**
