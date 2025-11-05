# Quick Deploy Guide - Premier America Credit Union

## TL;DR - Deploy in 10 Minutes

### 1. Deploy Backend (5 minutes)
\`\`\`bash
# Option A: Using Render (Recommended)
npm run deploy:render

# Option B: Using Heroku
npm run deploy:heroku

# Option C: Using Fly.io
npm run deploy:fly
\`\`\`

**Copy the backend URL** (e.g., `https://premier-banking-backend.onrender.com`)

---

### 2. Deploy Frontend (5 minutes)
\`\`\`bash
# Option A: Using Vercel Dashboard (Easiest)
# 1. Go to vercel.com
# 2. Import GitHub repo
# 3. Add environment variables
# 4. Click Deploy

# Option B: Using Vercel CLI
npm run deploy:vercel
\`\`\`

**Copy the frontend URL** (e.g., `https://premier-banking.vercel.app`)

---

### 3. Connect Them (2 minutes)

**Update Backend CORS:**
- Go to Render dashboard
- Add environment variable: `CLIENT_URL=https://your-vercel-url.vercel.app`
- Redeploy

**Update Frontend API:**
- Go to Vercel dashboard
- Add environment variable: `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
- Redeploy

---

## Environment Variables Checklist

### Backend (Render/Heroku/Fly.io)
\`\`\`bash
✓ NODE_ENV=production
✓ PORT=10000
✓ JWT_SECRET=your-secret-key
✓ FINERACT_URL=your-fineract-url
✓ FINERACT_TENANT=default
✓ FINERACT_USERNAME=username
✓ FINERACT_PASSWORD=password
✓ NEXT_PUBLIC_SUPABASE_URL=supabase-url
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
✓ CLIENT_URL=your-vercel-url
\`\`\`

### Frontend (Vercel)
\`\`\`bash
✓ NEXT_PUBLIC_SUPABASE_URL=supabase-url
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
✓ SUPABASE_SERVICE_ROLE_KEY=service-role-key
✓ NEXT_PUBLIC_API_URL=your-backend-url
\`\`\`

---

## Test Your Deployment

1. Visit your Vercel URL
2. Try signing up with a test account
3. Check if balance loads
4. Try making a transfer
5. Verify real-time updates work

---

## Need Help?

See `DEPLOYMENT_ARCHITECTURE.md` for detailed instructions.
