import express from "express"
import logger from "../logger.js"
import { verifyToken } from "../middleware/auth.ts"
import { fineractService } from "../services/fineractService.js"
import { supabaseOperations } from "../../lib/supabase/supabaseService.js"

const router = express.Router()

// POST /api/deposits
router.post("/deposits", verifyToken, async (req: any, res: any) => {
  try {
    const { amount, method } = req.body
    if (!amount || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" })
    }

    const userId = req.user.userId || req.user.userId || req.user?.userId
    const fineractAccountId = req.user.accountId

    if (!fineractAccountId) {
      return res.status(400).json({ error: "No linked account" })
    }

    // Perform deposit on Fineract
    const depositResult = await fineractService.depositToAccount(Number(fineractAccountId), Number(amount))

    // Fetch updated balance from Fineract
    const balance = await fineractService.getAccountBalance(fineractAccountId)

    // Update Supabase account record (if exists)
    try {
      const account = await supabaseOperations.getAccountByUserId(userId)
      if (account) {
        await supabaseOperations.updateAccountBalance(account.id, balance.balance)
      }
    } catch (err) {
      logger.error("Failed to update Supabase account balance:", err)
      // Non-fatal: continue
    }

    // Log transaction in Supabase if possible
    try {
      await supabaseOperations.logTransaction(null, userId, Number(amount), `Deposit via ${method || 'unknown'}`, String(depositResult.resourceId || ''))
    } catch (err) {
      logger.error("Failed to log transaction in Supabase:", err)
    }

    res.json({ success: true, deposit: depositResult, balance })
  } catch (error: any) {
    logger.error("Deposit endpoint error:", error)
    res.status(500).json({ error: error.message || "Deposit failed" })
  }
})

export default router
