# Premier America Credit Union - Production Deployment Checklist

## Pre-Deployment (2-3 days before)

### Environment & Secrets
- [ ] All `.env` files configured in target environment
- [ ] JWT_SECRET is cryptographically secure (32+ chars)
- [ ] Supabase credentials verified working
- [ ] Fineract API endpoints accessible
- [ ] All secrets stored in secure vault (AWS Secrets Manager, Vercel, etc.)
- [ ] `.env` files NOT committed to git
- [ ] `.gitignore` includes `.env*`

### Database
- [ ] All 3 migration scripts executed successfully
- [ ] RLS policies enabled on all tables
- [ ] Backup created before migrations
- [ ] Database user permissions verified
- [ ] Connection pooling configured in Supabase
- [ ] Realtime subscriptions enabled for: transactions, notifications, accounts

### Backend
- [ ] `npm audit` passes (no critical vulnerabilities)
- [ ] All API endpoints tested with Postman/Insomnia
- [ ] `/api/health` endpoint returns 200
- [ ] Error handling implemented on all endpoints
- [ ] CORS configured correctly for frontend domain
- [ ] Rate limiting implemented (optional but recommended)
- [ ] Logging configured (DataDog, Sentry, CloudWatch)
- [ ] SSL/TLS certificate obtained and installed

### Frontend
- [ ] `npm run build` completes without errors
- [ ] No console warnings or errors in dev tools
- [ ] Responsive design tested on mobile devices (iPhone, Android)
- [ ] Performance optimized (lighthouse score > 80)
- [ ] All images optimized and using next/image
- [ ] Environment variables for production set correctly
- [ ] Build artifacts analyzed for size

### Security Audit
- [ ] No API keys exposed in client code
- [ ] All sensitive data transmitted over HTTPS
- [ ] CORS headers properly configured
- [ ] XSS protection enabled (Content-Security-Policy)
- [ ] CSRF tokens implemented for POST/PUT/DELETE
- [ ] SQL injection impossible (using parameterized queries)
- [ ] Password hashing implemented correctly
- [ ] Session management secure (httpOnly cookies)
- [ ] Authentication token expiry set appropriately

### Testing
- [ ] Signup flow tested end-to-end
- [ ] Login with demo accounts works
- [ ] OTP verification process works
- [ ] Transfers between accounts work
- [ ] Real-time balance updates work (Socket.io)
- [ ] Transaction history displays correctly
- [ ] Settings page functions correctly
- [ ] Mobile navigation works
- [ ] Dark/light mode toggle works (if implemented)
- [ ] Error states handled gracefully

### Documentation
- [ ] README.md updated with production URLs
- [ ] API documentation generated
- [ ] Deployment guide completed
- [ ] Runbook for common issues created
- [ ] Team trained on monitoring and alerts

---

## Deployment Day

### Pre-Deployment (1 hour before)

- [ ] Notify team of deployment window
- [ ] Take database backup
- [ ] Verify rollback plan
- [ ] Have both dev and prod console open
- [ ] All team members ready for support

### Deployment Steps

