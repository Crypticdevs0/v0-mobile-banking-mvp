import express from "express"
import jwt from "jsonwebtoken"
import { fineractService } from "../services/fineractService.js"
import { supabaseOperations } from "../../lib/supabase/supabaseService.js"

const router = express.Router()

// Simple token verifier using our JWT (no Supabase)
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ error: "No token provided" })
  try {
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) return res.status(500).json({ error: "Server misconfiguration" })
    const decoded: any = jwt.verify(token, jwtSecret)
    req.user = { id: decoded.userId, email: decoded.email }
    next()
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" })
  }
}

// Signup: create local user profile + fineract client/account
router.post("/signup", async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // ensure user doesn't already exist
    const existing = await supabaseOperations.getUserByEmail(email)
    if (existing) return res.status(400).json({ error: "User already exists" })

    const userId = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`

    // Create Fineract client
    const fineractClient = await fineractService.createClient(firstName, lastName, email)
    const fineractClientId = fineractClient.resourceId

    // Create savings account
    const fineractAccount = await fineractService.createSavingsAccount(fineractClientId)
    const fineractAccountId = fineractAccount.resourceId

    // Create user profile (with password stored for demo)
    await supabaseOperations.createUserWithPassword(userId, email, password, firstName, lastName, fineractClientId)

    // Create account record
    await supabaseOperations.createAccount(userId, fineractAccountId, 0, "")

    // Get balance
    const balance = await fineractService.getAccountBalance(fineractAccountId)

    res.json({
      success: true,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        fineractClientId,
        accountId: fineractAccountId,
      },
      account: {
        balance: balance.balance,
        currency: balance.currency,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    res.status(500).json({ error: error.message || "Signup failed" })
  }
})

// Login: verify against local user store and issue JWT
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await supabaseOperations.verifyUserPassword(email, password)
    if (!user) return res.status(401).json({ error: "Invalid credentials" })

    const userProfile = await supabaseOperations.getUserProfile(user.id)
    const account = await supabaseOperations.getAccountByUserId(user.id)

    // Get Fineract balance
    const balance = await fineractService.getAccountBalance(account.fineract_account_id)

    // Create JWT for app
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET is not set")
      return res.status(500).json({ error: "Server misconfiguration" })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        accountId: account.fineract_account_id,
      },
      jwtSecret,
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: userProfile.email,
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        accountId: account.fineract_account_id,
      },
      account: {
        balance: balance.balance,
        currency: balance.currency,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    res.status(500).json({ error: error.message || "Login failed" })
  }
})

// Protected route example: Sync balance
router.post("/sync-balance", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id
    const account = await supabaseOperations.getAccountByUserId(userId)
    const balance = await fineractService.getAccountBalance(account.fineract_account_id)

    await supabaseOperations.updateAccountBalance(account.id, balance.balance)

    res.json({
      success: true,
      balance: balance.balance,
      currency: balance.currency,
    })
  } catch (error: any) {
    console.error("Sync balance error:", error)
    res.status(500).json({ error: error.message || "Failed to sync balance" })
  }
})

export default router
