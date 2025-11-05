import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import jwt from "jsonwebtoken"
import { fineractService } from "./services/fineractService.js"
import { SocketService } from "./services/socketService.js"
import otpRouter from "./routes/otpAuth.js"

const requiredEnvVars = [
  "FINERACT_URL",
  "FINERACT_TENANT",
  "FINERACT_USERNAME",
  "FINERACT_PASSWORD",
  "JWT_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
]

const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "))
  console.error("Please set these variables before starting the server.")
  process.exit(1)
}

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

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" })
    }

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
          mobileNo: "1234567890",
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
    console.error("Signup error:", error)
    res.status(500).json({ error: "Signup failed" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // For demo: validate against seed data
    const seedUsers = {
      "alice@bank.com": { id: 1, name: "Alice", accountId: 1 },
      "bob@bank.com": { id: 2, name: "Bob", accountId: 2 },
      "charlie@bank.com": { id: 3, name: "Charlie", accountId: 3 },
    }

    const user = seedUsers[email]

    if (!user || password !== "password123") {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email,
        accountId: user.accountId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email,
        name: user.name,
        accountId: user.accountId,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
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
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: "Internal server error" })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`✅ Banking server running on port ${PORT}`)
  console.log(`✅ Socket.io listening for connections`)
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`)
})
