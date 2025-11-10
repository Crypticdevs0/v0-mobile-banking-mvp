# Premier America Credit Union - v0 Mobile Banking MVP

This repository contains the frontend and backend services for the Premier America Credit Union's mobile banking application.

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js (v18 or higher)
- Docker (for database)
- Git

### 2. Clone & Install
```bash
git clone https://github.com/hybeprojects/v0-mobile-banking-mvp.git
cd v0-mobile-banking-mvp
npm install
```

### 3. Configure Environment
Run the setup script and follow the prompts to enter your Supabase and Fineract credentials:
```bash
bash setup-env.sh
```

### 4. Database Setup
Run the following database migrations in your Supabase SQL Editor:
1.  `001_create_banking_schema.sql`
2.  `002_enable_rls.sql`
3.  `003_add_otp_table.sql`

### 5. Start Development Servers
```bash
# In one terminal
npm run dev:all
```

### 6. Test Login
-   **URL:** `http://localhost:3000`
-   **Email:** `alice@bank.com`
-   **Password:** `password123`

---

## Deployment

### Recommended: Vercel & Render
-   **Frontend:** Deploy the Next.js application to Vercel.
-   **Backend:** Deploy the Node.js backend to Render.

**Vercel (Frontend) Configuration:**
-   **Build Command:** `next build`
-   **Environment Variables:**
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `NEXT_PUBLIC_SOCKET_URL` (your Render backend URL)

**Render (Backend) Configuration:**
-   **Build Command:** `npm install`
-   **Start Command:** `node backend/server.js`
-   **Environment Variables:**
    -   `SUPABASE_URL`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `FINERACT_URL`
    -   `JWT_SECRET`
    -   `NODE_ENV=production`
    -   `CLIENT_URL` (your Vercel frontend URL)

### Alternative: Docker
A `docker-compose.yml` file is provided for a full-stack Docker deployment.

---

## Troubleshooting

-   **Backend won't start?** Check if port 3001 is in use (`lsof -i :3001`) and verify your `.env` file.
-   **Frontend shows a blank page?** Check the browser console for errors and verify your `.env.local` file.
-   **Socket.io connection failed?** Ensure the backend is running and the `NEXT_PUBLIC_SOCKET_URL` is correct.

---

## Maintenance & Monitoring

-   **Health Checks:**
    -   Backend: `curl <your-backend-url>/api/health`
    -   Frontend: `curl <your-frontend-url>/health`
-   **Logs:** Monitor logs on your deployment platform (Vercel, Render, etc.).
-   **Database:** Use the Supabase dashboard to monitor database performance and RLS policies.
