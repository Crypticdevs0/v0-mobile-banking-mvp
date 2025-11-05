# Deployment Troubleshooting Guide

## Common Render Deployment Issues

### 1. Peer Dependency Conflicts
**Error:**
\`\`\`
npm error ERESOLVE unable to resolve dependency tree
\`\`\`

**Solution:**
- Use `--legacy-peer-deps` flag in Dockerfile
- Update conflicting packages to latest versions
- See `RENDER_DEPLOY_FIX.md` for details

### 2. Missing package-lock.json
**Error:**
\`\`\`
npm ci can only install with an existing package-lock.json
\`\`\`

**Solution:**
- Use `npm install` instead of `npm ci` in Dockerfile
- Or generate package-lock.json: `npm install --package-lock-only`

### 3. Build Timeout
**Error:**
\`\`\`
Build exceeded maximum time limit
\`\`\`

**Solution:**
- Optimize Docker layers with multi-stage builds
- Use `.dockerignore` to exclude unnecessary files
- Enable Docker layer caching in Render settings

### 4. Port Binding Issues
**Error:**
\`\`\`
Error: listen EADDRINUSE: address already in use :::3001
\`\`\`

**Solution:**
- Ensure `PORT` environment variable is set correctly
- Use `process.env.PORT || 3001` in server.js
- Check Render service settings for correct port

### 5. Environment Variables Not Set
**Error:**
\`\`\`
Error: Missing required environment variable: SUPABASE_URL
\`\`\`

**Solution:**
- Add all required env vars in Render dashboard
- See `RENDER_CONFIGURATION_GUIDE.md` for complete list
- Use the environment variable validation script

### 6. Database Connection Failures
**Error:**
\`\`\`
Error: connect ETIMEDOUT
\`\`\`

**Solution:**
- Verify Supabase URL and keys are correct
- Check if Supabase project is active
- Ensure IP allowlist includes Render's IPs (or use 0.0.0.0/0)

### 7. CORS Errors
**Error:**
\`\`\`
Access to fetch at 'https://api.example.com' from origin 'https://frontend.com' has been blocked by CORS
\`\`\`

**Solution:**
- Update `CORS_ORIGIN` environment variable with frontend URL
- Ensure backend CORS middleware is configured correctly
- Add both development and production URLs

### 8. Health Check Failures
**Error:**
\`\`\`
Health check failed: Connection refused
\`\`\`

**Solution:**
- Verify `/api/health` endpoint exists and responds
- Check if server is listening on correct port
- Ensure health check path matches in Dockerfile and Render settings

## Render-Specific Configuration

### Correct Settings:
\`\`\`yaml
# render.yaml
services:
  - type: web
    name: premier-banking-backend
    env: docker
    dockerfilePath: ./Dockerfile.backend
    dockerContext: .
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
\`\`\`

### Environment Variables Checklist:
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `FINERACT_URL`
- [ ] `FINERACT_TENANT`
- [ ] `FINERACT_USERNAME`
- [ ] `FINERACT_PASSWORD`
- [ ] `JWT_SECRET`
- [ ] `CORS_ORIGIN`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`

## Quick Fixes

### Force Rebuild:
\`\`\`bash
# In Render dashboard
Manual Deploy > Clear build cache & deploy
\`\`\`

### View Logs:
\`\`\`bash
# In Render dashboard
Logs > Select time range > Filter by error
\`\`\`

### Test Locally:
\`\`\`bash
# Build and run Docker locally
npm run docker:build:backend
docker run -p 3001:3001 --env-file .env.production premier-banking-backend:latest
\`\`\`

### Verify Health:
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

## Getting Help
If issues persist:
1. Check Render status page: https://status.render.com
2. Review full build logs in Render dashboard
3. Test Docker build locally first
4. Verify all environment variables are set
5. Check Supabase project status

## Success Indicators
✅ Build completes without errors
✅ Health check endpoint responds with 200
✅ Service shows "Live" status in Render
✅ Logs show "Server running on port 3001"
✅ API endpoints respond correctly
