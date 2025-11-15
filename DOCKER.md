# Docker Setup Guide for Room Assets

## Prerequisites Check

Before running Docker commands, ensure:

1. **Docker Desktop is installed and running**
   - Download from: https://www.docker.com/products/docker-desktop
   - During installation, enable WSL 2 support
   - Start Docker Desktop from Windows Start Menu

2. **Verify Docker is working:**
   ```powershell
   docker --version
   docker compose version
   docker run hello-world
   ```

3. **WSL 2 Integration (if using WSL):**
   - Open Docker Desktop Settings > Resources > WSL Integration
   - Enable integration with your WSL distro

## Project Structure

```
d:\Room-Assetsv2\
├── Dockerfile              # Multi-stage build configuration
├── .dockerignore          # Files to exclude from Docker build
├── compose.base.yml       # Base Docker Compose configuration
├── compose.dev.yml        # Development override (with HMR)
├── compose.prod.yml       # Production override (Nginx)
├── nginx/
│   └── nginx.conf         # Nginx configuration for SPA
└── app/
    ├── package.json
    ├── vite.config.ts
    └── src/
```

## Docker Build Stages

1. **deps**: Installs dependencies (Node 24 Alpine)
2. **dev**: Vite dev server with HMR (port 5173)
3. **build**: Compiles production build
4. **prod**: Nginx server with static files (port 80)

## Running in Development Mode (with HMR)

### Start Dev Environment:
```powershell
cd d:\Room-Assetsv2
docker compose -f compose.base.yml -f compose.dev.yml up --build -d
```

Or use the justfile shortcut:
```powershell
cd d:\Room-Assetsv2\app
just dev-docker
```

### Access:
- App: http://localhost:5173
- Changes will hot-reload automatically

### Stop:
```powershell
docker compose -f compose.base.yml -f compose.dev.yml down
```

Or:
```powershell
just stop-docker
```

### View Logs:
```powershell
docker compose -f compose.base.yml -f compose.dev.yml logs -f
```

## Running in Production Mode (Static Nginx)

### Start Prod Environment:
```powershell
cd d:\Room-Assetsv2
docker compose -f compose.base.yml -f compose.prod.yml up --build -d
```

Or use the justfile shortcut:
```powershell
cd d:\Room-Assetsv2\app
just prod-docker
```

### Access:
- App: http://localhost (or http://localhost:80)
- Fully optimized static build served by Nginx

### Stop:
```powershell
docker compose -f compose.base.yml -f compose.prod.yml down
```

Or:
```powershell
just stop-prod
```

## Build Optimization Tips

1. **WSL 2 Performance:**
   - Store project in WSL filesystem: `\\wsl$\Ubuntu\home\<user>\Room-Assets`
   - Faster mounts than Windows drives

2. **Build Cache:**
   - First build takes longer
   - Subsequent builds use cache layers
   - Only changed layers rebuild

3. **Resource Allocation:**
   - Docker Desktop Settings > Resources
   - Allocate sufficient CPU/RAM for builds

## Troubleshooting

### Docker Daemon Not Running
```powershell
# Start Docker Desktop from Windows Start Menu or:
docker info
# If error persists, restart Docker Desktop
```

### Build Fails
- Check Docker Desktop has enough resources
- Run: `docker compose config` to validate YAML
- Check Dockerfile syntax
- Ensure `app/package.json` exists

### Port Already in Use
```powershell
# Find and stop conflicting container
docker ps
docker stop <container_id>
```

### Check Container Logs
```powershell
docker compose -f compose.base.yml -f compose.dev.yml logs <service_name>
# or for all logs:
docker compose -f compose.base.yml -f compose.dev.yml logs
```

### Rebuild Without Cache
```powershell
docker compose -f compose.base.yml -f compose.dev.yml build --no-cache
```

## Justfile Commands Reference

```powershell
just install        # Install npm dependencies
just dev            # Run dev server locally
just build          # Build production bundle
just preview        # Preview production build
just dev-docker     # Start Docker dev environment
just stop-docker    # Stop Docker dev environment
just prod-docker    # Start Docker prod environment
just stop-prod      # Stop Docker prod environment
```

## Next Steps

1. Ensure Docker Desktop is running
2. Run: `docker compose -f compose.base.yml -f compose.dev.yml up --build -d`
3. Open: http://localhost:5173
4. Start developing! Changes will auto-reload

## Performance Notes

- **Dev Mode**: Full HMR with source maps (larger, slower)
- **Prod Mode**: Optimized Nginx serving static files (fast, small)
- **Build Time**: ~2-3 minutes for initial build, ~30s for rebuilds
- **HMR Polling**: Enabled via WATCHPACK_POLLING in dev mode
