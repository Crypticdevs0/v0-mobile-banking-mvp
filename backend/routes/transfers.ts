import express from "express"
import { fineractService } from "../services/fineractService.js"
import { verifyToken } from "../middleware/auth.ts"

const router = express.Router()

router.post("/", verifyToken, async (req, res) => {
  try {
    const { recipientAccountId, amount, description } = req.body

    if (!recipientAccountId || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid transfer data" })
    }

    const transfer = await fineractService.transferFunds(req.user.accountId, recipientAccountId, amount)

    res.json({
      success: true,
      transfer,
    })
  } catch (error) {
    console.error("Transfer error:", error)
    res.status(500).json({ error: error.message || "Transfer failed" })
  }
})

export default router
