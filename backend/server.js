import express from "express"
import dotenv from "dotenv"
dotenv.config()
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import jwt from "jsonwebtoken"
import { fineractService } from "./services/fineractService.js"
import { SocketService } from "./services/socketService.js"
import { z } from "zod"
import { requestLogger, errorHandler } from "./middleware/logger.ts"
import { authLimiter, apiLimiter, transferLimiter } from "./middleware/rateLimit.ts"
import { validateRequest, signupSchema, loginSchema, transferSchema } from "./middleware/validation.ts"
import { csrfProtection, csrfTokenEndpoint } from "./middleware/csrf.ts"

const app = express()
import routes from "./routes/index.js"
app.use("/api", routes)

const requiredEnvVars = [
  "FINERACT_URL",
  "FINERACT_TENANT",
  "FINERACT_USERNAME",
  "FINERACT_PASSWORD",
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "))
  console.error("Please set these variables before starting the server.")
  process.exit(1)
}
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000,
})

const socketService = new SocketService(io)

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mobileNo: z.string().min(10),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
app.use(express.json({ limit: "2mb" }))
app.use(requestLogger)

// Mount backend routers
// app.use('/api/otp', otpRouter)

import { verifyToken } from "./middleware/auth.ts"

// CSRF token endpoint
app.get("/api/csrf-token", csrfTokenEndpoint)

app.post("/api/auth/signup", authLimiter, csrfProtection, validateRequest(signupSchema), async (req, res) => {
  try {
    const { email, password, firstName, lastName, mobileNo } = req.body

    // Create Fineract client
    const clientResponse = await fetch(
      `${process.env.FINERACT_URL}/fineract-provider/api/v1/clients?tenantId=${process.env.FINERACT_TENANT}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.FINERACT_USERNAME}:${process.env.FINERACT_PASSWORD}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          email: email,
          mobileNo: mobileNo,
          dateFormat: "dd MMMM yyyy",
          locale: "en",
          active: true,
          activationDate: new Date().toISOString().split("T")[0],
        }),
      },
    )

    const clientData = await clientResponse.json()

    if (!clientResponse.ok) {
      return res.status(400).json({ error: clientData.defaultUserMessage || "Failed to create client" })
    }

    // Create checking account for client
    const accountResponse = await fetch(
      `${process.env.FINERACT_URL}/fineract-provider/api/v1/savingsaccounts?tenantId=${process.env.FINERACT_TENANT}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.FINERACT_USERNAME}:${process.env.FINERACT_PASSWORD}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: clientData.resourceId,
          productId: Number.parseInt(process.env.FINERACT_PRODUCT_ID || "1"),
          dateFormat: "dd MMMM yyyy",
          locale: "en",
          submittedOnDate: new Date().toISOString().split("T")[0],
        }),
      },
    )

    const accountData = await accountResponse.json()

    if (!accountResponse.ok) {
      return res.status(400).json({ error: accountData.defaultUserMessage || "Failed to create account" })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: clientData.resourceId,
        email,
        accountId: accountData.resourceId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: clientData.resourceId,
        email,
        firstName,
        lastName,
        accountId: accountData.resourceId,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error("Signup error:", error)
    res.status(500).json({ error: "Signup failed" })
  }
})

app.post("/api/auth/login", authLimiter, csrfProtection, validateRequest(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body

    const fineractUser = await fineractService.login(email, password)

    const token = jwt.sign(
      {
        userId: fineractUser.userId,
        email: fineractUser.username,
        accountId: fineractUser.officeId, // This is a hack, but it works for now
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: fineractUser.userId,
        email: fineractUser.username,
        name: fineractUser.officeName,
        accountId: fineractUser.officeId,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors })
    }
    console.error("Login error:", error)
    res.status(401).json({ error: "Invalid credentials" })
  }
})

// ===== Account Routes =====
app.get("/api/accounts/balance", verifyToken, async (req, res) => {
  try {
    const accountId = req.user.accountId
    const balance = await fineractService.getAccountBalance(accountId)

    res.json({
      userId: req.user.userId,
      ...balance,
    })
  } catch (error) {
    console.error("Error fetching balance:", error)
    res.status(500).json({ error: "Failed to fetch balance" })
  }
})

app.get("/api/accounts/:accountId", verifyToken, async (req, res) => {
  try {
    const account = await fineractService.getAccount(req.params.accountId)
    res.json(account)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch account details" })
  }
})

import transactionsRouter from './routes/transactions.js'
app.use('/api/transactions', verifyToken, transactionsRouter)
if (process.env.NODE_ENV !== "test") {
  import("./routes/transfers.ts").then(transfersRouter => {
    app.use('/api/transfers', transfersRouter.default)
  })
}

// ===== Socket.io Events =====
io.on("connection", (socket) => {
  console.log(`[Socket] New connection: ${socket.id}`)

  socket.on("user:login", (userId) => {
    socketService.registerUser(socket.id, userId)
    socket.emit("connection:established", {
      userId,
      socketId: socket.id,
      timestamp: new Date(),
    })
  })

  socket.on("subscribe:balance", (userId) => {
    socket.join(`balance:${userId}`)
    console.log(`[Socket] User ${userId} subscribed to balance updates`)
  })

  socket.on("subscribe:notifications", (userId) => {
    socket.join(`notifications:${userId}`)
    console.log(`[Socket] User ${userId} subscribed to notifications`)
  })

  socket.on("request:balance", async (userId, accountId) => {
    try {
      const balance = await fineractService.getAccountBalance(accountId)
      socketService.emitBalanceUpdate(userId, balance.balance, accountId)
    } catch (error) {
      console.error("Error fetching balance for socket:", error)
      socket.emit("error:balance", { error: "Failed to fetch balance" })
    }
  })

  socket.on("disconnect", () => {
    // Try to find userId from user data if available
    const userId = socket.handshake.auth?.userId
    if (userId) {
      socketService.unregisterUser(socket.id, userId)
    }
    console.log(`[Socket] User disconnected: ${socket.id}`)
  })
})

app.get("/api/health", async (req, res) => {
  try {
    // Test Fineract connectivity
    const fineractHealth = await fetch(`${process.env.FINERACT_URL}/fineract-provider/api/v1/health`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.FINERACT_USERNAME}:${process.env.FINERACT_PASSWORD}`).toString("base64")}`,
      },
    })
      .then((r) => r.ok)
      .catch(() => false)

    res.json({
      status: "ok",
      timestamp: new Date(),
      services: {
        api: "healthy",
        fineract: fineractHealth ? "healthy" : "degraded",
        socketio: io.engine.clientsCount >= 0 ? "healthy" : "down",
      },
    })
  } catch (error) {
    res.status(503).json({
      status: "error",
      error: error.message,
    })
  }
})

// Error handling
app.use(errorHandler)

const PORT = process.env.PORT || 3001
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`✅ Banking server running on port ${PORT}`)
    console.log(`✅ Socket.io listening for connections`)
    console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`)
  })
}

export { app }
