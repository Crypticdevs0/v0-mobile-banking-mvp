import express from "express"
import { createClient as createSupabase } from "@supabase/supabase-js"
import { otpLimiter } from "../middleware/rateLimit.js"

const router = express.Router()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post("/send-otp", otpLimiter, async (req, res) => {
  try {
    const supabase = createSupabase(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email required" })
    }

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

router.post("/verify-otp", otpLimiter, async (req, res) => {
  try {
    const supabase = createSupabase(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" })
    }

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
      return res.status(500).json({ error: "Failed to verify OTP" })
    }

    if (!data) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    // Check if OTP is expired
    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP expired" })
    }

    // Check max attempts
    if (data.attempts >= data.max_attempts) {
      return res.status(400).json({ error: "Too many attempts. OTP expired." })
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ attempts: data.attempts + 1, verified_at: new Date().toISOString() })
      .eq("id", data.id)

    if (updateError) {
      console.error("[OTP] Supabase update error:", updateError)
      return res.status(500).json({ error: "Failed to verify OTP" })
    }

    // Generate account numbers for demo
    const accountNumber = Math.floor(Math.random() * 9000000000) + 1000000000
    const routingNumber = "021000021"

    res.json({
      success: true,
      message: "OTP verified",
      account: {
        accountNumber: accountNumber.toString(),
        routingNumber,
        email,
      },
    })
  } catch (err) {
    console.error("[OTP] verify error:", err)
    res.status(500).json({ error: "Failed to verify OTP" })
  }
})

export default router
