import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import csurf from "csurf"
import { fineractService } from "./services/fineractService.js"
import { SocketService } from "./services/socketService.js"
import otpRouter from "./routes/otpAuth.ts"
import supabaseAuthRouter from "./routes/supabaseAuth.ts"
import { verifyToken } from "./middleware/auth.ts"

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
})

const socketService = new SocketService(io)

// Middleware
app.use(cors())
app.use(express.json())

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Mount Supabase-backed auth routes (signup/login) and the OTP router
import supabaseAuthRouter from "./routes/supabaseAuth.ts"
app.use("/api/auth", supabaseAuthRouter)
app.use("/api/auth", otpRouter)

// ===== Auth Middleware =====
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

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

// ===== Transfer Routes =====
app.post("/api/transfers", verifyToken, async (req, res) => {
  try {
    const { recipientAccountId, amount, description } = req.body

    if (!recipientAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer data" })
    }

    const transfer = await fineractService.transferFunds(req.user.accountId, recipientAccountId, amount)

    // Emit transfer completion to sender
    socketService.emitTransferSent(req.user.userId, {
      id: transfer.transactionId,
      toAccountId: recipientAccountId,
      amount,
      description,
      status: "completed",
    })

    // Emit transfer received notification to recipient (demo: hardcoded userId mapping)
    // In production, query database to find recipient's userId from accountId
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

      // Update recipient's balance in real-time
      try {
        const recipientBalance = await fineractService.getAccountBalance(recipientAccountId)
        socketService.emitBalanceUpdate(recipientUserId, recipientBalance.balance, recipientAccountId)
      } catch (error) {
        console.error("Error fetching recipient balance:", error)
      }
    }

    // Update sender's balance
    try {
      const senderBalance = await fineractService.getAccountBalance(req.user.accountId)
      socketService.emitBalanceUpdate(req.user.userId, senderBalance.balance, req.user.accountId)
    } catch (error) {
      console.error("Error fetching sender balance:", error)
    }

    res.json({
      success: true,
      transfer,
    })
  } catch (error) {
    console.error("Transfer error:", error)
    res.status(500).json({ error: error.message || "Transfer failed" })
  }
})

// ===== Transactions Routes =====
app.get("/api/transactions", verifyToken, async (req, res) => {
  try {
    const transactions = await fineractService.getAccountTransactions(req.user.accountId)

    // Transform Fineract transaction format to app format
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
    console.error("Error fetching transactions:", error)
    res.status(500).json({ error: "Failed to fetch transactions" })
  }
})

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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Banking server running on port ${PORT}`)
  console.log(`Socket.io listening for connections`)
})
