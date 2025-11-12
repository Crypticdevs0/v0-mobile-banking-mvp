import express from "express"
import { verifyToken } from "../middleware/auth.ts"

const router = express.Router()

import { fineractService } from "../services/fineractService.js"

// Deposits
router.post("/deposits", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid deposit amount" })
    }

    const deposit = await fineractService.depositToAccount(req.user.accountId, amount)

    res.json({
      success: true,
      deposit,
      message: `Deposit of $${amount} initiated. Funds will arrive in 1-3 business days.`,
    })
  } catch (error) {
    console.error("Deposit error:", error)
    res.status(500).json({ error: "Deposit failed" })
  }
})

// Bill Payments
router.post("/payments", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment details" })
    }

    // For simplicity, we'll treat a bill payment as a withdrawal
    const payment = await fineractService.withdrawFromAccount(req.user.accountId, amount)

    res.json({
      success: true,
      payment,
      message: "Payment scheduled successfully",
    })
  } catch (error) {
    console.error("Payment error:", error)
    res.status(500).json({ error: "Payment failed" })
  }
})

// Add Biller
router.post("/billers", verifyToken, async (req, res) => {
  try {
    const { billerName, accountNumber } = req.body

    if (!billerName || !accountNumber) {
      return res.status(400).json({ error: "Missing biller details" })
    }

    const biller = {
      id: Math.random().toString(36).substring(7),
      userId: req.user.userId,
      name: billerName,
      accountNumber: `****${accountNumber.slice(-4)}`,
      createdAt: new Date(),
    }

    res.json({
      success: true,
      biller,
      message: "Biller added successfully",
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to add biller" })
  }
})

// Get Billers
router.get("/billers", verifyToken, async (req, res) => {
  try {
    // Mock data - in production fetch from database
    const billers = [
      { id: 1, name: "Electric Company", accountNumber: "****1234" },
      { id: 2, name: "Internet Provider", accountNumber: "****5678" },
    ]

    res.json({ billers })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch billers" })
  }
})

export default router
