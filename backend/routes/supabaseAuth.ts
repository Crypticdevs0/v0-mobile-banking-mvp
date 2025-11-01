import express from "express"
import express from "express"
import { createClient as createSupabase } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"
import { fineractService } from "../services/fineractService.js"
import { supabaseOperations } from "../../lib/supabase/supabaseService.js"

const router = express.Router()

// Initialize Supabase client for backend operations
const supabase = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Validate Supabase JWT token
const verifySupabaseToken = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = data.user
    next()
  } catch (error) {
    res.status(401).json({ error: "Token verification failed" })
  }
}

// Signup with Supabase Auth + Fineract
router.post("/signup", async (req: any, res: any) => {
  try {
    const { email, password, firstName, lastName } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
      email_confirm: true, // Auto-confirm for demo
    })

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || "Failed to create auth user" })
    }

    const userId = authData.user.id

    // Create Fineract client
    const fineractClient = await fineractService.createClient(firstName, lastName, email)
    const fineractClientId = fineractClient.resourceId

    // Create savings account
    const fineractAccount = await fineractService.createSavingsAccount(fineractClientId)
    const fineractAccountId = fineractAccount.resourceId
    const fineractAccountNo = fineractAccount.accountNo || ""

    // Create user profile in Supabase
    await supabaseOperations.createUserProfile(userId, email, firstName, lastName, fineractClientId)

    // Create account record (persist account number from Fineract when available)
    await supabaseOperations.createAccount(userId, fineractAccountId, 0, fineractAccountNo)

    // Get balance
    const balance = await fineractService.getAccountBalance(fineractAccountId)

    res.json({
      success: true,
      token: authData.user?.id ? jwt.sign({ userId: userId, email, accountId: fineractAccountId }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" }) : undefined,
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

// Login with Supabase Auth
router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Fetch user profile
    const userProfile = await supabaseOperations.getUserProfile(authData.user.id)
    const account = await supabaseOperations.getAccountByUserId(authData.user.id)

    // Get Fineract balance
    const balance = await fineractService.getAccountBalance(account.fineract_account_id)

    // Create JWT for app
    const token = jwt.sign(
      {
        userId: authData.user.id,
        email: authData.user.email,
        accountId: account.fineract_account_id,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" },
    )

    res.json({
      success: true,
      token,
      user: {
        id: authData.user.id,
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
router.post("/sync-balance", verifySupabaseToken, async (req: any, res: any) => {
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
