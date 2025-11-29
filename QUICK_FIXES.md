# Quick Fixes - Implementation Guide

## Fix 1: Create .env.example

Create file: `.env.example`

```bash
# Frontend (NEXT_PUBLIC_ prefix for browser access)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Backend (Server-only secrets)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FINERACT_URL=http://localhost:8080
FINERACT_USERNAME=mifos
FINERACT_PASSWORD=your-password
FINERACT_TENANT=default
FINERACT_PRODUCT_ID=1
JWT_SECRET=your-secure-random-string-32-chars-minimum
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000
```

---

## Fix 2: Fix TypeScript Imports

### Option A: Convert backend to TypeScript (Recommended)

1. Rename files:
```bash
mv backend/server.js backend/server.ts
mv backend/routes/transactions.js backend/routes/transactions.ts
mv backend/services/fineractService.js backend/services/fineractService.ts
mv backend/services/socketService.js backend/services/socketService.ts
```

2. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev:backend": "tsx backend/server.ts",
    "start:backend": "node backend/server.js",
    "build:backend": "tsc --project tsconfig.backend.json"
  }
}
```

3. Create `tsconfig.backend.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./backend",
    "module": "esnext",
    "target": "ES2020"
  },
  "include": ["backend/**/*"],
  "exclude": ["node_modules", "app", "components"]
}
```

### Option B: Use tsx runtime

```bash
npm install -D tsx
```

Update scripts:
```json
{
  "dev:backend": "tsx backend/server.js",
  "start:backend": "node backend/server.js"
}
```

---

## Fix 3: Remove Build Bypasses

File: `next.config.mjs`

Change from:
```javascript
eslint: {
  ignoreDuringBuilds: true,
},
typescript: {
  ignoreBuildErrors: true,
},
```

To:
```javascript
// Remove these sections entirely
// Fix the actual errors instead
```

---

## Fix 4: Consolidate Authentication

Create file: `lib/auth/authService.ts`

```typescript
import { createClient as createSupabase } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"
import { fineractService } from "../../backend/services/fineractService"

export class AuthService {
  private supabase
  private jwtSecret = process.env.JWT_SECRET

  constructor() {
    this.supabase = createSupabase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  async signup(email: string, password: string, firstName: string, lastName: string) {
    // 1. Create Supabase user
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { first_name: firstName, last_name: lastName },
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create user")
    }

    // 2. Create Fineract client
    const fineractClient = await fineractService.createClient(firstName, lastName, email)
    const fineractClientId = fineractClient.resourceId

    // 3. Create Fineract account
    const fineractAccount = await fineractService.createSavingsAccount(fineractClientId)
    const fineractAccountId = fineractAccount.resourceId

    // 4. Create JWT token
    const token = jwt.sign(
      {
        userId: authData.user.id,
        email,
        accountId: fineractAccountId,
      },
      this.jwtSecret!,
      { expiresIn: "7d" }
    )

    return {
      success: true,
      token,
      user: {
        id: authData.user.id,
        email,
        firstName,
        lastName,
        accountId: fineractAccountId,
      },
    }
  }

  async login(email: string, password: string) {
    // 1. Authenticate with Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      throw new Error("Invalid credentials")
    }

    // 2. Fetch user profile and account
    const { data: userProfile } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    const { data: account } = await this.supabase
      .from("accounts")
      .select("*")
      .eq("user_id", authData.user.id)
      .single()

    // 3. Create JWT token
    const token = jwt.sign(
      {
        userId: authData.user.id,
        email: authData.user.email,
        accountId: account.fineract_account_id,
      },
      this.jwtSecret!,
      { expiresIn: "7d" }
    )

    return {
      success: true,
      token,
      user: {
        id: authData.user.id,
        email: userProfile.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        accountId: account.fineract_account_id,
      },
    }
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret!)
      return decoded
    } catch (error) {
      throw new Error("Invalid token")
    }
  }
}

export const authService = new AuthService()
```

---

## Fix 5: Add Request Validation Middleware

Create file: `backend/middleware/validation.ts`

```typescript
import { z } from "zod"
import { Request, Response, NextFunction } from "express"

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
})

export const transferSchema = z.object({
  recipientAccountId: z.string().min(1, "Recipient account required"),
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
})

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        })
      }
      res.status(400).json({ error: "Invalid request" })
    }
  }
}
```

---

## Fix 6: Add Structured Logging

Create file: `backend/logger.ts`

```typescript
import winston from "winston"

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "banking-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  )
}
```

---

## Fix 7: Add Rate Limiting

Create file: `backend/middleware/rateLimit.ts`

```typescript
import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
})
```

---

## Fix 8: Fix Docker Configuration

Create file: `Dockerfile.frontend`

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000 || exit 1

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

Update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      NEXT_PUBLIC_SOCKET_URL: http://backend:3001
    depends_on:
      - backend
    networks:
      - banking-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      PORT: 3001
      SUPABASE_URL: ${SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      FINERACT_URL: ${FINERACT_URL:-http://fineract:8080}
      FINERACT_USERNAME: ${FINERACT_USERNAME:-mifos}
      FINERACT_PASSWORD: ${FINERACT_PASSWORD}
      FINERACT_TENANT: ${FINERACT_TENANT:-default}
      JWT_SECRET: ${JWT_SECRET}
      CLIENT_URL: http://frontend:3000
    volumes:
      - ./backend:/app/backend
      - /app/node_modules
    networks:
      - banking-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  banking-network:
    driver: bridge
```

---

## Implementation Order

1. **Day 1:** Fixes 1, 2, 3 (Environment, TypeScript, Build)
2. **Day 2:** Fixes 4, 5 (Auth, Validation)
3. **Day 3:** Fixes 6, 7, 8 (Logging, Rate Limit, Docker)
4. **Day 4:** Testing and verification

---

## Verification Commands

```bash
# Check environment
node scripts/validate-env.js

# Run linter
npm run lint

# Test backend
npm run test

# Build frontend
npm run build

# Build Docker images
docker build -f Dockerfile.frontend -t banking-frontend:test .
docker build -f Dockerfile.backend -t banking-backend:test .

# Test Docker Compose
docker-compose up --build

# Health check
curl http://localhost:3001/api/health
curl http://localhost:3000
```
