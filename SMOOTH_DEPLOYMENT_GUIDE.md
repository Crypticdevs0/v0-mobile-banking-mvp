# Smooth Deployment Guide - Premier America Credit Union

## Overview
This guide ensures smooth deployment of your banking application with:
- **Backend**: Render (Express.js + Socket.io + Fineract)
- **Frontend**: Vercel (Next.js + React)
- **Database**: Supabase (PostgreSQL + Auth)

---

## Quick Deploy (5 Minutes)

### Step 1: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**
3. **Connect GitHub Repository**: `v0-mobile-banking-mvp`
4. **Configure Service**:
   - **Name**: `premier-banking-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Docker
   - **Dockerfile Path**: `Dockerfile.backend`
   - **Docker Build Context Directory**: `.`
   - **Docker Command**: Leave blank (uses CMD from Dockerfile)

5. **Add Environment Variables**:
\`\`\`bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FINERACT_URL=https://demo.fineract.dev
FINERACT_TENANT=default
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=password
FINERACT_PRODUCT_ID=1
CLIENT_URL=https://your-app.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
\`\`\`

6. **Click "Create Web Service"**
7. **Wait for deployment** (3-5 minutes)
8. **Copy your backend URL**: `https://premier-banking-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Project** → Select `v0-mobile-banking-mvp`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

4. **Add Environment Variables**:
\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Backend API
NEXT_PUBLIC_API_URL=https://premier-banking-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://premier-banking-backend.onrender.com

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
\`\`\`

5. **Click "Deploy"**
6. **Wait for deployment** (2-3 minutes)
7. **Copy your frontend URL**: `https://premier-banking.vercel.app`

---

### Step 3: Update CORS Settings

1. **Go back to Render Dashboard**
2. **Select your backend service**
3. **Environment** → **Add Environment Variable**:
\`\`\`bash
CLIENT_URL=https://premier-banking.vercel.app
\`\`\`
4. **Save Changes** (triggers automatic redeploy)

---

## Verification Checklist

### Backend Health Check
\`\`\`bash
curl https://premier-banking-backend.onrender.com/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "services": {
    "api": "healthy",
    "fineract": "healthy",
    "socketio": "healthy"
  }
}
\`\`\`

### Frontend Health Check
1. Visit: `https://premier-banking.vercel.app`
2. Should see landing page with "Premier America Credit Union"
3. Click "Sign In" → Should load login page
4. Open browser console → No errors

### Connection Test
1. **Login** with demo credentials:
   - Email: `alice@bank.com`
   - Password: `password123`
2. **Check Dashboard** loads with balance
3. **Check Real-time**: Balance updates should work
4. **Check Transfers**: Send money should work

---

## Troubleshooting

### Backend Issues

**Error: "Cannot use import statement outside a module"**
- ✅ Fixed: Added `"type": "module"` to package.json
- ✅ Fixed: Updated Dockerfile to Node 20

**Error: "Unsupported engine" (Supabase)**
- ✅ Fixed: Updated Dockerfile from Node 18 to Node 20

**Error: "Missing environment variables"**
- Check all required env vars are set in Render
- Restart service after adding variables

### Frontend Issues

**Error: "Supabase client creation failed"**
- ✅ Fixed: Added fallback handling in lib/supabase/client.ts
- Verify NEXT_PUBLIC_SUPABASE_URL is set in Vercel

**Error: "Failed to fetch from backend"**
- Check NEXT_PUBLIC_API_URL is correct
- Verify backend is running (health check)
- Check CORS settings in backend

**Error: "Socket.io connection failed"**
- Verify NEXT_PUBLIC_SOCKET_URL matches backend URL
- Check backend logs for WebSocket errors

---

## Environment Variables Reference

### Backend (Render)
| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `production` | Environment mode |
| `PORT` | Yes | `3001` | Server port |
| `JWT_SECRET` | Yes | `your-secret-key` | JWT signing key |
| `FINERACT_URL` | Yes | `https://demo.fineract.dev` | Fineract API URL |
| `FINERACT_TENANT` | Yes | `default` | Fineract tenant |
| `FINERACT_USERNAME` | Yes | `mifos` | Fineract username |
| `FINERACT_PASSWORD` | Yes | `password` | Fineract password |
| `FINERACT_PRODUCT_ID` | Yes | `1` | Savings product ID |
| `CLIENT_URL` | Yes | `https://your-app.vercel.app` | Frontend URL for CORS |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJ...` | Supabase service key |

### Frontend (Vercel)
| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | `eyJ...` | Supabase service key |
| `NEXT_PUBLIC_API_URL` | Yes | `https://backend.onrender.com` | Backend API URL |
| `NEXT_PUBLIC_SOCKET_URL` | Yes | `https://backend.onrender.com` | Socket.io URL |

---

## Production Optimization

### Backend (Render)
- ✅ Using Node 20 Alpine (minimal image)
- ✅ Non-root user for security
- ✅ Health checks enabled
- ✅ Graceful shutdown with dumb-init
- ✅ Production dependencies only

### Frontend (Vercel)
- ✅ Automatic edge optimization
- ✅ Image optimization enabled
- ✅ Static generation where possible
- ✅ Dynamic rendering for auth pages
- ✅ Analytics integration ready

---

## Monitoring

### Backend Logs (Render)
\`\`\`bash
# View in Render Dashboard
Logs → Select service → View real-time logs
\`\`\`

### Frontend Logs (Vercel)
\`\`\`bash
# View in Vercel Dashboard
Deployments → Select deployment → Runtime Logs
\`\`\`

### Database Monitoring (Supabase)
\`\`\`bash
# View in Supabase Dashboard
Database → Logs
\`\`\`

---

## Rollback Procedure

### Backend (Render)
1. Go to Render Dashboard
2. Select service → Deploys
3. Find previous successful deploy
4. Click "Redeploy"

### Frontend (Vercel)
1. Go to Vercel Dashboard
2. Select project → Deployments
3. Find previous deployment
4. Click "..." → "Promote to Production"

---

## Support

- **Render Issues**: https://render.com/docs
- **Vercel Issues**: https://vercel.com/docs
- **Supabase Issues**: https://supabase.com/docs

---

## Success Criteria

✅ Backend deployed and health check passes
✅ Frontend deployed and accessible
✅ Login works with demo credentials
✅ Dashboard loads with balance
✅ Real-time updates work (Socket.io)
✅ Transfers complete successfully
✅ No console errors
✅ Mobile responsive design works

**Your Premier America Credit Union banking app is now live!** 🎉
