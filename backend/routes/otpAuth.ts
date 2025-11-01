import express from "express"

const router = express.Router()

// Mock OTP storage - in production use Redis or database
const otpStore: { [key: string]: { code: string; expires: number } } = {}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    const otp = generateOTP()
    otpStore[email] = {
      code: otp,
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    }

    // In production: send via email service (SendGrid, Mailgun, etc.)
    console.log(`[OTP] Sent to ${email}: ${otp}`)

    res.json({ success: true, message: "OTP sent to email" })
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" })

    const stored = otpStore[email]
    if (!stored || stored.code !== otp) {
      return res.status(401).json({ error: "Invalid OTP" })
    }

    if (stored.expires < Date.now()) {
      delete otpStore[email]
      return res.status(401).json({ error: "OTP expired" })
    }

    // Generate account and routing numbers
    const accountNumber = Math.random().toString().slice(2, 12)
    const routingNumber = "021000021" // Fixed routing number

    delete otpStore[email]

    res.json({
      success: true,
      accountNumber,
      routingNumber,
      message: "OTP verified successfully",
    })
  } catch (error) {
    res.status(500).json({ error: "Verification failed" })
  }
})

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    const otp = generateOTP()
    otpStore[email] = {
      code: otp,
      expires: Date.now() + 10 * 60 * 1000,
    }

    console.log(`[OTP] Resent to ${email}: ${otp}`)

    res.json({ success: true, message: "OTP resent" })
  } catch (error) {
    res.status(500).json({ error: "Failed to resend OTP" })
  }
})

export default router
