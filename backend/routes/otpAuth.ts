import express from "express"

import express from "express"
import rateLimit from "express-rate-limit"
import { supabaseOperations } from "../../lib/supabase/supabaseService.js"

const router = express.Router()

// Rate limiters
const sendOtpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many OTP requests, try again later' } })
const verifyOtpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, message: { error: 'Too many attempts, try again later' } })

async function sendOtp(email: string, otp: string) {
  const sendgridKey = process.env.SENDGRID_API_KEY
  const sendFrom = process.env.SENDGRID_FROM || process.env.SENDGRID_FROM_EMAIL
  if (sendgridKey && sendFrom) {
    const payload = {
      personalizations: [{ to: [{ email }], subject: 'Your OTP Code' }],
      from: { email: sendFrom },
      content: [{ type: 'text/plain', value: `Your verification code is: ${otp}` }],
    }

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`SendGrid error: ${res.status} ${text}`)
    }

    return true
  }

  // No provider configured: do not log the OTP. Keep server-side storage for verification.
  return true
}

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

    // Send OTP via configured provider (if configured). Never log OTP values in production.
    try {
      await sendOtp(email, otp)
      res.json({ success: true, message: "OTP sent to email" })
    } catch (err) {
      console.error('Failed to send OTP via provider:', err?.message || err)
      // Keep behavior non-revealing to callers
      res.status(500).json({ error: 'Failed to deliver OTP' })
    }
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

    // Find the user via Supabase and return associated account info
    try {
      const userProfile = await supabaseOperations.getUserProfileByEmail(email)
      if (!userProfile) {
        // If user not yet persisted, fallback to a generated account number but warn
        const fallbackAccount = Math.random().toString().slice(2, 12)
        delete otpStore[email]
        return res.json({ success: true, accountNumber: fallbackAccount, routingNumber: "021000021", message: "OTP verified, but no linked account found" })
      }

      const account = await supabaseOperations.getAccountByUserId(userProfile.id)
      delete otpStore[email]

      // Prefer stored account_number (from Fineract), otherwise expose Fineract account id
      const accountNumber = account.account_number || account.fineract_account_id || null
      const routingNumber = process.env.DEFAULT_ROUTING_NUMBER || "021000021"

      return res.json({ success: true, accountNumber, routingNumber, message: "OTP verified successfully" })
    } catch (err) {
      console.error("OTP verification - lookup error:", err)
      delete otpStore[email]
      return res.status(500).json({ error: "Verification succeeded but failed to look up account" })
    }
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
