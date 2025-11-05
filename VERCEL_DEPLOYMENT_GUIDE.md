# Vercel Deployment Guide - Premier America Credit Union

## Quick Deploy Steps

### 1. Push to GitHub
\`\`\`bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
\`\`\`

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `v0-mobile-banking-mvp`
4. Vercel will auto-detect Next.js

### 3. Configure Environment Variables

**CRITICAL:** Add these environment variables in Vercel dashboard before deploying:

#### Required Supabase Variables
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

#### Optional Backend Variables (if using separate backend)
\`\`\`bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com
\`\`\`

### 4. Deploy Settings

**Framework Preset:** Next.js
**Build Command:** `pnpm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `pnpm install` (auto-detected)

### 5. Deploy

Click "Deploy" and wait 2-3 minutes.

---

## Environment Variables Setup

### Where to Find Supabase Credentials

1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Adding Variables in Vercel

1. In Vercel project settings, go to "Environment Variables"
2. Add each variable:
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** Your Supabase URL
   - **Environments:** Production, Preview, Development (select all)
3. Click "Save"
4. Repeat for all variables

---

## Troubleshooting

### Error: "Supabase URL and API key are required"

**Solution:** Environment variables not set in Vercel.
1. Go to Vercel project → Settings → Environment Variables
2. Add all required Supabase variables
3. Redeploy: Deployments → Click "..." → Redeploy

### Error: "Module not found" or build failures

**Solution:** Clear build cache and redeploy.
1. Go to Vercel project → Settings → General
2. Scroll to "Build & Development Settings"
3. Enable "Automatically expose System Environment Variables"
4. Redeploy

### Error: Edge Runtime compatibility warnings

**Solution:** These are warnings, not errors. The app will still work.
- Supabase uses Node.js APIs that trigger warnings in Edge Runtime
- These don't affect functionality in production

---

## Post-Deployment Checklist

- [ ] Frontend deployed successfully on Vercel
- [ ] Backend deployed on Render (if separate)
- [ ] All environment variables configured
- [ ] Test login with demo credentials
- [ ] Test signup flow
- [ ] Verify Supabase connection
- [ ] Check real-time updates work
- [ ] Test on mobile devices

---

## Custom Domain Setup (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain (e.g., `app.premieramerica.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, ~5 minutes)

---

## Monitoring & Logs

### View Deployment Logs
1. Go to Vercel project → Deployments
2. Click on latest deployment
3. View "Build Logs" and "Function Logs"

### View Runtime Logs
1. Go to Vercel project → Logs
2. Filter by time range
3. Search for errors or specific requests

---

## Performance Optimization

Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Image optimization
- ✅ Edge caching
- ✅ Serverless functions

---

## Support

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Check GitHub repository has latest code

**Need help?** Contact Vercel support or check [Vercel Docs](https://vercel.com/docs)