**Option 1: Vercel (Recommended for Frontend)**
\`\`\`bash
# 1. Push to main branch
git push origin main

# 2. Verify deployment status
vercel --prod

# 3. Test production URL
curl https://premier-banking.vercel.app/api/health
\`\`\`

**Option 2: Heroku (Recommended for Backend)**
\`\`\`bash
# 1. Push to heroku main
git push heroku main

# 2. Verify deployment
heroku logs --tail

# 3. Test production API
curl https://premier-banking-api.herokuapp.com/api/health
\`\`\`

**Option 3: Docker/AWS ECS**
\`\`\`bash
# 1. Build and push Docker image
docker build -t premier-banking:prod .
docker push [registry]/premier-banking:prod

# 2. Update ECS service
aws ecs update-service --cluster premier-banking --service api --force-new-deployment

# 3. Monitor deployment
aws ecs describe-services --cluster premier-banking --services api
\`\`\`

### Post-Deployment (1 hour after)

- [ ] Verify frontend loads: https://premier-banking.com
- [ ] Check backend health: https://api.premier-banking.com/api/health
- [ ] Test login with demo account
- [ ] Verify Socket.io connections in browser dev tools
- [ ] Check database query latency
- [ ] Monitor error logs in Sentry/DataDog
- [ ] Verify SSL certificate working (no security warnings)
- [ ] Test on mobile devices
- [ ] Check real-time updates with 2 accounts

### Smoke Tests
\`\`\`bash
# 1. Test authentication flow
curl -X POST https://api.premier-banking.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@bank.com","password":"password123"}'

# 2. Test balance fetch
curl -H "Authorization: Bearer [token]" \
  https://api.premier-banking.com/api/accounts/balance

# 3. Test health check
curl https://api.premier-banking.com/api/health
\`\`\`

---

## Post-Deployment

### Monitoring

**Set Up Alerts For:**
- [ ] Error rate > 1%
- [ ] Response time > 1000ms
- [ ] Database connection errors
- [ ] API 5xx errors
- [ ] Disk space > 80%
- [ ] Memory usage > 85%
- [ ] CPU usage > 90%

### Daily Checks (First Week)

- [ ] Review error logs
- [ ] Check database performance
- [ ] Verify all users can login
- [ ] Confirm transfers working
- [ ] Check Socket.io connection success rate
- [ ] Monitor API response times
- [ ] Review security logs

### Weekly Checks (First Month)

- [ ] Review performance metrics
- [ ] Analyze user feedback
- [ ] Check for any missed bugs
- [ ] Update documentation
- [ ] Plan any necessary optimizations
- [ ] Review and update security policies

---

## Rollback Procedures

### Quick Rollback (< 5 minutes)

**Vercel:**
\`\`\`bash
vercel rollback
\`\`\`

**Heroku:**
\`\`\`bash
heroku releases
heroku rollback v[number]
\`\`\`

### Manual Rollback

\`\`\`bash
# 1. Revert commit
git revert HEAD
git push origin main

# 2. Redeploy with previous version
# (Follow deployment steps above)

# 3. If database schema changed, restore backup
# (Contact database administrator)
\`\`\`

### Rollback Test (Before Production)

- [ ] Test rollback procedure in staging
- [ ] Verify database can be restored
- [ ] Confirm old version still works
- [ ] Document time to rollback

---

## Success Criteria

- ✅ All users can sign up successfully
- ✅ All users can log in successfully
- ✅ OTP verification works
- ✅ Transfers process without errors
- ✅ Real-time balance updates visible
- ✅ No unhandled errors in console
- ✅ Performance metrics within targets
- ✅ Security audit passed
- ✅ Team can support issues

---

## Post-Deployment Follow-Up

### Day 1
- [ ] Monitor for critical errors
- [ ] Respond to user issues immediately
- [ ] Check performance metrics

### Week 1
- [ ] Gather user feedback
- [ ] Fix any critical bugs
- [ ] Optimize performance if needed

### Month 1
- [ ] Analyze usage patterns
- [ ] Plan next iteration features
- [ ] Review and update security

---

## Deployment Rollout Strategy

### Recommended: Gradual Rollout

**Step 1: Canary Deployment (5% traffic)**
\`\`\`bash
# Deploy to 5% of servers
# Monitor for errors for 1 hour
\`\`\`

**Step 2: Small Batch (25% traffic)**
\`\`\`bash
# Increase to 25% if no errors
# Monitor for 2 hours
\`\`\`

**Step 3: Half Traffic (50%)**
\`\`\`bash
# Increase to 50% if stable
# Monitor for 4 hours
\`\`\`

**Step 4: Full Deployment (100%)**
\`\`\`bash
# Roll out to all servers
# Continue monitoring
\`\`\`

---

## Communication Plan

### Before Deployment
- Notify users of maintenance window (24hrs notice)
- Update status page
- Brief support team

### During Deployment
- Post hourly updates to Slack
- Have technical lead on-call
- Be ready to rollback if needed

### After Deployment
- Announce successful deployment
- Share deployment notes with team
- Update documentation

---

## Emergency Contacts

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| Tech Lead | [Name] | [Phone] | @tech-lead |
| DevOps | [Name] | [Phone] | @devops |
| DBA | [Name] | [Phone] | @dba |
| On-Call | [Name] | [Phone] | @oncall |

---

## Final Sign-Off

- [ ] Tech Lead: _____________________ Date: _____
- [ ] DevOps: _____________________ Date: _____
- [ ] Product: _____________________ Date: _____

**Deployment completed successfully on:** _______________

---

**Deployment Guide Version:** 1.0  
**Last Updated:** November 1, 2025  
**Next Review:** December 1, 2025
