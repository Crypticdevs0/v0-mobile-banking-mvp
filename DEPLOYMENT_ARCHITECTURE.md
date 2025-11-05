# Premier America Credit Union - Deployment Architecture Guide

## Architecture Overview

Your application has **two separate components** that need to be deployed:

### 1. Frontend (Next.js Application)
- **Location**: Root directory with `/app`, `/components`, `/lib`
- **Framework**: Next.js 15 with React 19
- **Best Platform**: **Vercel** (recommended)
- **Why Vercel**: Native Next.js support, automatic builds, edge functions, zero config

### 2. Backend (Express.js API Server)
- **Location**: `/backend` directory
- **Framework**: Express.js with Socket.io
- **Best Platform**: **Render** (recommended) or Heroku/Fly.io
- **Why Separate**: Socket.io requires persistent WebSocket connections

---

## Recommended Deployment Strategy

### Option 1: Vercel + Render (RECOMMENDED)

**Frontend on Vercel** + **Backend on Render**

This is the optimal setup for your application because:
- Vercel provides the best Next.js hosting with automatic optimizations
- Render provides persistent backend hosting for Socket.io
- Both platforms have free tiers for testing
- Easy environment variable management
- Automatic SSL certificates

---

## Step-by-Step Deployment Guide

### Part 1: Deploy Backend to Render

#### 1.1 Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub (connects your repository)

#### 1.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `v0-mobile-banking-mvp`
3. Configure the service:

\`\`\`yaml
Name: premier-banking-backend
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: (leave empty)
Runtime: Node
Build Command: npm install
Start Command: node backend/server.js
\`\`\`

#### 1.3 Set Environment Variables in Render
Go to "Environment" tab and add:

\`\`\`bash
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Fineract Configuration
FINERACT_URL=https://your-fineract-instance.com
FINERACT_TENANT=default
FINERACT_USERNAME=your-fineract-username
FINERACT_PASSWORD=your-fineract-password
FINERACT_PRODUCT_ID=1

# Supabase (from your Vercel project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS - Update after deploying frontend
CLIENT_URL=https://your-app.vercel.app
\`\`\`

#### 1.4 Deploy Backend
- Click "Create Web Service"
- Render will automatically build and deploy
- **Copy the backend URL**: `https://premier-banking-backend.onrender.com`

---

### Part 2: Deploy Frontend to Vercel

#### 2.1 Install Vercel CLI (Optional)
\`\`\`bash
npm install -g vercel
\`\`\`

#### 2.2 Deploy via Vercel Dashboard (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `v0-mobile-banking-mvp`
4. Configure project:

\`\`\`yaml
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
\`\`\`

#### 2.3 Set Environment Variables in Vercel
Go to "Settings" → "Environment Variables":

\`\`\`bash
# Supabase (already connected via integration)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend API URL (from Render deployment)
NEXT_PUBLIC_API_URL=https://premier-banking-backend.onrender.com

# Supabase Redirect URL for email verification
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.vercel.app/auth/callback
\`\`\`

#### 2.4 Deploy Frontend
- Click "Deploy"
- Vercel will build and deploy automatically
- **Copy the frontend URL**: `https://your-app.vercel.app`

---

### Part 3: Connect Frontend and Backend

#### 3.1 Update Backend CORS in Render
Go back to Render → Environment Variables:
\`\`\`bash
CLIENT_URL=https://your-app.vercel.app
\`\`\`
Redeploy the backend service.

#### 3.2 Update Frontend API URL
Already set in Vercel environment variables as `NEXT_PUBLIC_API_URL`

#### 3.3 Test the Connection
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try signing up or logging in
3. Check browser console for any CORS errors
4. Verify Socket.io connection in Network tab

---

## Alternative Deployment Options

### Option 2: All-in-One on Render

Deploy both frontend and backend on Render:

**Pros**: Single platform, simpler management
**Cons**: Not optimized for Next.js, slower builds

\`\`\`yaml
# render.yaml (already created)
services:
  - type: web
    name: premier-banking-frontend
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    
  - type: web
    name: premier-banking-backend
    runtime: node
    buildCommand: npm install
    startCommand: node backend/server.js
\`\`\`

### Option 3: Docker on Any Platform

Use the Docker setup (already created):

\`\`\`bash
# Build and push to Docker Hub
npm run docker:build
docker tag premier-banking:latest yourusername/premier-banking:latest
docker push yourusername/premier-banking:latest

# Deploy to any platform that supports Docker
# - Render
# - Fly.io
# - Railway
# - DigitalOcean App Platform
\`\`\`

---

## Environment Variables Reference

### Required for Backend (Render)
\`\`\`bash
NODE_ENV=production
PORT=10000
JWT_SECRET=<generate-secure-secret>
FINERACT_URL=<your-fineract-url>
FINERACT_TENANT=default
FINERACT_USERNAME=<username>
FINERACT_PASSWORD=<password>
FINERACT_PRODUCT_ID=1
NEXT_PUBLIC_SUPABASE_URL=<from-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase>
CLIENT_URL=<your-vercel-url>
\`\`\`

### Required for Frontend (Vercel)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=<from-supabase>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase>
NEXT_PUBLIC_API_URL=<your-render-backend-url>
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=<your-vercel-url>/auth/callback
\`\`\`

---

## Post-Deployment Checklist

- [ ] Backend deployed and accessible at Render URL
- [ ] Frontend deployed and accessible at Vercel URL
- [ ] All environment variables set correctly
- [ ] CORS configured with frontend URL
- [ ] Supabase integration connected in Vercel
- [ ] Database migrations run in Supabase
- [ ] Socket.io connection working (check browser console)
- [ ] Test signup flow end-to-end
- [ ] Test login flow end-to-end
- [ ] Test transfer functionality
- [ ] Test real-time balance updates
- [ ] Check health endpoint: `https://your-backend.onrender.com/api/health`

---

## Troubleshooting

### CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: Update `CLIENT_URL` in Render to match your Vercel URL exactly

### Socket.io Not Connecting
**Problem**: Real-time updates not working
**Solution**: Ensure backend URL in frontend includes `https://` and no trailing slash

### Supabase Auth Errors
**Problem**: Email verification not working
**Solution**: Update redirect URL in Supabase dashboard and Vercel env vars

### Build Failures
**Problem**: Deployment fails during build
**Solution**: Check build logs, ensure all dependencies in package.json

---

## Quick Deploy Commands

\`\`\`bash
# Deploy backend to Render (using CLI)
npm run deploy:render

# Deploy frontend to Vercel (using CLI)
vercel --prod

# Check backend health
curl https://your-backend.onrender.com/api/health

# View backend logs
# Go to Render dashboard → Logs tab
\`\`\`

---

## Cost Estimate

### Free Tier (Development/Testing)
- **Vercel**: Free (Hobby plan)
- **Render**: Free (Web Service with 750 hours/month)
- **Supabase**: Free (500MB database, 2GB bandwidth)
- **Total**: $0/month

### Production (Paid Tier)
- **Vercel Pro**: $20/month (better performance, analytics)
- **Render Starter**: $7/month (always-on, no cold starts)
- **Supabase Pro**: $25/month (8GB database, 250GB bandwidth)
- **Total**: ~$52/month

---

## Next Steps

1. **Deploy Backend First**: Follow Part 1 to deploy to Render
2. **Deploy Frontend Second**: Follow Part 2 to deploy to Vercel
3. **Connect Services**: Follow Part 3 to link them together
4. **Test Everything**: Use the checklist above
5. **Monitor**: Set up logging and monitoring in both platforms

Your Premier America Credit Union banking app will be live and production-ready!
