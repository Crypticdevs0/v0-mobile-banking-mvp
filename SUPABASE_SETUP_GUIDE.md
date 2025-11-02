# Premier America Credit Union - Supabase Setup Guide

## Overview
Your Supabase integration is connected and the database schema has been created. Your secret keys are already available via the devserver MCP connection. This guide walks you through enabling Realtime and verifying all systems.

## Step 1: Enable Realtime in Supabase Dashboard

### Access Realtime Settings
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Replication** section (left sidebar)
4. Find the **Real-time** or **Publication** settings

### Enable Real-time for Banking Tables
For each table below, enable real-time subscriptions:

#### Enable for `transactions` table:
1. In Replication section, find "transactions"
2. Toggle **Real-time** to ON
3. Select events: `INSERT`, `UPDATE`, `DELETE`

#### Enable for `notifications` table:
1. Find "notifications" table
2. Toggle **Real-time** to ON
3. Select events: `INSERT`, `UPDATE`

#### Enable for `accounts` table:
1. Find "accounts" table
2. Toggle **Real-time** to ON
3. Select events: `UPDATE` (for balance changes)

### Verify Realtime is Enabled
- You should see green checkmarks next to each enabled table
- Realtime is now broadcasting changes to subscribed clients

## Step 2: Verify Environment Variables

Your environment variables are already connected via devserver MCP:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Backend service role key

**No manual `.env.local` file is needed** - The devserver automatically provides these.

## Step 3: Test the Connection

### Test Login Flow
1. Visit your app at http://localhost:3000
2. Try logging in with demo credentials:
   - Email: `alice@bank.com`
   - Password: `password123`

### What Happens Behind the Scenes
1. Login request goes to `/api/auth/login`
2. Backend verifies credentials with Supabase Auth
3. User profile is fetched from Supabase database
4. Fineract balance is retrieved
5. JWT token is issued and stored
6. User is redirected to dashboard

### Test Real-time Updates
1. Open app in one browser window
2. Open in another browser window (different user)
3. Send a transfer from Account A to Account B
4. Both accounts should update in real-time via Socket.io

## Step 4: Database Schema Verification

Your tables are already created:
- `users` - User profiles with RLS policies
- `accounts` - Linked to Fineract accounts with RLS
- `transactions` - Transaction history with RLS
- `notifications` - User notifications with RLS

All tables have Row-Level Security (RLS) enabled to protect user data.

## Step 5: Troubleshooting

### Issue: Login fails with "Invalid credentials"
- Verify the Supabase Auth user exists in Dashboard → Authentication → Users
- Check that demo users were created (alice@bank.com, bob@bank.com, etc.)
- If missing, run the signup endpoint first to create users

### Issue: Real-time balance updates not working
- Verify Realtime is enabled in Supabase Dashboard
- Check Socket.io connection is established (look for green dot in app)
- Check browser console for Socket.io connection errors

### Issue: Transactions not appearing in database
- Verify `transactions` table has Realtime enabled
- Check that INSERT RLS policy allows user to write transactions
- Verify Fineract API is accessible

## Environment Variables Reference

\`\`\`env
# Supabase (Auto-provided via devserver MCP)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Fineract
FINERACT_URL=https://sandbox.mifos.io
FINERACT_TENANT=default
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=password
FINERACT_PRODUCT_ID=1

# JWT
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
PORT=4000
# For local connection testing only (set this in .env.local or via devserver MCP)
# CONNECTION_TEST_SECRET=dev-connection-secret
\`\`\`

## Next Steps
1. Enable Realtime in Supabase Dashboard (follow Step 1)
2. Test login flow (follow Step 3)
3. Verify data flows between Supabase and Fineract
4. Deploy when ready!
