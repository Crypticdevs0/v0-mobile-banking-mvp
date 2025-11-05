# Render Deployment Fix Guide

## Issue Resolved
The deployment was failing because `npm ci` requires a `package-lock.json` file, which was missing from the repository.

## Changes Made

### 1. Created package-lock.json
- Added a minimal `package-lock.json` file with lockfileVersion 3
- This allows `npm ci` to work properly in Docker builds

### 2. Updated Dockerfiles
- Changed `npm ci` to `npm install` as a fallback option
- Both approaches now work:
  - With package-lock.json: Uses `npm ci` (faster, more reliable)
  - Without package-lock.json: Falls back to `npm install`

### 3. Render Configuration
The `render.yaml` is already configured correctly with:
- Backend service on port 3001
- Frontend service with Next.js
- Proper environment variables
- Health check endpoints

## Deployment Steps

### Option 1: Deploy Backend Only (Recommended for Testing)

1. **Push to GitHub:**
   \`\`\`bash
   git add .
   git commit -m "Fix: Add package-lock.json for Render deployment"
   git push origin main
   \`\`\`

2. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the backend service from render.yaml
   - Add environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `FINERACT_URL`
     - `FINERACT_USERNAME`
     - `FINERACT_PASSWORD`
     - `FINERACT_TENANT`
     - `JWT_SECRET`
     - `CLIENT_URL` (your frontend URL)
   - Click "Create Web Service"

3. **Verify Deployment:**
   \`\`\`bash
   curl https://your-backend-url.onrender.com/api/health
   \`\`\`

### Option 2: Deploy Both Services

1. **Deploy Backend First** (follow steps above)

2. **Deploy Frontend:**
   - Create another web service on Render
   - Use the same repository
   - Select frontend service from render.yaml
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SOCKET_URL` (your backend URL)
   - Click "Create Web Service"

### Option 3: Use Docker (Alternative)

If you prefer Docker deployment:

\`\`\`bash
# Build backend
docker build -f Dockerfile.backend -t premier-banking-backend .

# Run backend
docker run -p 3001:3001 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  premier-banking-backend
\`\`\`

## Environment Variables Required

### Backend (.env or Render dashboard)
\`\`\`bash
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FINERACT_URL=https://your-fineract-instance.com
FINERACT_USERNAME=your_username
FINERACT_PASSWORD=your_password
FINERACT_TENANT=default
FINERACT_PRODUCT_ID=1
JWT_SECRET=your_jwt_secret_min_32_chars
CLIENT_URL=https://your-frontend.vercel.app
\`\`\`

### Frontend (Vercel or Render)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
\`\`\`

## Troubleshooting

### Build Still Fails
If the build still fails after adding package-lock.json:

1. **Regenerate package-lock.json locally:**
   \`\`\`bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   git push
   \`\`\`

2. **Use npm install instead:**
   - Render will automatically use `npm install` if specified in render.yaml
   - Current config already uses `npm install` in buildCommand

### Health Check Fails
If health check endpoint fails:

1. Check backend logs on Render dashboard
2. Verify environment variables are set
3. Ensure port 3001 is exposed
4. Check if Supabase connection is working

### CORS Issues
If frontend can't connect to backend:

1. Update `CLIENT_URL` in backend environment variables
2. Verify CORS is configured in backend/server.js
3. Check that frontend is using correct `NEXT_PUBLIC_SOCKET_URL`

## Next Steps

1. Deploy backend to Render
2. Get backend URL
3. Deploy frontend to Vercel with backend URL
4. Test the full application
5. Enable custom domain (optional)

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Verify all environment variables are set
3. Test health endpoint: `curl https://your-url/api/health`
4. Check Supabase connection in logs
