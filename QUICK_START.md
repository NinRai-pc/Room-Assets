# Quick Start Actions - CI/CD Pipeline

Copy-paste these commands in order to get your CI/CD pipeline live.

---

## 1️⃣ Initialize Git & Push to GitHub

```bash
# Initialize repository (if not already done)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit with CI/CD setup"

# Rename branch to main (if needed)
git branch -M main

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/Room-Assetsv2.git

# Push to GitHub
git push -u origin main
```

---

## 2️⃣ Create GitHub Repository

1. Go to https://github.com/new
2. Name: `Room-Assetsv2`
3. **Do NOT** create README/gitignore (leave empty)
4. Click "Create repository"
5. Copy the commands above and run them

---

## 3️⃣ Enable GitHub Pages (5 minutes)

1. Go to `https://github.com/YOUR-USERNAME/Room-Assetsv2`
2. Click **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. Save

✅ **Done!** Frontend will deploy automatically on next push.

---

## 4️⃣ Create Database on Render (5 minutes)

1. Go to https://render.com/dashboard
2. Click **New** → **PostgreSQL**
3. Fill in:
   - Database name: `room-assets-db`
   - User: `dbuser`
   - Region: **EU (Frankfurt)** ⚠️ Important!
4. Click **Create Database**
5. Copy **Internal Database URL** (looks like: `postgresql://dbuser:xxxx@host:5432/room-assets-db`)
6. Save it somewhere safe

---

## 5️⃣ Deploy Backend on Render (10 minutes)

1. Go to https://render.com/dashboard
2. Click **New** → **Web Service**
3. Click **Connect GitHub account** (if needed)
4. Select `Room-Assetsv2` repository
5. Fill in:
   - **Name**: `room-assets`
   - **Region**: **EU (Frankfurt)** (must match database!)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Docker`
   - Leave Build & Start commands empty

6. Scroll down → **Environment Variables**, click **Add Environment Variable**:
   ```
   DATABASE_URL = <paste the URL from step 4>
   NODE_ENV = production
   ```

7. Scroll down → **Health Check Path**:
   ```
   /api/health
   ```

8. Click **Create Web Service**

⏳ Wait 5-10 minutes for first deploy. Check the Render dashboard for status.

---

## 6️⃣ Add Health Check Endpoint (1 minute)

Your backend needs a health endpoint. Add this to `server/src/routes.ts`:

```typescript
export async function routes(fastify) {
  fastify.get('/api/health', async (request, reply) => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      reply.status(503);
      return { status: 'error', message: error.message };
    }
  });
  
  // ... rest of routes
}
```

Then push:
```bash
git add server/src/routes.ts
git commit -m "Add health check endpoint"
git push
```

---

## 7️⃣ Verify Everything Works

### Check Frontend:
1. Go to Actions tab in GitHub repo
2. Look for "Frontend CI/CD" workflow
3. Once ✅ passes, visit: `https://YOUR-USERNAME.github.io/Room-Assetsv2/`

### Check Backend:
1. Go to Render dashboard
2. Click your `room-assets` service
3. Check deployment status (should be "Live")
4. Visit: `https://room-assets.onrender.com/api/health`
5. Should return: `{"status":"ok","timestamp":"..."}`

---

## 🎯 After This...

Whenever you push to `main`:
- ✅ Frontend auto-builds & deploys to GitHub Pages
- ✅ Backend auto-tests via GitHub Actions
- ✅ Backend auto-deploys to Render (if tests pass)

---

## 📋 Checklist

- [ ] Git repo initialized & pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] PostgreSQL database created on Render
- [ ] Web Service created on Render with DATABASE_URL
- [ ] Health check endpoint added to backend
- [ ] First push triggers workflows
- [ ] Frontend accessible at GitHub Pages URL
- [ ] Backend accessible at Render URL with `/api/health`

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module prisma" on Render | Already fixed in Dockerfile (runs `npx prisma migrate deploy`) |
| Health check keeps failing | Ensure `/api/health` exists in backend & database connection works |
| Frontend shows blank page | Check that `--base=/Room-Assetsv2/` matches your repo name in `frontend.yml` |
| Database connection error | Ensure Render service & database are in same region (Frankfurt) |

---

## 🔗 Useful Links

- GitHub Actions logs: `https://github.com/YOUR-USERNAME/Room-Assetsv2/actions`
- Render dashboard: `https://render.com/dashboard`
- Frontend URL: `https://YOUR-USERNAME.github.io/Room-Assetsv2/`
- Backend API: `https://room-assets.onrender.com/`
