# 🚀 Quick Start Guide - Docker Setup

## Current Status ✅

All changes have been committed and pushed to GitHub:
- ✅ Booking management features implemented
- ✅ Delete functionality fixed
- ✅ Docker configuration files created
- ✅ All committed to: https://github.com/NinRai-pc/Room-Assets

## What You Need to Do NOW

### Step 1: Start Docker Desktop
1. Open **Windows Start Menu**
2. Search for **"Docker Desktop"**
3. Click to launch it
4. Wait for it to fully start (look for the Docker whale icon in system tray)
5. Open PowerShell and verify:
```powershell
docker --version
docker compose version
```

### Step 2: Build and Run the App in Docker

**Navigate to project root:**
```powershell
cd d:\Room-Assetsv2
```

**Option A: Development Mode (with Hot Reload)**
```powershell
docker compose -f compose.base.yml -f compose.dev.yml up --build -d
```

Then open: **http://localhost:5173**

Changes to code will automatically reload!

**Option B: Production Mode (Optimized)**
```powershell
docker compose -f compose.base.yml -f compose.prod.yml up --build -d
```

Then open: **http://localhost**

### Step 3: Using Justfile (Easier)

From `d:\Room-Assetsv2\app`:

```powershell
cd app
just dev-docker    # Start dev environment
just stop-docker   # Stop dev environment
just prod-docker   # Start prod environment
just stop-prod     # Stop prod environment
```

## Docker File Structure

```
d:\Room-Assetsv2\
├── Dockerfile                    ← Multi-stage build
├── .dockerignore                ← Exclude from build
├── compose.base.yml             ← Base config
├── compose.dev.yml              ← Dev overrides (HMR)
├── compose.prod.yml             ← Prod overrides (Nginx)
├── nginx/nginx.conf             ← Nginx config for SPA
└── DOCKER.md                     ← Detailed guide
```

## Build Stages

1. **deps** - Install Node packages
2. **dev** - Run Vite dev server (port 5173)
3. **build** - Compile production bundle
4. **prod** - Serve with Nginx (port 80)

## Expected Behavior

### Dev Mode (First Time)
```
- Build: ~2-3 minutes (first time)
- Port: 5173
- HMR: Enabled (changes reload automatically)
- Access: http://localhost:5173
```

### Prod Mode (First Time)
```
- Build: ~2-3 minutes
- Port: 80
- Serve: Static Nginx
- Access: http://localhost
```

## Troubleshooting

**Docker daemon not running?**
- Restart Docker Desktop
- Check: `docker info`

**Port already in use?**
```powershell
docker ps                    # List containers
docker stop <container_id>   # Stop container
```

**View logs:**
```powershell
docker compose -f compose.base.yml -f compose.dev.yml logs -f
```

**Rebuild from scratch:**
```powershell
docker compose -f compose.base.yml -f compose.dev.yml build --no-cache
```

## Next: Let's Code! 🎉

1. Start Docker Desktop
2. Run: `docker compose -f compose.base.yml -f compose.dev.yml up --build -d`
3. Open: http://localhost:5173
4. Start editing files - they'll hot-reload!

## Full Documentation

See `DOCKER.md` for complete setup, troubleshooting, and advanced usage.
