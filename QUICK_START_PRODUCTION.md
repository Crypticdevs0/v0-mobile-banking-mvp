# Quick Start - Production Deployment
**Get your banking app live in 15 minutes**

## Prerequisites
- GitHub account
- Render account (free tier works)
- Vercel account (free tier works)
- Supabase project created

---

## 5-Minute Backend Deploy (Render)

1. **Go to Render Dashboard**
   \`\`\`
   https://dashboard.render.com
   \`\`\`

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repo: `v0-mobile-banking-mvp`
   - Name: `premier-banking-backend`
   - Runtime: **Docker**
   - Dockerfile: `Dockerfile.backend`

3. **Add Environment Variables** (copy-paste this)
   \`\`\`bash
   FINERACT_URL=https://demo.fineract.dev
   FINERACT_TENANT=default
   FINERACT_USERNAME=mifos
   FINERACT_PASSWORD=password
   FINERACT_PRODUCT_ID=1
   JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHAR_STRING
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_KEY
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://your-app.vercel.app
   \`\`\`

4. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Copy your backend URL: `https://[your-service].onrender.com`

---

## 5-Minute Frontend Deploy (Vercel)

1. **Install Vercel CLI**
   \`\`\`bash
   npm install -g vercel
   \`\`\`

2. **Login**
   \`\`\`bash
   vercel login
   \`\`\`

3. **Deploy**
   \`\`\`bash
   cd /path/to/v0-mobile-banking-mvp
   vercel --prod
   \`\`\`

4. **Add Environment Variables** (when prompted)
   \`\`\`bash
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   NEXT_PUBLIC_BACKEND_URL=https://[your-render-service].onrender.com
   \`\`\`

5. **Done!**
   - Your app is live at: `https://[your-project].vercel.app`

---

## 5-Minute Supabase Setup

1. **Enable Realtime**
   - Dashboard → Database → Replication
   - Toggle ON for: `accounts`, `transactions`, `notifications`

2. **Configure Auth**
   - Dashboard → Authentication → URL Configuration
   - Site URL: `https://[your-project].vercel.app`
   - Redirect URLs: Add `/auth/callback` and `/dashboard`

3. **Verify RLS**
   - Dashboard → Database → Tables
   - Ensure RLS is enabled on all tables (green shield icon)

---

## Test Your Deployment

1. **Visit your app**
   \`\`\`
   https://[your-project].vercel.app
   \`\`\`

2. **Sign up a test user**
   - Click "Sign Up"
   - Fill in details
   - Verify email (if enabled)

3. **Test features**
   - View dashboard
   - Check balance
   - Perform a transfer
   - View transactions

---

## Get Your URLs

### Backend URL
\`\`\`
https://[your-service].onrender.com
\`\`\`
Test: `curl https://[your-service].onrender.com/api/health`

### Frontend URL
\`\`\`
https://[your-project].vercel.app
\`\`\`

### Supabase URL
\`\`\`
https://[your-project].supabase.co
\`\`\`

---

## Update CORS (Important!)

After frontend is deployed, update backend:

1. Go to Render dashboard
2. Find your service
3. Environment → Edit `CLIENT_URL`
4. Set to: `https://[your-project].vercel.app`
5. Save and restart service

---

## Common Issues

### "Failed to fetch" errors
- Check `NEXT_PUBLIC_BACKEND_URL` is correct
- Verify CORS is configured
- Check backend is running: visit `/api/health`

### "Unauthorized" errors
- Verify Supabase keys are correct
- Check RLS policies are enabled
- Ensure JWT_SECRET is set

### Build fails
- Check all environment variables are set
- Verify no TypeScript errors locally
- Check build logs in dashboard

---

## Next Steps

1. **Custom Domain** (optional)
   - Add domain in Vercel settings
   - Update DNS records
   - Update CORS and auth URLs

2. **Monitoring**
   - Check Vercel Analytics
   - Monitor Render metrics
   - Review Supabase logs

3. **Production Fineract**
   - Replace demo Fineract URL
   - Update credentials
   - Test thoroughly

---

**You're Live! 🎉**

Your Premier America Credit Union banking app is now in production.

Need help? Check `PRODUCTION_DEPLOYMENT_CHECKLIST.md` for detailed steps.
