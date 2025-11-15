# 🚀 START HERE - Application Launch Instructions

## ✨ Your Application is Ready!

All development is complete. Follow these simple steps to start using the Room Assets application.

---

## 📋 BEFORE YOU START

Ensure **Docker Desktop is installed and running:**

1. Download from: https://www.docker.com/products/docker-desktop
2. Install with WSL 2 support
3. Launch Docker Desktop from Windows Start Menu
4. Wait for it to start (whale icon in system tray)

---

## 🎯 HOW TO START THE APPLICATION

### **Option 1: Quick Start (Recommended)**

Open PowerShell and run:

```powershell
cd d:\Room-Assetsv2
docker compose -f compose.base.yml -f compose.dev.yml up --build -d
```

Then open your browser to: **http://localhost:5173**

### **Option 2: Using Justfile (Easier)**

```powershell
cd d:\Room-Assetsv2\app
just dev-docker
```

Then open your browser to: **http://localhost:5173**

---

## 💻 WHAT YOU'LL SEE

✅ Dashboard with booking statistics
✅ Booking list with edit/delete buttons
✅ Room catalog with delete functionality
✅ Create new booking form with:
   - Date/time selection
   - Room availability checking
   - Equipment filtering
   - Real-time status updates

---

## 🌟 KEY FEATURES

### Bookings Management
- **Create** - New bookings with room selection
- **Edit** - Modify existing bookings
- **Delete** - Remove bookings with confirmation
- **Availability** - Real-time room status checking

### Room Management
- **View** - Browse all available rooms
- **Edit** - Update room information
- **Delete** - Remove rooms with confirmation
- **Filter** - Search by name or equipment

### User Interface
- **Responsive** - Works on all screen sizes
- **Dark/Light/OLED** - Multiple theme options
- **Real-time Updates** - Changes reflect instantly
- **Confirmation Dialogs** - Prevent accidental deletions

---

## 🛑 HOW TO STOP

When you're done, stop the application:

```powershell
docker compose -f compose.base.yml -f compose.dev.yml down
```

Or use justfile:
```powershell
just stop-docker
```

---

## 🔄 HOW CODE CHANGES WORK

When running in dev mode (Docker):
- ✅ **Edit** any file in `app/src/`
- ✅ Changes **automatically reload** in browser
- ✅ No need to restart anything
- ✅ Keep seeing live updates

---

## 📚 DOCUMENTATION

- **DOCKER_QUICKSTART.md** - Docker reference
- **DOCKER.md** - Full Docker guide
- **SETUP_COMPLETE.md** - What was completed

---

## ⚡ QUICK COMMANDS REFERENCE

```powershell
# Start dev server (HMR enabled)
docker compose -f compose.base.yml -f compose.dev.yml up --build -d

# Stop dev server
docker compose -f compose.base.yml -f compose.dev.yml down

# View logs
docker compose -f compose.base.yml -f compose.dev.yml logs -f

# Start production build
docker compose -f compose.base.yml -f compose.prod.yml up --build -d

# Rebuild from scratch
docker compose -f compose.base.yml -f compose.dev.yml build --no-cache
```

---

## 🆘 HAVING ISSUES?

1. **Docker not running?**
   - Launch Docker Desktop from Start Menu
   - Wait for whale icon to appear

2. **Port 5173 already in use?**
   ```powershell
   docker ps
   docker stop <container_id>
   ```

3. **Build fails?**
   - Ensure `app/package.json` exists
   - Check Docker Desktop has resources allocated
   - Try: `docker compose config` to validate

4. **Need logs?**
   ```powershell
   docker compose -f compose.base.yml -f compose.dev.yml logs -f
   ```

---

## 🎉 YOU'RE ALL SET!

1. Start Docker Desktop ✓
2. Run docker compose command ✓
3. Open http://localhost:5173 ✓
4. Start using the app! 🎊

---

**Questions?** Check the documentation files or the GitHub repository:
https://github.com/NinRai-pc/Room-Assets
