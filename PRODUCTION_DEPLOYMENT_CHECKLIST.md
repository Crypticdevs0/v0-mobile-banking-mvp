# Production Deployment Checklist
**Premier America Credit Union - Mobile Banking MVP**

## Pre-Deployment Verification

### 1. Code Quality ✅
- [x] All TypeScript errors resolved
- [x] ESLint warnings addressed
- [x] No console.errors in production code
- [x] All imports are valid
- [x] No unused dependencies

### 2. Environment Variables ✅
- [x] `.env.example` created and documented
- [x] `.env.production.example` created
- [x] All required env vars identified
- [x] Sensitive data not committed to git

### 3. Database ✅
- [x] Supabase project created
- [x] Database schema migrated
- [x] RLS policies enabled
- [x] Test data seeded (optional)

### 4. Security ✅
- [x] JWT secret is strong (32+ characters)
- [x] CORS configured properly
- [x] API routes protected with auth
- [x] Supabase RLS enabled on all tables
- [x] No hardcoded credentials

### 5. Build Tests ✅
- [x] `npm run build` succeeds locally
- [x] `npm run start` works after build
- [x] Backend starts without errors
- [x] Docker build succeeds

---

## Deployment Steps

### Step 1: Deploy Backend to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up or log in

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `v0-mobile-banking-mvp`

3. **Configure Service**
   \`\`\`
   Name: premier-banking-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: (leave blank)
   Runtime: Docker
   Dockerfile Path: Dockerfile.backend
   Docker Build Context Directory: .
   Docker Command: (leave blank)
   \`\`\`

4. **Add Environment Variables**
   Go to "Environment" tab and add:
   \`\`\`
   FINERACT_URL=https://demo.fineract.dev
   FINERACT_TENANT=default
   FINERACT_USERNAME=mifos
   FINERACT_PASSWORD=password
   FINERACT_PRODUCT_ID=1
   JWT_SECRET=[generate with: openssl rand -base64 32]
   NEXT_PUBLIC_SUPABASE_URL=[from Supabase dashboard]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase dashboard]
   SUPABASE_SERVICE_ROLE_KEY=[from Supabase dashboard]
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-frontend.vercel.app
   \`\`\`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Note your backend URL: `https://premier-banking-backend.onrender.com`

6. **Verify Backend Health**
   \`\`\`bash
   curl https://premier-banking-backend.onrender.com/api/health
   \`\`\`
   Should return: `{"status":"ok",...}`

---

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (if not already installed)
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Login to Vercel**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

4. **Configure Environment Variables**
   During deployment, add:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=[from Supabase dashboard]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase dashboard]
   NEXT_PUBLIC_BACKEND_URL=https://premier-banking-backend.onrender.com
   \`\`\`

5. **Verify Frontend**
   - Visit your Vercel URL
   - Test login/signup flow
   - Check browser console for errors

---

### Step 3: Configure Supabase

1. **Enable Realtime**
   - Go to Supabase Dashboard → Database → Replication
   - Enable Realtime for tables:
     - `accounts` (UPDATE)
     - `transactions` (INSERT, UPDATE)
     - `notifications` (INSERT, UPDATE)

2. **Verify RLS Policies**
   - Go to Authentication → Policies
   - Ensure all tables have RLS enabled
   - Test policies with test user

3. **Configure Auth Settings**
   - Go to Authentication → Settings
   - Set Site URL: `https://your-frontend.vercel.app`
   - Add Redirect URLs:
     - `https://your-frontend.vercel.app/auth/callback`
     - `https://your-frontend.vercel.app/dashboard`

---

### Step 4: Update CORS

1. **Update Backend CORS**
   - Go to Render dashboard
   - Update `CLIENT_URL` environment variable
   - Set to: `https://your-frontend.vercel.app`
   - Restart service

2. **Test Cross-Origin Requests**
   - Open frontend in browser
   - Open DevTools → Network tab
   - Perform login
   - Verify no CORS errors

---

### Step 5: Final Verification

1. **Test Complete User Flow**
   - [ ] Landing page loads
   - [ ] Sign up new user
   - [ ] Verify email (if enabled)
   - [ ] Login with credentials
   - [ ] View dashboard
   - [ ] Check balance
   - [ ] Perform transfer
   - [ ] View transaction history
   - [ ] Logout

2. **Test Real-time Features**
   - [ ] Open dashboard in two browsers
   - [ ] Perform transfer in one
   - [ ] Verify balance updates in both

3. **Test Mobile Responsiveness**
   - [ ] Open on mobile device
   - [ ] Test all pages
   - [ ] Verify touch interactions work

4. **Performance Check**
   - [ ] Run Lighthouse audit
   - [ ] Check Core Web Vitals
   - [ ] Verify load times < 3s

---

## Post-Deployment

### Monitoring Setup

1. **Vercel Analytics**
   - Automatically enabled
   - View at: https://vercel.com/[your-project]/analytics

2. **Render Metrics**
   - View at: https://dashboard.render.com
   - Monitor CPU, Memory, Response times

3. **Supabase Logs**
   - View at: Supabase Dashboard → Logs
   - Monitor auth events, database queries

### Custom Domain (Optional)

1. **Add Domain to Vercel**
   - Go to Project Settings → Domains
   - Add your domain: `banking.yourdomain.com`
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - Update `CLIENT_URL` in Render
   - Update Site URL in Supabase
   - Update CORS settings

### Backup Strategy

1. **Database Backups**
   - Supabase: Automatic daily backups (included)
   - Manual backup: Database → Backups → Create backup

2. **Code Backups**
   - GitHub repository (already backed up)
   - Tag releases: `git tag v1.0.0 && git push --tags`

---

## Troubleshooting

### Backend Won't Start
\`\`\`bash
# Check logs
render logs --tail

# Common issues:
# - Missing environment variables
# - Docker build failed
# - Port already in use
\`\`\`

### Frontend Build Fails
\`\`\`bash
# Check build logs in Vercel dashboard
# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variables not set
\`\`\`

### Database Connection Issues
\`\`\`bash
# Verify Supabase credentials
# Check RLS policies
# Verify service role key is correct
\`\`\`

### CORS Errors
\`\`\`bash
# Verify CLIENT_URL matches frontend domain
# Check browser console for exact error
# Ensure credentials: true in backend CORS config
\`\`\`

---

## Rollback Procedure

### Rollback Frontend
\`\`\`bash
# In Vercel dashboard
# Go to Deployments
# Find previous working deployment
# Click "..." → "Promote to Production"
\`\`\`

### Rollback Backend
\`\`\`bash
# In Render dashboard
# Go to Events
# Find previous deployment
# Click "Rollback to this version"
\`\`\`

### Rollback Database
\`\`\`bash
# In Supabase dashboard
# Go to Database → Backups
# Select backup point
# Click "Restore"
\`\`\`

---

## Success Criteria

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Users can sign up and login
- [ ] Transfers work end-to-end
- [ ] Real-time updates functioning
- [ ] Mobile responsive on all devices
- [ ] No console errors in production
- [ ] Lighthouse score > 90
- [ ] All environment variables set
- [ ] Monitoring dashboards accessible

---

**Deployment Status:** Ready for Production ✅

*Last Updated: January 2025*
