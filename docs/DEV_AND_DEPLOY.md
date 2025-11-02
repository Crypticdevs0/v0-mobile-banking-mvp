Development & Deployment Guide

Overview
- Frontend: Next.js app (root)
- Backend: Express + Socket.io (backend/server.js)

Recommended local ports
- Frontend (Next dev): http://localhost:3000
- Backend (Express + Socket.io): http://localhost:4000

Environment variables (important)
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (devserver provides via MCP)
- SUPABASE_SERVICE_ROLE_KEY (required for seeding/migrations)
- JWT_SECRET, FINERACT_*, BACKEND_ORIGIN (set to http://localhost:4000)
- NEXT_PUBLIC_SOCKET_URL (set to backend origin or leave empty to use same-origin via rewrites)
- NEXT_PUBLIC_SOCKET_PATH (default: /socket.io)
- ALLOWED_ORIGINS (comma-separated list of allowed front-end origins; set to http://localhost:3000 in dev)
- CONNECTION_TEST_SECRET (optional; set for local connection test endpoint)

Run locally (two terminals)
1) Start backend server
   - PORT=4000 node backend/server.js
   - Or set env vars and run: PORT=4000 node backend/server.js

2) Start frontend
   - pnpm run dev

Notes
- The Next app proxies socket requests to the backend via the rewrites configured in next.config.mjs. If NEXT_PUBLIC_SOCKET_URL is empty, the client will connect to the current origin using NEXT_PUBLIC_SOCKET_PATH (default /socket.io).
- Make sure ALLOWED_ORIGINS includes your frontend origin (http://localhost:3000) so socket connections are accepted.

Connection test endpoint
- app/api/connection-test is gated by CONNECTION_TEST_SECRET. For local testing, set CONNECTION_TEST_SECRET in your environment (e.g. .env.local) and call the endpoint with header x-connection-test-secret.
- Keep this disabled in production.

Seeding Supabase (manual steps)
- Use the Supabase SQL editor or the supabase CLI to create example users, accounts, transactions and notifications.
- Ensure RLS policies are set to allow authenticated users to access their own rows.
- If you want me to add a simple seed SQL and a runner script, say so and provide access to the SUPABASE_SERVICE_ROLE_KEY.

Docker / Production
- Backend should run on the port specified by PORT environment variable; ensure that BACKEND_ORIGIN points to the production origin (https://api.example.com) and NEXT_PUBLIC_SOCKET_URL is set to the same origin.
- Use the included Dockerfile and docker-compose.yml to build and run containers. Ensure environment variables are injected via your deployment platform.

If you want, I can:
- Add a sample seed SQL file and an npm script to run it (needs SUPABASE_SERVICE_ROLE_KEY).
- Add a .env.example file with recommended dev values.
