# Quick Start Guide - Premier America Credit Union

## 5-Minute Setup

### Step 1: Clone & Install
\`\`\`bash
git clone https://github.com/hybeprojects/v0-mobile-banking-mvp.git
cd v0-mobile-banking-mvp
npm install
\`\`\`

### Step 2: Configure Environment
\`\`\`bash
bash setup-env.sh
# Follow prompts to enter your Supabase & Fineract credentials
\`\`\`

### Step 3: Database Setup
\`\`\`bash
# Run migrations in Supabase SQL Editor:
# 1. Open: https://app.supabase.com/
# 2. Go to SQL Editor
# 3. Run scripts in order:
#    - 001_create_banking_schema.sql
#    - 002_enable_rls.sql
#    - 003_add_otp_table.sql
\`\`\`

### Step 4: Start Development Servers
\`\`\`bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
\`\`\`

### Step 5: Test Login
\`\`\`
Open http://localhost:3000
Email: alice@bank.com
Password: password123
\`\`\`

---

## Demo Accounts

| Email | Password | Account Type |
|-------|----------|--------------|
| alice@bank.com | password123 | Checking |
| bob@bank.com | password123 | Checking |
| charlie@bank.com | password123 | Checking |

---

## Key Features

✅ Multi-step signup with account types  
✅ Email OTP verification  
✅ Real-time balance updates  
✅ Money transfers between accounts  
✅ Transaction history  
✅ Bill pay system  
✅ Virtual card management  
✅ Account settings & profile  
✅ Socket.io real-time notifications  

---

## API Health Check

\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

Expected response:
\`\`\`json
{
  "status": "ok",
  "database": "connected",
  "fineract": "ok",
  "timestamp": "2025-11-01T12:00:00Z"
}
\`\`\`

---

## Troubleshooting

**Backend won't start?**
- Check if port 3001 is in use: `lsof -i :3001`
- Verify .env file exists: `ls backend/.env`
- Check Supabase credentials

**Frontend shows blank page?**
- Check browser console for errors (F12)
- Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
- Run: `npm run dev:frontend -- --reset`

**Socket.io connection failed?**
- Ensure backend is running
- Check NEXT_PUBLIC_SOCKET_URL
- Try: `curl http://localhost:3001`

---

## Next Steps

1. Read MAINTENANCE_AUDIT_REPORT.md for full system overview
2. Review DEPLOYMENT_GUIDE.md for production setup
3. Check ARCHITECTURE.md for system design

**Need Help?** Check the GitHub issues or contact support@premiereamerica.com
\`\`\`

Finally, create the npm scripts helper:
