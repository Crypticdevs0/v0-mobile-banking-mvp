# Docker Deployment Guide - Premier America Credit Union

## Overview

This guide covers deploying the mobile banking MVP using Docker across multiple platforms:
- Local development with Docker Compose
- Render (recommended for simplicity)
- Heroku (traditional PaaS)
- Fly.io (modern container platform)
- AWS ECS (enterprise option)

---

## Local Docker Development

### Quick Start

\`\`\`bash
# Build Docker image
npm run docker:build

# Start all services (frontend, backend, database)
npm run docker:run

# View logs
npm run docker:logs

# Stop services
npm run docker:stop

# Health check
npm run health:check
\`\`\`

### Service URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: localhost:5432

---

## Production Platform Deployments

### Option 1: Render (Recommended)

**Why Render?**
- Simplest setup
- Auto-deploys on git push
- Free PostgreSQL database option
- Built-in monitoring

**Deploy:**
\`\`\`bash
npm run deploy:render
\`\`\`

**Steps:**
1. Push code to GitHub
2. Run deploy script
3. Configure environment variables in Render dashboard
4. Auto-deploys on git push

**Access:**
- Frontend: https://[app-name].onrender.com
- Backend: https://[app-name-backend].onrender.com

---

### Option 2: Heroku

**Deploy:**
\`\`\`bash
npm run deploy:heroku
\`\`\`

**Configuration:**
1. Create Procfile (auto-created by script)
2. Set buildpacks to Node.js
3. Add PostgreSQL addon
4. Configure environment variables
5. Deploy via Git

**Access:**
\`\`\`bash
heroku open -a [app-name]
heroku logs --tail -a [app-name]
\`\`\`

---

### Option 3: Fly.io

**Deploy:**
\`\`\`bash
npm run deploy:fly
\`\`\`

**Configuration:**
1. Create fly.toml configuration
2. Set up secrets
3. Deploy Docker image
4. Auto-scales based on demand

**Access:**
\`\`\`bash
flyctl open -a [app-name]
flyctl logs -a [app-name]
\`\`\`

---

### Option 4: AWS ECS (Enterprise)

**Prerequisites:**
- AWS account
- AWS CLI configured
- ECR repository created

**Deploy:**
\`\`\`bash
# Create ECR repository
aws ecr create-repository --repository-name premier-banking

# Login to ECR
aws ecr get-login-password --region us-east-1 | \\
  docker login --username AWS --password-stdin [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t premier-banking:latest .
docker tag premier-banking:latest [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/premier-banking:latest
docker push [ACCOUNT-ID].dkr.ecr.us-east-1.amazonaws.com/premier-banking:latest

# Deploy to ECS
aws ecs create-service \\
  --cluster premier-banking \\
  --service-name api \\
  --task-definition premier-banking:1 \\
  --desired-count 2
\`\`\`

---

## Environment Variables for Production

**Copy .env.production.example to .env.production:**

\`\`\`bash
cp .env.production.example .env.production
\`\`\`

**Required Variables:**
- SUPABASE_URL - Database URL
- SUPABASE_SERVICE_ROLE_KEY - Backend API key
- FINERACT_URL - Banking API endpoint
- JWT_SECRET - Token signing key
- CLIENT_URL - Frontend domain for CORS

**Platform-Specific:**

**Render:**
1. Settings → Environment → Add environment variable
2. Add each variable from .env.production
3. Redeploy

**Heroku:**
\`\`\`bash
heroku config:set VAR_NAME=value -a [app-name]
\`\`\`

**Fly.io:**
\`\`\`bash
flyctl secrets set VAR_NAME=value
\`\`\`

---

## Docker Image Optimization

### Multi-Stage Build

The included Dockerfile uses multi-stage builds to minimize image size:

1. **Build Stage**: Compiles frontend with Next.js
2. **Runtime Stage**: Copies only built artifacts and production dependencies

**Result:** Final image size ~200MB (vs 800MB without optimization)

### Build Arguments

\`\`\`bash
# Custom build
docker build \\
  --build-arg NODE_ENV=production \\
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://... \\
  -t premier-banking:latest .
\`\`\`

---

## Performance Tuning

### Docker Compose Optimization

\`\`\`yaml
services:
  backend:
    # Limit memory to prevent runaway processes
    mem_limit: 512m
    # CPU allocation
    cpus: 1.0
\`\`\`

### Health Checks

All services include HTTP health checks:
- Backend: `GET /api/health`
- Frontend: `GET /`
- Database: PostgreSQL connectivity

**Automatic Restart:**
- Unhealthy containers restart automatically
- Configurable intervals (default: 30s checks)

---

## Monitoring & Logs

### Local Development

\`\`\`bash
# View all service logs
npm run docker:logs

# View specific service
docker logs -f [service-name]

# View backend logs
docker logs -f [container-id] | grep "ERROR\\|WARNING"
\`\`\`

### Production Platforms

**Render:**
- Dashboard → Logs
- Real-time log streaming

**Heroku:**
\`\`\`bash
heroku logs --tail -a [app-name]
heroku logs --dyno=web -a [app-name]
\`\`\`

**Fly.io:**
\`\`\`bash
flyctl logs -a [app-name]
flyctl logs --process app -a [app-name]
\`\`\`

---

## Security Considerations

### Image Security

\`\`\`bash
# Scan for vulnerabilities
docker scan premier-banking:latest

# Use minimal base image (Alpine Linux)
# Already configured in Dockerfile
\`\`\`

### Secrets Management

**Never:**
- Commit .env files to git
- Pass secrets as build args
- Log sensitive information

**Use Instead:**
- Platform secret management
- Environment variables injected at runtime
- Secret manager services (AWS Secrets Manager, HashiCorp Vault)

---

## Rollback Procedures

### Docker Hub / Registry

\`\`\`bash
# List image versions
docker image ls

# Redeploy previous version
docker run -d \\
  -e NODE_ENV=production \\
  premier-banking:v1.0.0
\`\`\`

### Platform Rollback

**Render:**
- Deployments → Select previous → Redeploy

**Heroku:**
\`\`\`bash
heroku releases -a [app-name]
heroku rollback v123 -a [app-name]
\`\`\`

**Fly.io:**
\`\`\`bash
flyctl releases -a [app-name]
flyctl releases rollback [version] -a [app-name]
\`\`\`

---

## Troubleshooting

### Docker Build Failures

\`\`\`bash
# Clear cache and rebuild
docker build --no-cache -t premier-banking:latest .

# Verbose output
docker build --progress=plain -t premier-banking:latest .
\`\`\`

### Connection Errors

\`\`\`
Error: connect ECONNREFUSED 127.0.0.1:3001

Solution:
1. Check container is running: docker ps
2. Check port mapping: docker port [container-id]
3. Check logs: docker logs [container-id]
\`\`\`

### Environment Variable Issues

\`\`\`bash
# Verify variables in container
docker exec [container-id] env | grep SUPABASE

# Check .env files exist
docker exec [container-id] cat /app/.env
\`\`\`

---

## Next Steps

1. Test locally with Docker Compose
2. Choose deployment platform
3. Configure environment variables
4. Run health checks
5. Set up monitoring and alerts
6. Create CI/CD pipeline with GitHub Actions

**Support:** See MAINTENANCE_INDEX.md for additional documentation.
