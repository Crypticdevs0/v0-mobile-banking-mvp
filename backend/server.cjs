const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const logger = require("./logger.js")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser")
const csurf = require("csurf")
const { fineractService } = require("./services/fineractService.js")
const { SocketService } = require("./services/socketService.js")

// Require TypeScript routes/middleware via ts-node (register at startup when using start script)
const otpRouter = require("./routes/otpAuth.ts").default
const supabaseAuthRouter = require("./routes/supabaseAuth.ts").default
const depositsRouter = require("./routes/deposits.ts").default
const { verifyToken } = require("./middleware/auth.ts")

const express = require("express")

// The rest of the original server logic adapted to CommonJS

// Enforce required environment variables
const requiredEnv = ["JWT_SECRET", "FINERACT_URL", "FINERACT_USERNAME", "FINERACT_PASSWORD"]
const missing = requiredEnv.filter((k) => !process.env[k])
if (missing.length) {
  logger.error("Missing required environment variables:", missing.join(", "))
  logger.error("Aborting server start - please set the required environment variables and restart.")
  process.exit(1)
}

// Build allowlist for CORS / sockets
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

const app = express()
const httpServer = createServer(app)

// Helmet for basic security headers and a sensible CSP
app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    connectSrc: ["'self'", ...allowedOrigins],
    imgSrc: ["'self'", "data:"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
}))

// Rate limiting for API abuse protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(apiLimiter)
app.use(cookieParser())

// CSRF protection (expose token via /api/csrf-token for clients)
const csrfProtection = csurf({ cookie: true })
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// Socket.io setup with origin validation
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket"],
})

// Basic handshake origin check - reject unknown origins
io.use((socket, next) => {
  try {
    const origin = socket.handshake.headers.origin
    if (!origin || !allowedOrigins.includes(origin)) {
      return next(new Error("Origin not allowed"))
    }
    next()
  } catch (err) {
    next(err)
  }
})

const socketService = new SocketService(io)

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('CORS policy violation'))
  },
  credentials: true,
}
app.use(cors(corsOptions))
app.use(express.json())

// Logger middleware (keep, do not expose sensitive data)
app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Mount Supabase-backed auth routes (signup/login) and the OTP router with CSRF protection
app.use("/api/auth", csrfProtection, supabaseAuthRouter)
app.use("/api/auth", csrfProtection, otpRouter)

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
    logger.error("Error fetching balance:", error)
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

// ===== Transfer Routes =====
app.post("/api/transfers", verifyToken, async (req, res) => {
  try {
    const { recipientAccountId, amount, description } = req.body

    if (!recipientAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer data" })
    }

    const transfer = await fineractService.transferFunds(req.user.accountId, recipientAccountId, amount)

    socketService.emitTransferSent(req.user.userId, {
      id: transfer.transactionId,
      toAccountId: recipientAccountId,
      amount,
      description,
      status: "completed",
    })

    const recipientUserIdMap = {
      1: 1,
      2: 2,
      3: 3,
    }
    const recipientUserId = recipientUserIdMap[recipientAccountId]
    if (recipientUserId) {
      socketService.emitTransferReceived(recipientUserId, {
        id: transfer.transactionId,
        fromAccountId: req.user.accountId,
        from: req.user.email,
        amount,
        description,
        status: "completed",
      })

      try {
        const recipientBalance = await fineractService.getAccountBalance(recipientAccountId)
        socketService.emitBalanceUpdate(recipientUserId, recipientBalance.balance, recipientAccountId)
      } catch (error) {
        logger.error("Error fetching recipient balance:", error)
      }
    }

    try {
      const senderBalance = await fineractService.getAccountBalance(req.user.accountId)
      socketService.emitBalanceUpdate(req.user.userId, senderBalance.balance, req.user.accountId)
    } catch (error) {
      logger.error("Error fetching sender balance:", error)
    }

    res.json({
      success: true,
      transfer,
    })
  } catch (error) {
    logger.error("Transfer error:", error)
    res.status(500).json({ error: error.message || "Transfer failed" })
  }
})

// ===== Transactions Routes =====
app.get("/api/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await fineractService.getAccountTransactions(req.user.accountId)

    const formattedTransactions = (transactions.transactionItems || []).map((tx) => ({
      id: tx.id,
      type: tx.type?.value === "DEPOSIT" ? "received" : "sent",
      amount: tx.amount,
      description: tx.description || (tx.type?.value === "DEPOSIT" ? "Deposit" : "Withdrawal"),
      timestamp: new Date(tx.date),
    }))

    res.json({
      transactions: formattedTransactions,
      pagination: {
        page: 1,
        limit: 10,
        total: formattedTransactions.length,
      },
    })
  } catch (error) {
    logger.error("Error fetching transactions:", error)
    res.status(500).json({ error: "Failed to fetch transactions" })
  }
})

// ===== Socket.io Events =====
io.on("connection", (socket) => {
  logger.info(`[Socket] New connection: ${socket.id}`)

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
    logger.info(`[Socket] User ${userId} subscribed to balance updates`)
  })

  socket.on("subscribe:notifications", (userId) => {
    socket.join(`notifications:${userId}`)
    logger.info(`[Socket] User ${userId} subscribed to notifications`)
  })

  socket.on("request:balance", async (userId, accountId) => {
    try {
      const balance = await fineractService.getAccountBalance(accountId)
      socketService.emitBalanceUpdate(userId, balance.balance, accountId)
    } catch (error) {
      logger.error("Error fetching balance for socket:", error)
      socket.emit("error:balance", { error: "Failed to fetch balance" })
    }
  })

  socket.on("disconnect", () => {
    const userId = socket.handshake.auth?.userId
    if (userId) {
      socketService.unregisterUser(socket.id, userId)
    }
    logger.info(`[Socket] User disconnected: ${socket.id}`)
  })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

// Error handling
app.use((err, req, res, next) => {
  logger.error(err)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  logger.info(`Banking server running on port ${PORT}`)
  logger.info(`Socket.io listening for connections`)
})
