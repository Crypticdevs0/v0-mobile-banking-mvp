# Premier America Credit Union - Deployment Guide

## Quick Start (Development)

### 1. Environment Setup
\`\`\`bash
# Run the setup script
bash setup-env.sh

# Or manually create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
EOF

# Create backend/.env
cat > backend/.env << 'EOF'
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
FINERACT_URL=http://localhost:8080
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=[password]
FINERACT_TENANT=default
FINERACT_PRODUCT_ID=1
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
EOF
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Run Database Migrations
\`\`\`bash
# In Supabase SQL Editor or via CLI:
# Run scripts/001_create_banking_schema.sql
# Run scripts/002_enable_rls.sql
# Run scripts/003_add_otp_table.sql
\`\`\`

### 4. Start Development Servers

**Option A: Combined (one terminal with background processes)**
\`\`\`bash
npm run dev:backend & npm run dev:frontend
\`\`\`

**Option B: Separate Terminals**
\`\`\`bash
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend
npm run dev
\`\`\`

**Option C: Using npm-run-all**
\`\`\`bash
npm install -g npm-run-all
npm-run-all --parallel dev:backend dev:frontend
\`\`\`

### 5. Verify Setup
\`\`\`bash
# Test backend health
curl http://localhost:3001/api/health

# Test frontend
open http://localhost:3000

# Test Socket.io
curl http://localhost:3001
\`\`\`

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Tests passing (npm test)
- [ ] No security vulnerabilities (npm audit)
- [ ] Build completes without errors (npm run build)
- [ ] .env files NOT committed to git

### Option 1: Deploy to Vercel (Recommended)

\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel deploy --prod

# Deploy backend (if using separate project)
cd backend && vercel deploy --prod
\`\`\`

**Vercel Environment Variables:**
1. Go to Project Settings → Environment Variables
2. Add all NEXT_PUBLIC_* variables
3. Add backend URL: NEXT_PUBLIC_API_URL
4. Redeploy

### Option 2: Deploy to Heroku

\`\`\`bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create premier-banking-api

# Set environment variables
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_SERVICE_ROLE_KEY=...
heroku config:set FINERACT_URL=...
heroku config:set JWT_SECRET=...
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
\`\`\`

### Option 3: Docker Deployment

**Create Dockerfile:**
\`\`\`dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build frontend
COPY . .
RUN npm run build

EXPOSE 3000 3001

CMD ["npm", "run", "start:all"]
\`\`\`

**Create docker-compose.yml:**
\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - FINERACT_URL=${FINERACT_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: premier_banking
\`\`\`

**Deploy:**
\`\`\`bash
docker build -t premier-banking:latest .
docker-compose up -d
\`\`\`

### Option 4: AWS ECS

\`\`\`bash
# Create ECR repository
aws ecr create-repository --repository-name premier-banking

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [account-id].dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t premier-banking:latest .
docker tag premier-banking:latest [account-id].dkr.ecr.us-east-1.amazonaws.com/premier-banking:latest
docker push [account-id].dkr.ecr.us-east-1.amazonaws.com/premier-banking:latest

# Deploy to ECS
aws ecs update-service \
  --cluster premier-banking \
  --service api \
  --force-new-deployment
\`\`\`

---

## Monitoring & Maintenance

### Health Checks

**Backend Health:**
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

**Frontend Status:**
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

**Database Connectivity:**
\`\`\`bash
npm run health:db
\`\`\`

### Logs

**Backend Logs (Development):**
\`\`\`bash
# Check console output from node server.js
NODE_DEBUG=* node backend/server.js
\`\`\`

**Backend Logs (Production):**
\`\`\`bash
# Heroku
heroku logs --tail

# Docker
docker logs -f [container-id]

# AWS CloudWatch
aws logs tail /ecs/premier-banking --follow
\`\`\`

### Database Monitoring

**Supabase Dashboard:**
- Go to https://app.supabase.com/
- View real-time metrics
- Monitor RLS policies
- Check storage usage

### Performance Optimization

**Frontend:**
\`\`\`bash
npm run build
# Check bundle size
npm analyze

# Optimize images
npm run optimize-images
\`\`\`

**Backend:**
\`\`\`bash
# Enable compression
npm install compression

# Add rate limiting
npm install express-rate-limit

# Monitor with DataDog
npm install @datadog/browser-rum
\`\`\`

---

## Rollback Procedures

### Vercel Rollback
\`\`\`bash
vercel rollback
\`\`\`

### Heroku Rollback
\`\`\`bash
heroku releases
heroku rollback v123
\`\`\`

### Manual Rollback (Git)
\`\`\`bash
git revert HEAD
git push origin main
\`\`\`

---

## Troubleshooting

### Socket.io Connection Errors
\`\`\`
Error: WebSocket connection refused
Solution: Ensure backend is running on correct port
Check: curl http://localhost:3001/socket.io/
\`\`\`

### Database Connection Errors
\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:5432
Solution: Verify Supabase credentials in .env
Check: npm run health:db
\`\`\`

### Frontend Build Errors
\`\`\`
Error: Cannot find module
Solution: npm install
npm run build
\`\`\`

### CORS Issues
\`\`\`
Error: Access-Control-Allow-Origin header missing
Solution: Check CLIENT_URL in backend .env
Ensure CORS middleware is configured
\`\`\`

---

## Security Considerations

### Before Going Live

1. **Secrets Management**
   - Never commit .env files
   - Use secret manager (AWS Secrets Manager, HashiCorp Vault)
   - Rotate credentials regularly

2. **API Security**
   - Enable rate limiting
   - Add API key validation
   - Implement request signing

3. **Data Protection**
   - Enable encryption at rest
   - Enable HTTPS only
   - Enable Row-Level Security (RLS) on all tables

4. **Authentication**
   - Implement 2FA for high-value transactions
   - Add password complexity requirements
   - Add session timeout

5. **Monitoring**
   - Set up alerts for errors
   - Monitor database performance
   - Track API response times

---

## Performance Benchmarks

### Target Metrics
- Page load time: < 3 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Real-time update latency: < 1 second

### Monitor with
\`\`\`bash
# Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000

# WebPageTest
# Go to https://www.webpagetest.org/

# DataDog/New Relic integration
\`\`\`

---

**Last Updated:** November 1, 2025  
**Version:** 1.0  
**Maintained By:** Premier America Credit Union Dev Team
\`\`\`

Now let me create the database migration scripts:
