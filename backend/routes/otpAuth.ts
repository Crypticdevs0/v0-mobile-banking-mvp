import express from "express"
import { createClient as createSupabase } from "@supabase/supabase-js"

const router = express.Router()

// Simple in-memory rate limits (per-email). For production, use Redis or a persistent store.
const sendRateLimit: Map<string, { count: number; firstAt: number }> = new Map()
const MAX_SENDS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post("/send-otp", async (req, res) => {
  try {
    const supabase = createSupabase(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    // Rate limiting per email
    const now = Date.now()
    const record = sendRateLimit.get(email) || { count: 0, firstAt: now }
    if (now - record.firstAt > WINDOW_MS) {
      record.count = 0
      record.firstAt = now
    }
    if (record.count >= MAX_SENDS) {
      return res.status(429).json({ error: "Too many OTP requests. Try again later." })
    }
    record.count += 1
    sendRateLimit.set(email, record)

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Store OTP in Supabase table 'otp_codes' with limited visibility
    const { error } = await supabase.from("otp_codes").insert([
      {
        email,
        code: otp,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 5,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("[OTP] Supabase insert error:", error)
      return res.status(500).json({ error: "Failed to create OTP" })
    }

    // NOTE: Integration with an email provider should be here. Do NOT log OTPs in production.
    // For demo/dev, don't log secret OTPs.

    res.json({ success: true, message: "OTP generated and stored" })
  } catch (err) {
    console.error("[OTP] send error:", err)
    res.status(500).json({ error: "Failed to send OTP" })
  }
})

router.post("/verify-otp", async (req, res) => {
  try {
    const supabase = createSupabase(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" })

    // Fetch the latest OTP for this email
    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", otp)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("[OTP] Supabase select error:", error)
      return res.status(500).json({ error: "Verification failed" })
    }

    const otpRecord = data
    if (!otpRecord) {
      return res.status(401).json({ error: "Invalid or expired OTP" })
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      // Optionally delete expired codes
      await supabase.from("otp_codes").delete().eq("id", otpRecord.id)
      return res.status(401).json({ error: "OTP expired" })
    }

    if (otpRecord.attempts >= (otpRecord.max_attempts || 5)) {
      return res.status(401).json({ error: "OTP max attempts exceeded" })
    }

    // Mark OTP as verified
    await supabase.from("otp_codes").update({ verified_at: new Date().toISOString() }).eq("id", otpRecord.id)

    // Optionally delete used OTPs
    await supabase.from("otp_codes").delete().eq("id", otpRecord.id)

    // Generate account and routing numbers (demo values)
    const accountNumber = Math.floor(100000000 + Math.random() * 900000000).toString()
    const routingNumber = "021000021"

    res.json({
      success: true,
      accountNumber,
      routingNumber,
      message: "OTP verified successfully",
    })
  } catch (err) {
    console.error("[OTP] verify error:", err)
    res.status(500).json({ error: "Verification failed" })
  }
})

router.post("/resend-otp", async (req, res) => {
  try {
    const supabase = createSupabase(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    const { email } = req.body
    if (!email) return res.status(400).json({ error: "Email required" })

    // Similar rate limiting logic
    const now = Date.now()
    const record = sendRateLimit.get(email) || { count: 0, firstAt: now }
    if (now - record.firstAt > WINDOW_MS) {
      record.count = 0
      record.firstAt = now
    }
    if (record.count >= MAX_SENDS) {
      return res.status(429).json({ error: "Too many OTP requests. Try again later." })
    }
    record.count += 1
    sendRateLimit.set(email, record)

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Delete old OTPs for this email and insert a new one
    await supabase.from("otp_codes").delete().eq("email", email)
    const { error } = await supabase.from("otp_codes").insert([
      {
        email,
        code: otp,
        expires_at: expiresAt,
        attempts: 0,
        max_attempts: 5,
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("[OTP] Supabase insert error (resend):", error)
      return res.status(500).json({ error: "Failed to resend OTP" })
    }

    // Do not log OTP in production
    res.json({ success: true, message: "OTP resent" })
  } catch (err) {
    console.error("[OTP] resend error:", err)
    res.status(500).json({ error: "Failed to resend OTP" })
  }
})

export default router
