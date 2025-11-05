# Render Deployment Configuration Guide
## Premier America Credit Union - Mobile Banking MVP

This guide provides **exact values** to fill in Render's deployment form.

---

## 🎯 Quick Answer: What to Fill In

### **Service Type**
Select: **Web Service**

### **Repository**
Connect your GitHub repository: `v0-mobile-banking-mvp`

### **Branch**
\`\`\`
main
\`\`\`

---

## 📋 Build & Deploy Settings

### 1. **Docker Build Context Directory**
\`\`\`
.
\`\`\`
**What it means:** The root of your repository (`.` = current directory)

**Why:** Your `Dockerfile.backend` needs access to:
- `package.json` (in root)
- `backend/` folder
- `lib/` folder for Supabase utilities

**❌ Don't use:** `./backend` or `/backend` - this will fail because package.json is in the root

---

### 2. **Dockerfile Path**
\`\`\`
Dockerfile.backend
\`\`\`
**What it means:** Path to your backend-specific Dockerfile

**Why:** We have two Dockerfiles:
- `Dockerfile` - Full-stack (frontend + backend)
- `Dockerfile.backend` - Backend only (for Render)

---

### 3. **Docker Command** (Optional Override)
**Leave this BLANK** or use:
\`\`\`
node backend/server.js
\`\`\`

**Why:** Your `Dockerfile.backend` already has the correct `CMD` instruction. Only fill this if you need to override it.

---

### 4. **Pre-Deploy Command** (Optional but Recommended)
\`\`\`bash
npm run migrate || echo "Migrations skipped"
\`\`\`

**What it does:**
- Runs database migrations before starting your service
- Verifies Supabase tables exist
- Gracefully skips if credentials aren't set yet

**Alternative (more verbose):**
\`\`\`bash
chmod +x scripts/run-migrations.sh && npm run migrate
\`\`\`

---

## 🔐 Environment Variables

Click **"Add Environment Variable"** and add these:

### Required Variables:

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `NODE_ENV` | `production` | Static value |
| `PORT` | `10000` | Render's default (auto-set) |
| `SUPABASE_POSTGRES_URL` | `postgresql://...` | Supabase Dashboard → Settings → Database → Connection String |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API → service_role key |
| `SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase Dashboard → Settings → API → anon public key |
| `JWT_SECRET` | `your-secret-key-here` | Generate with: `openssl rand -base64 32` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Your Vercel frontend URL |

### Optional (Fineract Integration):

| Key | Value | Where to Get It |
|-----|-------|-----------------|
| `FINERACT_URL` | `https://demo.fineract.dev` | Your Fineract instance URL |
| `FINERACT_TENANT` | `default` | Your Fineract tenant |
| `FINERACT_USERNAME` | `mifos` | Fineract admin username |
| `FINERACT_PASSWORD` | `password` | Fineract admin password |
| `FINERACT_PRODUCT_ID` | `1` | Your savings product ID |

---

## 🚀 Complete Render Setup Steps

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### Step 2: Configure Service
Fill in these fields:

**Name:**
\`\`\`
premier-banking-backend
\`\`\`

**Region:**
\`\`\`
Oregon (US West) or closest to your users
\`\`\`

**Branch:**
\`\`\`
main
\`\`\`

**Root Directory:**
\`\`\`
(leave blank)
\`\`\`

**Runtime:**
\`\`\`
Docker
\`\`\`

**Dockerfile Path:**
\`\`\`
Dockerfile.backend
\`\`\`

**Docker Build Context Directory:**
\`\`\`
.
\`\`\`

**Docker Command:**
\`\`\`
(leave blank)
\`\`\`

### Step 3: Pre-Deploy Command
\`\`\`bash
npm run migrate || echo "Migrations skipped"
\`\`\`

### Step 4: Add Environment Variables
Copy all variables from the table above.

**Pro Tip:** Use Render's "Add from .env" feature:
1. Create a temporary `.env` file with all variables
2. Click "Add from .env" in Render
3. Paste the contents
4. Delete the local `.env` file (never commit it!)

### Step 5: Advanced Settings

**Health Check Path:**
\`\`\`
/health
\`\`\`

**Auto-Deploy:**
\`\`\`
✅ Yes (deploys automatically on git push)
\`\`\`

**Instance Type:**
\`\`\`
Free (for testing) or Starter ($7/month for production)
\`\`\`

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Service status shows "Live" (green)
- [ ] Health check endpoint responds: `https://your-backend.onrender.com/health`
- [ ] Logs show: `[Server] Backend running on port 10000`
- [ ] No error messages in deployment logs
- [ ] Database connection successful (check logs for Supabase connection)

---

## 🐛 Common Issues & Fixes

### Issue 1: "npm ci requires package-lock.json"
**Fix:** Already fixed in `Dockerfile.backend` - uses `npm install` instead

### Issue 2: "Cannot find module 'express'"
**Fix:** Ensure `package.json` is in root directory (not in `/backend`)

### Issue 3: "ECONNREFUSED - Supabase connection failed"
**Fix:** 
1. Verify `SUPABASE_POSTGRES_URL` is correct
2. Check Supabase project is not paused
3. Verify IP allowlist in Supabase (Render IPs should be allowed)

### Issue 4: "Port already in use"
**Fix:** Render automatically sets `PORT=10000` - don't override it

### Issue 5: "Migration failed"
**Fix:** 
1. Run SQL scripts manually in Supabase dashboard first
2. Scripts location: `/scripts/001_create_banking_schema.sql`, etc.
3. Pre-deploy command will verify tables exist

---

## 📊 Expected Deployment Output

\`\`\`bash
==> Cloning from https://github.com/your-username/v0-mobile-banking-mvp...
==> Checking out commit 4a1dac2 in branch main
==> Running build command 'docker build...'
==> Running pre-deploy command: npm run migrate
[Migration] Starting database migrations...
[Migration] ✓ Database tables verified
[Migration] ✓ Migrations complete
==> Starting service with 'node backend/server.js'
[Server] Environment: production
[Server] Backend running on port 10000
[Server] Socket.io initialized
[Server] Health check available at /health
==> Your service is live at https://premier-banking-backend.onrender.com
\`\`\`

---

## 🔗 Next Steps

1. **Copy your backend URL** from Render (e.g., `https://premier-banking-backend.onrender.com`)
2. **Deploy frontend to Vercel** with this backend URL as `NEXT_PUBLIC_API_URL`
3. **Update CORS_ORIGIN** in Render with your Vercel frontend URL
4. **Test the connection** by visiting your frontend and checking the Network tab

---

## 📞 Need Help?

- **Render Logs:** Dashboard → Your Service → Logs
- **Health Check:** `https://your-backend.onrender.com/health`
- **Backend Status:** Check Render dashboard for service status

Your backend should now be live and ready to connect with your Vercel frontend!
