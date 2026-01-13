# CI/CD Setup Guide for Room Assets Project

This guide walks you through setting up a complete CI/CD pipeline for the Room Assets project using GitHub Actions, GitHub Pages (frontend), and Render (backend).

## Overview

The CI/CD pipeline consists of:
- **Frontend CI/CD**: Automated build and deployment to GitHub Pages
- **Backend CI**: Automated testing and linting on each commit
- **Backend CD**: Automated deployment to Render on each commit

---

## Step 1: Initialize Git Repository

If you haven't already, initialize your Git repository locally:

```bash
cd d:\Room-Assetsv2
git init
git add .
git commit -m "Initial commit"
```

---

## Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `Room-Assetsv2`)
3. **Don't** create README, .gitignore, or license (leave it empty)
4. Follow GitHub's instructions to push your local repo:

```bash
git remote add origin https://github.com/<your-username>/Room-Assetsv2.git
git branch -M main
git push -u origin main
```

---

## Step 3: Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Under "Build and deployment" → Source, select **GitHub Actions**

---

## Step 4: Set Up Frontend Deployment

The workflow `.github/workflows/frontend.yml` is already created. It:
- Triggers on push to `main`/`master` branches
- Installs dependencies
- Builds the Vite project with the correct base path
- Deploys to GitHub Pages automatically

**Note**: The build command includes `--base=/Room-Assetsv2/` which matches your repository name. Adjust if your repo has a different name.

After your first push, the frontend will be available at:
```
https://<your-username>.github.io/Room-Assetsv2/
```

---

## Step 5: Set Up Backend CI

The workflow `.github/workflows/backend-ci.yml` is already created. It:
- Triggers on push to `main`/`master` branches
- Installs dependencies
- Runs linting (if configured)
- Runs tests (if configured)

To make this work, ensure your `server/package.json` has:
```json
{
  "scripts": {
    "lint": "eslint src/",
    "test": "jest"
  }
}
```

---

## Step 6: Set Up Backend Deployment on Render

### 6.1: Create PostgreSQL Database on Render

1. Go to [Render](https://render.com/)
2. Sign up/login with GitHub
3. Click **New** → **PostgreSQL**
4. Configure:
   - Database name: `room-assets-db`
   - User: `dbuser`
   - Region: **EU (Frankfurt)** (recommended, same as service)
5. Copy the **Internal Database URL** (format: `postgresql://user:password@host/db`)
   - Save it securely for the next step

### 6.2: Create Web Service on Render

1. On Render, click **New** → **Web Service**
2. Select **Build and deploy from a Git repository**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `room-assets` (or similar)
   - **Region**: `EU (Frankfurt)` (must match database)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Runtime**: Docker
   - **Build Command**: (leave empty - uses Dockerfile)
   - **Start Command**: (leave empty - uses Dockerfile CMD)

5. Add **Environment Variables**:
   - `DATABASE_URL`: Paste the PostgreSQL connection string from step 6.1
   - `NODE_ENV`: `production`
   - Any other env variables your backend needs

6. Set **Health Check Path**: `/api/health`
   - Ensure your backend has a health endpoint that verifies database connectivity

7. Click **Create Web Service**
   - Render will build the Docker image and deploy automatically
   - Your backend will be available at: `https://room-assets.onrender.com/`

### 6.3: Verify Auto-Deploy is Enabled

1. In your Render Web Service, go to **Settings** → **Build & Deploy**
2. Confirm **Auto-Deploy** is enabled and set to **On Commit**
3. Now every push to `main` in the `server/` directory will auto-deploy

---

## Step 7: Add API Endpoint for Health Checks

Ensure your backend has a health check endpoint. Example for Fastify:

```javascript
// server/src/routes.ts
export async function routes(fastify) {
  fastify.get('/api/health', async (request, reply) => {
    // Verify database is connected
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      reply.status(503);
      return { status: 'error', message: error.message };
    }
  });
  
  // ... other routes
}
```

---

## Step 8: Dockerfile Update (Already Done)

The `server/Dockerfile` has been updated to run Prisma migrations on startup:

```dockerfile
CMD ["sh","-lc","npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
```

This ensures:
- Database migrations run before the server starts
- If migrations fail, the container exits (Render detects failure)
- If migrations succeed, the server starts normally

---

## Step 9: Test the CI/CD Pipeline

1. **Push code** to your main branch:
   ```bash
   git push origin main
   ```

2. **Monitor GitHub Actions**:
   - Go to your repo → **Actions** tab
   - Watch the workflows run
   - Check logs for any issues

3. **Check Deployments**:
   - **Frontend**: Check GitHub Pages URL after frontend workflow completes
   - **Backend**: Check Render dashboard for deployment status

---

## Common Issues & Solutions

### GitHub Pages Shows Blank Page
- **Cause**: Wrong `--base` parameter in build command
- **Fix**: Update `.github/workflows/frontend.yml` to use your actual repo name:
  ```yaml
  run: npm run build -- --base=/your-repo-name/
  ```

### Backend Deployment Fails on Render
- **Check logs** in Render dashboard
- **Common issues**:
  - Wrong `DATABASE_URL` (copy from Render Postgres page)
  - Database in different region than service
  - Missing environment variables

### Health Check Keeps Failing
- Ensure `/api/health` endpoint exists and is working
- Verify database connectivity in the health check
- Check Render logs for detailed error messages

---

## Files Created/Modified

- ✅ `.gitignore` - Updated with comprehensive ignore patterns
- ✅ `.github/workflows/frontend.yml` - Frontend CI/CD
- ✅ `.github/workflows/backend-ci.yml` - Backend CI
- ✅ `server/Dockerfile` - Updated for production migrations

---

## Next Steps

1. Verify all workflows trigger correctly on push
2. Set up branch protection rules (optional) to require passing checks before merge
3. Add test scripts to `server/package.json` and `app/package.json` if not present
4. Monitor deployment logs and adjust as needed

For more details, see the [original guide](https://labs.1n0name.ru/inf-systems/ci-cd/).
